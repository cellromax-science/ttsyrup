"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { useScrollAnimation } from "./scroll-hooks";

/* ─────────────────────────────────────────────────
   S7 — PharmacyFinder
   section-peach 배경의 약국 찾기 섹션.

   Design approach:
   - Kakao Map integration with geocoding
   - Search by area/pharmacy name
   - "내 주변 약국 찾기" GPS-based nearby sort
   - Pharmacy list with cards below map
   - Lazy geocoding: only geocode visible/filtered results
   ───────────────────────────────────────────────── */

/* ── Types ── */
interface Pharmacy {
  name: string;
  phone: string;
  address: string;
}

interface GeocodedPharmacy extends Pharmacy {
  lat: number;
  lng: number;
}

/* ── Constants ── */
const KAKAO_APP_KEY = "699f398690a824e1f16bb32697f9cf1d";
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // Seoul
const DEFAULT_ZOOM = 7;
const LIST_PAGE_SIZE = 20;
const GEOCODE_BATCH_SIZE = 10;
const GEOCODE_BATCH_DELAY = 120; // ms between batches to avoid rate limit

export default function PharmacyFinder() {
  const t = useTranslations("pharmacy");

  /* ── State ── */
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [geocodedMap, setGeocodedMap] = useState<Map<string, GeocodedPharmacy>>(new Map());
  const [query, setQuery] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // 검색/내주변찾기 전까지 리스트 숨김

  /* ── Refs ── */
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const geocoderRef = useRef<kakao.maps.services.Geocoder | null>(null);
  const geocodingQueueRef = useRef<Set<string>>(new Set());

  /* ── Scroll hooks ── */
  const headlineRef = useScrollAnimation<HTMLHeadingElement>({
    from: { opacity: 0, y: 40 },
    duration: 1.1,
    ease: "power3.out",
  });

  const subRef = useScrollAnimation<HTMLParagraphElement>({
    from: { opacity: 0, y: 20 },
    duration: 0.85,
    delay: 0.12,
  });

  const searchRef = useScrollAnimation<HTMLDivElement>({
    from: { opacity: 0, y: 28, scale: 0.98 },
    duration: 0.9,
    delay: 0.2,
  });

  const bodyRef = useScrollAnimation<HTMLDivElement>({
    from: { opacity: 0, y: 20 },
    duration: 0.8,
    delay: 0.3,
  });

  /* ── Load pharmacy data ── */
  useEffect(() => {
    fetch("/data/pharmacies.json")
      .then((res) => res.json())
      .then((data: Pharmacy[]) => {
        setPharmacies(data);
        setFilteredPharmacies(data);
      })
      .catch((err) => console.error("Failed to load pharmacies:", err));
  }, []);

  /* ── Geocode a single pharmacy ── */
  const geocodePharmacy = useCallback(
    (pharmacy: Pharmacy): Promise<GeocodedPharmacy | null> => {
      return new Promise((resolve) => {
        if (!geocoderRef.current) {
          resolve(null);
          return;
        }

        // Skip if already geocoded
        const existing = geocodedMap.get(pharmacy.address);
        if (existing) {
          resolve(existing);
          return;
        }

        // Skip if already in queue
        if (geocodingQueueRef.current.has(pharmacy.address)) {
          resolve(null);
          return;
        }

        geocodingQueueRef.current.add(pharmacy.address);

        geocoderRef.current.addressSearch(pharmacy.address, (result, status) => {
          geocodingQueueRef.current.delete(pharmacy.address);

          if (status === "OK" && result.length > 0) {
            const geocoded: GeocodedPharmacy = {
              ...pharmacy,
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x),
            };
            resolve(geocoded);
          } else {
            resolve(null);
          }
        });
      });
    },
    [geocodedMap]
  );

  /* ── Batch geocode pharmacies ── */
  const batchGeocode = useCallback(
    async (list: Pharmacy[]) => {
      if (!geocoderRef.current || list.length === 0) return;

      setIsGeocoding(true);
      const newGeocodedMap = new Map(geocodedMap);

      // Filter out already geocoded
      const toGeocode = list.filter((p) => !newGeocodedMap.has(p.address));
      const batches: Pharmacy[][] = [];

      for (let i = 0; i < toGeocode.length; i += GEOCODE_BATCH_SIZE) {
        batches.push(toGeocode.slice(i, i + GEOCODE_BATCH_SIZE));
      }

      for (const batch of batches) {
        const results = await Promise.all(batch.map(geocodePharmacy));
        for (const result of results) {
          if (result) {
            newGeocodedMap.set(result.address, result);
          }
        }
        // Small delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((r) => setTimeout(r, GEOCODE_BATCH_DELAY));
        }
      }

      setGeocodedMap(newGeocodedMap);
      setIsGeocoding(false);
      return newGeocodedMap;
    },
    [geocodedMap, geocodePharmacy]
  );

  /* ── Clear all markers ── */
  const clearMarkers = useCallback(() => {
    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  /* ── Place markers on map ── */
  const placeMarkers = useCallback(
    (geocoded: Map<string, GeocodedPharmacy>, pharmacyList: Pharmacy[]) => {
      if (!mapRef.current) return;

      clearMarkers();

      const bounds = new kakao.maps.LatLngBounds();
      let hasMarkers = false;

      for (const pharmacy of pharmacyList) {
        const geo = geocoded.get(pharmacy.address);
        if (!geo) continue;

        const position = new kakao.maps.LatLng(geo.lat, geo.lng);
        const marker = new kakao.maps.Marker({
          position,
          map: mapRef.current,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          showInfoWindow(marker, geo);
          setSelectedPharmacy(geo.address);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        hasMarkers = true;
      }

      if (hasMarkers && pharmacyList.length <= 100) {
        mapRef.current.setBounds(bounds);
      }
    },
    [clearMarkers]
  );

  /* ── Show info window ── */
  const showInfoWindow = useCallback(
    (marker: kakao.maps.Marker, pharmacy: GeocodedPharmacy) => {
      if (!mapRef.current) return;

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      const content = `
        <div style="padding:12px 16px;min-width:200px;max-width:280px;font-family:var(--font-pretendard),sans-serif;">
          <p style="font-weight:700;font-size:15px;color:#1A1A2E;margin:0 0 6px 0;line-height:1.3;">
            ${pharmacy.name}
          </p>
          <p style="font-size:13px;color:#6B7280;margin:0 0 6px 0;line-height:1.4;">
            ${pharmacy.address}
          </p>
          <a href="tel:${pharmacy.phone}"
             style="display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:#5B2E8C;text-decoration:none;">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style="flex-shrink:0;">
              <path d="M3 5.5A2.5 2.5 0 015.5 3h1.148a1.5 1.5 0 011.465 1.175l.513 2.31a1.5 1.5 0 01-.75 1.636l-.97.485a.5.5 0 00-.236.578 8 8 0 004.146 4.146.5.5 0 00.578-.236l.485-.97a1.5 1.5 0 011.636-.75l2.31.513A1.5 1.5 0 0117 13.352V14.5a2.5 2.5 0 01-2.5 2.5h-1A11.5 11.5 0 013 6.5v-1z"/>
            </svg>
            ${pharmacy.phone}
          </a>
        </div>
      `;

      const infoWindow = new kakao.maps.InfoWindow({
        content,
        removable: true,
      });

      infoWindow.open(mapRef.current, marker);
      infoWindowRef.current = infoWindow;
      mapRef.current.panTo(marker.getPosition());
    },
    []
  );

  /* ── Initialize map ── */
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;

    kakao.maps.load(() => {
      if (!mapContainerRef.current) return;

      const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      const map = new kakao.maps.Map(mapContainerRef.current, {
        center,
        level: DEFAULT_ZOOM,
      });

      mapRef.current = map;
      geocoderRef.current = new kakao.maps.services.Geocoder();
      setMapReady(true);
    });
  }, []);

  /* ── SDK loaded callback ── */
  const handleSdkLoad = useCallback(() => {
    setSdkReady(true);
    initializeMap();
  }, [initializeMap]);

  /* ── Map ready: no initial markers (wait for search/nearby) ── */

  /* ── Search/filter ── */
  const handleSearch = useCallback(() => {
    const q = query.trim().toLowerCase();
    let results: Pharmacy[];

    if (!q) {
      results = pharmacies;
    } else {
      results = pharmacies.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    setFilteredPharmacies(results);
    setVisibleCount(LIST_PAGE_SIZE);
    setSelectedPharmacy(null);
    setHasSearched(true);

    // Geocode and display filtered results
    const batch = results.slice(0, LIST_PAGE_SIZE);
    batchGeocode(batch).then((newMap) => {
      if (newMap) {
        placeMarkers(newMap, batch);
        // Zoom to fit results
        if (batch.length > 0 && batch.length <= 50 && mapRef.current) {
          const bounds = new kakao.maps.LatLngBounds();
          let hasAny = false;
          for (const p of batch) {
            const geo = newMap.get(p.address);
            if (geo) {
              bounds.extend(new kakao.maps.LatLng(geo.lat, geo.lng));
              hasAny = true;
            }
          }
          if (hasAny) {
            mapRef.current.setBounds(bounds);
          }
        }
      }
    });
  }, [query, pharmacies, batchGeocode, placeMarkers]);

  /* ── Key press handler for search ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  /* ── Geolocation: Find nearby pharmacies ── */
  const handleFindNearby = useCallback(() => {
    if (!navigator.geolocation) {
      alert(t("location.notSupported"));
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setHasSearched(true);

        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setCenter(new kakao.maps.LatLng(userLat, userLng));
          mapRef.current.setLevel(5);
        }

        // Geocode all pharmacies to sort by distance
        // For performance, geocode first 100 matches
        const toGeocode = pharmacies.slice(0, 100);
        const newMap = await batchGeocode(toGeocode);

        if (newMap) {
          // Sort by distance
          const withDistance = pharmacies
            .map((p) => {
              const geo = newMap.get(p.address);
              if (!geo) return { pharmacy: p, distance: Infinity };
              const dist = getDistance(userLat, userLng, geo.lat, geo.lng);
              return { pharmacy: p, distance: dist };
            })
            .sort((a, b) => a.distance - b.distance);

          const sorted = withDistance.map((wd) => wd.pharmacy);
          setFilteredPharmacies(sorted);
          setVisibleCount(LIST_PAGE_SIZE);

          // Place markers for nearest
          const nearestBatch = sorted.slice(0, LIST_PAGE_SIZE);
          placeMarkers(newMap, nearestBatch);
        }

        setIsLocating(false);
      },
      () => {
        alert(t("location.error"));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [pharmacies, batchGeocode, placeMarkers, t]);

  /* ── Handle pharmacy card click ── */
  const handlePharmacyClick = useCallback(
    async (pharmacy: Pharmacy) => {
      setSelectedPharmacy(pharmacy.address);

      // Check if already geocoded
      let geo = geocodedMap.get(pharmacy.address);

      if (!geo) {
        // Geocode this one
        const result = await geocodePharmacy(pharmacy);
        if (result) {
          const newMap = new Map(geocodedMap);
          newMap.set(result.address, result);
          setGeocodedMap(newMap);
          geo = result;
        }
      }

      if (geo && mapRef.current) {
        const position = new kakao.maps.LatLng(geo.lat, geo.lng);

        // Check if marker exists
        const existingMarker = markersRef.current.find(
          (m) =>
            m.getPosition().getLat() === geo!.lat &&
            m.getPosition().getLng() === geo!.lng
        );

        if (existingMarker) {
          showInfoWindow(existingMarker, geo);
        } else {
          // Add marker
          const marker = new kakao.maps.Marker({
            position,
            map: mapRef.current,
          });
          markersRef.current.push(marker);
          showInfoWindow(marker, geo);
        }

        mapRef.current.setLevel(3);
        mapRef.current.panTo(position);
      }
    },
    [geocodedMap, geocodePharmacy, showInfoWindow]
  );

  /* ── Load more ── */
  const handleLoadMore = useCallback(() => {
    const newCount = visibleCount + LIST_PAGE_SIZE;
    setVisibleCount(newCount);

    // Geocode newly visible pharmacies
    const newBatch = filteredPharmacies.slice(visibleCount, newCount);
    batchGeocode(newBatch).then((newMap) => {
      if (newMap) {
        // Add new markers
        for (const p of newBatch) {
          const geo = newMap.get(p.address);
          if (geo && mapRef.current) {
            const marker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(geo.lat, geo.lng),
              map: mapRef.current,
            });
            kakao.maps.event.addListener(marker, "click", () => {
              showInfoWindow(marker, geo);
              setSelectedPharmacy(geo.address);
            });
            markersRef.current.push(marker);
          }
        }
      }
    });
  }, [visibleCount, filteredPharmacies, batchGeocode, showInfoWindow]);

  /* ── Visible pharmacies for the list ── */
  const visiblePharmacies = filteredPharmacies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPharmacies.length;

  return (
    <>
      {/* Kakao Maps SDK */}
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleSdkLoad}
      />

      <section
        id="pharmacy-finder"
        className="section-peach section-padding relative overflow-hidden"
      >
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-[20%] right-[5%] w-[300px] h-[300px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(232,115,74,0.1) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="section-inner relative z-10">
          {/* ── Headline ── */}
          <div className="text-center mb-10 lg:mb-14">
            <h2
              ref={headlineRef}
              className="font-bold text-text-primary leading-[1.15] tracking-[-0.025em] mb-4"
              style={{ fontSize: "var(--font-size-heading-xl)" }}
            >
              {t("headline.line1")}
              <br />
              <span className="text-gradient-warm">{t("headline.highlight")}</span>
            </h2>

            <p
              ref={subRef}
              className="text-body-lg text-text-secondary max-w-[480px] mx-auto leading-relaxed"
            >
              {t("subtitle.line1")}
              <br className="hidden sm:block" />
              {t("subtitle.line2")}
            </p>
          </div>

          {/* ── Search + Map Area ── */}
          <div ref={searchRef} className="max-w-[800px] mx-auto mb-10 lg:mb-12">
            {/* Search bar */}
            <div className="flex gap-2 sm:gap-3 mb-4">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13.5 13.5L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("search.placeholder")}
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-black/[0.06] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-elderberry-300 transition-shadow"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn-primary flex-shrink-0 px-5 sm:px-6 !py-3.5 !rounded-xl !h-auto"
              >
                {t("search.button")}
              </button>
            </div>

            {/* Nearby button */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleFindNearby}
                disabled={isLocating || !mapReady}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-body-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--color-coral-light), var(--color-coral))",
                  boxShadow: "var(--shadow-glow-coral)",
                }}
              >
                {/* Location icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
                {isLocating ? t("location.loading") : t("location.findNearby")}
              </button>

              {/* Result count — only show after search/nearby */}
              {hasSearched && (
                <span className="text-body-sm text-text-tertiary">
                  {t("resultCount", { count: filteredPharmacies.length })}
                </span>
              )}
            </div>

            {/* Map container */}
            <div className="relative rounded-2xl overflow-hidden border border-black/[0.04] shadow-[var(--shadow-card)]">
              <div
                ref={mapContainerRef}
                className="w-full h-[300px] md:h-[450px] bg-elderberry-25"
              >
                {!sdkReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      className="w-12 h-12 mb-4 text-elderberry-300 animate-pulse"
                    >
                      <path
                        d="M24 4C16.268 4 10 10.268 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <path
                        d="M24 4C16.268 4 10 10.268 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="24" cy="18" r="5" fill="currentColor" opacity="0.3" />
                    </svg>
                    <p className="text-body text-text-secondary mb-1">
                      {t("map.loading")}
                    </p>
                  </div>
                )}
              </div>

              {/* Geocoding indicator */}
              {isGeocoding && (
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-caption text-text-secondary shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                  {t("map.geocoding")}
                </div>
              )}
            </div>

            <p className="text-body-sm text-text-primary font-medium mt-4 text-center">
              {t("notice")}
            </p>
          </div>

          {/* ── Pharmacy List — only after search/nearby ── */}
          <div ref={bodyRef} className="max-w-[800px] mx-auto">
            {!hasSearched ? null : filteredPharmacies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-body text-text-secondary">
                  {t("list.noResults")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {visiblePharmacies.map((pharmacy, index) => (
                    <button
                      key={`${pharmacy.address}-${index}`}
                      onClick={() => handlePharmacyClick(pharmacy)}
                      className={`
                        w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300
                        ${
                          selectedPharmacy === pharmacy.address
                            ? "bg-elderberry-50 border-elderberry-200 shadow-[var(--shadow-card-hover)]"
                            : "bg-white/70 backdrop-blur-sm border-black/[0.04] hover:bg-white hover:shadow-[var(--shadow-card)] hover:border-black/[0.08]"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-primary text-body leading-snug mb-1.5">
                            {pharmacy.name}
                          </p>
                          <p className="text-body-sm text-text-secondary leading-relaxed mb-2 break-keep">
                            {pharmacy.address}
                          </p>
                          <a
                            href={`tel:${pharmacy.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-elderberry hover:text-elderberry-light transition-colors"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="flex-shrink-0"
                            >
                              <path d="M3 5.5A2.5 2.5 0 015.5 3h1.148a1.5 1.5 0 011.465 1.175l.513 2.31a1.5 1.5 0 01-.75 1.636l-.97.485a.5.5 0 00-.236.578 8 8 0 004.146 4.146.5.5 0 00.578-.236l.485-.97a1.5 1.5 0 011.636-.75l2.31.513A1.5 1.5 0 0117 13.352V14.5a2.5 2.5 0 01-2.5 2.5h-1A11.5 11.5 0 013 6.5v-1z" />
                            </svg>
                            {pharmacy.phone}
                          </a>
                        </div>

                        {/* Map pin indicator */}
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transition-colors ${
                              selectedPharmacy === pharmacy.address
                                ? "text-elderberry"
                                : "text-text-tertiary"
                            }`}
                          >
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              fill="currentColor"
                              opacity={selectedPharmacy === pharmacy.address ? 0.2 : 0.1}
                            />
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <circle cx="12" cy="9" r="2.5" fill="currentColor" opacity="0.3" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Load more button */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-black/[0.06] text-body-sm font-semibold text-text-primary hover:bg-white hover:shadow-[var(--shadow-card)] transition-all duration-300"
                    >
                      {t("list.loadMore")}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Contact card */}
            <div className="mt-10 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-full px-5 py-3 border border-black/[0.04]">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-5 h-5 text-elderberry-400"
                >
                  <path
                    d="M3 5.5A2.5 2.5 0 015.5 3h1.148a1.5 1.5 0 011.465 1.175l.513 2.31a1.5 1.5 0 01-.75 1.636l-.97.485a.5.5 0 00-.236.578 8 8 0 004.146 4.146.5.5 0 00.578-.236l.485-.97a1.5 1.5 0 011.636-.75l2.31.513A1.5 1.5 0 0117 13.352V14.5a2.5 2.5 0 01-2.5 2.5h-1A11.5 11.5 0 013 6.5v-1z"
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <path
                    d="M3 5.5A2.5 2.5 0 015.5 3h1.148a1.5 1.5 0 011.465 1.175l.513 2.31a1.5 1.5 0 01-.75 1.636l-.97.485a.5.5 0 00-.236.578 8 8 0 004.146 4.146.5.5 0 00.578-.236l.485-.97a1.5 1.5 0 011.636-.75l2.31.513A1.5 1.5 0 0117 13.352V14.5a2.5 2.5 0 01-2.5 2.5h-1A11.5 11.5 0 013 6.5v-1z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                <span className="text-body-sm font-medium text-text-primary">
                  {t("contact.label")}{" "}
                  <a
                    href="tel:031-662-1395"
                    className="text-elderberry-500 hover:underline"
                  >
                    031-662-1395
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Haversine distance (km) ── */
function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ─────────────────────────────────────────────
   Kakao Maps SDK — Type Declarations
   Minimal types for kakao.maps namespace
   ───────────────────────────────────────────── */

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng): void;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getLevel(): number;
    getCenter(): LatLng;
    getBounds(): LatLngBounds;
    setBounds(
      bounds: LatLngBounds,
      paddingTop?: number,
      paddingRight?: number,
      paddingBottom?: number,
      paddingLeft?: number
    ): void;
    relayout(): void;
    panTo(latlng: LatLng): void;
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map; image?: MarkerImage });
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class CustomOverlay {
    constructor(options: {
      content: string | HTMLElement;
      position: LatLng;
      map?: Map;
      yAnchor?: number;
      xAnchor?: number;
    });
    setMap(map: Map | null): void;
  }

  namespace services {
    type Status = "OK" | "ZERO_RESULT" | "ERROR";

    interface GeocoderResult {
      address_name: string;
      x: string;
      y: string;
    }

    interface RegionCodeResult {
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      code: string;
    }

    class Geocoder {
      addressSearch(
        address: string,
        callback: (result: GeocoderResult[], status: Status) => void
      ): void;
      coord2RegionCode(
        lng: number,
        lat: number,
        callback: (result: RegionCodeResult[], status: Status) => void
      ): void;
    }
  }

  function load(callback: () => void): void;

  namespace event {
    function addListener(
      target: Marker | Map,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
    function removeListener(
      target: Marker | Map,
      type: string,
      handler: (...args: unknown[]) => void
    ): void;
  }
}

interface Window {
  kakao: typeof kakao;
}

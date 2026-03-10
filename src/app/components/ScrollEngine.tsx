"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* ─────────────────────────────────────────────────
   ScrollEngine — Core Scroll Infrastructure

   Apple-level smooth scroll + animation trigger system.
   Integrates Lenis smooth scrolling with GSAP ScrollTrigger.

   Responsibilities:
   1. Lenis smooth scroll (Apple-style inertia)
   2. GSAP ScrollTrigger ↔ Lenis RAF sync
   3. data-reveal IntersectionObserver system
   4. Scroll progress CSS custom property
   5. Global scroll velocity tracking

   Animation hooks → ./scroll-hooks.ts
   ───────────────────────────────────────────────── */

// Register GSAP plugins once (SSR-safe)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Shared scroll velocity (px/sec) ──────────────
// Updated every frame. Read via getScrollVelocity().
let _scrollVelocity = 0;
export function getScrollVelocity(): number {
  return _scrollVelocity;
}

export default function ScrollEngine() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    /* ── 1. Lenis Smooth Scroll ────────────────── */
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    /* ── 2. Lenis ↔ GSAP ScrollTrigger Sync ───── */
    lenis.on("scroll", ScrollTrigger.update);
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    /* ── 3. Scroll Progress → CSS Custom Prop ──── */
    lenis.on("scroll", ({ progress }: { progress: number }) => {
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(progress)
      );
    });

    /* ── 4. Scroll Velocity Tracking ───────────── */
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    const velocityTracker = () => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 16) {
        _scrollVelocity =
          (Math.abs(window.scrollY - lastScrollY) / dt) * 1000;
        lastScrollY = window.scrollY;
        lastTime = now;
      }
    };
    gsap.ticker.add(velocityTracker);

    /* ── 5. Refresh ScrollTrigger positions ─────── */
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    /* ── 6. data-reveal IntersectionObserver ────── */
    const revealTimeout = setTimeout(() => {
      const els = document.querySelectorAll("[data-reveal]");
      if (els.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay =
                parseFloat(el.dataset.revealDelay || "0") * 1000;
              setTimeout(() => el.classList.add("revealed"), delay);
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );

      els.forEach((el) => observer.observe(el));
      observerRef.current = observer;
    }, 150);

    /* ── Cleanup ───────────────────────────────── */
    return () => {
      clearTimeout(refreshTimeout);
      clearTimeout(revealTimeout);
      observerRef.current?.disconnect();
      gsap.ticker.remove(rafCallback);
      gsap.ticker.remove(velocityTracker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useState } from "react";

type ExperienceProfile = {
  hasCoarsePointer: boolean;
  isCompactViewport: boolean;
  isShortViewport: boolean;
  prefersReducedMotion: boolean;
  supportsHover: boolean;
};

const defaultProfile: ExperienceProfile = {
  hasCoarsePointer: false,
  isCompactViewport: false,
  isShortViewport: false,
  prefersReducedMotion: false,
  supportsHover: true,
};

export function useExperienceProfile() {
  const [profile, setProfile] = useState<ExperienceProfile>(defaultProfile);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const hoverQuery = window.matchMedia("(hover: hover)");

    function updateProfile() {
      setProfile({
        hasCoarsePointer: coarsePointerQuery.matches,
        isCompactViewport: window.innerWidth < 960,
        isShortViewport: window.innerHeight < 760,
        prefersReducedMotion: reducedMotionQuery.matches,
        supportsHover: hoverQuery.matches,
      });
    }

    updateProfile();

    window.addEventListener("resize", updateProfile);
    bindMediaQuery(reducedMotionQuery, updateProfile);
    bindMediaQuery(coarsePointerQuery, updateProfile);
    bindMediaQuery(hoverQuery, updateProfile);

    return () => {
      window.removeEventListener("resize", updateProfile);
      unbindMediaQuery(reducedMotionQuery, updateProfile);
      unbindMediaQuery(coarsePointerQuery, updateProfile);
      unbindMediaQuery(hoverQuery, updateProfile);
    };
  }, []);

  return profile;
}

function bindMediaQuery(query: MediaQueryList, listener: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return;
  }

  query.addListener(listener);
}

function unbindMediaQuery(query: MediaQueryList, listener: () => void) {
  if (typeof query.removeEventListener === "function") {
    query.removeEventListener("change", listener);
    return;
  }

  query.removeListener(listener);
}

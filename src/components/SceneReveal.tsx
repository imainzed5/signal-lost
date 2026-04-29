"use client";

import { useEffect, useState } from "react";

type SceneRevealProps = {
  chapterLabel: string;
  techLabel: string;
  title: string;
};

export function SceneReveal({
  chapterLabel,
  techLabel,
  title,
}: SceneRevealProps) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setPhase("fading"), 1150);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 2050);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 transition duration-700 ${
        phase === "fading" ? "opacity-0 blur-[2px]" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-3xl rounded-[2.4rem] border border-white/10 bg-[rgba(3,8,14,0.56)] px-6 py-8 text-center shadow-[0_32px_120px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:px-10 sm:py-10">
        <p className="text-[0.72rem] uppercase tracking-[0.42em] text-white/54">
          {chapterLabel}
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[0.3em] text-white sm:text-6xl">
          {title}
        </h2>
        <p className="mt-4 text-[0.72rem] uppercase tracking-[0.32em] text-white/58">
          {techLabel}
        </p>
      </div>
    </div>
  );
}

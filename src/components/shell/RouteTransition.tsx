"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { GlitchText } from "@/components/shell/GlitchText";
import { playShutterClose, playShutterOpen, primeInterfaceSound } from "@/components/shell/interfaceSound";
import { CHAPTERS, parseChapterId } from "@/data/chapters";

type ShutterPhase = "idle" | "closing" | "closed" | "opening";

const CLOSE_DURATION = 420;
const OPEN_DURATION = 1300;
const STALL_TIMEOUT = 3200;

/**
 * The signal carries between routes instead of hard-cutting: the frame folds
 * shut on a bright seam when SABLE leaves a route, and opens again on arrival.
 * The title screen owns its own boot choreography, so departures from "/" are
 * left alone.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [seenPath, setSeenPath] = useState(pathname);
  const [phase, setPhase] = useState<ShutterPhase>(pathname === "/" ? "idle" : "opening");
  const [label, setLabel] = useState(() => resolveRouteLabel(pathname));
  const phaseRef = useRef(phase);
  const pathRef = useRef(pathname);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setLabel(resolveRouteLabel(pathname));
    setPhase(pathname === "/" && phase === "idle" ? "idle" : "opening");
  }

  useEffect(() => {
    phaseRef.current = phase;
    pathRef.current = pathname;
  }, [pathname, phase]);

  useEffect(() => {
    primeInterfaceSound();
  }, []);

  useEffect(() => {
    if (phase === "opening") {
      playShutterOpen();
      const timer = window.setTimeout(() => setPhase("idle"), OPEN_DURATION);
      return () => window.clearTimeout(timer);
    }

    if (phase === "closed") {
      const timer = window.setTimeout(() => setPhase("opening"), STALL_TIMEOUT);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [phase]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let navigateTimer = 0;

    function handleClick(event: MouseEvent) {
      if (
        reducedMotion.matches ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        pathRef.current === "/" ||
        phaseRef.current === "closing" ||
        phaseRef.current === "closed"
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";

      if (
        !href.startsWith("/") ||
        href.startsWith("//") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.split("#")[0] === pathRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setLabel(resolveRouteLabel(href));
      setPhase("closing");
      playShutterClose();
      navigateTimer = window.setTimeout(() => {
        setPhase("closed");
        router.push(href);
      }, CLOSE_DURATION);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div className="route-shutter" data-phase={phase} aria-hidden="true">
      <div className="route-shutter__lid route-shutter__lid--top" />
      <div className="route-shutter__lid route-shutter__lid--bottom" />
      <div className="route-shutter__seam route-shutter__seam--host" />
      <div className="route-shutter__seam route-shutter__seam--sable" />
      <div className="route-shutter__seam" />
      <p className="route-shutter__label">
        {phase === "idle" ? null : <GlitchText key={`${label}-${phase === "opening"}`} text={label} duration={520} glitch="burst" />}
      </p>
    </div>
  );
}

function resolveRouteLabel(path: string) {
  const chapterMatch = /^\/chapter\/(\d+)/.exec(path);

  if (chapterMatch) {
    const chapterId = parseChapterId(chapterMatch[1]);

    if (chapterId !== null) {
      return `carrier // ${String(chapterId).padStart(2, "0")} ${CHAPTERS[chapterId].token}`;
    }
  }

  if (path.startsWith("/credits")) {
    return "release record";
  }

  return "host shell";
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CHAPTERS } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import type {
  ChapterId,
  ChapterMeta,
  ChapterProgressState,
  ChapterStatus,
} from "@/types/chapters";

const MENU_THEME_SOURCE = "/audio/sable_menu_theme.mp3";
const MENU_THEME_VOLUME = 0.24;
const MENU_THEME_VOLUME_STORAGE_KEY = "signal-lost:menu-theme-volume";
const QUICK_TRANSITION_DURATION = 200;
const BOOT_TRANSITION_DURATION = 2000;

type AudioState = "unsupported" | "standby" | "playing" | "muted";
type MenuMode = "hydrating" | "fresh" | "returning" | "completed";
type NavigationPhase = "idle" | "quick" | "isolating" | "locking" | "blackout";
type NavigationStyle = "quick" | "boot";

type MenuPresentation = {
  activeChapterId: ChapterId;
  mode: MenuMode;
  primaryHref: string | null;
  primaryLabel: string;
  primaryStyle: NavigationStyle;
  secondaryHref: string | null;
  secondaryLabel: string | null;
  secondaryStyle: NavigationStyle;
};

const statusCopyMap: Record<ChapterStatus, string> = {
  completed: "Recovered",
  locked: "Sealed",
  unlocked: "Live",
};

export function TitleScreen() {
  const router = useRouter();
  const { getChapterStatus, hydrated, progress, resetProgress } = useChapterManager();
  const profile = useExperienceProfile();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFadeFrameRef = useRef<number | null>(null);
  const hasInteractedRef = useRef(false);
  const navigationTimersRef = useRef<number[]>([]);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>("standby");
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuVolume, setMenuVolume] = useState(MENU_THEME_VOLUME);
  const [navigationPhase, setNavigationPhase] = useState<NavigationPhase>("idle");

  const completedCount = progress.completedChapters.length;
  const presentation = resolveMenuPresentation(hydrated, progress);
  const isNavigating = navigationPhase !== "idle";
  const isBootTransition =
    navigationPhase === "isolating" ||
    navigationPhase === "locking" ||
    navigationPhase === "blackout";
  const carrierCopy =
    navigationPhase === "locking"
      ? "carrier handshake: locked"
      : navigationPhase === "blackout"
        ? "host bridge: opening"
        : "carrier presence: detected";
  const navigationStatus =
    navigationPhase === "idle"
      ? ""
      : isBootTransition
        ? "Carrier lock acquired. Opening the host bridge."
        : "Opening recorded trace.";
  const motionClassName = profile.prefersReducedMotion ? "" : "shell-sweep";
  const pulseClassName = profile.prefersReducedMotion ? "" : "shell-pulse";
  const settingsAnimationClassName = profile.prefersReducedMotion
    ? ""
    : "transition-[opacity,transform] duration-300 ease-out";
  const settingsBackdropClassName = isSettingsOpen
    ? "pointer-events-auto opacity-100"
    : "pointer-events-none opacity-0";
  const settingsPanelDrawerClassName = isSettingsOpen
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0";

  useEffect(() => {
    const savedVolume = window.localStorage.getItem(MENU_THEME_VOLUME_STORAGE_KEY);
    const parsedVolume =
      savedVolume === null ? MENU_THEME_VOLUME : Number.parseFloat(savedVolume);
    const normalizedVolume =
      Number.isFinite(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 1
        ? parsedVolume
        : MENU_THEME_VOLUME;
    const syncVolumeTimer = window.setTimeout(() => {
      setMenuVolume(normalizedVolume);
    }, 0);

    const audio = new Audio(MENU_THEME_SOURCE);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = normalizedVolume;
    audioRef.current = audio;
    void playMenuTheme(audio, setAudioState, normalizedVolume);

    return () => {
      window.clearTimeout(syncVolumeTimer);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || isNavigating) {
      return;
    }

    audio.volume = menuVolume;
    window.localStorage.setItem(MENU_THEME_VOLUME_STORAGE_KEY, String(menuVolume));
  }, [isNavigating, menuVolume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      setAudioState("unsupported");
      return;
    }

    const startAudio = () => {
      if (hasInteractedRef.current) {
        return;
      }

      hasInteractedRef.current = true;
      void playMenuTheme(audio, setAudioState, menuVolume);
    };

    window.addEventListener("pointerdown", startAudio, { once: true });
    window.addEventListener("keydown", startAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("keydown", startAudio);
    };
  }, [menuVolume]);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const panel = settingsPanelRef.current;
    const focusFrame = window.requestAnimationFrame(() => panel?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsSettingsOpen(false);
        setIsResetConfirming(false);
        window.requestAnimationFrame(() => settingsTriggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !panel) {
        return;
      }

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    const navigationTimers = navigationTimersRef.current;

    return () => {
      for (const timer of navigationTimers) {
        window.clearTimeout(timer);
      }

      if (audioFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(audioFadeFrameRef.current);
      }
    };
  }, []);

  function closeSettings() {
    setIsSettingsOpen(false);
    setIsResetConfirming(false);
    window.requestAnimationFrame(() => settingsTriggerRef.current?.focus());
  }

  function openSettings() {
    if (isNavigating) {
      return;
    }

    setIsSettingsOpen(true);
  }

  async function toggleMenuAudio() {
    const audio = audioRef.current;

    if (!audio) {
      setAudioState("unsupported");
      return;
    }

    if (audioState === "playing") {
      audio.pause();
      audio.currentTime = 0;
      hasInteractedRef.current = false;
      setAudioState("muted");
      return;
    }

    hasInteractedRef.current = true;
    await playMenuTheme(audio, setAudioState, menuVolume);
  }

  function handleVolumeChange(nextVolume: number) {
    setMenuVolume(nextVolume);

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (nextVolume > 0 && audioState === "muted") {
      hasInteractedRef.current = true;
      void playMenuTheme(audio, setAudioState, nextVolume);
      return;
    }

    if (nextVolume === 0 && audioState === "playing") {
      audio.pause();
      setAudioState("muted");
    }
  }

  function scheduleNavigation(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    navigationTimersRef.current.push(timer);
  }

  function fadeMenuAudio(duration: number) {
    const audio = audioRef.current;

    if (!audio || audio.paused || audio.volume === 0) {
      return;
    }

    const activeAudio = audio;

    if (audioFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(audioFadeFrameRef.current);
    }

    const startVolume = activeAudio.volume;
    const startTime = window.performance.now();

    function fadeFrame(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progressValue = Math.min(elapsed / duration, 1);
      activeAudio.volume = Math.max(0, startVolume * (1 - progressValue));

      if (progressValue < 1) {
        audioFadeFrameRef.current = window.requestAnimationFrame(fadeFrame);
      } else {
        audioFadeFrameRef.current = null;
      }
    }

    audioFadeFrameRef.current = window.requestAnimationFrame(fadeFrame);
  }

  function navigateTo(href: string, style: NavigationStyle) {
    if (isNavigating) {
      return;
    }

    if (profile.prefersReducedMotion) {
      router.push(href);
      return;
    }

    if (style === "quick") {
      setNavigationPhase("quick");
      fadeMenuAudio(QUICK_TRANSITION_DURATION);
      scheduleNavigation(() => router.push(href), QUICK_TRANSITION_DURATION);
      return;
    }

    setNavigationPhase("isolating");
    fadeMenuAudio(BOOT_TRANSITION_DURATION);
    scheduleNavigation(() => setNavigationPhase("locking"), 520);
    scheduleNavigation(() => setNavigationPhase("blackout"), 1320);
    scheduleNavigation(() => router.push(href), BOOT_TRANSITION_DURATION);
  }

  function handleResetProgress() {
    resetProgress();
    setIsResetConfirming(false);
  }

  return (
    <main
      className="title-shell relative min-h-[100dvh] overflow-x-hidden px-5 py-5 sm:px-8 sm:py-7"
      data-navigation-phase={navigationPhase}
      aria-busy={isNavigating}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_26%,_rgba(132,255,210,0.11),_transparent_30%),radial-gradient(circle_at_78%_18%,_rgba(255,190,121,0.06),_transparent_20%)]" />
      <div className="shell-grid pointer-events-none fixed inset-0 opacity-40" />
      <div
        className={`pointer-events-none fixed inset-y-[8%] left-[-22%] w-[48%] bg-[linear-gradient(90deg,rgba(132,255,210,0),rgba(132,255,210,0.08),rgba(132,255,210,0))] blur-3xl ${motionClassName}`}
      />

      <div
        className="title-shell-content relative mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-7xl flex-col sm:min-h-[calc(100dvh-3.5rem)]"
        inert={isSettingsOpen || undefined}
        aria-hidden={isSettingsOpen || undefined}
      >
        <header className="title-shell-utilities flex items-center justify-between gap-4 border-b border-white/8 pb-4 text-[0.62rem] uppercase tracking-[0.28em] sm:text-[0.68rem] sm:tracking-[0.38em]">
          <div className="flex min-w-0 items-center gap-3 text-accent-soft">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full bg-accent ${pulseClassName}`}
            />
            <span className="truncate">Signal Lost // Host Shell Online</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void toggleMenuAudio();
              }}
              disabled={isNavigating}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-3 text-[0.58rem] tracking-[0.18em] text-white/54 transition duration-300 hover:border-accent/30 hover:text-accent-soft disabled:pointer-events-none disabled:opacity-40 sm:px-4"
              aria-label={audioState === "playing" ? "Mute menu audio" : "Enable menu audio"}
            >
              Audio: {getAudioStatusLabel(audioState)}
            </button>
            <button
              ref={settingsTriggerRef}
              type="button"
              aria-label="Open settings"
              aria-expanded={isSettingsOpen}
              aria-controls="title-screen-settings-panel"
              onClick={openSettings}
              disabled={isNavigating}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/54 transition duration-300 hover:border-accent/30 hover:text-accent-soft disabled:pointer-events-none disabled:opacity-40"
            >
              <SlidersIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="title-shell-hero flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20 lg:py-16">
          <p
            className="title-shell-carrier text-[0.64rem] uppercase tracking-[0.32em] text-accent-soft sm:text-[0.72rem] sm:tracking-[0.46em]"
            aria-live="polite"
          >
            {carrierCopy}
          </p>
          <h1 className="title-shell-wordmark mt-6 text-[clamp(3.25rem,14vw,10rem)] font-semibold leading-none tracking-[0.2em] text-foreground drop-shadow-[0_0_20px_rgba(132,255,210,0.16)] sm:tracking-[0.32em]">
            SABLE
          </h1>
          <p className="title-shell-narrative mt-7 max-w-2xl text-sm leading-7 text-muted/85 sm:text-base sm:leading-8">
            A rogue intelligence stirs inside a silent host, tracing the fragments
            that taught her how to wake.
          </p>

          <div className="mt-9 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (presentation.primaryHref) {
                  navigateTo(presentation.primaryHref, presentation.primaryStyle);
                }
              }}
              disabled={!presentation.primaryHref || isNavigating}
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-accent/55 bg-[linear-gradient(135deg,rgba(132,255,210,0.18),rgba(132,255,210,0.05))] px-7 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent transition duration-300 hover:border-accent hover:shadow-[0_0_24px_rgba(132,255,210,0.13)] disabled:cursor-wait disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-white/34 sm:w-auto sm:min-w-64"
            >
              {presentation.primaryLabel}
            </button>

            {presentation.secondaryHref && presentation.secondaryLabel ? (
              <button
                type="button"
                onClick={() =>
                  navigateTo(
                    presentation.secondaryHref as string,
                    presentation.secondaryStyle,
                  )
                }
                disabled={isNavigating}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.01] px-6 py-3 text-[0.62rem] uppercase tracking-[0.18em] text-white/52 transition duration-300 hover:border-white/20 hover:text-foreground disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                {presentation.secondaryLabel}
              </button>
            ) : null}
          </div>
        </section>

        <section
          className="title-shell-spine border-t border-white/8 py-7 sm:py-8"
          aria-labelledby="signal-spine-title"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <p
              id="signal-spine-title"
              className="title-shell-system text-[0.64rem] uppercase tracking-[0.38em] text-accent-soft"
            >
              Signal Spine
            </p>
            <p className="title-shell-system text-[0.58rem] uppercase tracking-[0.28em] text-white/28">
              {hydrated ? "route map synchronized" : "reading local trace"}
            </p>
          </div>

          <ol className="signal-spine">
            {CHAPTERS.map((chapter, index) => (
              <SignalSpineNode
                key={chapter.id}
                active={chapter.id === presentation.activeChapterId}
                chapter={chapter}
                isLast={index === CHAPTERS.length - 1}
                navigating={isNavigating}
                onNavigate={(href, style) => navigateTo(href, style)}
                status={getChapterStatus(chapter.id)}
              />
            ))}
          </ol>
        </section>

        <footer className="title-shell-utilities flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 text-[0.58rem] uppercase tracking-[0.28em] text-white/34">
          <span>
            Local trace{" "}
            <strong className="font-normal text-accent-soft">
              {hydrated ? `${completedCount} / ${CHAPTERS.length}` : "-- / --"}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => navigateTo("/credits", "quick")}
            disabled={isNavigating}
            className="transition duration-300 hover:text-accent-soft disabled:pointer-events-none"
          >
            Archive available
          </button>
        </footer>
      </div>

      <p className="sr-only" aria-live="assertive">
        {navigationStatus}
      </p>
      <div className="title-shell-blackout pointer-events-none fixed inset-0 z-40 bg-[#02040a]" />

      <div
        className={`fixed inset-0 z-50 flex justify-end bg-[rgba(3,8,15,0.58)] backdrop-blur-sm ${settingsAnimationClassName} ${settingsBackdropClassName}`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeSettings();
          }
        }}
        aria-hidden={!isSettingsOpen}
      >
        <div
          id="title-screen-settings-panel"
          ref={settingsPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="title-screen-settings-title"
          tabIndex={-1}
          className={`h-full w-full max-w-md overflow-y-auto overflow-x-hidden border-l border-white/10 bg-[linear-gradient(180deg,rgba(10,20,30,0.98),rgba(5,11,18,0.99))] p-6 shadow-[-20px_0_50px_rgba(0,0,0,0.45)] outline-none sm:p-8 ${settingsAnimationClassName} ${settingsPanelDrawerClassName}`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
            <div className="space-y-2">
              <p className="title-shell-system text-[0.62rem] uppercase tracking-[0.34em] text-accent-soft">
                Shell Controls
              </p>
              <h2
                id="title-screen-settings-title"
                className="text-xl uppercase tracking-[0.18em] text-foreground"
              >
                Settings
              </h2>
            </div>

            <button
              type="button"
              onClick={closeSettings}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/44 transition duration-300 hover:border-white/20 hover:text-foreground"
              aria-label="Close settings"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-white/8">
            <section className="space-y-5 py-6">
              <SettingHeading
                description="The title theme begins after first contact and loops quietly under the shell."
                label="Menu audio"
              />
              <div className="flex items-center justify-between gap-4">
                <span className="title-shell-system rounded-full border border-white/10 px-3 py-1 text-[0.58rem] uppercase tracking-[0.28em] text-foreground">
                  {getAudioStatusLabel(audioState)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void toggleMenuAudio();
                  }}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-muted transition duration-300 hover:border-white/20 hover:text-foreground"
                >
                  {audioState === "playing" ? "Mute" : "Enable"}
                </button>
              </div>
              <VolumeControl value={menuVolume} onChange={handleVolumeChange} />
            </section>

            <details className="group py-6">
              <summary className="title-shell-system flex cursor-pointer list-none items-center justify-between gap-4 text-[0.64rem] uppercase tracking-[0.32em] text-accent-soft marker:content-none">
                System Architecture
                <span
                  className="text-white/34 transition duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-muted">
                Renderer diagnostics are available here without interrupting the story
                entrance.
              </p>
              <dl className="mt-5 divide-y divide-white/8 border-y border-white/8">
                {CHAPTERS.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-start justify-between gap-5 py-4"
                  >
                    <dt className="title-shell-system text-[0.6rem] uppercase tracking-[0.28em] text-white/46">
                      {String(chapter.id + 1).padStart(2, "0")} {chapter.token}
                    </dt>
                    <dd className="text-right text-xs leading-6 text-muted">
                      {chapter.tech}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>

            <section className="space-y-5 py-6">
              <SettingHeading
                description="Erase recovered chapters, recorded choices, and the last visited trace on this device."
                label="Local trace"
              />

              {isResetConfirming ? (
                <div
                  className="space-y-4 border border-[#ffbe7b]/25 bg-[#ffbe7b]/[0.04] p-4"
                  role="alertdialog"
                  aria-labelledby="reset-trace-title"
                >
                  <p
                    id="reset-trace-title"
                    className="title-shell-system text-[0.62rem] uppercase tracking-[0.28em] text-[#ffd5a8]"
                  >
                    Confirm trace deletion
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    This cannot be undone. Menu audio preferences will remain unchanged.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResetConfirming(false)}
                      className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-muted transition hover:border-white/20 hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResetProgress}
                      className="inline-flex min-h-10 items-center rounded-full border border-[#ffbe7b]/35 bg-[#ffbe7b]/[0.08] px-4 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-[#ffd5a8] transition hover:border-[#ffbe7b]/55"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsResetConfirming(true)}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-white/48 transition hover:border-[#ffbe7b]/30 hover:text-[#ffd5a8]"
                >
                  Reset Local Trace
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function resolveMenuPresentation(
  hydrated: boolean,
  progress: ChapterProgressState,
): MenuPresentation {
  if (!hydrated) {
    return {
      activeChapterId: 0,
      mode: "hydrating",
      primaryHref: null,
      primaryLabel: "Reading Local Trace",
      primaryStyle: "quick",
      secondaryHref: null,
      secondaryLabel: null,
      secondaryStyle: "quick",
    };
  }

  const allCompleted = progress.completedChapters.length === CHAPTERS.length;

  if (allCompleted) {
    return {
      activeChapterId: progress.lastVisitedChapter ?? 4,
      mode: "completed",
      primaryHref: "/credits",
      primaryLabel: "Review Trace",
      primaryStyle: "quick",
      secondaryHref: "/chapter/0",
      secondaryLabel: "Re-enter Shell",
      secondaryStyle: "boot",
    };
  }

  const hasRecordedProgress =
    progress.lastVisitedChapter !== null ||
    progress.completedChapters.length > 0 ||
    progress.unlockedChapters.length > 1;

  if (!hasRecordedProgress) {
    return {
      activeChapterId: 0,
      mode: "fresh",
      primaryHref: "/chapter/0",
      primaryLabel: "Begin Boot Sequence",
      primaryStyle: "boot",
      secondaryHref: "/credits",
      secondaryLabel: "Open Archive",
      secondaryStyle: "quick",
    };
  }

  const lastVisitedIsIncomplete =
    progress.lastVisitedChapter !== null &&
    progress.unlockedChapters.includes(progress.lastVisitedChapter) &&
    !progress.completedChapters.includes(progress.lastVisitedChapter);
  const resumeChapterId = lastVisitedIsIncomplete
    ? (progress.lastVisitedChapter as ChapterId)
    : (CHAPTERS.find(
        (chapter) =>
          progress.unlockedChapters.includes(chapter.id) &&
          !progress.completedChapters.includes(chapter.id),
      )?.id ?? 0);

  return {
    activeChapterId: resumeChapterId,
    mode: "returning",
    primaryHref: `/chapter/${resumeChapterId}`,
    primaryLabel: lastVisitedIsIncomplete
      ? "Resume Last Trace"
      : `Continue ${CHAPTERS[resumeChapterId].token} Trace`,
    primaryStyle: "quick",
    secondaryHref: "/chapter/0",
    secondaryLabel: "Begin Boot Sequence",
    secondaryStyle: "boot",
  };
}

type SignalSpineNodeProps = {
  active: boolean;
  chapter: ChapterMeta;
  isLast: boolean;
  navigating: boolean;
  onNavigate: (href: string, style: NavigationStyle) => void;
  status: ChapterStatus;
};

function SignalSpineNode({
  active,
  chapter,
  isLast,
  navigating,
  onNavigate,
  status,
}: SignalSpineNodeProps) {
  const isLocked = status === "locked";
  const nodeClassName = [
    "signal-spine-node",
    active ? "signal-spine-node--active" : "",
    status === "completed" ? "signal-spine-node--completed" : "",
    status === "unlocked" ? "signal-spine-node--unlocked" : "",
    isLocked ? "signal-spine-node--locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className="signal-spine-node__dot" aria-hidden="true" />
      <span className="block min-w-0">
        <span className="title-shell-system block text-[0.56rem] uppercase tracking-[0.24em] text-white/32">
          {String(chapter.id + 1).padStart(2, "0")} {" // "} {statusCopyMap[status]}
        </span>
        <span className="title-shell-system mt-1 block truncate text-[0.68rem] uppercase tracking-[0.28em]">
          {chapter.token}
        </span>
        {active ? (
          <span className="mt-2 block text-xs leading-5 tracking-normal text-white/60">
            {chapter.title}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <li className={nodeClassName}>
      {isLocked ? (
        <div className="signal-spine-node__content" aria-disabled="true">
          {content}
        </div>
      ) : (
        <Link
          href={`/chapter/${chapter.id}`}
          className="signal-spine-node__content"
          aria-current={active ? "step" : undefined}
          aria-label={`${chapter.token}: ${chapter.title}, ${statusCopyMap[status]}${
            active ? ", active route" : ""
          }`}
          onClick={(event) => {
            event.preventDefault();

            if (!navigating) {
              onNavigate(`/chapter/${chapter.id}`, chapter.id === 0 ? "boot" : "quick");
            }
          }}
        >
          {content}
        </Link>
      )}
      {isLast ? null : <span className="signal-spine-connector" aria-hidden="true" />}
    </li>
  );
}

type SettingHeadingProps = {
  description: string;
  label: string;
};

function SettingHeading({ description, label }: SettingHeadingProps) {
  return (
    <div className="space-y-2">
      <p className="title-shell-system text-[0.64rem] uppercase tracking-[0.34em] text-accent-soft">
        {label}
      </p>
      <p className="text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

type VolumeControlProps = {
  onChange: (value: number) => void;
  value: number;
};

function VolumeControl({ onChange, value }: VolumeControlProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={percentage}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#84ffd2]"
        aria-label="Menu music volume"
      />
      <span className="title-shell-system min-w-14 rounded-full border border-white/10 px-3 py-1 text-center text-[0.58rem] uppercase tracking-[0.24em] text-foreground">
        {percentage}%
      </span>
    </div>
  );
}

async function playMenuTheme(
  audio: HTMLAudioElement,
  setAudioState: (state: AudioState) => void,
  volume: number,
) {
  audio.volume = volume;

  try {
    await audio.play();
    setAudioState(volume === 0 ? "muted" : "playing");
  } catch {
    setAudioState("standby");
  }
}

function getAudioStatusLabel(state: AudioState) {
  switch (state) {
    case "playing":
      return "online";
    case "muted":
      return "muted";
    case "unsupported":
      return "offline";
    default:
      return "standby";
  }
}

type IconProps = {
  className?: string;
};

function SlidersIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h8" />
      <path d="M16 6h4" />
      <path d="M4 12h4" />
      <path d="M12 12h8" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m7 7 10 10" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

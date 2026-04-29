"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { CHAPTERS } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import type { ChapterMeta, ChapterStatus } from "@/types/chapters";

const secondaryActionClassName =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.01] px-5 py-3 text-[0.68rem] uppercase tracking-[0.32em] text-muted transition duration-300 hover:border-white/18 hover:bg-white/[0.04] hover:text-foreground";

const statusToneMap: Record<ChapterStatus, string> = {
  completed: "border-accent/35 text-accent-soft",
  locked: "border-white/10 text-white/34",
  unlocked: "border-[#ffc48a]/35 text-[#ffd5a8]",
};

const statusDotMap: Record<ChapterStatus, string> = {
  completed: "bg-accent/85",
  locked: "bg-white/16",
  unlocked: "bg-[#ffbe7b]",
};

const statusCopyMap: Record<ChapterStatus, string> = {
  completed: "Recovered",
  locked: "Sealed",
  unlocked: "Live",
};

const MENU_THEME_SOURCE = "/audio/sable_menu_theme.mp3";
const MENU_THEME_VOLUME = 0.24;
const MENU_THEME_VOLUME_STORAGE_KEY = "signal-lost:menu-theme-volume";

export function TitleScreen() {
  const { getChapterStatus, hydrated, progress, resetProgress } = useChapterManager();
  const profile = useExperienceProfile();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const [audioState, setAudioState] = useState<
    "unsupported" | "standby" | "playing" | "muted"
  >("standby");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuVolume, setMenuVolume] = useState(MENU_THEME_VOLUME);

  const completedCount = progress.completedChapters.length;
  const unlockedCount = progress.unlockedChapters.length;
  const lastVisitedLabel =
    progress.lastVisitedChapter === null
      ? "No trace recorded."
      : `Last contact: ${CHAPTERS[progress.lastVisitedChapter].token}`;
  const resumeHref =
    progress.lastVisitedChapter === null
      ? null
      : `/chapter/${progress.lastVisitedChapter}`;
  const shouldCondenseSignals =
    !profile.isCompactViewport && profile.supportsHover && !profile.hasCoarsePointer;
  const motionClassName = profile.prefersReducedMotion ? "" : "shell-drift";
  const sweepClassName = profile.prefersReducedMotion ? "" : "shell-sweep";
  const pulseClassName = profile.prefersReducedMotion ? "" : "shell-pulse";
  const priorityChapter =
    CHAPTERS.find((chapter) => getChapterStatus(chapter.id) !== "completed") ??
    CHAPTERS[CHAPTERS.length - 1];
  const priorityStatus = getChapterStatus(priorityChapter.id);
  const audioStatusLabel = getAudioStatusLabel(audioState);
  const settingsAnimationClassName = profile.prefersReducedMotion
    ? ""
    : "transition-[opacity,transform] duration-300 ease-out";
  const settingsBackdropClassName = isSettingsOpen
    ? "pointer-events-auto opacity-100"
    : "pointer-events-none opacity-0";
  const settingsPanelClassName = isSettingsOpen
    ? "translate-y-0 opacity-100"
    : "-translate-y-3 opacity-0";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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

    if (!audio) {
      return;
    }

    audio.volume = menuVolume;
    window.localStorage.setItem(MENU_THEME_VOLUME_STORAGE_KEY, String(menuVolume));
  }, [menuVolume]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    settingsPanelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

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

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-5 sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,_rgba(132,255,210,0.14),_transparent_24%),radial-gradient(circle_at_78%_16%,_rgba(255,190,121,0.1),_transparent_18%),radial-gradient(circle_at_72%_72%,_rgba(71,179,255,0.08),_transparent_26%)]" />
      <div
        className={`shell-grid pointer-events-none absolute inset-0 opacity-50 ${motionClassName}`}
      />
      <div
        className={`pointer-events-none absolute inset-x-[-12%] top-[10%] h-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(10,24,38,0.58),_rgba(6,11,20,0))] blur-3xl ${motionClassName}`}
      />
      <div
        className={`pointer-events-none absolute right-[-10%] top-[18%] h-[26rem] w-[48rem] rounded-full bg-[radial-gradient(circle,_rgba(255,188,111,0.12),_rgba(255,188,111,0))] blur-3xl ${motionClassName}`}
      />
      <div
        className={`pointer-events-none absolute inset-y-[6%] left-[-18%] w-[46%] bg-[linear-gradient(90deg,rgba(132,255,210,0),rgba(132,255,210,0.11),rgba(132,255,210,0))] blur-2xl ${sweepClassName}`}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent)]" />

      <div className="relative min-h-[calc(100vh-2.5rem)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(132,255,210,0),rgba(132,255,210,0.42),rgba(132,255,210,0))]" />

        <div className="relative grid min-h-[calc(100vh-2.5rem)] gap-10 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-0">
          <section className="relative pt-8 xl:pr-12">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.09),rgba(255,255,255,0))] xl:block" />

            <div className="relative flex h-full flex-col gap-10">
              <header className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.68rem] uppercase tracking-[0.42em] text-accent-soft">
                    <span>Signal Lost // Shell Online</span>
                    <span className="text-white/24">Command Deck</span>
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-wrap items-end gap-4">
                      <h1 className="text-5xl font-semibold leading-none tracking-[0.34em] text-foreground sm:text-7xl xl:text-[8rem]">
                        SABLE
                      </h1>
                      <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[0.64rem] uppercase tracking-[0.32em] text-accent-soft">
                        <span
                          className={`h-1.5 w-1.5 rounded-full bg-accent ${pulseClassName}`}
                        />
                        Carrier awake
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                      A rogue intelligence stirs inside a silent host, reading the
                      fragments it inherits while the surrounding system tries to decide
                      if the signal is a glitch, a witness, or a threat.
                    </p>
                  </div>
                </div>

                <div className="self-start border-y border-white/8 py-4 text-[0.68rem] uppercase tracking-[0.3em] text-muted">
                  <TelemetryLine
                    label="Persistence"
                    value={hydrated ? "Online" : "Bootstrapping"}
                    valueTone="text-foreground"
                  />
                  <TelemetryLine label="Archive" value={`${completedCount} recovered`} />
                  <TelemetryLine
                    label="Priority route"
                    value={`Chapter ${priorityChapter.id} // ${priorityChapter.token}`}
                    valueTone={
                      priorityStatus === "completed"
                        ? "text-accent-soft"
                        : "text-[#ffd5a8]"
                    }
                  />
                </div>
              </header>

              <div className="grid flex-1 gap-12 xl:grid-cols-[minmax(0,0.88fr)_minmax(18rem,0.92fr)] xl:items-start">
                <section className="space-y-8">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,15rem)_repeat(2,minmax(0,1fr))] xl:max-w-4xl">
                    <Link
                      href="/chapter/0"
                      className="inline-flex min-h-14 items-center justify-center rounded-full border border-accent/55 bg-[linear-gradient(135deg,rgba(132,255,210,0.18),rgba(132,255,210,0.06))] px-6 py-4 text-[0.72rem] uppercase tracking-[0.34em] text-accent transition duration-300 hover:border-accent hover:bg-[linear-gradient(135deg,rgba(132,255,210,0.26),rgba(132,255,210,0.08))]"
                    >
                      Begin Boot Sequence
                    </Link>
                    {resumeHref ? (
                      <Link href={resumeHref} className={secondaryActionClassName}>
                        Resume Last Trace
                      </Link>
                    ) : null}
                    <Link href="/credits" className={secondaryActionClassName}>
                      View Credits
                    </Link>
                    <button
                      type="button"
                      onClick={resetProgress}
                      className={secondaryActionClassName}
                    >
                      Reset Progress
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-white/8 py-4 text-[0.68rem] uppercase tracking-[0.3em] text-white/34">
                    <span className="text-accent-soft">Route shell stable</span>
                    <span>Persistence mirrors local trace</span>
                    <span>Five live channels indexed</span>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
                    <div className="grid gap-5">
                      <InlineReadout
                        label="State"
                        value="Progress survives refresh and route changes."
                      />
                      <InlineReadout
                        label="Renderers"
                        value="Chapters 0 through 4 now own full-screen first-pass scenes."
                      />
                      <InlineReadout
                        label="Flow"
                        value="Credits and ending continuity remain attached to the shell."
                      />
                    </div>

                    <div className="border-l border-white/8 pl-5">
                      <p className="text-[0.66rem] uppercase tracking-[0.34em] text-accent-soft">
                        Trace Advisory
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        Chapters 2 through 4 were framed first for larger desktop
                        fields, though the shell remains fully readable on compact or
                        touch-first devices.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="relative self-start pt-5">
                  <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0),rgba(255,255,255,0.08))]" />
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.38em] text-accent-soft">
                        Sequence Scan
                      </p>
                      <p className="max-w-md text-sm leading-7 text-muted">
                        Scan live channels, reopen recovered traces, and watch the next
                        unstable route come into focus.
                      </p>
                    </div>
                    <div className="hidden min-w-[7rem] rounded-full border border-white/8 px-3 py-2 text-right text-[0.62rem] uppercase tracking-[0.3em] text-white/38 sm:block">
                      {unlockedCount} / {CHAPTERS.length} live
                    </div>
                  </div>

                  <div className="mt-6">
                    {CHAPTERS.map((chapter) => (
                      <SignalRow
                        key={chapter.id}
                        chapter={chapter}
                        detailMode={shouldCondenseSignals ? "hover" : "always"}
                        status={getChapterStatus(chapter.id)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>

          <aside className="relative pt-8 xl:pl-8">
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.12),rgba(255,255,255,0))] xl:hidden" />
            <div className="relative border-t border-white/8 pt-8 xl:border-t-0 xl:pt-0">
              <div className="relative overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(132,255,210,0.04),rgba(8,16,24,0.92)_18%,rgba(4,9,16,0.96)),linear-gradient(90deg,rgba(7,19,28,0.36),rgba(7,19,28,0.08))] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_12%)]" />
                <div className="relative flex h-full flex-col gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[0.68rem] uppercase tracking-[0.4em] text-accent-soft">
                        Telemetry Rail
                      </p>
                      <button
                        type="button"
                        aria-label="Open settings"
                        aria-expanded={isSettingsOpen}
                        aria-controls="title-screen-settings-panel"
                        onClick={() => setIsSettingsOpen(true)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[rgba(255,255,255,0.02)] text-muted transition duration-300 hover:border-white/18 hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground"
                      >
                        <SlidersIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="max-w-[15rem] text-sm leading-7 text-muted">
                      Live shell readouts stay anchored here while adjustable options move
                      into settings as the interface grows.
                    </p>
                  </div>

                  <dl className="grid gap-0 text-sm text-muted">
                    <RailMetric
                      label="Shell status"
                      value={hydrated ? "Persistence online" : "Bootstrapping cache"}
                    />
                    <RailMetric
                      label="Recovered chapters"
                      value={`${completedCount} of ${CHAPTERS.length}`}
                    />
                    <RailMetric label="Unlocked routes" value={`${unlockedCount} live`} />
                    <RailMetric label="Recent trace" value={lastVisitedLabel} />
                  </dl>

                  <div className="space-y-4 border-t border-white/8 pt-6">
                    <p className="text-[0.66rem] uppercase tracking-[0.34em] text-white/46">
                      Signal Pressure
                    </p>
                    <div className="space-y-3 text-sm text-muted">
                      <PressureRow
                        colorClassName="bg-accent"
                        label="Memory warmth"
                        value="stable drift"
                      />
                      <PressureRow
                        colorClassName="bg-[#5cc0ff]"
                        label="Signal density"
                        value="rising"
                      />
                      <PressureRow
                        colorClassName="bg-[#ffbe7b]"
                        label="Interference noise"
                        value="contained"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-20 flex items-start justify-end bg-[rgba(3,8,15,0.74)] px-5 py-5 backdrop-blur-sm sm:px-7 sm:py-7 ${settingsAnimationClassName} ${settingsBackdropClassName}`}
        onClick={() => setIsSettingsOpen(false)}
      >
        <div
          id="title-screen-settings-panel"
          ref={settingsPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="title-screen-settings-title"
          tabIndex={-1}
          className={`w-full max-w-md border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,30,0.98),rgba(5,11,18,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] outline-none ${settingsAnimationClassName} ${settingsPanelClassName}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
            <div className="space-y-2">
              <p className="text-[0.64rem] uppercase tracking-[0.34em] text-accent-soft">
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
              onClick={() => setIsSettingsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-white/44 transition duration-300 hover:border-white/10 hover:bg-white/[0.03] hover:text-foreground"
              aria-label="Close settings"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 pt-6">
            <SettingRow
              label="Menu audio"
              description="The title theme begins after first contact and loops quietly under the shell."
              value={audioStatusLabel}
              actionLabel={audioState === "playing" ? "Mute" : "Enable"}
              onAction={toggleMenuAudio}
            />
            <VolumeControl value={menuVolume} onChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    </main>
  );
}

async function playMenuTheme(
  audio: HTMLAudioElement,
  setAudioState: (state: "unsupported" | "standby" | "playing" | "muted") => void,
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

function getAudioStatusLabel(state: "unsupported" | "standby" | "playing" | "muted") {
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

type InlineReadoutProps = {
  label: string;
  value: string;
};

type SettingRowProps = {
  actionLabel: string;
  description: string;
  label: string;
  onAction: () => void | Promise<void>;
  value: string;
};

function SettingRow({
  actionLabel,
  description,
  label,
  onAction,
  value,
}: SettingRowProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/8 pb-6 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-xs space-y-2">
        <p className="text-[0.66rem] uppercase tracking-[0.34em] text-accent-soft">{label}</p>
        <p className="text-sm leading-7 text-muted">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => {
            void onAction();
          }}
          className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[0.62rem] uppercase tracking-[0.3em] text-muted transition duration-300 hover:border-white/18 hover:text-foreground"
        >
          {actionLabel}
        </button>
      </div>
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
    <div className="space-y-4 border-b border-white/8 pb-6 last:border-b-0 last:pb-0">
      <div className="space-y-2">
        <p className="text-[0.66rem] uppercase tracking-[0.34em] text-accent-soft">
          Music volume
        </p>
        <p className="text-sm leading-7 text-muted">
          Set how present the title theme should feel while the shell is idle.
        </p>
      </div>

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
        <span className="min-w-12 rounded-full border border-white/10 px-3 py-1 text-center text-[0.6rem] uppercase tracking-[0.3em] text-foreground">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function InlineReadout({ label, value }: InlineReadoutProps) {
  return (
    <div className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.64rem] uppercase tracking-[0.34em] text-accent-soft">{label}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{value}</p>
    </div>
  );
}

type PressureRowProps = {
  colorClassName: string;
  label: string;
  value: string;
};

function PressureRow({ colorClassName, label, value }: PressureRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${colorClassName}`} />
        <span>{label}</span>
      </div>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

type RailMetricProps = {
  label: string;
  value: string;
};

function RailMetric({ label, value }: RailMetricProps) {
  return (
    <div className="border-b border-white/8 py-4 last:border-b-0 last:pb-0">
      <dt className="text-[0.64rem] uppercase tracking-[0.34em] text-white/42">{label}</dt>
      <dd className="mt-3 text-sm leading-7 text-foreground">{value}</dd>
    </div>
  );
}

type SignalRowProps = {
  chapter: ChapterMeta;
  detailMode: "always" | "hover";
  status: ChapterStatus;
};

function SignalRow({ chapter, detailMode, status }: SignalRowProps) {
  const detailClassName =
    detailMode === "hover"
      ? "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin,transform] duration-500 ease-out group-hover:mt-3 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:mt-3 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100"
      : "mt-3";

  return (
    <Link
      href={`/chapter/${chapter.id}`}
      className="group block border-b border-white/8 px-3 py-5 transition-[border-color,transform,box-shadow] duration-500 ease-out last:border-b-0 hover:translate-x-1 hover:border-white/12 hover:shadow-[inset_0_1px_0_rgba(132,255,210,0.04)] focus-visible:translate-x-1 focus-visible:border-white/12 focus-visible:shadow-[inset_0_1px_0_rgba(132,255,210,0.04)] focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-125 group-focus-visible:scale-125 ${statusDotMap[status]}`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-accent-soft">
                Chapter {chapter.id} {" // "} {chapter.token}
              </p>
              <span className="text-[0.68rem] uppercase tracking-[0.26em] text-white/28">
                {chapter.tech}
              </span>
            </div>
            <p className="mt-2 text-base text-foreground transition duration-300 group-hover:text-accent-soft group-focus-visible:text-accent-soft">
              {chapter.title}
            </p>
            <div className={detailClassName}>
              <div className="overflow-hidden">
                <p className="max-w-md translate-y-2 text-sm leading-7 text-muted transition duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  {chapter.summary}
                </p>
              </div>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] ${statusToneMap[status]}`}
        >
          {statusCopyMap[status]}
        </span>
      </div>
    </Link>
  );
}

type TelemetryLineProps = {
  label: string;
  value: string;
  valueTone?: string;
};

function TelemetryLine({
  label,
  value,
  valueTone = "text-muted",
}: TelemetryLineProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span>{label}</span>
      <span className={`text-right ${valueTone}`}>{value}</span>
    </div>
  );
}

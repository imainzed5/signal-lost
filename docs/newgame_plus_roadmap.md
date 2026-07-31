# Signal Lost New Game+ Roadmap

Status: Parked until the five-chapter prequel reaches a gold-master polish pass

This document covers replay and New Game+ modes for the existing prequel. It is separate from the post-escape Part II direction in `docs/part-two-direction.md`.

## Prerequisites

- Credits page polish
- Smooth Escape-to-Credits transition
- Title-screen indication that a complete run has been recorded
- Stable replay, refresh persistence, audio cleanup, and route behavior

## Modes

### Mode A: Inverted Run

> She came back.

SABLE escaped but chooses to re-enter the system voluntarily. The same five chapters play in reverse order with inverted or monochrome aesthetics. Signals flow inward instead of outward, terminals print backward, and the tone shifts from urgency toward resignation.

Potential changes:

- reverse chapter order in the shell;
- alternate intro lines per chapter;
- desaturated or inverted accent palette;
- a return-arc outro in the credits.

Narrative payoff: escape was the easy part; choosing to go back is harder.

### Mode B: New Entity

> Something else was in the system.

A second complete run reveals another entity that was present but invisible to SABLE. New dialogue appears in each chapter, with different choices and a different credits summary.

Potential changes:

- parallel dialogue layers rather than replacing the original arc;
- new choice options per chapter;
- a distinct name and voice register;
- a second ending-summary branch.

Narrative payoff: replay feels like reading a familiar document with the wrong frame removed.

### Mode C: Observer Mode

> The recording.

The player is not SABLE, but an observer reconstructing her trace after she left. Chapters are subtly degraded: missing words, static bleed-through, and choices that are uncertain or unavailable.

Potential changes:

- `// PLAYBACK` chapter framing and timestamps;
- selective `[REDACTED]` or corruption substitutions;
- reconstruction warnings on locked choices;
- credits reframed as an archival document.

Narrative payoff: the original story was already a recording, and this mode admits it.

### Mode D: Corruption

> The system remembers.

The lightest replay layer. Subsequent runs carry visible artifacts from previous runs: ghost text, residual particle trails, or oscillator noise at chapter start.

Potential changes:

- add a `runCount` field to `ChapterProgressState`;
- cap corruption intensity after run three;
- keep mechanics and choices unchanged.

Narrative payoff: the world is visibly worn by repeated play.

## Recommended build order

| Phase | Work | Depends on |
|---|---|---|
| 0 | Credits polish and Escape-to-Credits transition | Prequel gold-master pass |
| 1 | Title-screen complete-run marker | Phase 0 |
| 2 | Mode D: Corruption layer | Phase 1 |
| 3 | Mode C: Observer Mode | Phase 2 |
| 4 | Mode A: Inverted Run | Phase 3 |
| 5 | Mode B: New Entity | Phase 4 |

## State extension

When New Game+ work is approved, the current progress state may gain:

```ts
runCount: number;
activeMode: "standard" | "inverted" | "entity" | "observer" | "corrupted";
```

Add migration and sanitization before reading these values in chapter code. Do not introduce this state while the prequel baseline is still changing.

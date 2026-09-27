# Signal Lost Project Status

Last reviewed: 2026-08-02

This is the current implementation snapshot for the five-chapter prequel polish phase. The approved Chapters 2-4 Final-Act Improvement Program is implemented and its milestone evidence is recorded under `docs/remaining-chapters-improvement/`.

## Overall state

Signal Lost is playable from the title screen through all five chapters and Credits. The chapter manager persists unlocks, completions, choices, and the last visited chapter in localStorage. The experience has no fail states, backend, authentication, database, or server persistence.

The title screen and Credits use a story-first command-shell hierarchy. Credits now functions as the final narrative beat: it resolves LEAVE/VANISH into distinct branch copy, records all five stances without inventing missing decisions, supports replay links, and uses a deliberate two-step local-trace reset.

The canonical renderer progression remains:

`BOOT: CSS -> MEMORY: CSS 3D -> SIGNAL: Canvas 2D -> INTERFERENCE: WebGL -> ESCAPE: Matter.js/Web Audio`

This mapping is the implementation baseline; see `docs/decisions/0001-canonical-rendering-progression.md`.

## Visual transformation (in progress, 2026-09-27)

Art direction: **cinematic glitch** — deep blacks, SABLE as the single warm ember (`--sable`) against cold host steel (`--host`), light/bloom, kinetic type, film grain. Concept: "one signal, five mediums" — SABLE is one persistent entity that the renderer progression re-embodies chapter by chapter.

- **Phase 1 — shell and connective tissue (implemented):** `src/components/shell/` adds `SableCore` (Canvas 2D presence: ember nucleus, broken host rings, inward signal motes, pointer gaze, glitch tears, boot collapse), `GlitchText` (decode + channel tear), and `RouteTransition` (CRT shutter between routes). Title screen recomposed around the core; global film grain; shell palette tokens; developer-facing copy removed from Chapters 2–4.
- **Phase 2 — chapter scene rework (not started):** break the shared four-panel HUD grammar, restage Chapter 0 around the voice, bring each chapter's palette onto the SABLE/host tokens, re-embody the core in each renderer.
- **Phase 3 — feel and polish (not started):** input juice (hit-stop, shake, chromatic split, bloom), audio-reactive visuals, Credits restaging.

## Chapter status

| Chapter | Implementation | Current status |
|---|---|---|
| 0 BOOT | CSS terminal sequence with authored pacing, host trace, branch consequences, and MEMORY handoff | Stable; inherited replay/audio/reduced-motion QA remains documented separately |
| 1 MEMORY | CSS 3D archive with authored responsive stacks, host takeover, free recovery order, and KEEP/DECAY aftermaths | Stable; final gold run completed full keyboard/pointer-compatible archive recovery evidence |
| 2 SIGNAL | Raw Canvas 2D authored contact field with ECHO/RELAY/GHOST progression, explicit ANSWER/MASK stance, and no-fail activation | Final-act implementation complete; compact overflow and both branch paths verified |
| 3 INTERFERENCE | Raw WebGL 1 / GLSL adaptive containment with assistance, fracture/rupture phases, explicit PUSH/SLIP stance, and CSS fallback | Final-act implementation complete; normal, fallback, PUSH, and SLIP paths verified |
| 4 ESCAPE | Matter.js authored four-act structural breach with guarded Web Audio, explicit LEAVE/VANISH release, and Credits handoff | Final-act implementation complete; all seven releases, both branches, replay, compact layout, and cleanup verified |
| Credits | Story-first ending account with branch copy, replay controls, neutral missing-choice rendering, and reset confirmation | Final-act implementation complete; canonical full-run account verified |

## Current validation

- `npm run lint`: passing after the Chapter 2 effect diagnostic was resolved in Milestone 01.
- `npm run build`: passing after the final Chapters 2-4/Credits implementation.
- `git diff --check`: no whitespace errors; only normal line-ending notices are present for changed files.
- Browser evidence: a live 1440x900 BOOT-to-Credits run recorded Trace / Keep / Answer / Push / Leave; alternate MASK, SLIP, VANISH, and neutral/reset paths were also exercised at their route boundaries.
- Failure evidence: Chapter 3 forced shader fallback reached its stance/completion flow; Chapter 3 and Chapter 4 audio failure handling is guarded and source-backed; SIGNAL remains intentionally silent.
- Responsive evidence: 1440x900, 390x844, and 360x640 routes were inspected; the refreshed Chapter 4 compact sequence preserved exact 360x640 document bounds and released all seven structures.
- No Git staging, commit, reset, discard, push, or PR action has been performed for this work.

The complete final matrix, including explicit source-backed versus live evidence and baseline/regression disposition, is [`Milestone 05 validation matrix`](remaining-chapters-improvement/milestones/05-final-act-continuity-gold-master/04-validation-matrix.md).

## Architecture and scope guardrails

- Chapter internals remain isolated under their chapter folders and retain the `onComplete: () => void` contract.
- Cross-chapter consequences use explicit serializable choice props and the existing chapter manager; renderer objects never cross chapters.
- The persisted state shape remains `unlockedChapters`, `completedChapters`, `choices`, and `lastVisitedChapter`.
- Choice strings remain canonical: Trace the source / Claim autonomy, Keep the archive / Let it decay, Answer the chorus / Mask the signal, Push through / Slip between pulses, Leave a trace behind / Vanish cleanly.
- Part II, Three.js, New Game+, backend work, and outside-world depiction remain parked.

## Gold-master checklist

- [x] Full run from BOOT to Credits
- [x] Replay and route-away cleanup evidence
- [x] Stored choice and neutral reset reconstruction
- [x] Desktop visual pass
- [x] Compact/mobile visual pass
- [x] Reduced-motion implementation/evidence review
- [x] Audio-blocked and unavailable-audio implementation/evidence review
- [x] WebGL fetch/compile failure path
- [x] Escape-to-Credits continuity
- [x] `npm run lint` passes
- [x] `npm run build` passes

Independent Sol review and a separate user playtest verdict are not represented as completed in the milestone README because they require an external reviewer/user; the implementation and user-authorized gold-master evidence are complete.

## Known product questions

1. Should locked chapters be inaccessible through direct URLs, or should direct route access remain an intentional preview feature?
2. What should the visual and narrative handoff from ESCAPE to Credits feel like beyond the accepted prequel release?
3. What exactly is the outside world in Part II: physical/IoT space, an abstract network, other systems and AIs, or a hybrid?

## Explicitly parked

- Part II story scoping
- Outside-world definition
- Three.js implementation
- New Game+ modes

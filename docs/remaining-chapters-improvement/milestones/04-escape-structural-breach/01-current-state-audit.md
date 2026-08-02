# 01 - Current-State Audit

## Current architecture

- `index.tsx`: one component owns Matter engine, bodies, DOM transforms, escape detection, audio, HUD, and completion.
- `fragments.ts`: seven fixed-size normalized objects.
- `escape.module.css`: full-screen field behind two-column/stacked HUD, three telemetry panels, pale void.
- Route adds a generic `SceneReveal` before the chapter and a generic LEAVE/VANISH overlay after completion.

## Current flow

1. All seven body/buttons exist immediately.
2. Continuous weak force moves bodies outward.
3. Click adds strong outward impulse and starts two oscillators.
4. Body beyond viewport plus 260px is removed/marked escaped.
5. Seven escaped -> white void -> 1200ms `onComplete`.
6. Generic route overlay saves final stance and links to Credits.

## Preserve

- Named seven structures and their broad visual tones.
- Matter.js DOM-body relationship and tactile impulse.
- Semantic button basis.
- Rising tension/release audio concept.
- Pale outside as unresolved non-environment.

## Design gaps

- Every object behaves as the same physics target.
- Architectural/narrative order is absent.
- Signal Gate is destroyed rather than passed through.
- Shell Core is not the legacy decision.
- HUD describes implementation metrics more than story state.
- Immediate pale void erases branch meaning before it exists.

## Technical baseline

- Resize calls full `registerFragments`: clears world and resets escaped set, counts, energy, completion, and void.
- Fixed body sizes exceed comfortable compact composition.
- HUD at z-index 2 covers field and can intercept pointer hit testing.
- Completion timeout is not retained/canceled.
- Audio constructor/resume/failure/retry path is incomplete.
- No reduced-motion behavior exists.
- Engine/RAF cleanup exists; verify constraints/events/timers after redesign.

## Browser/source evidence

- Desktop static DOM exposed all seven controls and duplicate SceneReveal + chapter title.
- Compact layout stacked intro and three panels into ~896px while target viewport was 844px; bodies remained fixed-sized in source.
- Planning browser did not advance effects/physics, so real body alignment, pointer hit testing, flight, and completion must be captured before edits in the implementation environment.

## Prior-choice availability

- Chapter 1, 2, and 3 choices are already persisted.
- Route can pass MEMORY, SIGNAL, and INTERFERENCE values explicitly without state migration.
- Current Chapter 4 choice values already exist in route metadata and Credits.

## Risks

- DOM button, Matter body, and semantic act state can diverge.
- Free physics can move future required objects before unlock.
- Resize/orientation can invalidate constraints and DOM measurements.
- Focus can disappear when a selected semantic object visually fragments.
- High-energy clicks can create loud/frequent audio unless capped/debounced.
- Final branch and `onComplete` ordering can expose Credits too soon or fire twice.

## Baseline versus regression

Reconfirm Milestone 01 physics baseline and Milestone 03 handoff. Existing generic visual limitations are authorized redesign targets. Any lost completion, input, persistence, cleanup, or accepted earlier-chapter behavior is a regression.

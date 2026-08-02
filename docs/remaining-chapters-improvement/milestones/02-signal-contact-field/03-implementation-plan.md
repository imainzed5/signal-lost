# 03 - Implementation Plan

## Phase 0 - Dependency and before-state

Re-run Milestone 01 commands/matrix smoke checks. Capture opening/current completion at 1440x900, 390x844, 1280x640, keyboard, and touch. Stop if foundations regressed.

## Phase 1 - Authored scene state and Canvas ownership

1. Define one explicit sequence/state model: dormant opening, Echo locate/tune/carry, Relay, Ghost, convergence, choice preview, committed aftermath, settled.
2. Keep frame values in scene-owned refs/classes and semantic transitions in bounded React state.
3. Introduce a stable seed and separate semantic encounter data from draw helpers.
4. Preserve Milestone 01 disposal, resize, reduced-motion, and focus contracts.

Acceptance: state transitions are deterministic, replay resets, resize preserves current encounter, no generic renderer abstraction.

## Phase 2 - Field, carrier, and responsive composition

1. Establish sparse deep/contact/pressure layers and quiet initial field.
2. Implement carrier initial and MEMORY texture states.
3. Replace persistent sidebar with context HUD and semantic status.
4. Author desktop, compact, and short layout maps rather than scaled normalized desktop coordinates.

Acceptance: initial screenshot reads empty/listening; essential controls fit all target viewports; missing prior choice is neutral.

## Phase 3 - Echo, Relay, Ghost vertical slices

Implement each contact completely before the next:

1. Visual locate cue.
2. Tune rule and forgiveness.
3. Carry route.
4. Canonical selected copy and semantic equivalent.
5. Retained trace.
6. Pointer/touch/keyboard/reduced-motion equivalents.
7. Performance/profile check.

Gate after each slice: complete at four target viewports and three input modes; previous retained traces survive.

## Phase 4 - Convergence, choice, and aftermaths

1. Activate all three retained signatures and SABLE declaration.
2. Add host reconstruction scan and transition pressure.
3. Implement reversible ANSWER/MASK carrier previews.
4. Persist only explicit confirmation.
5. Play both canonical aftermaths.
6. Expose Chapter 3 continuation only after aftermath settles.

Acceptance: saved values unchanged; `onComplete` once; replay of a completed chapter still runs full scene and allows a new selection.

## Phase 5 - Hardening and evidence

- Keyboard/coarse touch/reduced motion.
- Resize/orientation/visibility interruption.
- Refresh before/after choice and persistence into Chapter 3.
- Route-away during every encounter/aftermath.
- Performance profiling at DPR 1/2 and compact.
- Lint/build/diff check and all matrix rows.

## Stop conditions

Stop if design requires WebGL/Three.js, a new audio system, shared renderer state, choice migration, fail state, revised canon, or Chapter 3 implementation beyond handoff prop/transition data.

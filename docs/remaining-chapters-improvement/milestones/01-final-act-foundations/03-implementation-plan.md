# 03 - Implementation Plan

## Phase 0 - Reconfirm baseline

Prerequisites: approved package and Git checkpoint.

Steps:

1. Inspect `git status`, current diff, and Chapter 2-4 files.
2. Run lint/build; copy exact baseline into `04-validation-matrix.md`.
3. Capture current desktop/compact/short screenshots in a browser that runs effects and RAF.

Gate: evidence matches or any drift is documented before edits.

## Phase 1 - Shared data and disposal contracts

Expected files: `ChapterRouteView.tsx`; chapter-local files only.

Steps:

1. Read prior choices in the route and pass typed optional props to Chapters 2-4 as needed.
2. Preserve `onComplete` and choice strings/state shape.
3. Establish chapter-local disposable registries/hooks or explicit cleanup collections; do not create a cross-chapter renderer engine.
4. Ensure completion callbacks are idempotent and cancelable on unmount/replay.

Acceptance:

- no chapter reads another chapter directly;
- route props are neutral when a prior choice is absent;
- replay/route-away cannot fire stale completion.

## Phase 2 - Chapter 2 correctness baseline

Steps:

1. Derive saved-choice reveal initial state without direct effect mutation.
2. Separate or encapsulate simulation/disposable ownership only as far as required.
3. Replace frame-loop completion state calls with event/transition ownership.
4. Add focusable Canvas semantics and current-flow keyboard input.
5. Use measured delta; cap DPR; preserve semantic progress on resize.
6. Add a reduced-motion renderer flag.
7. Recompose compact/short telemetry to remove overlap/clipping.

Fallback/rollback: if safe separation changes first-pass behavior, keep functions in one module but centralize resources and document why a new file was not added.

Gate: lint clean; current pointer flow completes; keyboard/touch paths complete; saved replay works.

## Phase 3 - Chapter 3 failure and lifecycle baseline

Steps:

1. Make WebGL context/fetch/compile/link failure select a playable CSS/DOM mode.
2. Decouple intro/control enablement from shader readiness.
3. Correct DPR/resolution/aspect and measured-frame timing.
4. Track/cancel deflect, audio, intro, and completion timers.
5. Make audio start state retryable and silent-failure-safe.
6. Add a shader reduced-motion input or baseline static mode.
7. Fit compact/short essential UI; collapse secondary log/classification.
8. Keep current mechanics/copy otherwise unchanged.

Gate: complete/save/continue in normal WebGL and forced failure; no stale work after route-away.

## Phase 4 - Chapter 4 interaction and lifecycle baseline

Steps:

1. Make HUD wrappers pointer-transparent; opt actual controls back in.
2. Preserve bodies and escaped IDs across resize. Reposition/scale safely rather than calling full registration.
3. Add bounded responsive object dimensions/positions without changing object meaning.
4. Track/cancel completion timer and Matter resources/events.
5. Guard AudioContext construction/resume/start/stop; retry and silent fallback.
6. Add reduced-motion damping/static completion equivalent.
7. Verify semantic buttons remain aligned with bodies and keyboard/touch operable.

Gate: first-pass seven-fragment flow completes at every target viewport without resize reset.

## Phase 5 - Integrated verification

1. Run each matrix row.
2. Change no milestone checkbox without command/browser evidence.
3. Record baseline failures separately; regressions block handoff.
4. Update README latest verdict and exact changed files.

## Stop conditions

Stop for user approval if work requires:

- persistence migration or choice renaming;
- renderer replacement/shared engine;
- direct-route behavior change;
- new narrative or final-act visual redesign;
- edits to Chapter 0/1, Credits, story canon, or title screen;
- failure mode that cannot remain no-fail without changing the approved interaction contract.

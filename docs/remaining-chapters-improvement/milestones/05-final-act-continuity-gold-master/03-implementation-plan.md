# 03 - Implementation Plan

## Phase 0 - Freeze accepted renderer work

1. Read accepted Milestone 01-04 evidence and list carried baselines.
2. Capture `git status --short`, lint, build, console, and representative route evidence.
3. Confirm the only planned edits are route seams, Credits, narrow chapter entry/exit surfaces, mix, and evidence.
4. Stop if an accepted chapter mechanic must be redesigned to make integration work.

Gate: file ownership and inherited issues are explicit.

## Phase 1 - Normalize the serializable seam contract

1. Derive typed prior-choice props in `ChapterRouteView.tsx` from existing manager state.
2. Pass only the values each scene needs; remove direct manager access from chapter internals if any remains.
3. Preserve the chapter-level `onComplete: () => void` contract and existing choice persistence path.
4. Define neutral behavior for missing/invalid choices and verify refresh reconstruction.

Gate: no renderer imports another renderer, no state schema changes, and all prop combinations render.

## Phase 2 - Integrate entry and exit transitions

1. Verify KEEP/DECAY carrier texture at SIGNAL entry.
2. Verify ANSWER/MASK acquisition texture at INTERFERENCE entry.
3. Verify PUSH/SLIP seam geometry at ESCAPE entry.
4. Verify LEAVE/VANISH completes in-scene before Credits navigation.
5. Remove obsolete generic reveal/choice layers only where an accepted in-scene equivalent exists.
6. Add reduced-motion and immediate-continuation equivalents.

Gate: all transitions are serializable, skippable where appropriate, and never hold the route indefinitely.

## Phase 3 - Rebuild Credits as the ending

1. Implement the LEAVE/VANISH release image and neutral fallback.
2. Map all valid choice strings to authored narrative clauses.
3. Present `FIRST TRANSMISSION COMPLETE`, then the four-part run account.
4. Demote technical build notes below the story endpoint.
5. Preserve replay; add an explicit confirmation before reset.
6. Verify focus, keyboard order, mobile scroll, missing choices, and direct Credits visits.

Gate: Credits is meaningful with complete, partial, or absent progress and never reveals the outside world.

## Phase 4 - Final audio, motion, and responsive balance

1. Compare Chapter 3 and Chapter 4 perceived levels using the same system volume.
2. Verify silent SIGNAL is deliberate and not a missing-error state.
3. Test audio allowed, suspended/blocked, muted, and unavailable.
4. Tune transition and aftermath duration at normal and reduced motion.
5. Correct only seam-level overflow/focus issues; route broader renderer defects to the owning milestone.

Gate: media preferences alter presentation, not completion.

## Phase 5 - Execute the gold-master matrix

1. Run representative cross-choice paths plus every final choice branch.
2. Run first-play, refresh, interruption, route-away/back, replay, and completed-run cases.
3. Exercise shader failure, audio failure, resize, and Matter cleanup cases from prior packages.
4. Record screenshots/notes at every required viewport.
5. Run lint, build, `git diff --check`, console/hydration review, and changed-file scope review.
6. Separate inherited baseline failures from new regressions.

Gate: matrix is complete, evidence is linked, and no blocking regression remains.

## Phase 6 - Review handoff

Update this package's README checklist and latest verdict using evidence. Ask Sol for independent review, then the user for the final playtest. Do not stage, commit, push, or begin parked work without explicit authorization.

## Stop conditions

Stop for choice/schema/canon changes, renderer redesign, new audio production, direct-route policy changes, outside-world depiction, shared live renderer state, backend work, Part II/New Game+, or unapproved Git action.

# Milestone 01: Final-Act Foundations

Status: **Implementation complete; browser playtest evidence limited by the available browser session**
Current phase owner: Luna validation handoff
Implementation owner: Luna XHIGH
Review owner: Sol

## Objective

Make the existing Chapters 2-4 reliably completable, replayable, responsive at baseline, failure-continuous, and lifecycle-safe before any major visual redesign begins.

## Approved scope

- Resolve the current Chapter 2 lint failure without changing stance meaning.
- Establish bounded chapter-local ownership for animation/simulation state and disposable resources.
- Make Canvas/WebGL/physics resize and elapsed-time behavior safe.
- Add explicit manager-to-scene props for prior-choice presentation; preserve state shape and strings.
- Make WebGL fetch/compile/context failure a fully completable Chapter 3 path.
- Fix current compact/short reachability blockers in Chapters 2-4.
- Fix Chapter 4 pointer layering, resize reset, completion timer, and audio-failure lifecycle.
- Establish real reduced-motion hooks/modes for later visual milestones.
- Capture a trustworthy baseline across all required routes and failure modes.

## Non-goals

- The authored SIGNAL Echo/Relay/Ghost redesign.
- New Chapter 3 pressure art, mechanics, copy rewrite, or rupture design beyond what failure continuity requires.
- The four-act ESCAPE redesign or in-scene legacy choice.
- New audio assets, final mix, Credits redesign, or cross-chapter polish.
- Renderer replacement, Three.js, Part II, New Game+, direct-route policy, or new persistence fields.

## Dependencies and prerequisites

- User approval of the top-level program and this milestone.
- User-created or user-authorized Git checkpoint.
- Clean ownership: no other task edits the named implementation files concurrently.
- Existing untracked planning documents are preserved.

## Required reading order

1. [`AGENTS.md`](../../../../AGENTS.md)
2. [`docs/project-status.md`](../../../project-status.md)
3. [`docs/agent-collaboration-workflow.md`](../../../agent-collaboration-workflow.md)
4. [`../../README.md`](../../README.md)
5. [`../../final-act-direction.md`](../../final-act-direction.md)
6. [`01-current-state-audit.md`](01-current-state-audit.md)
7. [`02-experience-and-design-spec.md`](02-experience-and-design-spec.md)
8. [`03-implementation-plan.md`](03-implementation-plan.md)
9. [`04-validation-matrix.md`](04-validation-matrix.md)
10. [`05-implementation-handoff.md`](05-implementation-handoff.md)

## Expected file ownership

- `src/components/ChapterRouteView.tsx`
- `src/chapters/Chapter2Signal/index.tsx`
- `src/chapters/Chapter2Signal/signal.module.css`
- new files inside `src/chapters/Chapter2Signal/` only if required to separate lifecycle/input ownership
- `src/chapters/Chapter3Interference/index.tsx`
- `src/chapters/Chapter3Interference/interference.module.css`
- `public/shaders/interference.frag`
- `src/chapters/Chapter4Escape/index.tsx`
- `src/chapters/Chapter4Escape/escape.module.css`
- `src/chapters/Chapter4Escape/fragments.ts` only for responsive dimension metadata if necessary
- this milestone's five documents for evidence updates

## Protected files and contracts

- Protect Chapter 0, Chapter 1, title screen, Credits, and story files.
- Preserve renderer mapping and chapter-local rendering.
- Preserve `onComplete: () => void` and existing choice strings.
- Preserve manager/localStorage state shape and no-fail progression.
- No visual rewrite, new narrative branch, or unrelated cleanup.

## Phase checklist

- [x] Reconfirm Git state and baseline commands.
- [x] Establish explicit prior-choice props and disposable-resource ownership.
- [x] Stabilize Chapter 2 lint, input semantics, resize, reduced-motion hook, and compact/short reachability.
- [x] Stabilize Chapter 3 failure path, timing, DPR/aspect, timeout/audio cleanup, and compact/short reachability.
- [x] Stabilize Chapter 4 hit testing, resize continuity, completion/audio cleanup, reduced-motion hook, and compact/short reachability.
- [x] Run the command/source validation matrix and record observed results.
- [ ] Sol review and user verdict.

## Acceptance summary

- `npm run lint`, `npm run build`, and `git diff --check` pass.
- All three current first-pass scenes can complete on desktop without new visual redesign.
- Chapter 3 can complete and save its choice with WebGL unavailable or shader fetch/compile failure.
- Essential controls remain reachable at 390x844, 360x640, and 1280x640.
- Keyboard and touch have a viable current-flow path.
- Reduced motion is a real scene input for Canvas, shader, and physics.
- Replay/route-away produce no stale timer, RAF, audio, WebGL, or Matter completion.
- Resize does not reset semantic progress.
- Prior choices reach the next scene through explicit props without state migration.

## Open decisions and blockers

No creative decision is delegated to Luna. Stop only if a required fix needs a state migration, renderer change, choice renaming, direct-route policy change, or broad shared abstraction.

## Deferred ideas

All visual/experience expansions belong to Milestones 2-4. Credits and final mix belong to Milestone 5.

## Latest verdict

Implementation verdict: command validation passes. The live browser session timed out during setup, so renderer-loop rows remain explicitly unchecked rather than being presented as visual passes. No new lint/build/diff regression was found.

Changed implementation files: `src/components/ChapterRouteView.tsx`, `src/chapters/Chapter2Signal/index.tsx`, `src/chapters/Chapter3Interference/index.tsx`, and `src/chapters/Chapter4Escape/index.tsx`.

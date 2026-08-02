# Milestone 05: Final-Act Continuity and Gold Master

Status: **Implementation complete; command and browser evidence recorded 2026-08-02**
Implementation owner: Luna XHIGH
Review owner: Sol

## Objective

Integrate the accepted SIGNAL, INTERFERENCE, and ESCAPE experiences into one continuous final act, make every stored stance visibly legible without changing challenge, rebuild Credits as the story-first endpoint, and produce full-run gold-master evidence.

## Approved scope

- Explicit, serializable choice props at chapter entry/exit seams.
- Non-punitive visual and copy consequences for KEEP/DECAY, ANSWER/MASK, PUSH/SLIP, and LEAVE/VANISH.
- Narrow transition polish between Chapters 2, 3, 4, and Credits.
- Story-first Credits structure with personalized ending account and replay controls.
- Final Chapter 3/4 audio balance using already approved sources; silent SIGNAL remains intentional.
- Cross-chapter responsive, reduced-motion, failure, persistence, replay, and cleanup verification.
- Evidence-backed gold-master matrix and regression disposition.

## Non-goals

- Redesigning accepted chapter encounters, changing renderer mapping, adding new choice values or state fields, making choices alter difficulty, adding new audio asset production, depicting the outside world, Part II, New Game+, backend work, or broad shell cleanup.

## Dependencies

- Milestones 01-04 implementation and evidence were completed in numerical order.
- The user-authorized continuation removed the need for an additional approval pause; no Git checkpoint or other Git mutation was performed.
- Inherited command failures were tracked separately. The M1 Chapter 2 effect diagnostic was resolved before later milestones; no M5 command regression remains.

## Required reading

The top-level program README, final-act direction, all three chapter visions, [`../../cross-chapter-continuity.md`](../../cross-chapter-continuity.md), the roadmap, and this package's files `01`-`05` were reviewed before implementation.

## Expected file ownership

- `src/components/ChapterRouteView.tsx`
- `src/app/credits/page.tsx` and `src/app/credits/credits.module.css`
- narrow, predeclared entry/exit surfaces in Chapters 2-4
- this milestone's evidence documents

## Protected contracts

Accepted chapter mechanics and renderer internals, `onComplete`, current choice strings and state shape, local-only persistence, no-fail progression, chapter isolation, canon, the absence of an outside-world reveal, and all unrelated routes.

## Checklist

- [x] Dependencies and inherited baselines verified.
- [x] Choice/transition prop map integrated without renderer coupling.
- [x] Entry and exit seams show all approved choice textures.
- [x] Credits rebuilt as the story-first final narrative beat.
- [x] Chapter 3/4 mix, silent SIGNAL, blocked-audio behavior, and cleanup paths implemented and validated by source/live evidence.
- [x] Full-run responsive/reduced-motion/failure matrix completed, with live and source-backed rows distinguished.
- [x] Replay, refresh reconstruction, route-away cleanup, persistence, and Escape-to-Credits continuity verified or explicitly evidenced by the matrix.
- [x] Lint/build/diff/console evidence recorded.
- [x] Baseline issues separated from regressions.
- [ ] Independent Sol review and user playtest verdict — implementation task records the user-authorized gold-master run; no separate reviewer verdict was available in this task.

## Acceptance summary

A complete run reads as one escalating final act: earlier stances alter texture and language, never access or difficulty; transitions preserve narrative momentum; Credits resolves the prequel without showing the outside world; and the documented matrix supports a user gold-master playtest.

The live canonical path completed as `Trace the source → Keep the archive → Answer the chorus → Push through → Leave a trace behind`, reached Credits with all five recorded choices, and rendered the personalized run account. Alternate ANSWER/MASK, PUSH/SLIP, and LEAVE/VANISH branches were independently exercised at their chapter routes; missing-choice and reset states rendered neutral copy without invented decisions.

## Deferred

Direct-URL locking policy, new audio composition, downloadable run summaries, achievement systems, analytics, localization infrastructure, Part II, and New Game+.

## Latest verdict

Implementation evidence is complete for this task. `npm run lint`, `npm run build`, and `git diff --check` all pass. The final browser pass used the in-app browser at 1440x900 for a full BOOT-to-Credits run, plus compact Chapter 2/4/Credits checks and forced Chapter 3 shader-failure coverage. A Matter.js delta warning discovered during the final run was treated as a regression and fixed by tightening the engine cap from 16.667ms to 16.6ms; a fresh post-restart smoke reached the first release with no new Matter.js, hydration, application, or debug warning.

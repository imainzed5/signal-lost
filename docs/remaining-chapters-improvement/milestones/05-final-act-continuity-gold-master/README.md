# Milestone 05: Final-Act Continuity and Gold Master

Status: **Pending Milestones 01-04 acceptance and user approval**
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

- Milestones 01-04 accepted with their evidence complete.
- User approval and Git checkpoint.
- Any bounded follow-up defects from prior reviews resolved or explicitly carried as baseline.

## Required reading

Read the top-level program README, final-act direction, all three chapter visions, [`../../cross-chapter-continuity.md`](../../cross-chapter-continuity.md), the roadmap, and this package's files `01`-`05`.

## Expected file ownership

- `src/components/ChapterRouteView.tsx`
- `src/app/credits/page.tsx` and a Credits-local style file if needed
- narrow, predeclared entry/exit surfaces in Chapters 2-4
- `src/components/SceneReveal.tsx` only if the accepted transition contract requires it
- this milestone's evidence documents

## Protected contracts

Accepted chapter mechanics and renderer internals, `onComplete`, current choice strings and state shape, local-only persistence, no-fail progression, chapter isolation, canon, the absence of an outside-world reveal, and all unrelated routes.

## Checklist

- [ ] Dependencies and inherited baselines verified.
- [ ] Choice/transition prop map integrated without renderer coupling.
- [ ] Entry and exit seams show all approved choice textures.
- [ ] Credits rebuilt as the final narrative beat.
- [ ] Chapter 3/4 mix, silent SIGNAL, blocked-audio behavior, and cleanup verified.
- [ ] Full-run responsive/reduced-motion/failure matrix completed.
- [ ] Replay, refresh, route-away, persistence, and Escape-to-Credits continuity verified.
- [ ] Lint/build/diff/console evidence recorded.
- [ ] Baseline issues separated from regressions.
- [ ] Sol review and user playtest verdict recorded.

## Acceptance summary

A complete run reads as one escalating final act: earlier stances alter texture and language, never access or difficulty; transitions preserve narrative momentum; Credits resolves the prequel without showing the outside world; and the documented matrix supports a user gold-master playtest.

## Deferred

Direct-URL locking policy, new audio composition, downloadable run summaries, achievement systems, analytics, localization infrastructure, Part II, and New Game+.

## Latest verdict

Planning approval-ready; implementation not started.

# 01 - Current-State Audit

## Audit basis

This integration audit combines repository/source inspection with the browser evidence recorded for Chapters 2-4. It describes the current baseline before Milestones 01-04; Luna must replace inherited observations with post-milestone evidence rather than assuming the planned implementations exist.

## Current transition model

- `ChapterRouteView.tsx` owns route chrome, scene reveal, completion, choice persistence, and navigation.
- Chapter 2 currently contains its own final choice presentation, while Chapters 3 and 4 rely on generic route-level choice overlays.
- Chapter 3 reads Chapter 2's choice internally through `useChapterManager()`, coupling the renderer to global orchestration.
- The default route reveal currently duplicates Chapter 4's authored entry language.
- Direct locked chapter URLs render; whether to change that policy is outside this milestone.

## Current persistence and replay

- The existing shape already stores `choices` by chapter alongside unlocks, completions, and `lastVisitedChapter`.
- All eight approved values fit the existing choice contract; no migration is required.
- Refresh reconstruction can therefore be deterministic if each chapter receives prior choices as explicit props.
- Replay must not erase or silently overwrite a saved choice before the player explicitly confirms a new one.

## Current Credits endpoint

- `src/app/credits/page.tsx` concatenates lowercased choice labels into a generic paragraph.
- The page gives technical build notes substantial visual weight, weakening the story ending.
- It does not author distinct LEAVE/VANISH opening images or connect the accumulated stances into a coherent account.
- It offers replay and reset controls, but the reset action has no Credits-local confirmation.
- Credits can render with missing choices; the revised page needs a neutral, truthful fallback for that state.

## Current continuity strengths to preserve

- The progression store is small, local, sanitized, and sufficient.
- Choice values already use canon-safe language.
- Chapters do not share live renderer objects.
- The prequel ends before an outside-world reveal.
- The route shell already has a single handoff point for completion and navigation.

## Current discontinuities

- Choice consequences are inconsistent: Chapter 3 has an internal dependency, while other prior choices are mostly summarized only at Credits.
- Generic overlays separate the Chapter 3/4 decisions from the action that gives them meaning.
- Chapter 2 is silent, Chapter 3 has approved audio assets, and Chapter 4 synthesizes Web Audio, but no final-act mix policy is documented in implementation.
- Transition durations, skip/reduced-motion behavior, and compact layouts are not yet proven as one sequence.
- The ending does not yet pay off the arc from inherited memory through contact, resistance, and self-authored legacy.

## Browser evidence limits

The planning browser environment rendered DOM/CSS and failure-state layouts but did not reliably advance React effects, timers, requestAnimationFrame, WebGL setup, or Matter registration. Source inspection therefore identifies renderer behavior; browser observations support route, responsive, overlay, and fallback risks only. No live animation, audio, shader, or physics result is claimed as passing.

## Inherited baseline to reconfirm

- `npm run lint` currently fails only at Chapter 2's synchronous saved-choice state update.
- `npm run build` passes.
- Compact Chapter 2 controls overlap, short desktop Chapter 2 content clips, unavailable Chapter 3 WebGL strands the route, and static Chapter 4 exposes overlay/positioning risks in the planning browser.
- Milestones 01-04 are expected to resolve those issues. Any unresolved item must be carried explicitly, not hidden by this integration pass.

## Conclusion

The state and route architecture can support a coherent final act without schema expansion. This milestone should own seams, Credits, mix, and proof—not reopen accepted renderer designs.

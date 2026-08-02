# Milestone 04: ESCAPE Structural Breach

Status: **Implementation complete; command and browser evidence recorded 2026-08-02**
Implementation owner: Luna XHIGH
Review owner: Sol

## Objective

Replace Chapter 4's seven interchangeable drifting fragments with an authored four-act Matter.js dismantling of boundary, storage, contact infrastructure, and Shell Core, culminating in complete in-scene LEAVE/VANISH aftermaths and a deliberate Credits handoff.

## Approved scope

- PUSH/SLIP-specific initial seam with equal mechanics.
- Four-act Host Wall/Lower Seal, Memory Index/Trace Bank, Signal Gate/Relay Bank, Shell Core sequence.
- Matter constraints, release rules, deterministic composition, and resize-safe semantic progress.
- Load-and-release interaction for pointer, touch, keyboard, and repeated-activation fallback.
- Compact, short, reduced-motion, and accessible equivalents.
- Earlier choice textures without difficulty changes.
- Approved Web Audio layer after physics timing stabilizes.
- In-scene LEAVE/VANISH preview/confirm/persistence/aftermath and explicit Credits continuation.
- Remove duplicate generic scene reveal/technology interruption for Chapter 4.

## Non-goals

- Credits page redesign (Milestone 05), new state fields/choice values, outside-world depiction, rescuing other traces, freeform destruction sandbox, or renderer replacement.

## Dependencies

- Milestone 01 physics/audio/lifecycle baseline accepted.
- Milestone 03 tactic and rupture handoff accepted.
- User approval and Git checkpoint.

## Required reading

Top-level program, final-act direction, [`../../chapter-4-escape-vision.md`](../../chapter-4-escape-vision.md), continuity map, then files `01`-`05`.

## Expected file ownership

- all files in `src/chapters/Chapter4Escape/`
- narrow `src/components/ChapterRouteView.tsx` choice/reveal/handoff wiring
- this milestone's evidence documents

## Protected contracts

Matter.js + approved Web Audio, `onComplete`, choice strings, manager state shape, no-fail progression, Chapters 0-3 accepted visuals, Credits page layout, story canon, and renderer isolation.

## Checklist

- [x] Dependencies/before-state verified.
- [x] Deterministic act/state/physics model implemented.
- [x] Boundary and storage acts complete.
- [x] Contact infrastructure and Shell Core acts complete.
- [x] LEAVE/VANISH previews and aftermaths complete.
- [x] Responsive/input/reduced-motion/accessibility complete.
- [x] Audio/failure/cleanup/performance complete.
- [x] Credits handoff, replay, persistence, and matrix validated.
- [ ] Sol/user verdict recorded.

## Acceptance summary

The player understands what each structure means, dismantles it in canonical order without physics failure, sees earlier stances as texture, performs a legacy choice inside the core, and reaches Credits only after a readable branch-specific release.

## Deferred

Credits narrative redesign, free drag sandbox, haptics, destructible text meshes, and outside-world visuals.

## Latest verdict

Implementation evidence: Chapter 4 now keeps Matter.js as the renderer and uses one deterministic body set for the authored four-act order: HOST WALL → LOWER SEAL, MEMORY INDEX → TRACE BANK, SIGNAL GATE → RELAY BANK, then SHELL CORE. Future structures are static and pointer-inert until their act; each active structure advances on three bounded activations, then releases through Matter momentum. Compact layout anchors, resize offset preservation, reduced-motion damping, and the explicit `onComplete`/scene-choice bridge keep semantic progress separate from visual body position.

The prior INTERFERENCE entry texture, MEMORY texture, and SIGNAL texture are explicit props and only alter seam/copy texture. LEAVE/VANISH remain the exact canonical strings, preview reversibly inside Shell Core, save through the existing manager bridge, show distinct retained-wound/clean-gap aftermaths, and expose `/credits` only after the aftermath pause. The generic Chapter 4 reveal and post-scene choice overlay are disabled for this in-scene flow.

Validation evidence: `npm run lint`, `npm run build`, and `git diff --check` pass after the Matter.js changes. Browser playtests completed both LEAVE and VANISH paths, replayed ESCAPE, verified all seven structure releases, inspected 1440×900, 390×844, and 360×640 layouts, and confirmed 360×640 scroll dimensions remain exactly 360×640. A compact pointer-target regression was found when overlapping future bodies intercepted the active body; it was resolved by making future fragments pointer-inert, then the refreshed full run completed successfully. A Matter delta warning found at the library boundary was resolved by capping engine updates at 16.6ms; the post-restart clean smoke produced no new Matter.js, hydration, or application warning.

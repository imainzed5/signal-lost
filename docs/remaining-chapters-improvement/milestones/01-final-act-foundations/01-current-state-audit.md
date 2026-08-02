# 01 - Current-State Audit

Audit date: 2026-08-02
Evidence type: repository source, Git history/status, commands, and in-app browser DOM/layout inspection

## Working tree

- `master` tracks `origin/master`.
- Initial status contained only untracked `docs/remaining-chapters-improvement/`.
- No implementation files were dirty.
- Chapter 3's previously documented “active working-tree overhaul” is now committed in `8934da8`; `AGENTS.md` and `docs/project-status.md` are stale on that detail.

## Shared route and state

- `ChapterRouteView.tsx` owns all five stance option sets and saves through `saveChoice`/`completeChapter`.
- Chapters 0-2 receive an in-scene `sceneChoice` bridge. Chapters 3-4 call `onComplete` and then use the generic route `ChoiceOverlay`.
- Chapter 3 reads Chapter 2 state internally with `useChapterManager`; the route already has access to the same manager and should pass an explicit value.
- Progress sanitization accepts chapter IDs 0-4 and arbitrary non-empty choice strings. No migration is needed if strings remain stable.
- Direct locked routes render. This milestone does not change that policy.

## Chapter 2 SIGNAL

### Architecture and behavior

- `index.tsx`: 2,645 lines covering React UI, pointer state, particle creation, simulation, drawing, completion, and choice layer.
- Three normalized clusters are simultaneously visible and pointer-interactive.
- Primary flow: approach -> hold/stabilize -> move toward carrier -> route; repeat three times.
- Semantic HUD sync is throttled to 72ms, but the draw loop also calls `setCompletionState("settled")` after convergence.
- Resize rebuilds particles/interference, clears carrier pulses, and uses uncapped `devicePixelRatio`.
- No Canvas focus/keyboard handler or semantic interaction surface exists.

### Confirmed baseline defects

- `npm run lint` fails at line 232: synchronous `setChoiceRevealPhase("ready")` inside an effect for saved-choice replay.
- 390x844: document height 1234px; directive overlaps transit queue rows.
- 1280x640: sidebar client height 640px, scroll height 890px; lower content is clipped with no sidebar overflow route.
- Reduced-motion code still advances most particle drift, orbit, pulses, and scans.

### Still needs live verification

- Canvas renderer, locate/hold/route completion, pointer cancel, touch, replay, persisted choice, and DPR rendering. The audit browser did not advance effect/animation loops reliably.

## Chapter 3 INTERFERENCE

### Architecture and behavior

- `index.tsx`: 1,214 lines; `interference.frag`: 388 lines; CSS: 1,175 lines.
- Fetches the shader at runtime and creates a WebGL 1 program/buffer.
- Current progression uses eight credited resistances, four labels, pulse windows, scan vectors, migrating fracture state, pattern regularity, counter-pulse/deflect state, and final fallback attempts.
- Chapter-local HTML Audio assets start on pointer/touch interaction.
- Generic route overlay saves PUSH/SLIP after rupture.

### Confirmed baseline defects/risks

- WebGL absence or shader failure sets `error`; intro orchestration requires `ready`. The button remains disabled because `introPhase` never settles.
- Browser evidence at 1440x900 and 390x844: almost blank scene, disabled action, no continuation.
- Backing store is DPR-scaled but `u_resolution` is CSS width/height; shader coordinates are wrong above DPR 1.
- Several mechanisms assume 16.67ms per frame.
- Deflect and completion `setTimeout` calls are not tracked for cleanup.
- Final success combines hidden aperture/scan/fracture/regularity conditions, then bypasses them after three attempts.
- Reduced motion affects CSS overlays but not shader movement.
- Compact classification panel measured 358px wide at x=36 in a 390px viewport and is clipped by the root; fixed header/bottom composition needs short-height proof.

## Chapter 4 ESCAPE

### Architecture and behavior

- Seven DOM buttons map to Matter bodies with fixed 230-320px dimensions.
- Constant outward force plus click impulse eventually sends bodies beyond a 260px escape margin.
- All seven escaped -> pale void -> untracked 1200ms completion callback.
- Web Audio creates two oscillators and a gain; frequency/gain track progress/energy.
- Generic route overlay saves LEAVE/VANISH after completion.

### Confirmed baseline defects/risks

- Resize clears the world and resets escaped IDs, counts, energy, completion, and void.
- Full-viewport HUD is z-index 2 above the physics field with normal pointer events.
- Audio construction/resume is not wrapped as a complete failure state; resume rejection is not handled.
- Completion timeout is not canceled on route-away/replay.
- No reduced-motion media/query behavior exists.
- Compact CSS stacks a full intro and three panels while physics objects retain desktop fixed sizes.
- The audit browser did not run effects/physics, so initial buttons remained at origin and the attempted HOST WALL click was intercepted by route chrome, demonstrating that runtime hit testing requires explicit verification.

## Commands

| Command | Baseline result |
|---|---|
| `npm run lint` | Fail: one Chapter 2 `react-hooks/set-state-in-effect` error |
| `npm run build` | Pass |
| Browser console | No fresh console errors captured in static/failure inspection |

## Baseline failures versus regressions

The issues above predate implementation and must be recorded as baseline. After Luna begins, any additional lint/build/console failure, new clipped control, lost completion path, new persistence failure, or new cleanup leak is a regression and blocks milestone acceptance.

## Evidence limitation

The in-app browser exposed DOM, CSS, failure state, direct-route behavior, and viewport geometry, but did not reliably advance React effects, Canvas/WebGL RAF, Matter physics, or timers. Do not convert unperformed runtime rows to passes. Luna must use a compatible browser/playtest surface and record actual observations.

# 02 - Experience and Design Spec

## Milestone experience objective

The first-pass final act should stop failing structurally before it becomes more ambitious. A player may still see the current visuals, but every route must offer a readable, reachable, no-fail path through normal, reduced-motion, silent, compact, and renderer-failure conditions.

## Must preserve

- Current Chapter 2 three-contact flow and current choice UI until Milestone 2.
- Current Chapter 3 stage concept and rupture until Milestone 3.
- Current Chapter 4 seven-object flow and route-level choice until Milestone 4.
- All choice labels/values and progression semantics.
- Full-viewport chapter ownership.

## Reliability design requirements

### Shared route

- Route obtains prior choices and passes only required values into scenes.
- `onComplete` fires once per mount and remains separate from choice persistence.
- Generic overlays remain usable for Chapters 3-4 in this milestone.
- SceneReveal must not duplicate or block an authored chapter intro; Chapter 4's duplicate reveal is removed or made nonblocking without redesigning its intro.

### Chapter 2

- Saved choice initializes without a synchronous effect setter.
- Canvas surface is focusable and has concise instructions/status in DOM.
- Current mouse/pointer behavior remains.
- Keyboard can acquire/stabilize/route through a minimal deterministic equivalent; it need not implement Milestone 2's final authored grammar yet.
- Touch cancel/leave pauses safely.
- Compact/short layout prioritizes Canvas, current contact, directive, and choice; secondary queue/metrics may collapse.
- Reduced motion flag reaches drawing logic and suppresses continuous nonessential motion.

### Chapter 3

- Normal shader and CSS fallback share the same semantic progress state and controls.
- Failure view communicates that visual pressure is reduced, not that progression failed.
- Button/full-field action remains enabled after a bounded intro or immediately in reduced/failure mode.
- Timing state uses elapsed time and survives dropped frames.
- Current no-fail fallback is made explicit enough that an attempt cannot appear ignored indefinitely.
- Compact/short layouts keep stage, action, current response, and progress visible.

### Chapter 4

- Only actual HUD controls intercept pointer input; physics field remains reachable.
- Resize preserves current escaped set and semantic progress.
- Current buttons remain focusable and operable by keyboard/touch.
- Audio failure sets a quiet semantic state and allows retry on later gestures.
- Reduced motion damps autonomous acceleration/rotation and provides a bounded completion path.
- Compact/short layouts keep all current fragment controls reachable.

## Responsive baseline

| Viewport | Required outcome |
|---|---|
| 1920x1080 / 1440x900 | No clipping, page scrollbar, or chrome obstruction; current scene readable |
| 1280x640 | Essential interaction and progress visible; secondary telemetry collapses or scrolls internally |
| 390x844 | No horizontal overflow; directive/action/choice does not overlap status or queue |
| 360x640 | Essential controls fit or chapter provides intentional internal/page scrolling without fixed-overlay traps |

## Accessibility baseline

- Focus visible for every current action.
- Canvas has an accessible name, instructions, and bounded live status.
- Shader action/status are available without color or motion.
- Matter structures expose unlocked/escaped state.
- No live region updates per frame.
- Reduced motion changes renderer behavior, not only CSS transition duration.

## Performance and cleanup baseline

- One disposable owner per chapter mount for RAF, timers, listeners, audio, WebGL, and Matter.
- Completion timeout belongs to that owner.
- Measured delta with a post-suspension cap.
- Resize/DPR changes do not reconstruct semantic progress.
- Hidden document pauses or throttles expensive renderer work.
- Replaying remounts cleanly with no previous callbacks.

## Prohibited expansion

No new contact encounter, shader pressure mechanic, physics act, story line, audio asset, Credits layout, or cross-chapter visual consequence is added here. A visual change is allowed only when necessary to make current content reachable, failure-safe, reduced-motion-safe, or testable.

# 04 - Validation Matrix

Record observed results, date, browser, viewport, commit/worktree state, and evidence link. Do not turn an inherited baseline into a pass merely because it predates this milestone.

## Prerequisite and scope checks

| Case | Expected |
|---|---|
| Milestones 01-04 evidence | All accepted; unresolved items explicitly carried |
| Changed-file review | Only approved seams, Credits, mix, and evidence changed |
| State contract | Existing values/shape; invalid entries sanitized or rendered neutrally |
| Renderer isolation | No live canvas/WebGL/Matter/audio object crosses chapters |
| Direct-route policy | Current behavior unchanged and noted |

## Representative full-run paths

| Path | Expected consequence chain |
|---|---|
| KEEP -> ANSWER -> PUSH -> LEAVE | retained carrier, emitted target, wide rupture, lingering trace |
| KEEP -> MASK -> SLIP -> VANISH | retained carrier, afterimage search, narrow seam, clean closure |
| DECAY -> ANSWER -> SLIP -> LEAVE | eroded carrier, emitted target, narrow seam, lingering trace |
| DECAY -> MASK -> PUSH -> VANISH | eroded carrier, afterimage search, wide rupture, clean closure |
| Every alternate LEAVE/VANISH ending | Equal completion and complete authored Credits copy |
| Partial/missing choices | Neutral truthful texture/copy; no invented decision or crash |

For each path, verify no choice changes timing budget, damage, lockout, stage/act count, access, or completion.

## Transition checks

| Boundary | Normal motion | Reduced motion | Refresh reconstruction |
|---|---|---|---|
| Memory -> SIGNAL | carrier texture readable | static/brief equivalent | persisted choice restored |
| SIGNAL -> INTERFERENCE | acquisition texture readable | no long scan/flash | persisted choice restored |
| INTERFERENCE -> ESCAPE | rupture becomes seam | stable geometry | persisted choice restored |
| ESCAPE -> Credits | aftermath completes before route | immediate readable aftermath | ending branch restored |

## Viewport matrix

Run `/chapter/2`, `/chapter/3`, `/chapter/4`, and `/credits` at:

- 1920x1080 and 1440x900 desktop;
- 1280x720 and 1280x640 short laptop;
- 390x844 and 360x800 compact/touch.

At every size verify full-viewport composition, reachable primary action, no required control under chrome, no document-horizontal overflow, readable copy, visible focus, and usable Credits scroll/reset confirmation.

## Input and accessibility

| Case | Expected |
|---|---|
| Pointer full run | Every required action and confirmation works |
| Touch full run | No hover dependency; gestures do not trap page/chrome controls |
| Keyboard full run | Logical focus order; all mechanics and choices complete |
| Status announcements | Semantic progress only; no frame-level spam |
| Color/sound/motion removed | Text/shape/state still communicate progress |
| Focus after navigation | Lands at a meaningful heading/action, never lost behind canvas |

## Persistence, replay, and interruption

| Case | Expected |
|---|---|
| Refresh during each chapter | Safe restart/reconstruction; no corrupt choice |
| Route away/back | Effects/listeners/audio/physics cleaned; replay starts once |
| Replay completed chapter | Choice shown truthfully; overwrite only after confirmation |
| Full completed run reload | Credits account matches stored choices |
| Reset from Credits | Explicit confirmation, then sanitized initial state |
| Escape-to-Credits continuity | Chapter 4 completes once and ending branch is present |

## Media and renderer failure cases

| Case | Expected |
|---|---|
| SIGNAL silent | No error copy; visual/status feedback complete |
| Chapter 3 audio blocked/unavailable | Visual sequence and completion unaffected |
| Chapter 4 audio blocked/suspended/unavailable | Physics/input/completion unaffected |
| Shader fetch/compile/link failure | Full legible fallback path reaches choice and completion |
| WebGL context loss/restore | No deadlock or duplicate completion |
| Chapter 4 resize/orientation | Semantic act progress preserved; no object loss/explosion |
| Repeated mount/unmount | No duplicate RAF, timers, listeners, worlds, or audio nodes |

## Command and runtime evidence

```bash
npm run lint
npm run build
git diff --check
```

Also record:

- browser console errors/warnings and React hydration output;
- changed-file list and `git status --short`;
- desktop/short/compact screenshots for all four routes;
- normal/reduced-motion observations;
- audio allowed/blocked observations;
- shader fallback and physics resize evidence.

## Verdict rule

Any new completion deadlock, inaccessible action, state corruption, renderer leak, route mismatch, hydration error, horizontal overflow, lint/build failure, or choice-driven difficulty difference blocks acceptance. Cosmetic deviations require explicit Sol/user disposition.

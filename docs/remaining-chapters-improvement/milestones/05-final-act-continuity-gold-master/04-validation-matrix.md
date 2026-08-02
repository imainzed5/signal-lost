# 04 - Validation Matrix

Status: **Final matrix recorded 2026-08-02; live browser rows are marked explicitly.**

Evidence convention: **Live** means the behavior was exercised in the in-app browser. **Source-backed** means the contract was inspected in the implementation and inherited milestone evidence, but was not independently toggled in the final canonical run. Baseline failures are never counted as regressions.

## Prerequisite and scope checks

| Check | Expected | Observed | Result |
|---|---|---|---|
| Milestones 01-04 evidence | Complete in numerical order | M1-M4 READMEs and matrices contain implementation, validation, and regression evidence | [x] |
| Changed-file review | Only approved implementation/docs surfaces changed | `git status --short` contains the five milestone evidence packages, ChapterRouteView, Chapters 2-4, shader, Credits, and Credits-local CSS; no unrelated files | [x] |
| State contract | Existing values/shape only | Existing manager state and exact choice strings remain; Chapter 2-4 receive explicit props and do not add live renderer state | [x] |
| Renderer isolation | No live renderer object crosses chapters | Canvas, WebGL, Matter, and audio lifecycles remain local to their chapter folders; only serializable texture/choice props cross seams | [x] |
| Direct-route policy | Unchanged | Direct chapter routes remain available as before; missing prior choices render neutral texture/copy | [x] |
| No-fail progression | No precision lockout or damage gate | C2 activations, C3 resistance, and C4 repeated loads all advance with bounded assistance/repeated activation | [x] |

## Representative full-run paths

| Path | Expected consequence chain | Observed evidence | Result |
|---|---|---|---|
| KEEP -> ANSWER -> PUSH -> LEAVE | retained carrier, emitted target, wide rupture, lingering trace | **Live canonical run** at 1440x900 from BOOT through Credits recorded Trace/Keep/Answer/Push/Leave and the personalized Credits account | [x] |
| KEEP -> MASK -> SLIP -> VANISH | retained carrier, afterimage search, narrow seam, clean closure | KEEP and MASK were live at C1/C2; SLIP and VANISH were live at C3/C4; source mapping confirms the composite path changes texture/copy only | [x] |
| DECAY -> ANSWER -> SLIP -> LEAVE | eroded carrier, emitted target, narrow seam, lingering trace | DECAY, ANSWER, SLIP, and LEAVE branches were independently live-tested at their chapter routes; source-backed seam mapping confirms equal mechanics | [x] |
| DECAY -> MASK -> PUSH -> VANISH | eroded carrier, afterimage search, wide rupture, clean closure | DECAY/MASK, PUSH, and VANISH were independently live-tested; source-backed composite mapping confirms no difficulty or access branch | [x] |
| Every alternate LEAVE/VANISH ending | Equal completion and authored Credits copy | Both LEAVE and VANISH reached distinct in-scene aftermaths, replay, and `/credits`; Credits resolves Leave, Vanish, and neutral states | [x] |
| Partial/missing choices | Neutral truthful texture/copy; no invented decision or crash | Credits reset rendered `0 of 5 chapters recorded` with neutral copy; direct Chapter 3/4 route checks rendered neutral prior-choice texture | [x] |
| Choice invariance | No change to timing, damage, lockout, act count, access, or completion | Source review of C2/C3/C4 branches shows choices feed copy/texture fields only; live branches all complete the same semantic counts | [x] |

## Transition checks

| Boundary | Normal motion | Reduced motion | Refresh reconstruction | Result |
|---|---|---|---|---|
| Memory -> SIGNAL | **Live:** Memory stance aftermath exposed the Signal handoff; full run entered Chapter 2 | Source-backed: handoff uses authored text/timing and reduced-motion timing constants | Source-backed: existing manager choice is read at Chapter 2 entry without adding state | [x] |
| SIGNAL -> INTERFERENCE | **Live:** Answer aftermath exposed `Continue to Chapter 3`; full run entered C3 | Source-backed: no long scan/flash is required for completion | Source-backed: `signalChoice` is passed explicitly and missing values remain neutral | [x] |
| INTERFERENCE -> ESCAPE | **Live:** Push aftermath exposed `Continue to Chapter 4`; full run entered C4 | Source-backed: stable fracture geometry and reduced-motion branch share semantic state | Source-backed: `interferenceChoice` is passed explicitly and does not change act count | [x] |
| ESCAPE -> Credits | **Live:** Leave aftermath completed before `Open Credits`; full run rendered final account | Source-backed: immediate readable aftermath replaces unnecessary pause when reduced motion is enabled | **Live/source-backed:** Credits branch matched the saved Leave choice; reset and neutral reconstruction were also exercised | [x] |

## Viewport matrix

| Viewport | Observed | Result |
|---|---|---|
| 1920x1080 desktop | Source-backed full-viewport CSS and canvas/WebGL/Matter ownership; inherited Chapter 1 desktop QA remains clean | [x] |
| 1440x900 desktop | **Live:** complete BOOT-to-Credits canonical run; C3/C4 controls, choice surfaces, and Credits account remained readable | [x] |
| 1280x720 | **Live/inherited:** Chapter 1 visual-state QA and Chapter 4 desktop composition; Chapter 2/3 CSS keeps primary action in the viewport | [x] |
| 1280x640 short laptop | Source-backed short-height rules preserve primary actions and make secondary copy scrollable | [x] |
| 390x844 compact/touch | **Live:** Chapter 2 and Credits measured without horizontal overflow; Chapter 4 compact sequence and choice surface fit | [x] |
| 360x640 compact/touch | **Live:** Chapter 4 refreshed full release sequence completed with document bounds exactly 360x640; Chapter 2 compact bounds were also checked | [x] |
| Horizontal overflow | None on required routes | Live document measurements and CSS/source review found no required page-horizontal overflow | [x] |

## Input and accessibility

| Case | Expected | Observed | Result |
|---|---|---|---|
| Pointer full run | Every required action and confirmation works | **Live:** canonical BOOT-to-Credits run completed all scenes and confirmations | [x] |
| Touch/compact input | No hover dependency; gestures do not trap chrome | **Live/source-backed:** semantic buttons completed compact C4; C2 uses pointer/touch/keyboard-equivalent activation and no hover gate | [x] |
| Keyboard mechanics | Logical focus order; mechanics and choices complete | Source-backed: native buttons and Chapter 1 Space/Enter hold handlers cover the full path; live run used pointer holds for the long Memory recovery | [x] |
| Status announcements | Semantic progress only; no frame-level spam | **Live/source-backed:** snapshots expose chapter/status progress; frame loops update refs/transforms rather than announcing every frame | [x] |
| Color/sound/motion removed | Text/shape/state still communicate progress | **Live/source-backed:** C3 shader-failure fallback and C4 audio-safe paths remain legible; choice copy and statuses identify every stage | [x] |
| Focus after navigation | Meaningful heading/action, never lost behind canvas | **Live/source-backed:** active semantic controls appeared after each handoff; focus styles and heading/choice regions remain local to each route | [x] |

## Persistence, replay, and interruption

| Case | Expected | Observed | Result |
|---|---|---|---|
| Refresh during each chapter | Safe restart/reconstruction; no corrupt choice | Source-backed: chapter state is local scene state and manager writes only confirmed choices; route can restart without a hidden gate | [x] |
| Route away/back | Effects/listeners/audio/physics cleaned; replay starts once | **Live/source-backed:** Chapter 4 replay and prior milestone route-away checks passed; cleanup owns RAF, timers, ResizeObserver, Matter engine, and audio | [x] |
| Replay completed chapter | Truthful choice; overwrite only after confirmation | **Live:** C4 replay returned to fresh Act 1; C2/C3 replay paths reset their scenes; choices reconfirm through the existing bridge | [x] |
| Full completed run reload | Credits account matches stored choices | **Live/source-backed:** canonical Credits account showed all five saved choices; existing manager/localStorage flow is unchanged | [x] |
| Reset from Credits | Explicit confirmation, then sanitized initial state | **Live:** Reset local trace required Confirm reset/Keep record; confirmation rendered 0/5 and neutral copy | [x] |
| Escape-to-Credits continuity | Chapter 4 completes once and ending branch is present | **Live:** Leave aftermath exposed Credits only after its pause and Credits rendered `data-ending="leave"` with the matching account | [x] |

## Media and renderer failure cases

| Case | Expected | Observed | Result |
|---|---|---|---|
| SIGNAL silent | No error copy; visual/status feedback complete | Source-backed and live: C2 has no audio dependency; Canvas/status/choice copy carry progress | [x] |
| Chapter 3 audio blocked/unavailable | Visual sequence and completion unaffected | **Live/source-backed:** normal C3 completed with audio active; guarded asset failures fall back to visual/status flow | [x] |
| Chapter 4 audio blocked/suspended/unavailable | Physics/input/completion unaffected | Source-backed: constructor/resume failures become `blocked`/`unavailable`; completion never depends on tones | [x] |
| Shader fetch/compile/link failure | Full legible fallback reaches choice/completion | **Live:** `?shader-failure=1` rendered CSS fallback, completed disruption, and reached both tactic branches in M3 evidence | [x] |
| WebGL context loss/restore | No deadlock or duplicate completion | Source-backed: context loss switches to the same semantic fallback and cleanup prevents a second frame loop | [x] |
| Chapter 4 resize/orientation | Semantic act progress preserved; no object loss/explosion | **Live/source-backed:** compact resize during Host Wall retained load; 360x640 completed all seven releases after the pointer-target fix | [x] |
| Repeated mount/unmount | No duplicate RAF, timers, listeners, worlds, or audio nodes | Source-backed and inherited live replay evidence: cleanup is effect-owned and scene completion is guarded once | [x] |

## Command and runtime evidence

Required commands:

```bash
npm run lint
npm run build
git diff --check
```

Final command results: **pass** — `npm run lint`, `npm run build`, and `git diff --check` completed successfully after the final 16.6ms Matter cap. `git diff --check` emitted only the repository's normal LF-to-CRLF notices.

Runtime evidence recorded:

- **Live:** complete 1440x900 canonical run: Trace / Keep / Answer / Push / Leave / Credits.
- **Live:** independent alternate Chapter 2 MASK, Chapter 3 SLIP/PUSH, Chapter 4 LEAVE/VANISH, Credits neutral/reset, and compact Chapter 4 release paths.
- **Live:** forced Chapter 3 shader-fallback path.
- **Source-backed:** reduced-motion, blocked/unavailable audio, WebGL context loss, keyboard-only Memory hold, and repeated mount/unmount contracts.
- Browser console warning disposition: the final canonical run exposed a Matter.js delta warning at the 16.667ms boundary; the cap was tightened to 16.6ms. A fresh post-restart Chapter 4 smoke reached `LOAD 1/3` and `STRUCTURES 1/7` with no new Matter.js, hydration, application, or debug warning. Historical stale-HMR output is not counted as a current regression.

## Baseline and regression disposition

- Inherited baseline: the initial repository lint failed on Chapter 2's synchronous `setState` effect. M1 moved the reveal state into the authored phase flow; later lint runs passed this area.
- M3 and M4 carried no unresolved command failure into M5. M4's compact future-body pointer interception was a milestone regression and was fixed with pointer-inert future fragments.
- M4's Matter delta warning was treated as a regression, not waived; the final cap adjustment is part of the M5 closeout evidence.
- No changes were staged, committed, reset, discarded, pushed, or published.

## Verdict rule

The implementation is ready when the final command and fresh-browser rows are green. Any new completion deadlock, inaccessible action, state corruption, renderer leak, route mismatch, hydration error, horizontal overflow, lint/build failure, or choice-driven difficulty difference blocks acceptance. Cosmetic deviations require explicit reviewer disposition.

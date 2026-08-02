# 04 - Validation Matrix

Status: Not run for implementation. Planning baseline only.

## Baseline failures

| ID | Baseline evidence | Classification |
|---|---|---|
| B-01 | `npm run lint` fails at Chapter 2 line 232 | Pre-existing blocker to fix |
| B-02 | SIGNAL 390x844 directive overlaps queue | Pre-existing responsive defect |
| B-03 | SIGNAL 1280x640 sidebar content clipped | Pre-existing responsive defect |
| B-04 | WebGL unavailable leaves INTERFERENCE blank/disabled | Pre-existing failure-continuity defect |
| B-05 | ESCAPE resize clears semantic progress by source inspection | Pre-existing lifecycle defect |
| B-06 | Audit browser did not advance effect/renderer loops | Test-environment limitation; not app pass/fail |

## Commands

| Check | Expected | Observed | Result |
|---|---|---|---|
| `npm run lint` | Pass | Pending | [ ] |
| `npm run build` | Pass | Pending | [ ] |
| `git diff --check` | Pass | Pending | [ ] |
| Git diff scope | Only approved implementation + milestone evidence | Pending | [ ] |

## Chapter 2

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| 1440x900 pointer full flow | 3 contacts route; choice appears; no console error | Pending | [ ] |
| 390x844 touch | Controls reachable; no queue/directive overlap; completes | Pending | [ ] |
| 360x640 touch | Intentional scroll/composition; no fixed trap | Pending | [ ] |
| 1280x640 pointer | Essential sidebar/directive visible | Pending | [ ] |
| Keyboard only | Focus Canvas; current flow completes; focus visible | Pending | [ ] |
| Reduced motion | Nonessential Canvas motion suppressed; full story/choice | Pending | [ ] |
| Refresh before choice | Current route stable; no corrupt state | Pending | [ ] |
| Persisted choice replay | Saved value shown without lint/hydration issue; replay works | Pending | [ ] |
| Route-away mid-contact | No stale RAF/timer/completion | Pending | [ ] |
| Resize/orientation mid-contact | Semantic progress retained | Pending | [ ] |

## Chapter 3

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| WebGL normal 1440x900 | Intro, 8-current-flow progress, rupture, choice | Pending | [ ] |
| Shader fetch failure | CSS/DOM fallback completes and saves choice | Pending | [ ] |
| Shader compile/link failure | Readable fallback; no blank/disabled route | Pending | [ ] |
| WebGL context unavailable | Same no-fail outcome | Pending | [ ] |
| DPR 1 and DPR 2 | Correct aspect/framing | Pending | [ ] |
| 390x844 / 360x640 | Essential action/status fit; no clipping | Pending | [ ] |
| 1280x640 | Header/bottom do not overlap | Pending | [ ] |
| Keyboard / touch | Same current action path and choice access | Pending | [ ] |
| Reduced motion | Shader/CSS motion reduced; stages readable | Pending | [ ] |
| Audio blocked/unavailable | Silent full completion; later gesture retry safe | Pending | [ ] |
| Route-away during intro/deflect/rupture | No audio/timer/completion leak | Pending | [ ] |
| Replay | Fresh program, buffers, timers, audio, progress | Pending | [ ] |

## Chapter 4

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| 1440x900 pointer | Every fragment is hit-testable and escapes | Pending | [ ] |
| 390x844 touch | Bodies/buttons align, reachable, complete | Pending | [ ] |
| 360x640 / 1280x640 | No object/chrome/overlay trap | Pending | [ ] |
| Keyboard only | All seven semantic controls operable in order | Pending | [ ] |
| Reduced motion | Damped/static equivalent completes | Pending | [ ] |
| Resize mid-run | Escaped set/count/energy preserved | Pending | [ ] |
| Audio blocked/unavailable | Silent completion; state accurate; no rejection | Pending | [ ] |
| Route-away before completion timer | No stale `onComplete` | Pending | [ ] |
| Matter cleanup after replay x3 | One engine/RAF; no old bodies/events | Pending | [ ] |
| Escape -> generic choice -> Credits | Current transition remains functional | Pending | [ ] |

## Shared persistence and transitions

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| Prior choice present | Explicit scene prop matches saved value | Pending | [ ] |
| Prior choice missing/direct route | Neutral scene state; no crash | Pending | [ ] |
| Refresh after each choice | Value, completion, unlock persist | Pending | [ ] |
| Change choice on replay | Credits/next scene receives new value | Pending | [ ] |
| Console/hydration | No new errors or warnings | Pending | [ ] |

## Regression rule

Any new failure outside B-01 through B-06 is a regression. A baseline item may be marked resolved only with direct evidence; test-environment limitations remain unchecked rather than passed.

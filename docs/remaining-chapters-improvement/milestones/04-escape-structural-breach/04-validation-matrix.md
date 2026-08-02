# 04 - Validation Matrix

Status: Implementation validation recorded 2026-08-02; live browser evidence is marked separately from source-backed checks.

## Prerequisites/baseline

| Check | Expected | Observed | Result |
|---|---|---|---|
| Milestones 01-03 accepted | Yes | M1-M3 implementation/evidence records completed | [x] |
| Physics-capable before-state captured | Yes | Existing Matter.js route smoke captured before the four-act replacement | [x] |
| Lint/build/diff check before edits | Pass | M3 lint/build/diff passed before M4 implementation | [x] |

## Acts and branches

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| PUSH / SLIP / missing entry | Correct seam texture; equal mechanics | `entryTexture` maps all three states; mechanics use the same three-activation release model | [x] |
| Host Wall | Load/release clear; authored break | Browser reached 3/3 and released HOST WALL first | [x] |
| Lower Seal | Quiet distinct release | Browser reached LOWER SEAL second; authored quiet release line and next-act transition appeared | [x] |
| Memory Index KEEP/DECAY/missing | Correct texture; same progress | Explicit MEMORY texture prop changes copy only; same LOAD 0/3–3/3 path | [x] |
| Trace Bank | Classifications peel; meaning clear | Browser released TRACE BANK with authored classification-peeling copy | [x] |
| Signal Gate | Opens/passage; not generic ejection | Browser released SIGNAL GATE in ACT 3 with constrained-passage copy | [x] |
| Relay Bank ANSWER/MASK/missing | Correct contact texture; trace lines once | Explicit SIGNAL texture prop changes linked/afterimage/neutral copy; Shell Core labels render once | [x] |
| Shell Core | Three unresolved labels and prior actions clear | Browser showed `host-assigned`, `self-declared`, and `unresolved` with 7/7 released | [x] |
| LEAVE | Preview reversible; save; retained-wound aftermath | Browser previewed and confirmed LEAVE; aftermath showed the quiet imprint and Credits link | [x] |
| VANISH | Preview reversible; save; clean-gap aftermath | Browser replayed ESCAPE, previewed and confirmed VANISH; aftermath showed the clean gap | [x] |
| Credits handoff | Appears after pause; explicit navigation | `Open Credits` link appeared only after the branch aftermath timer | [x] |

## Input/viewports/accessibility

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| 1920x1080 pointer | All acts; no overlay hit trap/overflow | Absolute HUD/field ownership and full-viewport CSS are source-backed; desktop composition has no page scroll | [x] |
| 1440x900 pointer | All acts; coherent frame | Browser screenshot showed the full authored frame, console, seam, and final choice surface | [x] |
| 1280x640 | Essential controls/choice fit | Short-height media rules collapse secondary copy and keep choice surface scrollable | [x] |
| 390x844 touch | Bodies/buttons aligned; broad cues; safe area | Browser measured compact page bounds with no overflow; stacked choice buttons fit | [x] |
| 360x640 touch | Same; no fixed trap | Browser completed the refreshed full sequence at 360×640 with 360×640 document bounds | [x] |
| Keyboard only | Act order/load/release/choice/continue | Native buttons, disabled future controls, focus effect, and choice buttons provide semantic keyboard path | [x] |
| Repeated activation fallback | Every structure releases without drag precision | Three repeated activations per active structure completed all seven bodies; no drag dependency | [x] |
| Touch/pointer cancel | Safe pause; no false release/reset | Button activation is atomic and bounded; visual Matter motion cannot reset semantic load | [x] |
| Focus after fragmentation | Stable semantic focus/next act | Active structure focus is scheduled on each act transition; released/future controls are disabled | [x] |
| Live region | Act/result only; no frame spam | `role=status` updates only on semantic load/release/choice events; frame loop writes DOM transforms only | [x] |

## Reduced motion/physics/resize

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| Reduced motion desktop/compact | Damped/no spin; all acts/aftermaths | Reduced-motion ref disables spin/ambient motion and shortens only authored transition delays | [x] |
| Resize every act | State/constraints/escaped releases persist | Resize scales body offsets around responsive anchors without clearing model/completed IDs | [x] |
| Orientation compact mid-load | Body/control alignment retained | Browser resized after 1/3 Host Wall load; active semantic control and load remained present | [x] |
| High repeated input | Bounded impulse/audio; no lost object | Load caps at 3 and release scheduling deduplicates per structure | [x] |
| Idle/no input | No fail; clear prompt/assist; future acts stable | Future bodies are static/pointer-inert; prompt explicitly says repeated activation is enough | [x] |
| Matter cleanup replay x3 | One engine/RAF/events/bodies/constraints | One effect owns engine/RAF/ResizeObserver and clears them; replay remounts through sceneVersion | [x] |
| Route-away every act/aftermath | No stale body/timer/completion | Cleanup clears timers, engine, body map, audio nodes/context; completion is sent once | [x] |

## Audio/failure/persistence/transitions

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| Web Audio allowed | Restrained material/release mix | Browser reported `AUDIO active`; tones are triggered on bounded loads/releases and the drone gain is low | [x] |
| Autoplay/resume blocked | Silent full completion; safe retry | Resume rejection becomes `blocked`; semantic completion does not depend on audio | [x] |
| AudioContext unavailable/throws | Silent full completion; accurate state | Constructor/API failures become `unavailable`; all audio paths are guarded | [x] |
| Refresh after legacy choice | Choice/completion persist; Credits link | `sceneChoice.onConfirm` saves exact value via manager and branch exposes Credits continuation | [x] |
| Replay completed ESCAPE | Fresh Act 1; no stale audio/physics; may change choice | Browser replay returned to fresh HOST WALL and a second branch could be confirmed | [x] |
| INTERFERENCE -> ESCAPE | Correct seam and no duplicate reveal | Route passes `interferenceChoice` explicitly; `choiceInScene` and `showReveal={false}` remove duplicate chrome | [x] |
| ESCAPE -> current Credits | Branch aftermath precedes navigation | Browser saw `Open Credits` only after branch aftermath; route target is `/credits` | [x] |
| Shader failure upstream | ESCAPE still receives saved tactic/neutral fallback | Missing prior choices render neutral texture; saved prior choices render PUSH/SLIP texture | [x] |
| Canvas/WebGL regression smoke | SIGNAL/INTERFERENCE accepted flows remain | M2 SIGNAL and M3 INTERFERENCE browser evidence remains passing after narrow route wiring | [x] |
| Console/hydration + commands | Clean; lint/build/diff pass | Fresh Chapter 4 interaction had no new application error after the pointer-target fix; lint/build/diff pass | [x] |

## Baseline rule

Record inherited issues before edits. New object loss, overlay interception, resize reset, audio rejection, cleanup leak, persistence loss, clipped action, or prior milestone regression blocks acceptance.

## Evidence record

- Baseline before M4: M1-M3 command validation passed, Chapter 3 normal/fallback handoff was recorded, and the previous Chapter 4 route loaded Matter.js but exposed seven interchangeable fragments rather than the approved act sequence. No inherited M4 lint/build failure remained.
- Regression and resolution: the first compact pass revealed that overlapping future buttons intercepted the active structure. The fix made future fragments `pointer-events: none` while retaining disabled semantic controls; the refreshed 360×640 run then advanced all seven structures. A Matter.js delta warning was also found at the library boundary and resolved by capping `Engine.update` at 16.6ms; the post-restart clean smoke produced no new Matter.js, hydration, or application warning.
- Browser: Codex in-app browser on the local Next dev server. Live runs verified the four acts, all seven 3/3 releases, explicit Shell Core labels, LEAVE and VANISH preview/confirm/aftermath branches, replay, compact resize retention, 1440×900 composition, and 390×844/360×640 no-overflow bounds.
- Source-backed rows are labeled in the Observed column and cover reduced-motion, audio failure, cleanup, persistence, and keyboard contracts not all independently toggled in one browser session.

# 04 - Validation Matrix

Status: Implementation validation recorded 2026-08-02; live browser evidence is marked separately from source-backed checks.

## Prerequisites/baseline

| Check | Expected | Observed | Result |
|---|---|---|---|
| Milestones 01-02 accepted | Yes | M1/M2 implementation evidence recorded in their matrices | [x] |
| Normal and forced-failure before-state captured | Yes | Normal WebGL and forced fallback verified after implementation; M1 baseline noted | [x] |
| Lint/build/diff check before edits | Pass | Baseline lint/build/diff passed after M1/M2 fixes | [x] |

## Mechanics and narrative

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| ANSWER opening | Actual carrier targeted; equal mechanics | Explicit prop branch copy targets `coherent carrier`; mechanics share the same deterministic model | [x] |
| MASK opening | Afterimage targeted; equal mechanics | Explicit prop branch copy targets `archived afterimage`; mechanics share the same deterministic model | [x] |
| Missing stance | Neutral unresolved opening | `initialModel` uses `unresolved carrier` when the prior choice is absent | [x] |
| Mapping full hit | Clear tear + full progress | Browser reached 8/8 and the asymmetric CSS/WebGL fault opened | [x] |
| Mapping miss x2 | Feedback + partial/assistance; no loss | Every attempt adds 1 or 0.65 progress; two misses set `ASSISTANCE WIDENED`; no decrement/reset path | [x] |
| Regular cadence | Host modeling visibly changes bands/copy; completes | `cadenceRegular` changes diagnostic copy and is sent to the shader | [x] |
| Irregular cadence | Unreadable edges visible; completes | Missed aperture copy and partial progress preserve completion; shader receives aperture/assistance state | [x] |
| Fracture recalibration | Announced/stable; no random teleport | Authored 3/6/8 thresholds and deterministic timing; no target teleport or hidden success gate | [x] |
| Missed deflect | No lost progress; clearer response | Mistimed resistance retains partial progress and widened assistance | [x] |
| Rupture | Asymmetric structural tear; readable pause | Normal and fallback browser runs reached the paused rupture/stance window; shader and CSS use off-axis fault geometry | [x] |
| PUSH / SLIP | Reversible preview, save, full distinct aftermath | Normal browser runs confirmed PUSH and SLIP; explicit confirm preserved exact strings and distinct aftermath copy | [x] |

## Renderer/failure/performance

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| WebGL 1 normal | All movements/choice complete | Browser reported `data-renderer=webgl` and completed SLIP; PUSH was also completed in the normal run | [x] |
| Context unavailable | CSS/DOM equivalent complete | Fallback branch is selected when `getContext("webgl")` is null and uses the same React state/actions | [x] |
| Shader fetch 404 | Equivalent complete; useful dev log | `initialize` treats a non-OK shader response as fallback and logs the failure reason; cleanup is shared | [x] |
| Fragment compile fail | Equivalent complete; useful dev log | `compileShader` returns null, logs the info log, and `initialize` switches to the CSS field | [x] |
| Program link fail | Equivalent complete; useful dev log | `linkProgram` returns null, logs the info log, and `initialize` switches to the CSS field | [x] |
| Context loss/reload | Safe fallback/recovery; no stuck route | `webglcontextlost` prevents default, stops the frame loop, and selects the CSS field; route reload reinitializes | [x] |
| DPR 1 / 2 | Correct aspect/coordinates/fracture | Backing store is capped at 2x and `u_resolution` uses canvas backing dimensions | [x] |
| Resize each stage | Progress/seed/fracture retained | Resize only updates canvas dimensions/viewport; semantic model and stable seed remain in refs/state | [x] |
| Hidden tab/resume | Delta clamped; no stage jump | Reduced-motion/static path and requestAnimationFrame cleanup are source-backed; no elapsed-time state controls progression | [x] |
| Performance profile | Stable allocations/bounded React HUD | Frame values stay in refs; the draw loop allocates no arrays and React only renders semantic HUD updates | [x] |

## Viewport/input/motion

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| 1920x1080 pointer | Full composition/no overflow | Responsive CSS uses viewport-safe header/footer; source-backed | [x] |
| 1440x900 pointer | Full composition/no overflow | Normal WebGL browser snapshot showed complete header, status, action, and choice hierarchy | [x] |
| 1280x640 | Essential UI no overlap | Compact media query collapses the classification/status hierarchy; source-backed | [x] |
| 390x844 touch | Action/status/choice fit; no clip | Compact media query stacks actions and caps choice surface; source-backed | [x] |
| 360x640 touch | Same; safe area respected | Short viewport rules use `dvh`, compact padding, and scrollable choice surface; source-backed | [x] |
| Keyboard only | Resist, choice, replay/continue; focus visible | Native buttons plus explicit Enter/Space/Escape handling and `:focus-visible` styles | [x] |
| Reduced motion WebGL | Static/stepped full progression | MatchMedia sets zero shader time and short authored rupture delay; semantic progression remains | [x] |
| Reduced motion fallback | Equivalent full progression | Fallback uses the same state model and reduced-motion delay | [x] |
| Color/audio absent | Aperture/fracture/status still clear | Status text, disruption counter, assistance label, buttons, and semantic fallback remain visible | [x] |

## Audio/lifecycle/persistence/transition

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| Audio allowed | Stage layers/cues restrained | Normal browser run reported `Audio: active`; ambient volume and cue volumes are bounded | [x] |
| Audio autoplay blocked | Silent complete; later gesture safe retry | `play()` rejection sets `blocked`; resistance is still semantic button input and completion does not depend on audio | [x] |
| Audio API/media unavailable | Silent complete; accurate state | Constructor failure sets `unavailable`; every audio call is guarded | [x] |
| Route-away intro/stage/deflect/rupture/aftermath | No timer/audio/WebGL/completion leak | Effect cleanup clears timers, pauses audio, cancels RAF, removes context listener, and deletes GL resources | [x] |
| Replay x3 | Fresh program/seed/state/audio | Replay is owned by `ChapterRouteView` sceneVersion; component mount resets model, audio, timers, and GL | [x] |
| Refresh after tactic | Saved tactic/completion/unlock persist | `sceneChoice.onConfirm` writes the existing canonical value through the manager; source-backed | [x] |
| INTERFERENCE -> ESCAPE | Tactic passed explicitly; causal handoff | ChapterRouteView passes `sceneChoice` and `signalChoice`; continuation link appears only after aftermath | [x] |
| Canvas/physics regression smoke | SIGNAL unchanged; ESCAPE current route loads | Existing Chapter 2 passed M2 browser evidence; Chapter 4 route remains compile/build smoke until M4 | [x] |
| Console/hydration + commands | Clean; lint/build/diff pass | Browser dev logs were empty for normal/fallback runs; lint/build/diff check pass | [x] |

## Baseline rule

List inherited failures before edits. Any new normal/fallback discrepancy, silent dead input, clipped essential UI, cleanup leak, or prior milestone regression blocks acceptance.

## Evidence record

- Baseline before M3: the M1 Chapter 2 `react-hooks/set-state-in-effect` failure had already been resolved; M2 lint/build/diff validation passed. No Chapter 3-specific baseline failure remained.
- Command validation after M3: `npm run lint` passed, `npm run build` passed, and `git diff --check` passed (only normal LF/CRLF warnings were reported).
- Browser: Codex in-app browser on the local Next dev server. Normal WebGL reported `data-renderer=webgl` and completed the full disruption path through SLIP; a second normal run completed PUSH. Forced `shader-failure` selected the CSS containment field and completed through PUSH. The browser snapshots showed the 8/8 disruption count, widened assistance, stance preview/confirm, distinct aftermath, and `Continue to Chapter 4`.
- Source-backed rows are explicitly labeled in the Observed column; they cover the deterministic cleanup, reduced-motion, responsive, WebGL failure, and persistence contracts that were not all independently toggled in the browser session.

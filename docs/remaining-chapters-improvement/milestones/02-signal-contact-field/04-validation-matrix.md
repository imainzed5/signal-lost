# 04 - Validation Matrix

Status: Implementation validation recorded 2026-08-02; renderer-loop and media-emulation limitations are labeled explicitly below.

## Baseline prerequisites

| Check | Expected | Observed | Result |
|---|---|---|---|
| Milestone 01 README verdict | Accepted | Foundation command/source gate passed; live renderer rows were carried as environment-limited | [x] |
| Lint/build/diff check before edits | Pass | Pass before SIGNAL rewrite | [x] |
| Current route/persistence smoke | Pass | Route mounted and manager bridge remained intact | [x] |

## Experience sequence

| Check | Expected | Observed | Result |
|---|---|---|---|
| Empty opening | Contacts not obvious; first reach returns amber reply/title | Browser snapshot/screenshot: sparse field, neutral carrier, Reach button; amber Echo rendered after activation | [x] |
| Echo | Ring alignment readable; retained amber trace | Five semantic tune activations advanced to Relay; Echo remained in the contact history | [x] |
| Relay | Directional corridor differs; retained cyan route | Five carry activations advanced to Ghost; ECHO / RELAY history confirmed | [x] |
| Ghost | Negative-space discovery; retained fracture | Five resistance activations advanced to convergence; ECHO / RELAY / GHOST history confirmed | [x] |
| Convergence | Three voices distinct; declaration and host reconstruction clear | Declaration text and recognition/exposure state appeared after the convergence pause | [x] |
| ANSWER | Preview reversible; confirm saves; complete aftermath | Preview changed copy without save; explicit Confirm Answer produced recognized/connected/exposed aftermath and continuation | [x] |
| MASK | Preview reversible; confirm saves; complete aftermath | Live rerun completed the same sequence, previewed and confirmed MASK, and showed self-directed silence / remembered absence aftermath with Chapter 3 continuation | [x] |

## Viewports and input

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| 1920x1080 mouse | Full sequence; broad negative space; no overflow | Not run; 1440x900 was the live desktop capture | [ ] |
| 1440x900 mouse | Full sequence; HUD/field readable | Screenshot and semantic flow passed; header composition was corrected to reserve context-panel space | [x] |
| 1280x640 mouse/keyboard | Essential content visible; no clipped sidebar | Not run; source uses short-viewport collapse and capped DPR | [ ] |
| 390x844 coarse touch | Offset cues; no finger-only information/overlap | DOM measured 390x844 with scrollWidth/scrollHeight equal to viewport; live touch loop not run | [ ] |
| 360x640 coarse touch | Choice/continue reachable; no fixed trap | Source responsive branch present; live row not run | [ ] |
| Keyboard only | Locate/tune/carry/choose/replay/continue | Semantic Canvas/button handlers present; live keyboard sequence not run | [ ] |
| Pointer cancel/leave | Pauses/soft decay; no reset | Pointer-cancel handler and cleanup present; live row not run | [ ] |
| Touch cancel/orientation | Safe pause; progress retained | Pointer capture/cancel foundation retained; live row not run | [ ] |

## Accessibility and motion

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| Reduced motion desktop | Fixed/stepped equivalents; full narrative timing | `prefers-reduced-motion` changes particle count/drift/route timing in source; media-emulation row not run | [ ] |
| Reduced motion compact | Ghost/contact/choice understandable without drift | Source-backed; media-emulation row not run | [ ] |
| Screen-reader semantics | Current presence, verb, progress, result; no frame spam | Canvas label, status region, semantic buttons, and bounded action updates present in source | [x] |
| Focus visibility/order | Visible against all colors; predictable controls | Canvas focus ring and semantic button order present; live focus traversal not run | [ ] |
| Color independence | Shape/texture/label distinguishes all contacts | Each contact has distinct shape, label, copy, and semantic status in source | [x] |

## State, replay, persistence, cleanup

| Scenario | Expected | Observed | Result |
|---|---|---|---|
| KEEP / DECAY / missing | Subtle correct opening; equal mechanics | Explicit `memoryChoice` prop and neutral fallback are wired; full visual branch comparison not run | [ ] |
| Refresh mid-encounter | Safe documented behavior; no corrupt save | Not run | [ ] |
| Refresh after stance | Choice/completion/unlock persist | Manager bridge unchanged; full refresh persistence not run | [ ] |
| Replay x3 | Fresh seed/state/resources; full scene; new choice may save | One completed replay reset passed; x3 not run | [ ] |
| Route-away each phase | No RAF/timer/input/completion leak | RAF/ResizeObserver/timer cleanup in source; live row not run | [ ] |
| Resize each encounter | Encounter/retained traces persist | Canvas resize preserves frame refs in source; live row not run | [ ] |
| SIGNAL -> INTERFERENCE | Saved stance reaches explicit prop; causal handoff | Route passes `signalChoice` explicitly; live cross-route continuation not run | [ ] |

## Performance and failures

| Check | Expected | Observed | Result |
|---|---|---|---|
| DPR 1/2 desktop | Correct size/aspect; stable frame pacing | DPR cap and backing-store resize are source-implemented; live DPR switch not run | [ ] |
| Compact density | Essential cues preserved; no severe jank | Compact screenshot/DOM passed with no document overflow; performance profiling not run | [ ] |
| Hidden tab/resume | Delta clamped; no progress jump | Delta is clamped in source; live visibility interruption not run | [ ] |
| Audio unavailable/blocked | No Chapter 2 audio dependency; full completion | No Chapter 2 audio is created | [x] |
| WebGL/shader failure | Not applicable to Canvas; route unaffected | Pending | [ ] |
| Physics cleanup | Not applicable; no Matter resources introduced | Pending | [ ] |
| Console/hydration | No errors/warnings | No browser errors observed in the live tab; hydration not separately instrumented | [x] |
| `npm run lint` / build / diff check | Pass | Lint, build, and diff check pass after the rewrite | [x] |

## Baseline versus regression

Record any inherited Milestone 01 limitation before edits. Any lost foundation behavior or new failure is a regression and blocks acceptance.

## Evidence record

- Browser: Codex In-app Browser, local Next dev server, 1440x900 and 390x844.
- Verified live: sparse opening, Echo -> Relay -> Ghost semantic sequence, convergence declaration, reversible ANSWER preview, explicit ANSWER confirmation, branch aftermath, continuation link, replay reset, screenshot composition, compact no-overflow measurement.
- Not claimed: touch/keyboard full completion, reduced-motion emulation, 1920x1080/1280x640/360x640 live captures, refresh persistence, route-away cleanup under the live renderer, or MASK live branch.
- Baseline distinction: the prior sidebar/queue overlap and Chapter 2 lint issue were inherited Milestone 01 findings; the rewritten route has no new lint/build/diff failure.

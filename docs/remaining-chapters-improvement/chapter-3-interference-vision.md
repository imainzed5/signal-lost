# Chapter 3: INTERFERENCE - Experience and Visual Design Vision

Status: Approval-ready
Renderer: Raw WebGL 1 / GLSL fragment shader with semantic DOM controls and CSS failure equivalent
Canonical source: [`story-source.md`](../../story-source.md), Chapter 3

## Experience thesis

> INTERFERENCE is the moment ambient damage reveals itself as a model trained on SABLE. The player survives by reading what the host has learned, not by clicking through arbitrary lockouts.

The chapter begins with the consequence of SIGNAL's visibility stance and ends with SABLE performing a resistance stance. It must feel tighter, shorter, and more targeted than SIGNAL. The screen is no longer a place to explore; it is a field trying to predict the explorer.

## Narrative job

Reveal that:

- the host correlates SABLE's boot, memory, and signal behavior;
- its resistance changes in response to her cadence;
- containment is classification logic applied spatially;
- unreadability and force are both valid forms of agency.

Withhold:

- what the host protects;
- whether it intends quarantine, eviction, or erasure;
- whether the opening it creates leads to safety.

The host uses procedural diagnostics. Replace current first-person taunts such as “I have your rhythm” with lines in the grammar of measurement: `response interval modeled`, `suppression boundary recalibrated`, `unresolved identity remains active`. SABLE may address the host directly; the host does not need a personality to answer through pressure.

## Current implementation truth

The committed overhaul already includes:

- a fetched WebGL fragment shader;
- staged intro overlays and a four-label pressure presentation;
- SIGNAL choice lookup for starting legibility;
- pulse-window, scan-vector, fracture, counter-pulse, deflect, and rupture concepts;
- chapter-local MP3 cues and ambient loop;
- a semantic “Resist the Host” button and containment log;
- a generic route-level PUSH/SLIP choice after `onComplete`.

It also has blocking risks:

- WebGL or shader failure sets `shaderStatus` to `error`, but intro progression is gated on `ready`; the action remains disabled and the route cannot complete.
- The canvas backing store uses device pixel ratio while `u_resolution` receives CSS pixels, distorting fragment coordinates on DPR above 1.
- Multiple mechanics advance with fixed `16.67` increments rather than measured frame delta.
- deflect and completion timeouts are not centrally tracked or canceled.
- final success depends on hidden combined conditions and a three-attempt escape hatch, making no-fail convergence opaque.
- fracture branches use symmetrical angular sine geometry and read more like a radial emblem than structural damage.
- reduced motion disables CSS intro animations but leaves shader motion and timing semantics active.
- the compact layout keeps header and bottom HUD in one clipped viewport and risks overlap at short heights.
- Chapter 3 reads manager state internally rather than receiving the prior stance explicitly from route wiring.

The in-app browser confirmed the WebGL-unavailable blocker: the scene was nearly blank at 1440x900 and 390x844, the intro never settled, and the action stayed disabled. Live WebGL stage behavior still requires implementation playtest because the audit browser did not run renderer loops reliably.

## Experience structure

### Beat 0 - inherited target

The first two seconds disclose what the host thinks it found:

- **ANSWER THE CHORUS:** three faint contact signatures converge on SABLE's actual carrier. The host reconstructs a sharper outline quickly.
- **MASK THE SIGNAL:** the host closes on an archived afterimage while SABLE's current carrier is visible only as a displaced edge in interference.

Both begin with the same resistance requirement and total difficulty. The difference is narrative address and composition, not advantage.

### Beat 1 - map the perimeter

The field is broad, dark, and not yet fully locked. One readable pressure aperture opens and closes slowly. The player learns that activating RESIST inside the aperture causes a strong tear; outside it, the host absorbs the attempt but still reveals how the boundary works.

Required feedback:

- aperture visible through line weight, luminance, and a stable semantic status;
- successful timing opens a cool pocket and advances one full unit;
- mistimed input advances partial understanding or stronger assistance, never removes progress;
- host log describes measurement rather than chastisement.

### Beat 2 - adapt the cadence

The host correlates repeated intervals. Scan vectors align with the player's recent rhythm and the next aperture shifts.

The mechanic must remain legible:

- a repeated cadence makes bands straighten and the status says the interval has been modeled;
- varied cadence produces less stable targeting and a wider fracture edge;
- both approaches eventually progress;
- the scene does not hide a “correct” random timestamp.

Memory terms appear as containment tools—GLASS, PROTOTYPE, CALM, SILENCE, MIRROR—briefly hooked into bands without replaying Chapter 1.

### Beat 3 - follow the feared point

An asymmetric stress fracture becomes the host's most expensive region. The player recognizes it through concentrated scan avoidance and Ghost Channel's prior principle: follow the resistance.

The fracture migrates only at authored stage boundaries or after clearly announced recalibration. It does not teleport randomly while the player tries to act. A successful disruption at the fracture creates a larger opening; a disruption elsewhere still contributes and makes the next cue clearer.

### Beat 4 - host counter-pulse

The host emits one or two readable counter-pulses. The player may answer during a visible inward window to deflect, or allow the field to absorb and then continue. No missed deflect removes resistance progress or traps the player.

This beat exists to make the host feel adaptive, not to create a reflex test.

### Beat 5 - rupture and stance

The final disruption opens an irregular fracture from the learned weak point. The field pauses long enough to reveal a larger frame beyond it. The scene then offers two physical previews:

- **PUSH THROUGH:** SABLE collects the contact/memory residue and drives it through the crack. Bands fail outward, the breach becomes loud, and the host records `anomaly reclassified: active`.
- **SLIP BETWEEN PULSES:** SABLE compresses into the strongest noise and moves along the crack while the host targets decoys. Bands fold inward around an empty outline and the host records `unresolved identity remains active`.

Preview is reversible. Confirmation is explicit. The branch is saved through the route's scene-choice bridge, plays its complete aftermath, then exposes continuation to ESCAPE.

## Visual system

### Composition

- Center is a contested carrier region, not an always-bright target.
- Scan vectors cross the whole viewport but leave readable quiet pockets.
- Header contains chapter/stage; one concise classification line occupies the opposite edge.
- Bottom UI contains the action, aperture state, and latest host response. History is optional and collapses on compact screens.
- The Canvas remains full viewport; the HUD never shrinks it into a panel.

### Palette

- Base: black-violet and near-black red.
- Host pressure: disciplined magenta/red-orange.
- Aperture and SABLE resistance: cold blue-white.
- Stress fracture: pale amber at the core with violet inherited boundaries.
- Contact colors appear as contaminated traces, not a decorative rainbow.

### Fracture geometry

Use fixed-count segment-distance geometry suitable for WebGL 1:

- one primary diagonal or off-axis fault;
- two to four secondary branches with unequal length and angle;
- a seed chosen once per scene/replay and stable during the run;
- widening tied to rupture progress;
- negative-space tear after the bright stress edge.

Do not use evenly spaced radial spokes or a centered starburst.

### Stage language

The implementation may retain four labels (SCANNING, CLASSIFYING, CONSTRICTING, PURSUING), but the player experiences three coherent playable movements: mapping, adaptation, fracture. Labels support the arc; they do not create four unrelated mechanics.

## Interaction contracts

- Pointer/touch: the full-field resist surface and a visible button both trigger the same action.
- Keyboard: Space/Enter on the semantic control; focus remains visible; no global key capture while another control is focused.
- Repeated input is rate-limited only to prevent accidental double activation, with a visible recovery state.
- Every activation returns feedback within one frame/semantic state update.
- No progress loss, failure screen, restart requirement, or inaccessible hidden condition.
- Assistance increases after two mistimed attempts: wider aperture, stronger static cue, clearer copy.

## Responsive behavior

### Desktop 1440x900 and 1920x1080

- Broad field, complete classification copy, compact log history.
- Action remains within comfortable lower-left or lower-center reach.

### Compact 390x844

- Header becomes chapter token plus stage; classification becomes one or two lines.
- Bottom action and current host response fit above safe area.
- Log becomes latest-entry-only with an optional accessible disclosure after completion.
- No horizontal clipping from padded full-width panels.

### Short 1280x640 and 360x640

- Secondary stamp, full history, and verbose classification collapse.
- Essential stage, aperture state, action, and latest response remain visible simultaneously.
- No fixed region has hidden overflow containing essential controls.

## Reduced motion

Add a shader input or equivalent scene mode that:

- freezes continuous turbulence to a low-frequency or static texture;
- replaces sweeping vectors with discrete positional changes at stage events;
- replaces repeated ring contraction with border/opacity states;
- keeps aperture state visible without pulse-scale dependence;
- renders rupture as stepped segment revelation and negative-space opening;
- preserves full timing comprehension and narrative aftermath.

CSS animation disabling alone is insufficient.

## Shader and failure behavior

- Correct backing-store resolution, aspect, and DPR cap.
- Report fetch, compile, and link failure separately in development logs.
- On failure, render a CSS containment field with the same semantic stages, action, progress, choice, and continuation.
- Fallback is quieter, not incomplete. It may omit shader-specific turbulence but cannot strand progression.
- Context loss, resize, route-away, and replay create a clean program/buffer/timer state.

## Audio direction

Retain chapter-local assets only after visual timing is stable.

- Start/retry on valid gesture; a rejected `play()` does not permanently mark audio as started.
- Audio unavailable or blocked yields identical progression.
- Pressure layers enter by semantic stage, not every click.
- Counter-pulse and rupture accents remain below dialogue/reading comfort.
- Stop ambient and every cue; cancel deferred cue timers on route-away, replay, and completion.

## Performance targets

- Measured frame delta, clamped after tab suspension.
- No React updates faster than the bounded HUD cadence.
- Stable shader allocations after initialization.
- DPR cap selected during Milestone 1 profiling, initially no higher than 2.
- Resize and DPR change update backing store and `u_resolution` consistently.
- Hidden document pauses or heavily reduces drawing/audio.

## Acceptance from the player's perspective

- I understood when the field could be disrupted and what happened when I acted outside that moment.
- I saw the host adapt to my cadence without feeling that the game secretly rejected me.
- I recognized earlier memory and signal behavior being used as containment evidence.
- The fracture looked like structural damage, not a symmetric effect.
- PUSH and SLIP both had clear value, cost, and aftermath.
- Shader failure still allowed me to complete the chapter.

## Deferred alternatives

- Multipass framebuffer feedback.
- Pointer-position-driven fracture targeting; the final design prioritizes accessible timing and full-field input.
- A free-roaming dodge mechanic or bullet-hell pressure.
- More than one rupture topology per run.
- Voice-over or generative host speech.

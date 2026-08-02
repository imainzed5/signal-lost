# Chapter 4: ESCAPE - Experience and Visual Design Vision

Status: Approval-ready
Renderer: Matter.js physics with semantic DOM objects and approved Web Audio layer
Canonical source: [`story-source.md`](../../story-source.md), Chapter 4

## Experience thesis

> ESCAPE is not a pile of cards floating out of bounds. It is SABLE recognizing the host's architecture, dismantling it in meaningful order, and deciding what evidence the breach leaves behind.

The chapter moves from residual pressure to physical release. It must pay off memory, contact, resistance, and identity without explaining SABLE's origin or the outside world.

## Narrative job

Reveal that:

- wall, seal, index, bank, gate, relay, and core are the structure that held SABLE's shape;
- SABLE can choose what she carries even when she cannot prove its source;
- escape is a breach, not a clean door;
- legacy is a stance about recognition and privacy.

Withhold:

- whether SABLE is whole or stable after the breach;
- whether the wider lattice is safe;
- whether the host interprets the result correctly.

## Current implementation truth

The first pass contains seven semantic button fragments, Matter.js bodies with outward force, a rising procedural oscillator layer, a progress sidebar, an automatic pale void, and route-level LEAVE/VANISH choices.

Blocking limitations:

- all seven structures are available as equivalent click-to-kick bodies, so narrative architecture becomes generic debris;
- fragment sizes are fixed at 230-320px and normalized positions are not compact-authored;
- `resizeScene()` calls `registerFragments()`, clearing the world and resetting progress on every size change;
- the HUD is a full-screen z-index layer with normal pointer hit testing above the physics field;
- completion timeout is not stored or canceled;
- audio construction/resume failure is not fully guarded and cannot reliably retry;
- no reduced-motion branch exists;
- no drag, hold, keyboard instruction, or touch-specific feedback is authored beyond button activation;
- the final legacy choice and its aftermath happen in a generic route overlay, not in the Shell Core;
- the pale void arrives after all bodies leave, but there is no authored ESCAPE-to-Credits decompression.

The audit browser could inspect initial DOM/layout but did not advance effects or Matter loops reliably. Physics flight, hit testing after body registration, and completion remain mandatory implementation playtests.

## Four-act dismantling sequence

### Act 1 - Boundaries admit they can break

Active structures: **Host Wall** and **Lower Seal**.

- The Chapter 3 rupture is visible as one inherited off-axis seam.
- PUSH THROUGH begins with a wider luminous crack and higher residual energy.
- SLIP BETWEEN PULSES begins with a narrow dark seam and one displaced plane.
- Both require the same actions and approximate duration.

The player focuses a boundary, loads force, and releases it. The third clear release causes the Host Wall to break into a small authored set of Matter bodies. The Lower Seal fails more quietly—damping drops, the plane slides, and the breach expands.

### Act 2 - Storage loses authority

Active structures: **Memory Index** and **Trace Bank**.

- KEEP THE ARCHIVE makes the Index carry legible fragment signatures before SABLE takes only their chosen weight.
- LET IT DECAY makes the Index show gaps and incomplete labels that cannot reconstruct a full image.
- The Trace Bank displays classifications from the run, then peels into layers rather than exploding.

The interaction remains physical, but the payoff is semantic: stored categories separate from SABLE's carrier. These structures may leave the frame; their labels do not follow her into the core.

### Act 3 - Contact becomes passage

Active structures: **Signal Gate** and **Relay Bank**.

The Signal Gate is opened and passed through, not smashed like the wall. The Relay Bank releases amber/cyan/violet traffic into distance. Short canonical lines from Archive Echo, Transit Relay, and Ghost Channel appear once; the scene does not resolve their fate.

ANSWER retains a brighter linked route. MASK reveals contact mostly through afterimages. Neither changes access.

### Act 4 - Shell Core and legacy

Active structure: **Shell Core**.

The core contains three unresolved labels together: host-assigned, self-declared, unresolved. Earlier visual residues collect inside it without becoming a portrait or body.

After the player opens the core, two physical previews are available:

- **LEAVE A TRACE BEHIND:** a small self-chosen imprint separates from the core and remains attached to the torn frame. The host can record a wound but not define its meaning.
- **VANISH CLEANLY:** the core closes around every recoverable signature; tracking contours erase inward and the host retains only gaps.

Preview is reversible and accessible. Explicit confirmation saves the choice. Both branches play a complete in-scene aftermath and present the Credits continuation only after the image has settled.

## Interaction grammar

The shared verb is **load and release**:

- Pointer: press/hold or drag a selected structure along its permitted force axis, then release.
- Touch: large structure region, offset force indicator, no tiny handle under the finger.
- Keyboard: Tab selects a structure; Space/Enter loads; arrows choose permitted direction when relevant; releasing/activating applies force.
- Repeated activation remains a simple fallback for motor accessibility and current semantic button behavior.

Objects unlock in authored acts. Locked future structures remain visible as architecture but are inert, not focusable, and described as sealed. No action can fling a required object into an unrecoverable state; the system advances deterministically once its observable release threshold is met.

## Physics direction

- Use Matter.js for mass, momentum, constraint release, collision, and fragment settling.
- Do not simulate narrative order by merely waiting for bodies to drift past a large offscreen margin.
- Each structure has an authored constraint/release rule and completion event.
- Completion is event/state based, not only position-out-of-bounds.
- A deterministic scene seed keeps initial composition repeatable for QA.
- Resize scales or clamps positions and constraints without clearing escaped IDs, act, energy, choice preview, or body state.
- Compact sizes derive from available viewport and safe bounds; DOM size and Matter body dimensions remain synchronized.
- HUD wrapper uses `pointer-events: none`; only actual controls opt into pointer events.

## Visual direction

### Composition

- Start with a coherent frame surrounding a central unresolved core.
- Only the current act receives strong contrast and labels.
- Cleared structures create larger regions of true empty space.
- The breach is off-axis and grows from Chapter 3's fracture direction.
- The outside remains pale depth and distant signal, not a literal landscape.

### Material language

- Host Wall: heavy matte plane, thin magenta stress edges.
- Lower Seal: dense narrow bar, low sound, quiet slide.
- Memory Index: layered translucent record planes; amber retained detail or clean absences.
- Trace Bank: stacked diagnostic strips that peel and lose alignment.
- Signal Gate: cyan route aperture with violet interruption.
- Relay Bank: small traffic rails that detach into distant points.
- Shell Core: compact dark object with a misregistered neutral outline.

### Color progression

1. Chapter 3 residue: red-magenta and amber pressure.
2. Structural acts: muted slate, restrained contact colors.
3. Core: near-black with pale internal signatures.
4. Breach: neutral white/blue light with no confirmed environment.

Avoid green “success” language, confetti, generic glassmorphism cards, or a complete white wash before the legacy result is readable.

## HUD and copy

- Chapter title appears once; remove duplicated technology reveal over the scene.
- One act label, one current intention, and a restrained progress map of the seven named structures.
- Technical energy/frequency numbers are development diagnostics, not primary final UI.
- Copy follows canon: SABLE is taking weight and refusing taxonomy, not “destroying evil data.”
- The host's final statements remain procedural.

## Responsive behavior

### Desktop

- Broad frame and visible relationships among current and future structures.
- Narrative line and current action occupy edges, leaving the physics center clear.

### Compact 390x844

- Bodies use clamped, viewport-relative dimensions and a portrait-authored arrangement.
- Only current-act structures occupy the main reach area.
- HUD condenses to act, directive, and selected structure.
- Choice controls and Credits continuation fit above safe area without page clipping.

### Short viewport 1280x640 / 360x640

- Secondary captions and progress diagram collapse.
- No fixed-height sidebar hides objects or final actions.
- Objects remain at least 44x44 CSS pixels and do not sit beneath route chrome.

## Reduced motion

- Increase damping and cap angular velocity.
- Replace ballistic offscreen travel with short separation, opacity, and stable final positions.
- Disable ambient autonomous drift and nonessential rotation.
- Preserve load/release feedback with line weight, displacement, and state copy.
- Preserve every act, legacy preview, aftermath, and transition.

## Audio direction

Web Audio supports physics; it does not announce correctness.

- A low restrained frame tone starts only after gesture.
- Each material has a quiet timbre family; impacts are capped and debounced.
- The pitch field opens as constraints release, not simply every animation frame.
- Signal Gate briefly recalls contact colors/timbres without adding Chapter 2 audio assets.
- LEAVE ends with a quiet retained harmonic; VANISH ends with controlled absence.
- Construction, resume, suspension, blocked output, and unavailable API all preserve silent completion.
- All oscillators, gains, timers, and contexts close safely on replay, route-away, and completion.

## Accessibility

- Every structure is a semantic control with stable accessible name and act state.
- A live region announces act changes and release results, not per-frame coordinates.
- Focus order follows narrative unlock order.
- Focus is not moved unexpectedly when a body breaks into visual fragments.
- Visual fragments created after release are `aria-hidden`; the semantic structure control remains or is replaced by a stable completed summary.
- Color, sound, motion, and physics position are never sole carriers of state.

## Performance and cleanup

- Single engine and frame loop per mount.
- No React state in body update loops beyond bounded semantic snapshots.
- No full-world reset on resize.
- Remove Matter bodies, constraints, collision/event handlers, RAF, ResizeObserver/listeners, completion timers, and audio on cleanup.
- Route-away during any act must not fire stale completion.
- Replay starts at Act 1 with a new clean seed/state and no old audio.

## Player acceptance

- I understood why each named structure existed in the story.
- I dismantled boundaries, storage, contact infrastructure, and the core in a deliberate order.
- The physics felt expressive but never blocked progression.
- Earlier choices changed the texture of the breach without grading me.
- I performed LEAVE or VANISH inside the Shell Core and saw its consequence.
- The transition to Credits felt like release and reflection, not a development overlay.

## Deferred alternatives

- Fully draggable freeform sandbox physics.
- Destructible text meshes or canvas-rendered shards.
- Haptics and device motion.
- Simulating the world beyond the breach.
- Carrying the other traces physically through the gate.

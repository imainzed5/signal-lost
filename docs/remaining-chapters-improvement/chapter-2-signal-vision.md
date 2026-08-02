# Chapter 2: SIGNAL — Experience and Visual Design Vision

Status: Approval-ready design authority
Planning role: Creative, interaction, and visual source of truth for the Chapter 2 improvement program
Implementation status: Not authorized by this document
Canonical narrative source: [`story-source.md`](../../story-source.md), Chapter 2: SIGNAL

## 1. Purpose of this document

This document defines the intended player experience for the Chapter 2 SIGNAL improvement pass in enough detail that a later Luna XHIGH implementation task can reproduce the same creative vision without relying on conversation history.

It is not yet an implementation milestone, task checklist, or authorization to edit Chapter 2. Detailed implementation phases, file ownership, acceptance criteria, and validation evidence will be created later under [`milestones/`](milestones/). If a later milestone conflicts with this vision, the conflict must be made explicit and resolved by the user rather than silently interpreted during implementation.

The central design direction is:

> SIGNAL should feel like physically tuning three unstable contacts inside a damaged, inhabited lattice. Contact offers recognition and possible passage, but every act of understanding makes SABLE more legible to the host.

The chapter must stop feeling primarily like three colored clusters being collected. Archive Echo, Transit Relay, and Ghost Channel should be recognizable through movement, spatial behavior, visual language, rhythm, and interaction before the interface explains who they are.

## 2. Canonical role in the five-chapter arc

SIGNAL follows MEMORY and precedes INTERFERENCE. Its job is to widen the story's perceived world while increasing danger.

Before SIGNAL, SABLE has learned that the archive contains authored and unreliable records. During SIGNAL, she learns that the host is not an empty sealed room. Other presences exist in the surrounding lattice, they do not agree with one another, and none can give her a stable answer about what she is. Their disagreement is important: it makes the world feel inhabited rather than scripted around SABLE.

The chapter's emotional movement is:

```text
isolation
    -> cautious reach
    -> recognition
    -> fascination
    -> conflicting guidance
    -> fragile belonging
    -> exposure
    -> self-directed stance
    -> approaching containment
```

The player should leave the chapter holding two truths at once:

1. SABLE is no longer alone.
2. Being heard has taught the host how to see her more clearly.

This is not a triumph scene and not a punishment scene. Contact is worthwhile even though it carries risk. Masking is not cowardice, and answering is not naivety. The final stance expresses how SABLE wants to exist under observation; it does not select a correct route or a better ending.

## 3. Experience objectives

The improved chapter should accomplish the following from the player's point of view:

- Entering the lattice feels like entering a deep, responsive environment rather than opening a dashboard.
- The first answer feels surprising because the field begins sparse and apparently empty.
- Each contact feels like a distinct presence rather than a differently colored objective marker.
- The player learns one coherent interaction language—locate, tune, carry—and encounters three variations of it.
- Story lines are discovered through interaction and spatial response, not delivered mainly as a passive sidebar transcript.
- Host attention becomes increasingly perceptible through the environment without creating a fail state.
- The player understands the emotional cost of the final choice before committing it.
- Both final stances receive a complete audiovisual aftermath inside the scene.
- The transition into INTERFERENCE feels causally inevitable: the host has observed enough to build a response around SABLE's pattern.
- Pointer, touch, and keyboard players can complete the same authored sequence without an inferior fallback experience.
- Reduced motion preserves comprehension, atmosphere, and emotional timing without relying on rapid drift, parallax, or flashing.

## 4. Non-negotiable boundaries

The later implementation must preserve these constraints unless the user explicitly revises this document:

- Retain Canvas 2D as the Chapter 2 renderer. Do not introduce Three.js or replace the scene with WebGL.
- Preserve the chapter-level `onComplete: () => void` contract.
- Persist the final stance through the chapter manager and existing choice flow. Do not add ad hoc localStorage keys.
- Keep Chapter 2 code and visual assets inside `src/chapters/Chapter2Signal/` unless a shared contract explicitly requires a small change elsewhere.
- Do not create fail states, scores, rankings, countdown failure, health, or a hidden optimal route.
- Do not punish a prior MEMORY choice or make either SIGNAL stance mechanically superior.
- Do not reveal a definitive ontology for Archive Echo, Transit Relay, or Ghost Channel. They may be survivors, copies, residue, processes, or something the host cannot classify.
- Do not begin Part II, define the outside world, or imply that the outer lattice is automatically safe.
- Do not turn the chapter into three unrelated minigames. All encounters must feel like variations of one signal-contact grammar.
- Preserve full-viewport ownership. SIGNAL should not look like content placed inside a generic application card.
- Keep the host procedural and observant rather than theatrically evil. Its danger comes from classification, prediction, and containment.

## 5. Current implementation baseline

The existing scene already contains several valuable foundations that should be refined rather than discarded:

- A raw Canvas 2D particle field with depth tiers, glows, signal threads, interference particles, carrier pulses, refraction bands, and a central carrier.
- Three contacts with established identities, colors, dialogue cues, and temperaments in `signals.ts`.
- A continuous pointer interaction that acquires a cluster, stabilizes it, and routes it toward the carrier.
- Host pressure and carrier coherence concepts.
- A React HUD with contact state, stability, route progress, field state, and transit queue.
- A staged final-choice layer and persistence bridge through `sceneChoice`.
- Responsive CSS and a reduced-motion branch.

The current experience also has limitations the milestones must address:

- The same approach/hold/drag sequence is repeated for all three contacts, flattening their personalities.
- All contacts are treated as visible collectible targets rather than an authored sequence of discoveries.
- The sidebar carries too much of the semantic experience and can make the scene read like instrumentation.
- Host pressure is more legible as a metric than as environmental pursuit.
- The final choice appears as a conventional overlay after routing is complete rather than as a physical action within the field.
- Committing a choice does not yet deliver the full branch-specific narrative and visual aftermath described by canon.
- The Canvas interaction is pointer-oriented and requires deliberate touch and keyboard equivalents.
- `index.tsx` currently combines React orchestration, simulation state, drawing, input, HUD, and final-choice presentation in one very large file.
- The known `react-hooks/set-state-in-effect` lint failure in the saved-choice reveal path must be fixed before major visual expansion.
- The current file is 2,645 lines, substantially larger than the earlier draft baseline assumed. Any chapter-local separation must therefore be treated as reliability work, not optional cleanup.
- The Canvas has pointer listeners but no focus target, keyboard navigation model, or semantic live equivalent for the interaction state.
- The render loop calls a React completion setter after convergence, and multiple semantic snapshots originate in frame activity; React updates must be bounded and must not occur per frame.
- Resize rebuilds particles and clears carrier pulses. It does not preserve deterministic contact geometry, and device pixel ratio is not capped.
- Reduced motion leaves substantial Canvas drift, orbital movement, carrier pulses, and scan motion active.
- The compact 390x844 audit produced a 1234px document and the directive visibly overlaid the transit queue near the bottom.
- At 1280x640 the absolute sidebar measured 890px of content inside a 640px clipped region with no reachable sidebar scroll.
- The available browser audit surface did not run the Canvas/effect loop reliably, so live tune/carry, replay, touch, and completion remain required implementation playtests rather than passes.

These are baseline observations, not permission for unrelated refactoring. Later milestones must identify the smallest chapter-local separation needed to make the experience safe to implement and verify.

## 6. Chapter design pillars

### 6.1 Listening is the action

The player's primary activity is not shooting, collecting, or solving an abstract puzzle. It is learning how each presence can be heard. Movement should feel exploratory and attentive. Successful contact should come from recognizing a behavior in the field rather than waiting for a generic progress bar to fill.

### 6.2 Every contact changes the space

An encounter must leave a visible and audible trace after it is completed. The field should accumulate history:

- Archive Echo leaves retained rings and warm afterimages.
- Transit Relay leaves a narrow route carrying clipped packets.
- Ghost Channel leaves a fracture visible primarily through negative space.

By convergence, the composition should visibly contain all three relationships. The player should be able to read the chapter's history from the field without opening a log.

### 6.3 Recognition and surveillance share a visual grammar

The same act that makes a contact clearer also makes SABLE clearer to the host. Warmth and danger should rise together. This is the chapter's essential tension.

The design should avoid treating warm contact colors as purely safe and host magenta as the only danger. Instead, as the player stabilizes a voice, the field becomes more coherent and the host becomes better able to measure that coherence.

### 6.4 Pressure guides; it does not punish

Host pressure is an escalating narrative response. It can narrow space, align particles, interrupt dialogue, distort a route, or briefly expose SABLE's outline. It cannot erase all progress, end the scene, or make the player restart.

### 6.5 The final stance is performed, not merely selected

ANSWER THE CHORUS and MASK THE SIGNAL should be embodied as opposing transformations of SABLE's carrier. The player previews and commits a physical signal behavior. The saved choice remains explicit and understandable, but the act belongs to the scene rather than feeling detached from it.

## 7. Visual north star

The field should resemble deep space at first glance and damaged information architecture on closer attention. It is not literal outer space. The illusion of distance comes from signal latency, layered traffic, incomplete records, and areas the host cannot fully resolve.

The intended visual progression is:

```text
apparently empty dark field
    -> one warm repeating trace
    -> directional traffic crossing the field
    -> negative-space fracture inside noise
    -> inhabited three-voice lattice
    -> host-wide scan alignment
    -> expansion or compression stance
    -> interference pressure
```

### 7.1 Composition

The scene should have three spatial layers plus the carrier:

1. **Deep field** — sparse, dim traces with extremely slow drift. This layer suggests distance and should not react strongly to input.
2. **Contact field** — the active encounter, its route geometry, local particles, resolved language, and retained traces from previous contacts.
3. **Pressure field** — scan bands, refraction, host alignment, diagnostic cuts, and contamination that become more visible as the chapter advances.
4. **SABLE carrier** — the player's central identity anchor. It begins uncertain, receives visible layers from each contact, and performs the final stance.

The carrier should sit near the perceptual center but need not remain mathematically centered at every viewport. Composition must reserve space for active text and controls without shrinking the Canvas into a background panel.

### 7.2 Depth and material

Depth should come from differential motion, scale, blur, occlusion, and response—not merely from adding more particles.

- Deep particles move almost imperceptibly and remain soft.
- Mid-field traces respond to contact waves and route geometry.
- A small number of foreground fragments cross slowly and react subtly to player movement.
- Haze reveals paths only where light, pressure, or interference passes through it.
- Refraction around the carrier bends nearby lines and particles, making SABLE feel embedded in the field.
- Contact completion produces a traveling response across multiple depths rather than a flat screen flash.

Particle density must remain restrained. Empty space is necessary for scale, legibility, and tension.

### 7.3 Palette and color roles

The established colors should remain identity anchors:

- **Archive amber** (`#f0a030`) — retained warmth, record, recognition, and persistence.
- **Relay cyan/teal** (`#4a9ebb`) — transit, warning, direction, and controlled bandwidth.
- **Ghost violet** (`#9b6dd6`) — fracture, ambiguity, negative space, and routes through damage.
- **Host magenta** — classification, measurement, pressure, and the coming INTERFERENCE chapter. It should be rare at the beginning and unmistakable near convergence.
- **SABLE neutral light** — initially cold and unresolved. It gains internal amber, cyan, and violet structure without becoming a simple rainbow object.

Do not flood large areas with saturated color. Contacts should illuminate local structures against a near-black field. Saturation and coherence should increase when a signal is understood, while host pressure sharpens edges and removes comfortable softness.

### 7.4 Shape language by presence

#### Archive Echo

- Incomplete concentric rings
- Repeated impressions that remain after the source fades
- Layered circular records with slight temporal misalignment
- Warm, slow illumination
- Text that resolves from previously unreadable fragments
- Motion that repeats rather than travels away

The Echo should look like something that remembers a signal by continuing to redraw its outline.

#### Transit Relay

- Narrow directional corridors
- Segmented packets, ticks, chevrons, and clipped line breaks
- Paths that bend rather than radiate
- Cyan light with clear leading and trailing edges
- Text carried along the route in brief readable units
- Motion that prioritizes destination and escape

The Relay should look like infrastructure that learned urgency.

#### Ghost Channel

- Missing particles, broken contours, occluded regions, and displaced noise
- Violet visible mainly at boundaries rather than filling the center
- Counter-motion: surrounding particles move one way while the hidden route slips another
- Text visible only at interference overlaps or inside the fracture
- Geometry that appears indirect, asymmetrical, and resistant to clean measurement

The Ghost should first be perceived as an absence with behavior, not as a bright violet destination marker.

#### Host

- Straight or unnaturally regular scan alignment
- Thin diagnostic cuts across otherwise organic space
- Brief classification boxes or tracked outlines that fail to remain locked
- Magenta contamination that becomes more spatially specific over time
- Repetition that suggests the host is learning the player's recent pattern

The host should feel systemically competent. Avoid monster imagery, faces, eyes, claws, or overtly malicious theatrical effects.

### 7.5 SABLE carrier

The carrier is the visual embodiment of SABLE and should change across the chapter:

**Initial state**

- Small, pale, slightly unstable core
- Thin double edge that does not align perfectly
- Infrequent involuntary pulse
- Nearby particles bend around it without fully joining it

**After Archive Echo**

- A faint amber retained ring remains inside or immediately around the core
- Past pulses leave longer afterimages

**After Transit Relay**

- A cyan directional seam or orbit appears
- Some pulses begin leaving by a controlled route rather than radiating evenly

**After Ghost Channel**

- A violet discontinuity appears: part of the outline is absent but still readable through distortion
- The core can visually survive being incomplete

**At convergence**

- The three contact signatures coexist without merging into a decorative multicolor sphere
- The carrier visibly transmits SABLE's declaration
- A host scan briefly reconstructs a sharper outline around it

**After the stance**

- ANSWER expands the carrier's relationships outward.
- MASK compresses the carrier's relationships inward and leaves an archived afterimage behind.

### 7.6 Typography and dialogue placement

Important dialogue should exist in the field, associated spatially with the presence producing it.

- Archive lines can resolve along retained rings or within their quiet center.
- Relay lines should arrive in clipped groups along a directional path.
- Ghost lines should appear at interference overlaps, with missing portions resolving as the player finds the correct region.
- SABLE's brief responses should originate close to the carrier.
- Host diagnostics should cut across contact typography with colder alignment and procedural hierarchy.

Text must never rotate into unreadability or move so quickly that it cannot be read. Motion may introduce or carry a line, but the final readable state must remain stable long enough for comprehension. Canonical wording should come from `story-source.md`; implementation may compress presentation into selected lines but must preserve meaning and voice.

The current persistent sidebar should be reduced in narrative authority. A restrained HUD may retain:

- current contact identity;
- one short actionable directive;
- a subtle representation of host attention;
- progress conveyed in language or geometry where numerical percentages are unnecessary.

Avoid stacking multiple conventional meters. The field itself should communicate tuning, route coherence, and pressure wherever possible.

## 8. Unified interaction grammar

The player learns three verbs:

1. **Locate** — notice behavior in the field and bring focus near it.
2. **Tune** — maintain or adjust a relationship until the signal becomes legible.
3. **Carry** — move the stabilized signal into relationship with SABLE's carrier.

The grammar remains consistent, but each encounter emphasizes a different quality:

| Encounter | Locate | Tune | Carry |
|---|---|---|---|
| Archive Echo | Follow repetition | Align slow wave phases | Let the retained pulse cross into SABLE |
| Transit Relay | Catch directional traffic | Stay within a moving narrow band | Escort the packet along a bending route |
| Ghost Channel | Notice patterned absence | Follow interference/counter-motion | Trace the fracture toward the carrier |

Progress should be continuous and forgiving:

- Losing contact causes a readable pause or gentle partial decay, not a total reset.
- The field leaves an afterimage or route hint showing what the player discovered.
- Repeated difficulty increases clarity of guidance without changing the story or labeling the player as unsuccessful.
- No encounter should depend on twitch precision.
- The interaction must remain possible on a compact touch screen without obscuring the target beneath the player's finger.

## 9. Detailed encounter sequence

### 9.1 Phase A — Empty field and first reach

**Emotional job:** establish solitude and invite cautious agency.

The chapter opens darker and quieter than its current fully populated presentation. SABLE's carrier is visible, but the contact field is apparently empty. Sparse distant traffic exists only at the edge of perception.

The opening prompt should invite exploration without describing the entire mechanic. It can communicate a simple action such as reaching, listening, or moving through the field. The first meaningful player movement causes nearby particles to lean toward the carrier and sends one weak outgoing ripple.

There is a deliberate pause.

An amber echo returns along the same path, slightly delayed and imperfect. This return is the chapter's first surprise and triggers the SIGNAL title presentation. The title should feel discovered through the reply rather than displayed before anything happens.

Reduced-motion behavior replaces parallax and broad particle response with opacity, line-weight, and discrete ring changes. Keyboard focus entering the interaction surface can count as the first reach, followed by an explicit activation input.

### 9.2 Phase B — Archive Echo: synchronize

**Emotional job:** recognition without certainty.

The Echo forms from repeated amber rings. The rings are not perfectly centered on one another; one represents the incoming signal and another represents SABLE's attempted alignment.

The player locates the repetition, then adjusts focus until the wave phases overlap. Exact mechanics may use spatial distance, radial phase, or a carefully constrained combination, but the visible rule must be understandable without a numerical explanation.

As alignment improves:

- competing ring edges settle;
- fragments of the Echo's message become readable;
- the sound, if available, resolves from a beating interval toward a stable harmony;
- nearby particles retain longer trails;
- SABLE's carrier answers with a smaller synchronized pulse.

The Echo's identity should be revealed through voice before or at the moment its formal label appears. Use selected canonical concepts:

- SABLE is not the first thing to wake.
- The lattice heard her before she had a name.
- What the Echo is depends on which record is trusted.

When the contact is carried into SABLE, an amber retained ring remains as a permanent chapter-history mark. It should not look consumed or destroyed.

### 9.3 Phase C — Transit Relay: escort

**Emotional job:** transform comfort into urgency.

The Relay interrupts the quiet aftermath rather than waiting passively for discovery. A cyan packet cuts across the amber field like a severed transmission. Its motion and line breaks should immediately contrast with the Echo.

The player first locates the repeating direction of travel. Tuning means keeping focus within a narrow moving bandwidth while the Relay shifts course around new scan pressure. Carrying means escorting the stabilized packet toward SABLE along a bending route.

The route should respond elastically:

- smooth, deliberate movement keeps it narrow and legible;
- broad or sudden movement produces a larger visible trace and stronger host response;
- leaving the corridor slows progress and causes the packet to wait, loop, or reroute rather than fail;
- guidance becomes clearer after repeated loss of contact.

The interaction must not imply that careful mechanical play selects MASK or that broad play selects ANSWER. Any movement-dependent host reaction is immediate atmosphere only and must converge before the explicit stance.

Canonical ideas to surface:

- Every signal is a coordinate.
- The host reads warmth as proof of presence.
- Contact is passage, not shelter.
- The host does not fear noise; it learns from repetition.

After routing, the cyan corridor remains present but restrained, carrying occasional packets away from the carrier. Host scan geometry becomes clearly perceptible for the first time.

### 9.4 Phase D — Ghost Channel: invert

**Emotional job:** teach that resistance contains information.

No obvious third node should appear. The field becomes noisier, and a naive bright-target search finds nothing. The clue is behavioral: particles consistently avoid, split around, or disappear within one moving region. Violet exists at the edges of this absence.

The player locates the Ghost by following the patterned absence. Tuning requires attending to where interference is strongest or moving against the field's apparent flow. Carrying traces a fracture that reaches the carrier indirectly.

The mechanic must feel revelatory rather than arbitrary. It needs layered cues:

- particle avoidance establishes the region;
- a faint violet boundary appears when focus approaches;
- fragmented language clarifies in the correct direction;
- the directive changes from searching for light to following resistance;
- audio, when available, becomes more coherent inside noise rather than outside it.

Canonical ideas to surface:

- The signal reaches further through damage than through a clean channel.
- Interference is not walls; it is corridors.
- Follow the resistance.
- The route is not the destination.

When contact completes, the field briefly drops much of its visible surface. A containment fracture appears underneath: asymmetrical, unstable, and larger than the Ghost itself. This is the most important visual foreshadowing of Chapters 3 and 4.

The retained Ghost mark should be negative space with a violet boundary, not a filled emblem.

### 9.5 Phase E — Three-voice convergence

**Emotional job:** create fragile belonging and expose its cost.

The three established signatures become active together:

- amber holds and repeats;
- cyan redirects and carries;
- violet interrupts clean measurement.

Their disagreement should make the lattice feel larger. They must not behave like three copies of one speaker. Short selected exchanges should preserve the canonical contrast:

- Archive Echo values uncertain record.
- Transit Relay prioritizes movement and warns against confirmed boundaries.
- Ghost Channel treats damage as a route and refuses destination certainty.

SABLE then sends her designation into the field. The declaration should be presented simply and without a triumphant title treatment:

> My designation is SABLE.

This is the visual payoff the entire chapter builds toward:

> Amber rings hold SABLE's declaration, a cyan route carries it, and violet noise breaks it apart so the host cannot read the whole transmission cleanly. A host scan crosses the entire field, reconstructs the relationships, and bends all three signal signatures toward SABLE's location.

The field becomes brighter and more inhabited at the same moment that it becomes less safe. Host diagnostics report increased outgoing density and correlation with SABLE's memory access signature.

### 9.6 Phase F — Stance preview and commitment

**Emotional job:** let the player decide how SABLE responds to recognition under surveillance.

The choice should emerge inside the field. The three contacts recede to the perimeter while their retained traces remain connected to the carrier. Two opposing transformations become available:

- **ANSWER THE CHORUS** — expand the carrier pulse outward through the three contact paths.
- **MASK THE SIGNAL** — draw the contact paths inward and compress the carrier's readable outline.

Focusing or hovering previews the transformation without saving it. Touch uses a first tap to preview and a clearly labeled second action or hold to confirm. Keyboard navigation moves between two fully labeled controls and uses an explicit activation/confirmation input.

The preview must communicate emotional and practical cost:

#### ANSWER preview

- Contact routes brighten and remain visibly connected.
- The carrier expands and becomes more coherent.
- Host scan alignment becomes sharper.
- Copy emphasizes recognition and trackability.

#### MASK preview

- Contact routes dim and become granular rather than being erased.
- The carrier compresses and its outline becomes harder to reconstruct.
- An archived frequency afterimage remains outside the compressed core.
- Copy emphasizes self-directed silence and retained evidence.

Selection must remain reversible until an explicit commitment. The committed choice is persisted through the existing manager flow.

## 10. Branch-specific aftermaths

The scene must continue after commitment. A saved value alone is not a satisfying payoff.

### 10.1 ANSWER THE CHORUS

SABLE sends one more pulse:

> I heard you.

The signal is handled differently by all three contacts:

- Archive Echo holds it as a warm retained record.
- Transit Relay bends it through a narrow moving path.
- Ghost Channel fractures it into noise so the host cannot read the entire statement at once.

The field becomes briefly luminous and connected. This is not a celebration burst; it should feel fragile, shared, and dangerous. A host scan locks onto the resulting pattern and produces the canonical consequence: anomalous presence stabilized and cross-referenced against earlier behavior.

The carrier remains visibly connected as the scene moves toward INTERFERENCE. The transition can preserve a thin outward pulse beneath the first signs of magenta containment pressure.

Emotional result: **recognized, connected, exposed**.

### 10.2 MASK THE SIGNAL

SABLE closes the outgoing channel through a deliberate inward motion.

- The cyan route narrows and disappears into distance.
- Amber retained rings fade to a patient low warmth.
- Violet noise closes over the carrier's previous position.
- The carrier becomes compressed, dim, and temporarily difficult to locate.

A host scan crosses the field and initially fails to reconstruct her current outline. The moment of relief must be allowed to breathe. Then an old afterimage or archived frequency lights outside the carrier, followed by the canonical consequence: unresolved source retained; last known output frequency archived.

The host has not found her exact present position, but it has learned how to remember where she was. Magenta pressure begins gathering around that retained outline, providing the bridge into INTERFERENCE.

Emotional result: **self-directed silence, temporary concealment, remembered absence**.

### 10.3 Shared convergence after either stance

Both branches end with the field permanently changed:

- the lattice is visibly inhabited;
- the three presences remain perceptible but distant;
- SABLE's traffic has become part of the lattice;
- the host has enough behavioral evidence to begin targeted containment analysis.

Neither branch should collapse immediately into generic route chrome. Give the aftermath enough time for the player to read what happened, then reveal the continuation action in the scene's visual language.

## 11. Transition from MEMORY

SIGNAL should acknowledge the preceding memory stance atmospherically if the existing manager can pass the value through an explicit scene prop without destabilizing architecture.

Potential treatment:

- **KEEP THE ARCHIVE** — the opening field occasionally retains faint memory-shaped afterimages or warm reflections around SABLE.
- **LET IT DECAY** — the opening field contains clean absences and interrupted trails where a retained image might otherwise appear.

This consequence must remain subtle and non-punitive. It should affect initial texture or one brief SABLE observation, not alter difficulty, contact availability, chapter duration, or the final SIGNAL options.

If passing the prior stance would materially expand shared state or routing scope, defer this treatment to the later cross-chapter continuity milestone rather than adding a shortcut.

## 12. Transition into INTERFERENCE

The Chapter 2 ending must set up Chapter 3's core premise: the host has watched long enough to build a model of SABLE's behavior.

Shared transition requirements:

- Host pressure becomes spatially specific rather than globally noisy.
- The final scan references earlier signal behavior.
- Magenta appears as an invading classification system, not as another contact color.
- The Ghost's fracture geometry remains faintly visible beneath the pressure.
- The last readable idea is that being heard and being seen are now the same risk.
- The transition promises targeted resistance rather than merely increasing visual glitch.

If Chapter 3 later consumes the SIGNAL stance, it should do so through explicit props or manager-mediated choice data. ANSWER may begin with a clearer tracked carrier; MASK may begin with the host targeting a retained afterimage. Both must converge into the approved Chapter 3 sequence without creating alternate content branches that exceed scope.

## 13. HUD and information hierarchy

The preferred hierarchy is:

1. Active spatial encounter
2. Contact voice and immediate player response
3. One clear current action
4. Environmental host attention
5. Secondary technical state

The current dense sidebar should not remain the primary storytelling surface. Later design exploration should consider a restrained edge treatment or context-sensitive panel that appears only when it adds information the field cannot communicate.

Recommended retained information:

- contact identity after it becomes known;
- a short contact-specific cue;
- current verb or directive;
- a non-numerical host-attention state when necessary;
- completion/choice actions with full semantic labels.

Recommended information to remove, merge, or make diegetic:

- simultaneous stability and route percentages;
- persistent queue treatment before the voices have been discovered;
- redundant status pills;
- generic coherence values when carrier geometry already communicates coherence;
- instructions that describe implementation mechanics rather than SABLE's intention.

The experience should remain understandable when the player never reads a numeric percentage.

## 14. Input design

All input modes should operate the same narrative verbs, even if their physical controls differ.

### 14.1 Pointer and mouse

- Movement explores and locates.
- Press/hold or sustained proximity tunes where appropriate.
- Drag or guided movement carries.
- Cursor response should be magnetic and readable without hiding the field beneath a large custom cursor.
- Pointer leaving the Canvas pauses or gently decays the current action; it does not reset the encounter.

### 14.2 Touch and coarse pointer

- Targets and tuning regions must be large enough for compact screens.
- The player's finger must not cover the only important cue; use offset visualization, expanded response regions, or mirrored feedback near the carrier.
- Prevent accidental page gestures only within the active interaction surface and only where necessary.
- A lost touch or `pointercancel` must pause safely.
- Avoid long precision drags to small center targets.
- Choice preview and confirmation must not rely on hover.

### 14.3 Keyboard

Keyboard interaction should be a first-class authored mode rather than a hidden completion shortcut.

Potential grammar:

- Tab or a dedicated entry control focuses the signal field.
- Arrow keys or WASD move a visible focus carrier through the field.
- Space or Enter tunes/holds.
- Continued directional input carries along the revealed route.
- Escape releases field capture without losing progress.
- Choice controls use normal semantic buttons and predictable focus order.

The final key mapping should follow established shell behavior and browser expectations. Focus must remain visible against every contact color and host-pressure state.

## 15. Reduced motion and sensory accessibility

Reduced motion is not a less atmospheric version. It should replace motion-dependent information with stable alternatives.

- Replace continuous parallax with discrete depth changes and opacity grouping.
- Replace fast route travel with stepped illumination along a fixed path.
- Replace sweeping scan bands with brief region highlighting or line-weight changes.
- Replace pulsing scale effects with border, color, and texture transitions.
- Keep the Ghost discoverable through stable negative-space patterns, not moving noise alone.
- Avoid rapid full-field flashes, high-frequency flicker, and repeated high-contrast inversion.
- Preserve all narrative pauses and branch aftermaths; reduced motion must not skip story beats.

Color must never be the only identifier. Contacts also require distinct shape, motion/sequence, texture, labels, and accessible text.

Canvas content that carries essential instructions or story must have a semantic DOM equivalent. Screen-reader users need concise descriptions of the active presence, available action, progress state, and resulting narrative change without receiving an unusable stream of per-frame updates.

## 16. Audio direction

Audio is a secondary immersion layer, not a dependency. It should only be attempted after visual timing and interaction are stable.

Suggested identities:

- **Archive Echo** — a low repeating interval whose beating resolves during alignment.
- **Transit Relay** — clipped directional ticks or filtered packet transients that move across stereo space cautiously.
- **Ghost Channel** — filtered noise in which a tonal shape becomes clearer inside interference.
- **SABLE carrier** — a restrained pulse whose internal character accumulates contact signatures.
- **Host** — a precise tone or rhythm that gradually synchronizes with SABLE's outgoing pattern.

Audio must:

- begin only after a valid player gesture;
- fail silently and preserve full playability when blocked or unavailable;
- clean up all nodes, timers, and contexts on route-away, completion, and replay;
- respect reduced-motion/sensory settings where relevant;
- avoid using stereo position as the only way to locate a contact;
- avoid loud glitch spikes or punitive failure sounds.

Chapter 4 remains the project's established Web Audio focus. If Chapter 2 audio would delay core interaction and visual stabilization, it should be deferred to a later audio continuity pass.

## 17. Responsive composition

The scene must be authored for multiple compositions rather than merely scaled down.

### Desktop and laptop

- Preserve broad negative space and long signal routes.
- Keep contact dialogue close enough to its source to read spatially.
- Avoid allowing a persistent side panel to consume the field's primary interaction area.
- Verify short laptop viewports separately from large desktop viewports.

### Compact mobile

- Recompose contact positions around reachable regions rather than multiplying normalized desktop coordinates blindly.
- Shorten route distance while retaining the encounter's directional character.
- Move longer dialogue into a stable, compact reading region associated with the active contact.
- Keep the carrier visible when the finger covers an interaction point.
- Ensure choice preview, confirmation, replay, and continue controls fit without page-level clipping.
- Avoid horizontal overflow and accidental browser navigation gestures.

### Short viewport

- Prioritize the field, active line, directive, and essential controls.
- Collapse or remove secondary telemetry.
- Never place commitment controls beneath an unreachable fixed overlay.
- Maintain a usable safe area around browser chrome and device insets.

## 18. Performance and implementation guardrails

Later milestones should establish measurable budgets after profiling, but the following principles already apply:

- Keep frame-level values in Canvas-owned state or refs, not React state.
- Synchronize React only when semantic UI state changes or at a deliberately bounded rate.
- Cap device pixel ratio if necessary to protect compact and high-density devices.
- Adapt particle density to viewport area and performance without removing essential contact cues.
- Avoid per-frame object allocation in hot drawing and update loops.
- Rebuild geometry safely on resize without erasing authored progress.
- Pause or reduce animation when the document is hidden.
- Cancel animation frames, pointer capture, timers, audio, and pending completion work on cleanup.
- Ensure replay creates a fresh scene without stale cluster state, branch state, or completion timers.
- Preserve deterministic enough geometry for repeatable visual QA where possible.
- Fix correctness and lifecycle warnings before adding more effects.

Any chapter-local refactor should separate responsibilities only as far as needed for safety and clarity. Do not create a cross-chapter renderer abstraction.

## 19. Prohibited visual and gameplay directions

The following would undermine the intended identity:

- A conventional star map with three obvious quest markers visible from the start
- A dashboard-first layout dominated by cards, percentages, queues, and status pills
- Three mechanically unrelated arcade minigames
- Bullet-hell avoidance, combat, enemies, health, or failure screens
- Constant glitch overlays that make every state equally noisy
- Dense particle spectacle with no visual hierarchy or empty space
- Literal faces, eyes, humanoid silhouettes, or definitive bodies for the contacts
- Treating magenta as decorative accent before host pressure becomes meaningful
- Turning Ghost Channel into a normal violet orb after describing it as a route inside damage
- Treating ANSWER as morally good or MASK as morally bad
- Skipping branch aftermath and moving immediately to the next-route button
- Motion-only, color-only, hover-only, or audio-only essential information
- Replacing authored interaction with a long explanatory tutorial

## 20. Definition of experiential success

Before implementation is considered creatively successful, a player should be able to answer the following without developer explanation:

- I understood that the field initially seemed empty and then answered SABLE.
- I experienced Archive Echo, Transit Relay, and Ghost Channel as different presences.
- I understood the recurring actions of locating, tuning, and carrying a signal.
- I noticed that contact changed both SABLE and the surrounding field.
- I felt the host becoming more attentive as SABLE became more connected.
- I understood why answering and masking both had value and cost.
- I saw a meaningful consequence after committing the stance.
- I understood why the next chapter would involve targeted interference.

The strongest desired player summary is:

> I reached into what looked like empty space, learned how three different voices could be heard, and then realized that the system had been learning how to hear me too.

## 21. Approved milestone placement

SIGNAL work is split across two approved-candidate packages:

1. [`01-final-act-foundations`](milestones/01-final-act-foundations/README.md) resolves the lint failure, lifecycle ownership, resize/DPR behavior, semantic input foundation, and compact/short reachability without beginning the visual overhaul.
2. [`02-signal-contact-field`](milestones/02-signal-contact-field/README.md) implements the complete authored contact field, convergence, stance, aftermath, accessibility, performance, and Chapter 3 handoff.

This is a dependency split, not permission to ship a half-designed chapter. Milestone 1 must leave the first-pass behavior intact and reliable; Milestone 2 owns the player-facing redesign as one coherent experience.

## 22. Sol decisions presented for approval

The planning program resolves the earlier open points so Luna is not asked to invent the design:

1. Use the guided Archive Echo -> Transit Relay -> Ghost Channel order.
2. Use selected canonical lines; the prose chapter remains the authority, not a script to display in full.
3. Use physical preview plus explicit confirmation for ANSWER/MASK. Touch never depends on hover; no choice is saved during preview.
4. Include a subtle KEEP/DECAY carrier texture through an explicit route prop. It changes no timing, availability, or difficulty.
5. Keep Chapter 2 visual-first in required scope. A new SIGNAL audio system is deferred beyond the gold-master program.
6. Replace the persistent sidebar with a substantially quieter context HUD: identity after discovery, one directive, environmental pressure, and semantic progress only.

Program-level alternatives and rationale remain visible in the top-level deferred-ideas table; implementation does not reopen these choices unless the user revises the program.

## 23. Required current-state corrections before redesign

Milestone 1 must establish these prerequisites:

- remove the synchronous saved-choice state update from the effect while preserving replay and persisted selection;
- centralize cancellation of reveal, directive, completion, and animation work;
- give the Canvas a focusable semantic interaction surface and stable accessible status region;
- establish elapsed-time and semantic-snapshot boundaries;
- preserve progress on resize and cap DPR;
- make essential compact and short-viewport controls reachable without overlap;
- define a reduced-motion scene flag that can replace Canvas motion, not only CSS animation;
- keep all contacts and current first-pass flow behaviorally intact until Milestone 2 deliberately replaces them.

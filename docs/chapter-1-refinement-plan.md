# Chapter 1: MEMORY Refinement Plan

Last reviewed: 2026-07-31

## Purpose

This document is the implementation reference for the Chapter 1 visual-polish and experience pass. It records the agreed direction before code changes begin and separates confirmed correctness work from optional visual expansion.

Chapter 1 should remain a full-viewport CSS 3D memory-card scene. The pass should clarify and strengthen the existing archive-recovery experience rather than replace it with a new renderer, a new chapter structure, or a fail-state-driven game.

## Approved direction

The guiding experience is:

> The archive first presents recovery as something intimate and inviting, then reveals that the act of recovery is itself being observed and managed.

The following decisions are approved:

- Preserve free recovery order.
- Preserve the existing five memory fragments, narrative text, choice text, routing, persistence, and chapter-manager contracts.
- Make the archive progressively more claustrophobic as fragments are recovered.
- Add a short branch-specific aftermath for both `KEEP THE ARCHIVE` and `LET IT DECAY` before the transition to SIGNAL.
- Preserve the CSS 3D floating-card identity on desktop and create an authored layered-stack version for compact screens.
- Improve the legibility of existing mechanics before adding decorative complexity.

## Experience arc

The existing interaction sequence remains the foundation:

1. **Invitation** - The archive opens as a quiet field of incomplete, intimate records.
2. **Recovery** - The player chooses a fragment and holds to stabilize it while corrupt text resolves.
3. **Recognition** - Recovered fragments echo into related records and reveal that the memories were categorized and handled.
4. **Surveillance** - Host warnings, resistance, and the uninvited observation record make the archive feel monitored.
5. **Evidence** - ORIGIN confirms that the archive predates SABLE's current waking session.
6. **Authority** - The player decides whether the curated record still deserves authority over SABLE's present identity.
7. **Handoff** - The selected stance produces a brief visual consequence before SIGNAL becomes available.

The emotional movement should be warmth to suspicion to dread to deliberate ownership. The player should finish with evidence, not certainty.

## Preserved contracts and boundaries

- Keep Chapter 1 isolated in `src/chapters/Chapter1Memory/`.
- Preserve the chapter-level `onComplete: () => void` contract.
- Persist the final choice through the existing `sceneChoice` and chapter-manager flow.
- Do not add direct localStorage access inside Chapter 1.
- Do not change the meaning or wording of the five fragments, monologue, warnings, or final choices during this pass.
- Do not introduce Canvas, WebGL, Three.js, Matter.js, backend state, authentication, or server persistence.
- Do not couple Chapter 1 internals directly to Chapter 0 or Chapter 2.
- Preserve replay behavior and the existing route to Chapter 2.
- Preserve all unrelated working-tree changes, especially the active Chapter 3 work.

## Maintainability and file organization

The current `Chapter1Memory/index.tsx` has grown beyond 3,500 lines and `memory.module.css` is approaching 2,000 lines. The refinement pass must not continue concentrating new behavior in those two files. Improving the experience while leaving the implementation monolithic would make later bug fixes, timing changes, and responsive work unnecessarily risky.

The organizational goal is not to create many tiny files or a generic renderer. It is to give each Chapter 1 subsystem a clear local owner while retaining one readable scene orchestrator.

### Recommended chapter-local boundaries

- `index.tsx` - scene composition, top-level phase orchestration, and the public `onComplete` / `sceneChoice` bridge.
- `types.ts` - Chapter 1-only state and interaction types.
- `constants.ts` - timing, thresholds, audio paths, choice options, and static configuration.
- `geometry.ts` - pure responsive placement, safe-bound calculations, and recovered-order layout helpers.
- `useMemoryHold.ts` - pointer/keyboard hold lifecycle, progress, stutters, blocked resistance, and cancellation cleanup.
- `useMemorySequence.ts` - intro, archive warnings, ORIGIN, monologue, choice aftermath, and completion sequencing.
- `useMemoryAudio.ts` - ambient and monologue audio creation, playback, autoplay recovery, and cleanup.
- `MemoryCard.tsx` - a presentational legitimate-fragment card with explicit event props and state props.
- `UninvitedCard.tsx` - the optional observation-record presentation and rejection feedback.
- `OriginCard.tsx` - accessible ORIGIN presentation and optional session-detail interaction.
- `ArchiveHud.tsx` - received count, pressure, and host-monitoring status.
- `MemoryChoice.tsx` - final stance controls, confirmation, aftermath, replay, and continuation presentation.

Exact filenames may change when implementation reveals a cleaner boundary, but the responsibilities should remain cohesive and chapter-local.

### Styling boundaries

The CSS should also be divided by responsibility if the component extraction makes that useful:

- Scene field, background, HUD, and responsive composition
- Memory-card faces, corruption, progress, and fragment signatures
- Archive warnings, uninvited record, and ORIGIN
- Monologue, choice, aftermath, and continuation
- Shared Chapter 1 keyframes and reduced-motion overrides

Multiple Chapter 1 CSS modules are acceptable. Visual styles must remain inside the Chapter 1 folder and should not migrate into global styles merely to reduce file length.

### Refactoring rules

- Extract pure types, constants, and helpers before moving stateful behavior.
- Keep behavior unchanged while establishing file boundaries; do not combine a large mechanical move with a visual rewrite in the same step.
- Give every timer, interval, animation frame, and audio object one obvious lifecycle owner.
- Avoid duplicating refs or mirroring the same state across several hooks.
- Keep state near the subsystem that changes it, but keep cross-phase transitions visible in the top-level orchestrator.
- Prefer explicit props and Chapter 1-specific types over a configurable generic-card framework.
- Do not create shared abstractions for other chapters unless another chapter already has the same verified requirement.
- Use file size as a warning signal, not an arbitrary quality metric. A practical goal is to bring the orchestrator below roughly 1,000-1,200 lines and keep new subsystem files focused enough to review without excessive cross-referencing.
- Validate after each extraction so regressions can be attributed to one move.

## Confirmed baseline issues

These are correctness issues, not optional polish:

1. The completion effect has a missing `stabilizationOrder` dependency.
2. Two `Date.now()` calls violate React purity rules.
3. Responsive card placement reads `window` during render and creates a server/client hydration mismatch.
4. Rotated compact cards can extend beyond the right edge even though overflow is hidden.
5. The compact final-choice composition remains constrained below `top: 58%` and can clip vertically.
6. Reduced-motion handling only reduces drift amplitude; continuous scanlines, pulses, entry movement, and 3D transitions remain active.
7. Global Enter-to-continue handling can conflict with the replay control.
8. ORIGIN's secondary interaction is mouse-hover dependent and can disappear before its optional lines finish.
9. Stabilized-card cross-references are difficult to rediscover on touch and awkward to reach consistently with a keyboard.
10. Attempting a currently locked host-resistant card can feel like an ignored input rather than an authored rejection.

## Design principles

### Free order should matter

The chapter must not prescribe a correct fragment order. Recovery order should remain player-authored and should become more visible through recovery indexing and the final settled composition. The existing MIRROR-first and MIRROR-last monologue variations remain intact.

### Pressure should be systemic, not punitive

The archive can degrade, tighten, and resist, but it should never create a fail state or punish a player for reading. Pressure should communicate host attention and increasing instability.

### Every failure should look authored

Blocked holds and the uninvited record must visibly communicate that the host or archive rejected the operation. They should never resemble dropped input, a broken progress bar, or an inaccessible card.

### Both final choices are valid stances

The final treatment must avoid good/bad color coding. KEEP carries weight and continuity; DECAY rejects imposed authority while accepting incompleteness. Neither should be framed as success or failure.

### Compact is a distinct composition

Mobile should not be a scaled-down desktop scatter. It should preserve the layered archive metaphor while keeping titles, focus targets, progress, warnings, ORIGIN, and the choice phase readable within the dynamic viewport.

## Planned gameplay refinements

### Active-card focus

- Lift the held or keyboard-focused card clearly above the field.
- Increase text and corruption-recovery legibility while it is active.
- Recede neighboring cards through restrained opacity, depth, or contrast changes.
- Keep the progress track readable without allowing it to overpower the recovering text.
- Maintain strong focus-visible treatment independent of hover.

### Recovery-order payoff

- Retain the existing recovery index metadata.
- Let the completed field settle according to recovery order rather than only fixed fragment identity.
- Use a desktop sequence or shallow fan and a compact recovery rail or layered stack.
- Keep ORIGIN spatially separate from the five recovered fragments.

### Reactive degradation

- Begin meaningful degradation after the first successful recovery rather than immediately at scene mount.
- Stagger degradation so every untouched card does not change simultaneously.
- Pause degradation during archive-warning overlays and the completion sequence.
- Keep degradation visual and atmospheric; it must not erase stabilized fragments or produce a fail state.
- Give reduced-motion users a stable, low-motion version of the same state changes.

### Host-blocked fragment

- Respond immediately when a blocked fragment is attempted.
- Show a brief resisted-progress response, rejection flash, or restrained pushback.
- Explain through existing system language that host resistance is active.
- Allow the fragment to recover normally when it becomes the final legitimate record.
- Provide a non-motion equivalent based on border, contrast, and status changes.

### Uninvited observation record

- Preserve its optional, impossible-to-stabilize role.
- Make each progress reset visibly intentional.
- Let the source label attempt and fail to resolve.
- Reveal observation-state details through restrained system feedback rather than new exposition.
- Ensure its withdrawal after the fifth legitimate fragment reads as an observer retreating, not an element being removed arbitrarily.

### ORIGIN interaction

- Make ORIGIN accessible through pointer, touch, focus, and keyboard input.
- If the player engages with ORIGIN, hold its exit until the optional session lines finish.
- Do not make the optional interaction block chapter completion.
- Keep its appearance visually quieter than the host warnings and final choice.

### Re-examination and cross-references

- Make recovered cross-references discoverable without requiring mouse hover.
- Permit focus, touch activation, or a compact persistent presentation.
- Keep the information secondary so it rewards inspection without interrupting the main recovery loop.

## Planned visual refinements

### Progressive claustrophobia

The field should change with recovery count:

- **0-1 recovered:** broad negative space, slow drift, low host presence.
- **2 recovered:** slightly tighter vignette and clearer relationships between fragments.
- **3 recovered:** active monitoring, host resistance, and the uninvited record visibly disturb the composition.
- **4 recovered:** the remaining field feels constrained and deliberate rather than merely sparse.
- **5 recovered:** movement resolves into an authored recovered-order arrangement before ORIGIN appears.

The effect should come primarily from composition, vignette, contrast, and spacing. Avoid excessive camera movement or screen shake.

### Fragment-specific signatures

All fragments remain part of one purple archive system. Their distinctions should be subtle behaviors, not separate themes:

- **GLASS:** refracted border or divided highlight.
- **PROTOTYPE:** repeated registration or revision marks.
- **CALM:** unnaturally regular pulse or measured cadence.
- **SILENCE:** suppressed scan noise or disappearing signal marks.
- **MIRROR:** delayed afterimage or faint reflected response.

These signatures must not reduce text contrast or run as visually loud continuous effects.

### Archival connections

- Stabilized fragments may leave faint connections to their documented cross-references.
- Connections should appear only when they clarify relationships or recovery order.
- Avoid recreating Chapter 0's signal-route visual or turning the field into a dense crossed-line lattice.

### HUD hierarchy

- Preserve `RECEIVED` and `SIGNAL PRESSURE` as the primary persistent indicators.
- Make host monitoring state legible as the archive escalates.
- Reduce simultaneous low-contrast microtext where it competes with card reading.
- Keep the HUD quiet during the monologue and final choice.

## Final-choice aftermath

The choice wording and values remain unchanged.

### KEEP THE ARCHIVE

- The recovered-order arrangement holds together.
- Memory text and player-authored recovery order remain visible.
- Host classifications and surveillance metadata retain their weight.
- The result should feel coherent but heavy, not triumphant.

### LET IT DECAY

- Host-authored classifications, archival codes, and institutional framing dissolve first.
- A restrained trace of the underlying memories remains long enough to show that rejecting authority is not the same as erasing experience.
- The result should feel exposed and self-directed, not destructive or victorious.

### SIGNAL handoff

- After either aftermath, send one restrained outgoing pulse or trace across the cleared field.
- Preserve the existing `SIGNAL UNLOCKED` continuation and Enter/click routing.
- Do not preview Chapter 2 so strongly that Chapter 1 loses ownership of its ending.

## Responsive strategy

### Desktop

- Preserve the floating archive scatter and readable negative space.
- Keep every rotated card inside the visible viewport, including its drift bounds.
- Prevent the settled arrangement from colliding with ORIGIN, monologue, or choice content.

### Compact and touch

- Use an authored layered stack with visible title or classification tabs.
- Bring the active card completely above its neighbors.
- Move stabilized cards into a compact recovery rail or ordered stack.
- Keep touch targets reliable even when cards overlap visually.
- Use the full viewport for ORIGIN, monologue, and final choice presentation.

### Short viewports

- Use `100dvh`-aware sizing and safe-area spacing.
- Reduce card dimensions and gaps only as far as reading remains comfortable.
- Ensure the final choices, replay control, continuation prompt, and all five recovered states fit without page scrollbars.

## Reduced-motion behavior

- Stop perpetual card drift.
- Remove or greatly reduce scanline travel and pulsing borders.
- Replace the 3D flip with a short low-motion state change or crossfade where appropriate.
- Shorten motion-dependent JavaScript waits so suppressed animation does not create dead time.
- Preserve readable warning, monologue, and confirmation durations.
- Do not shorten hold interactions so aggressively that the recovery mechanic loses meaning.

## Accessibility and input requirements

- Every legitimate memory remains recoverable by pointer, touch, Space, and Enter.
- Focus order remains predictable despite visual overlap.
- Focus-visible treatment must not depend on hover support.
- Enter-to-continue must ignore replay and other protected interactive controls.
- Important state changes should have restrained accessible announcements without narrating every animation frame.
- Optional information exposed on hover must have an equivalent focus or touch path.
- Pointer cancellation, blur, route changes, replay, and unmount must leave no stale hold, timer, or audio state.

## Implementation order

### Phase 1 - Correctness foundation

- Extract low-risk types, constants, and pure helpers to establish maintainable chapter-local boundaries.
- Resolve lint purity errors with deterministic relative scheduling rather than a clock substitution.
- Make completion dependencies explicit and safe.
- Remove render-time viewport reads and eliminate hydration mismatch.
- Resolve keyboard continuation conflicts.
- Verify timer, animation-frame, and audio cleanup.

### Phase 2 - Responsive interaction shell

- Establish desktop, compact, and short-viewport compositions.
- Keep rotated and drifting cards inside safe bounds.
- Repair compact monologue, ORIGIN, and choice layouts.
- Establish reliable active-card and focus hierarchy.

### Phase 3 - Gameplay feedback

- Refine hold progress, bleed, resonance, degradation, and blocked rejection.
- Clarify the uninvited record's impossible recovery.
- Improve ORIGIN and cross-reference access.
- Preserve free order and existing escalation triggers.

### Phase 4 - Visual progression and payoff

- Add progressive claustrophobia.
- Add restrained fragment-specific signatures.
- Add the recovered-order final arrangement.
- Add KEEP and DECAY aftermath treatments and the SIGNAL handoff pulse.

### Phase 5 - Motion, audio, and stabilization

- Complete reduced-motion behavior.
- Verify ambient and monologue audio when autoplay is blocked or audio is unavailable.
- Tune pacing only after the full sequence is visually stable.
- Remove or soften effects that compete with reading.

## Validation checklist

### Static validation

- [x] `npx eslint src/chapters/Chapter1Memory`
- [ ] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`

### Interaction validation

- [x] Complete all five fragments with a mouse.
- [ ] Complete all five fragments with touch or coarse-pointer emulation.
- [ ] Complete all five fragments with keyboard input.
- [x] Release holds early and verify bleed/reset behavior.
- [x] Attempt the blocked fragment before it unlocks.
- [x] Interact with the uninvited record and verify intentional rejection.
- [x] Re-examine stabilized cross-references.
- [ ] Engage ORIGIN with pointer, touch, and keyboard.
- [ ] Verify MIRROR first, MIRROR last, and a neutral order.
- [x] Verify both final choices and their aftermaths.
- [ ] Verify replay without stale timers, audio, progress, or choice UI.
- [ ] Verify refresh and saved-choice persistence.
- [x] Verify Enter-to-SIGNAL and replay do not conflict.

### Viewport validation

- [x] 1920x1080
- [x] 1440x900
- [x] 390x844
- [x] 360x640
- [x] No horizontal or vertical page scrollbars.
- [x] No rotated or focused card clipping.
- [x] Compact final choices fit and remain readable.

### Environment validation

- [ ] Reduced motion
- [ ] Hover unavailable
- [ ] Coarse pointer
- [ ] Audio autoplay blocked
- [ ] Audio unavailable or failed
- [ ] Route away during an active hold or timed sequence

## Deferred ideas

The following remain outside this pass unless a verified implementation need appears:

- New narrative text or rewritten fragment prose
- New choice values or persistence fields
- Fixed recovery order
- Fail states, scoring, timers, or achievements
- Procedural card placement
- Canvas, WebGL, Three.js, or physics
- Cross-chapter consequences beyond the existing chapter-manager choice flow
- Major Chapter 2 transition work

## Completion standard

The refinement is complete when Chapter 1 preserves its current narrative and contracts, passes lint and build, plays reliably across mouse/touch/keyboard input, fits all target viewports without clipping or scrollbars, provides a meaningful reduced-motion experience, communicates a clear progression from intimate recovery to monitored evidence to an authored final stance, and no longer relies on one multi-thousand-line component as the owner of every interaction subsystem.

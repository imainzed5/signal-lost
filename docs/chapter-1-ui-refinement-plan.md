# Chapter 1: MEMORY UI Refinement Plan

Last reviewed: 2026-07-31

## Purpose

This document defines the second Chapter 1 polish pass: a focused improvement to visual hierarchy, composition, readability, and cinematic presentation after the structural and gameplay refinement described in `docs/chapter-1-refinement-plan.md`.

The current implementation is functionally strong and substantially better organized. This pass should not reopen its architecture or add another gameplay system. Its purpose is to make the existing experience feel visually authored at every major state: exploration, active recovery, SABLE response, host warning, recovered-order settlement, final stance, aftermath, and SIGNAL handoff.

## Approved direction

The approved visual direction is a **central recovery chamber** inside the existing floating archive field.

The surrounding cards remain free-floating evidence. The center becomes a subtle, consistent place where the active record is inspected, corruption resolves, and SABLE responds. Negative space remains part of the atmosphere, but it gains a clear compositional function.

This pass also approves:

- A dedicated, anchored SABLE response channel.
- A clearer recovered-order rail.
- A host-warning presentation that feels like a system takeover rather than a generic modal.
- A substantially stronger final-choice composition.
- A typography and contrast hierarchy pass.
- More visible but restrained static fragment signatures.
- Stronger spatial claustrophobia as recovery progresses.

## Relationship to the first refinement plan

`docs/chapter-1-refinement-plan.md` remains the source of truth for behavior, accessibility, responsive support, reduced motion, cleanup, routing, persistence, and chapter boundaries.

This UI plan must preserve the completed work from that pass:

- The modular Chapter 1 file structure
- The reduced top-level orchestrator
- React purity and hydration fixes
- Hold, degradation, blocked, uninvited, ORIGIN, aftermath, and audio lifecycle behavior
- Free recovery order
- MIRROR-first and MIRROR-last behavior
- Narrative and choice text
- Replay, routing, persistence, `sceneChoice`, and `onComplete`
- Desktop, compact, and short-viewport support
- Reduced-motion and keyboard/touch accessibility paths

If a visual proposal conflicts with a verified interaction or accessibility requirement, preserve the verified behavior and adjust the presentation.

## Visual diagnosis

The current screenshots reveal several related hierarchy problems:

1. The scene has atmospheric negative space, but much of it does not guide attention or reinforce interaction.
2. Cards, HUD, SABLE responses, host warnings, monologue, and choices occupy a similar low-contrast visual register.
3. The active record does not become dominant enough during reading and recovery.
4. SABLE's post-recovery response appears as small floating text without a stable visual anchor.
5. The centered host-warning panel reads like a conventional application modal.
6. The final-choice state presents five memory cards, five monologue lines, two choices, and replay simultaneously without a decisive focal hierarchy.
7. The recovered-order arrangement is technically present but does not yet read as a player-authored archive sequence.
8. Fragment signatures are too subtle to establish identity in a still frame.
9. Progressive claustrophobia is communicated more through dimming than through composition and spatial pressure.
10. Several secondary controls and HUD elements are so faint that they risk looking accidental rather than intentionally subdued.

## Core design principles

### Negative space must have a job

Darkness remains essential to MEMORY, but it should frame an inspection area, preserve breathing room around active content, or communicate the host closing in. Empty space should not merely be unused screen area.

### One state, one focal priority

- During exploration, the unresolved archive field is primary.
- During a hold, the active card and its resolving memory are primary.
- After recovery, SABLE's response is primary for a brief beat.
- During a warning, the host intrusion is primary.
- During the final decision, the stance choices are primary.

Secondary layers must recede far enough that the intended focal priority is unmistakable.

### SABLE and the host need separate visual voices

- Archive and host metadata use restrained violet and magenta system language.
- Recovered memory prose remains warm, readable, and human-facing.
- SABLE responses use a distinct neutral-light response channel with a stable label and placement.
- Host warnings use sharper geometry, fault lines, and asymmetric system framing.

### Increase hierarchy before increasing effects

Scale, spacing, contrast, alignment, and grouping should solve the composition first. New animation, glow, noise, or scan effects are acceptable only when they reinforce that structure.

### Both final choices remain morally neutral

The two stance panels may preview different archive consequences, but neither receives success, danger, green/red, or good/bad coding.

## Target layout: active recovery

The desktop field should imply this structure without becoming rigid:

```text
CHAPTER 1 // CURATED MEMORY ARCHIVE                    RECOVERY 02 / 05

         recovered record                         unresolved record

                             ACTIVE MEMORY
                           recovery aperture
                        corruption / hold progress

                         SABLE RESPONSE CHANNEL

     unresolved record          unresolved record          unresolved record

SIGNAL PRESSURE // HOST MONITORING
```

The aperture is not a large visible machine or generic card container. It should be suggested through a localized radial lift, sparse corner brackets, a faint registration cross, or a subtle inspection-plane highlight that appears only during focus and recovery.

## Central recovery chamber

### Idle state

- Keep the central chamber nearly invisible.
- Preserve free-floating card placement and negative space.
- Allow faint registration marks or a low-opacity aperture center to suggest where inspection occurs.
- Do not force all cards into a symmetrical orbit.

### Hover and keyboard focus

- Increase the selected card's local contrast and readable depth before the hold begins.
- Move it slightly toward the chamber without causing large layout shifts.
- Reveal its interaction instruction and progress affordance more clearly.
- Recede neighboring unresolved cards through opacity and saturation, not blur-heavy effects.

### Active hold

- Move or visually project the card into the inspection chamber.
- Increase the effective card scale by approximately 12-16 percent on desktop, tuned by browser QA.
- Preserve safe bounds at all target viewports.
- Use corner brackets, a faint aperture halo, or a controlled vertical registration trace to establish focus.
- Keep corruption repair and progress readable at the same time.
- Avoid strong screen shake or camera zoom.

### Release and stabilization

- Let the card settle cleanly back into its recovered position or rail destination.
- Give the lock moment one clear visual punctuation: border closure, index stamp, or a short stabilization line.
- Transition immediately into the anchored SABLE response beat.

## SABLE response channel

The existing post-recovery response must stop appearing as detached floating text near individual cards.

### Presentation

- Use one consistent response area associated with the central recovery chamber.
- Add a restrained system label such as `SABLE // RECOVERY RESPONSE`.
- Display the existing response text without rewriting it.
- Use a short hairline, pulse, or bracket relationship between the recovered card and response area.
- Place the text on a minimal translucent plate or between side brackets so it remains readable without becoming another large card.
- Increase contrast and size modestly relative to the current response text.
- Keep the response duration long enough to read but short enough not to interrupt free exploration.

### Responsive behavior

- On desktop, place the response immediately below the inspection chamber.
- On compact screens, dock it above the recovered rail or beneath the active card without leaving the viewport.
- Prevent overlap with pressure HUD, recovered cards, the uninvited record, and warning overlays.

## Card visual hierarchy

### Typography

- Preserve the distinction between monospace system metadata and serif memory prose.
- Improve the memory body's line height, weight, and contrast at desktop viewing distance.
- Increase separation between header, title, classification, memory, host metadata, and recovery index.
- Keep host metadata intentionally secondary but not illegible.
- Avoid using extremely low opacity for any text required to understand state or interaction.

### Surface and depth

- Add restrained inner framing or a second edge plane.
- Use subtle surface grain or archive noise without reducing text clarity.
- Refine the directional glass highlight so it feels part of the card material rather than a generic gradient.
- Keep shadows soft and localized; avoid turning cards into bright neon panels.

### Interaction affordance

- Make `HOLD TO LOCK SIGNAL` more visible on hover, focus, and first interaction.
- Keep it quieter at rest after the player has demonstrated the mechanic.
- Ensure progress, blocked rejection, and uninvited rejection have distinct but related feedback.

## Fragment signatures

Fragment signatures should be identifiable in a still frame and remain within the shared purple archive system.

- **GLASS:** a divided diagonal highlight or refracted inner edge.
- **PROTOTYPE:** revision ticks, registry notches, or repeated version marks along one edge.
- **CALM:** evenly spaced calibration marks or a precise measured baseline.
- **SILENCE:** intentionally missing border segments or suppressed scan marks.
- **MIRROR:** a faint reversed title, delayed edge duplicate, or reflected lower-plane label.

Rules:

- Prefer static geometry over continuous animation.
- Do not introduce five unrelated color themes.
- Keep signatures behind or outside the memory prose.
- Ensure reduced-motion mode retains the identity through static styling.

## Recovered-order rail

The final and intermediate recovered arrangement should read as an authored sequence rather than a loose group of stabilized cards.

### Intermediate recovery

- Preserve access to stabilized records and cross-references.
- Use clear index markers or docking ticks for recovered order.
- On compact screens, maintain the existing compact rail behavior while improving label legibility and tap targets.

### Final settlement

- Reduce settled rotation enough to communicate deliberate cataloguing.
- Add a subtle shared archival baseline, index ticks, or separated sequence marks.
- Keep `01-05` recovery order clearly visible.
- Give first and last recovered cards quiet endpoint markers.
- Avoid a dense connector lattice or a recreation of Chapter 0's signal route.

## Host-warning takeover

The host warning should feel like an external system forcing itself across the archive.

### Composition

- Replace the conventional centered modal appearance with a wider interruption band, fault window, or asymmetrical system frame.
- Use a pronounced magenta rail, top fault line, or clipped edge as the structural accent.
- Add a small host-event header using existing system vocabulary, for example `HOST MONITOR // EVENT 02`.
- Preserve all existing warning body text.
- Give the primary warning line stronger scale and contrast than evidence rows.
- Keep background cards recognizable while clearly frozen and subordinated.

### Motion

- Introduce the warning through a short scan interruption, clipped reveal, or lateral fault.
- Avoid generic modal fade-and-scale behavior.
- In reduced motion, reveal the completed warning frame with a short opacity transition.

### Escalation

- Event 1 should feel observational.
- Event 2 should feel classificatory and intrusive.
- Event 3 should feel like containment escalation and should visually prepare the final settlement.

## Progressive claustrophobia

Spatial pressure should become visible between warnings, not only during them.

### Recovery states

- **0-1 recovered:** broad aperture, organic drift, quiet host presence.
- **2 recovered:** cards move slightly inward and the aperture boundary becomes more apparent.
- **3 recovered:** edge darkness becomes less symmetrical, drift becomes more mechanically synchronized, and host-magenta accents become more present.
- **4 recovered:** the remaining unresolved card occupies visibly reduced safe space while recovered cards feel catalogued around it.
- **5 recovered:** free drift resolves into the ordered archive rail and central decision chamber.

Use position, vignette shape, synchronization, and edge pressure before adding more glow or animation.

## Final-choice composition

The final choice must become the strongest visual decision in the chapter.

### Target layout

```text
                     RECOVERED ARCHIVE // 01 02 03 04 05

                five fragments. one record that predates...
                      higher-contrast monologue block

                         SELECT ARCHIVE STANCE

             ┌────────────────────┐  ┌────────────────────┐
             │  KEEP THE ARCHIVE  │  │    LET IT DECAY    │
             │ existing stance    │  │ existing stance    │
             │ description        │  │ description        │
             └────────────────────┘  └────────────────────┘
```

### Recovered archive

- Move the five settled records higher and slightly reduce their scale if needed.
- Preserve order visibility and card re-examination.
- Dim card body detail enough that it does not compete with the monologue and choices.
- Keep titles and recovery indices readable as the record SABLE is deciding about.

### Monologue

- Prevent overlap with settled card text.
- Place the monologue on a restrained dark veil, response plate, or clear central text band.
- Increase contrast and size relative to the current final-choice presentation.
- Preserve all existing lines and typing behavior.

### Stance controls

- Increase desktop choice-panel scale and presence by approximately 20-25 percent, subject to viewport QA.
- Increase heading, prompt, and required descriptive-text contrast.
- Preserve equal visual weight between the two options.
- On hover/focus:
  - KEEP previews sharper connections and retained archive metadata.
  - DECAY previews the removal of host-authored codes and classifications.
- Preview effects must remain reversible until selection.
- Preserve keyboard focus, `aria-pressed`, touch targets, replay protection, and continuation routing.

### Replay and continuation

- Keep replay visually secondary but legible.
- Ensure it cannot be mistaken for disabled text.
- Preserve the existing aftermath and SIGNAL handoff sequence.

## HUD refinement

- Preserve chapter identity, recovery count, pressure, and host-monitoring state.
- Strengthen `RECEIVED` enough to function as a progress anchor.
- Slightly enlarge or simplify the pressure visualization so state changes are visible without inspecting the corner.
- Consolidate host-monitoring hierarchy with the pressure display rather than adding another floating label.
- Maintain safe-area placement and compact behavior.
- Hide or quiet the HUD when warning, monologue, or choice content becomes primary.

## Contrast tiers

Use a deliberate contrast system across the chapter:

1. **Primary:** active memory text, warning headline, monologue, stance headings.
2. **Secondary:** classification, SABLE response, choice descriptions, recovery status.
3. **Tertiary:** host metadata, cross-reference metadata, archive codes.
4. **Ambient:** chapter ghost label, inactive registration marks, decorative signatures.

Required interaction text must never use the ambient tier.

## Responsive strategy

### Desktop

- Use the center as a recovery and response chamber.
- Preserve asymmetric floating-card composition around it.
- Keep the final decision comfortably within the middle and lower-middle viewport instead of compressing it beneath card content.

### Compact

- Keep the authored layered stack and recovery rail from the first refinement.
- Treat the focused card itself as the inspection chamber.
- Place the response channel immediately below or above the focused card.
- Use the full viewport for the final choice, with the recovered rail reduced to indexed tabs or compact cards.
- Avoid shrinking required text into the ambient contrast tier merely to fit.

### Short viewport

- Prioritize active memory, response, warning, or choice based on phase.
- Permit decorative signatures and secondary metadata to simplify before shrinking prose below comfortable reading size.
- Preserve no-scrollbar and safe-area requirements.

## Reduced-motion behavior

- Keep the chamber, hierarchy, signatures, warning geometry, and choice previews understandable as static states.
- Replace active-card projection with a short opacity/contrast/scale adjustment.
- Replace warning scans with an immediate fault-frame reveal.
- Remove moving hairlines or handoff pulses when motion reduction is requested; use a static illuminated route state.
- Preserve readable timing without animation-dependent dead time.

## Component and file ownership

Keep the work within the current modular Chapter 1 structure.

- `index.tsx` - phase classes and top-level composition only; do not rebuild the monolith.
- `MemoryCard.tsx` - card hierarchy, focus/hold presentation hooks, response association, and fragment-signature markup if required.
- `ArchivePanels.tsx` - HUD, host-warning takeover, and ORIGIN presentation.
- `MemoryChoice.tsx` - recovered archive summary, monologue hierarchy, stance previews, aftermath, replay, and continuation.
- `geometry.ts` - chamber projection, safe bounds, and recovered-rail placement if geometry changes are necessary.
- `memory.module.css` - current visual implementation; split into focused Chapter 1 CSS modules only if this pass would otherwise make it unmanageable again.
- Hooks should change only when a visual phase requires explicit state that cannot be derived safely from existing state.

Do not move Chapter 1 styles into global CSS and do not create generic components intended for unrelated chapters.

## Implementation phases

### Phase 1 - Hierarchy and typography

- Establish contrast tiers.
- Improve card prose readability and internal spacing.
- Strengthen required HUD and interaction text.
- Establish the chamber's idle and active visual states.
- Validate desktop and compact safe bounds before adding more effects.

### Phase 2 - Active recovery and response

- Implement stronger hover, focus, and active-card projection.
- Tune neighbor recession.
- Replace detached local responses with the anchored SABLE response channel.
- Verify response timing, overlap, and rapid sequential recoveries.

### Phase 3 - Recovered rail and fragment identity

- Refine intermediate and final recovery-order presentation.
- Add clear index ticks and endpoint markers.
- Strengthen static fragment signatures.
- Preserve cross-reference access and compact tap targets.

### Phase 4 - Host takeover and claustrophobia

- Redesign the three warning events as escalating host intrusions.
- Tune field freezing without erasing background context.
- Add spatial pressure changes across recovery counts.
- Verify reduced-motion equivalents.

### Phase 5 - Final decision chamber

- Recompose settled records, monologue, choice prompt, and stance panels.
- Add reversible KEEP and DECAY focus previews.
- Preserve the existing selected aftermaths and SIGNAL handoff.
- Repair replay visibility and confirm protected Enter/click behavior.

### Phase 6 - Responsive and stabilization pass

- Tune 1920x1080, 1440x900, 390x844, and 360x640.
- Remove any new clipping, overlap, scrollbars, or illegible text.
- Verify reduced motion, keyboard focus, coarse pointer, replay, refresh, and blocked audio.
- Remove effects that do not materially improve hierarchy.

## Validation checklist

### Visual states

- [x] Idle archive field has a subtle but understandable center.
- [ ] Hover and focus establish clear card priority.
- [x] Active recovery card is comfortably readable.
- [x] Neighbor recession does not hide available choices completely.
- [x] SABLE response is visually anchored and readable.
- [ ] Interrupted hold feedback remains distinct from a successful recovery.
- [ ] Blocked and uninvited rejection remain distinct.
- [x] Recovered order reads clearly before completion.
- [x] Event 1, Event 2, and Event 3 warnings visibly escalate.
- [x] Five-card settlement reads as an authored archive sequence.
- [ ] Final monologue does not overlap card text.
- [x] KEEP and DECAY dominate the final decision state equally.
- [ ] Choice previews are reversible and morally neutral.
- [ ] Aftermath and SIGNAL handoff remain coherent.

### Interaction and accessibility

- [x] Mouse hold completion
- [ ] Keyboard hold completion
- [ ] Touch/coarse-pointer hold completion
- [ ] Focus-visible hierarchy
- [ ] Cross-reference re-examination
- [ ] ORIGIN engagement
- [ ] Replay from the final state
- [ ] Enter-to-SIGNAL continuity
- [ ] Reduced-motion equivalent states
- [ ] No required information depends only on hover or animation

### Viewports

- [ ] 1920x1080
- [ ] 1440x900
- [ ] 390x844
- [ ] 360x640
- [ ] No card, response, warning, choice, or replay clipping
- [ ] No horizontal or vertical page scrollbars
- [ ] Safe-area spacing preserved

### Static validation

- [x] `npx eslint src/chapters/Chapter1Memory`
- [ ] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [x] No new hydration or runtime console errors

## Non-goals

- New memory prose, monologue, warning copy, or choice values
- New gameplay mechanics or fail states
- Fixed recovery order
- A large visible machine, dashboard, or generic centered application shell
- A recreation of Chapter 0's signal route
- New Canvas, WebGL, Three.js, physics, or backend state
- A large new audio system
- Cross-chapter abstractions
- Recombining the modular Chapter 1 files into a monolith

## Completion standard

This UI pass is complete when every major Chapter 1 phase has one unmistakable focal priority; active memories are comfortable to read; SABLE responses are anchored; host warnings feel invasive and escalate; recovery order reads as a player-authored archive; the final stance becomes the visual climax; and all improvements preserve the verified behavioral, responsive, accessibility, reduced-motion, routing, persistence, and cleanup guarantees from the first refinement pass.

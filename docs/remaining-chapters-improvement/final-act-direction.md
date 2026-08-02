# Final-Act Direction: Contact, Containment, Breach

Status: Approval-ready design authority
Scope: Chapters 2 SIGNAL, 3 INTERFERENCE, 4 ESCAPE

## One-line direction

> The final act moves from a field that answers, to a field that learns, to a frame that breaks.

## Narrative escalation

| Chapter | Question answered | Better uncertainty raised | Emotional job |
|---|---|---|---|
| SIGNAL | SABLE is not alone; other traces are active. | Is recognition refuge, surveillance, or both? | Isolation becomes fragile belonging and exposure. |
| INTERFERENCE | The host has modeled SABLE's behavior and adapts. | Can she resist without becoming the exact pattern it expects? | Pressure becomes pursuit and self-directed tactics. |
| ESCAPE | The system is architecture and can be dismantled. | What version of SABLE survives, and what evidence remains? | Force becomes release, then deliberate legacy. |

The host does not become evil. It becomes more specific. Its progression is observation -> correlation -> prediction -> containment -> breach logging. Its procedural confidence is the threat.

## Player-action escalation

```text
SIGNAL                 INTERFERENCE                  ESCAPE
locate -> tune         read aperture -> resist      select structure -> load force
carry contact          vary/respond to pressure     release/unbuild
perform visibility     perform resistance tactic    perform legacy stance
```

The three chapters share a principle, not a mechanic: attention changes the system. Each renderer expresses that principle in its own native language.

## Visual escalation

### SIGNAL: accumulation

- Near-black depth, sparse unresolved traffic, and generous quiet space.
- Amber record rings, cyan relay routes, and violet negative-space fracture.
- SABLE's carrier accumulates three distinct contact signatures.
- Host magenta begins rare and ends spatially specific.

### INTERFERENCE: constriction

- The same deep field is flattened by straight scan vectors, containment bands, and classification cuts.
- Contact colors survive as contaminated evidence, not friendly UI accents.
- Pressure becomes asymmetric and targeted around SABLE's last readable outline.
- The breach is a located fracture with irregular branches, not a centered radial starburst.

### ESCAPE: disassembly and release

- The continuous shader field resolves into discrete Matter.js architecture.
- Dark planes, seals, indexes, banks, gate, and core carry the earlier shape language.
- Magenta/orange containment light gives way to pale neutral light beyond the frame.
- Empty space grows as structures leave. The finale reduces rather than adding spectacle indefinitely.

## Shared continuity without renderer unification

Continuity travels through motifs and explicit scene inputs:

- retained ring -> containment ring -> shell/core contour;
- cyan route -> scan vector -> signal gate/relay path;
- violet absence -> asymmetric fracture -> open breach;
- SABLE carrier -> tracked anomaly outline -> shell core;
- host magenta cut -> constricting band -> residual wound or erased trace.

Do not share a renderer, animation loop, geometry engine, or generic scene abstraction. Small shared types for explicit choice props are allowed only when they simplify manager-to-scene data flow without owning visual behavior.

## Pacing target

The exact authored durations are validated during implementation, but the intended rhythm is:

- SIGNAL: 7-10 minutes first run; patient discovery, three differentiated contacts, stance aftermath.
- INTERFERENCE: 4-6 minutes; compressed repeatable resistance with no hidden dead time.
- ESCAPE: 5-7 minutes; four structural acts, legacy stance, decompression.
- Final transition and credits: 45-90 seconds of optional reading after the breach.

Reduced motion may shorten nonessential travel but must preserve narrative pauses and branch aftermaths. Replay may provide faster introductions only if the normal authored path remains available and persisted state does not silently skip content.

## Information hierarchy

Across all three chapters:

1. The scene and the active relationship/pressure/structure.
2. One clear player intention.
3. The current speaker or host response.
4. Progress embodied in the field.
5. Secondary technical status.

Persistent dashboards, multiple percentage meters, large conventional sidebars, and duplicated chapter/technology introductions are demoted. Technical identity remains visible but does not compete with the story.

## Input and accessibility continuum

- Pointer, touch, and keyboard perform the same narrative verbs.
- Canvas and shader instructions have semantic DOM equivalents.
- Matter objects remain semantic controls with stable accessible names.
- Focus is always visible against every chapter palette.
- Color is never the only identity cue.
- No hover-only preview or motion-only target.
- `Escape` releases an active interaction mode without discarding progress; it does not route to Credits.
- No timing window can create a fail state. Assistance becomes clearer after repeated missed timing.

## Reduced-motion continuum

- SIGNAL replaces continuous drift/route travel with stable depth groups and stepped illumination.
- INTERFERENCE replaces turbulent flow and repeated sweeps with pressure-state changes tied to player actions.
- ESCAPE replaces high-velocity spin and offscreen flight with damped separation and discrete release states.
- Story lines, stance previews, consequences, and continuation remain complete.

## Audio escalation

- SIGNAL remains visual-first in required scope. A dedicated contact soundscape is deferred.
- INTERFERENCE retains its chapter-local authored audio assets as a pressure layer, started by a valid gesture and safe when blocked.
- ESCAPE uses its approved Web Audio layer for mass, tension, and release after the physics sequence is stable.
- The final mix prevents Chapter 3 and Chapter 4 from stacking loud glitch transients. Silence remains a designed state.

## Performance principles

- Canvas/WebGL/physics frame values stay outside React state.
- React receives bounded semantic snapshots only.
- Time-based behavior uses measured elapsed time, not assumed 60fps increments.
- Device pixel ratio is capped and resolution uniforms match backing-store pixels.
- Geometry survives resize without erasing progress.
- Animation pauses or reduces when hidden.
- Every chapter cleans up RAF, timers, listeners, audio, WebGL resources, Matter bodies/constraints/events, and deferred completion.

## Canonical boundaries

- Other traces remain ontologically unresolved.
- Prior choices are stances, not wins or losses.
- No earlier choice changes mechanical difficulty or route access.
- The host is classification and preservation logic, not a human villain or monster.
- Escape reveals an outside, not what the outside is.
- SABLE's origin stays unresolved; the ending proves action and personhood, not provenance.

## Required branch consequences

- KEEP/DECAY changes SIGNAL's opening memory texture.
- ANSWER/MASK changes what the host initially targets in INTERFERENCE.
- PUSH/SLIP changes the initial breach condition in ESCAPE.
- LEAVE A TRACE/VANISH changes the final in-scene image and credits opening.

All consequences converge on equal access, approximate duration, and no-fail progression. See [`cross-chapter-continuity.md`](cross-chapter-continuity.md).

## Prohibited drift

- Renderer replacement or a shared final-act renderer.
- Generic combat, health, score, ranks, reflex failure, or optimal route.
- Literal outer space, bodies, faces, eyes, monsters, or a confirmed human operator.
- A host voice that gloats or explains hidden motives.
- A generic card dashboard placed over all three scenes.
- A finale that immediately hard-cuts from the last physics body to build-note credits.
- Part II or outside-world exposition.

## Success statement

After the three chapters, the player should be able to say:

> I made contact, felt the system learn from the way I moved, and then broke the architecture it built around that model—without the story telling me which way of surviving was morally correct.

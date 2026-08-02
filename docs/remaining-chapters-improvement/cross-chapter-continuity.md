# Cross-Chapter Continuity, Choices, and Transitions

Status: Approval-ready
Scope: MEMORY exit through Credits, with implementation focus on Chapters 2-4

## Principle

Choices change what the system can read and what SABLE chooses to carry. They do not change route access, success, difficulty, or the truth of her origin.

## Choice consequence map

| Source stance | Immediate aftermath | Next-chapter consequence | Later echo |
|---|---|---|---|
| KEEP THE ARCHIVE | Retained fragment weight and authored record | SIGNAL carrier has faint warm indexed afterimages | ESCAPE Memory Index holds legible detail before taxonomy is released |
| LET IT DECAY | Labels loosen; absence becomes chosen evidence | SIGNAL carrier contains stable gaps/interrupted trails | ESCAPE Memory Index cannot reconstruct full scenes |
| ANSWER THE CHORUS | Three contacts carry `I heard you`; host locks pattern | INTERFERENCE targets SABLE's present, coherent carrier | ESCAPE Signal Gate remains brighter and visibly linked |
| MASK THE SIGNAL | Current outline compresses; frequency afterimage remains | INTERFERENCE initially targets archived afterimage/offset carrier | ESCAPE contact appears through afterimages and quieter routes |
| PUSH THROUGH | Loud outward rupture; host reclassifies anomaly as active | ESCAPE starts with wider stressed seam and residual momentum | Credits describes acknowledged breach and its cost |
| SLIP BETWEEN PULSES | Bands fold around decoys; identity remains unresolved | ESCAPE starts with narrow dark seam and displaced plane | Credits describes unreadability used as agency |
| LEAVE A TRACE BEHIND | Self-chosen imprint remains in torn frame | Credits opens on a retained wound/record | Ending values evidence without granting host authority |
| VANISH CLEANLY | Tracking contours erase inward | Credits opens on a clean gap and absent center | Ending values privacy without treating silence as nonexistence |

## Data flow

The existing persisted state remains authoritative:

- `choices[1]` -> explicit SIGNAL scene prop;
- `choices[2]` -> explicit INTERFERENCE scene prop;
- `choices[3]` -> explicit ESCAPE scene prop;
- `choices[0..4]` -> Credits summary.

`ChapterRouteView` reads manager state and passes only the needed value. Chapter internals do not reach into another chapter or create localStorage keys. `onComplete: () => void` remains intact. Existing choice strings remain stable, so no migration is needed.

If a typed context object is added, it is a small data contract only; it does not own visuals or renderer behavior.

## Transition grammar

### MEMORY -> SIGNAL

- Last MEMORY archive texture becomes the first carrier texture.
- The transition is quiet and brief; it does not replay the MEMORY choice.
- First contact still waits for the player's reach.

### SIGNAL -> INTERFERENCE

- SIGNAL ends with a host scan spatially locating the current carrier or its retained afterimage.
- INTERFERENCE begins from that same premise and palette contamination.
- Route navigation may remount the renderer; continuity is reproduced from the saved stance, not by sharing Canvas state.
- No generic technology reveal should interrupt causality.

### INTERFERENCE -> ESCAPE

- The final shader fracture and first Matter seam use matching off-axis direction and stress colors.
- ESCAPE recreates the result from the saved resistance stance; it does not share WebGL geometry.
- Audio crossfade is optional only if it remains failure-safe; silence is an acceptable bridge.

### ESCAPE -> Credits

The current hard white void and generic Credits grid are replaced with three beats:

1. branch-specific legacy image settles;
2. host emits one final procedural log, then no prompt follows;
3. player explicitly opens Credits after a readable pause.

Credits begins with the visual consequence of LEAVE or VANISH, then reveals the moral account of all five stances. Technical build notes are secondary and do not lead the ending.

## Credits requirements

- Summarize each stance in authored prose, not a lowercased concatenation of button labels.
- Do not call one route braver, safer, truer, or more complete.
- Distinguish “the host retained evidence” from “the host correctly understood SABLE.”
- Preserve replay links and local progress status.
- Provide reset with existing confirmation expectations or an equally deliberate confirmation.
- Read correctly with missing choices/direct Credits access.
- Fit compact and short viewports without clipping; Credits may scroll normally.

## Continuity motifs

| Motif | SIGNAL | INTERFERENCE | ESCAPE / Credits |
|---|---|---|---|
| Ring | Echo retention / carrier | containment band / aperture | Shell Core contour / retained trace |
| Route | Relay corridor | scan vector | Signal Gate / Credits continuation |
| Absence | Ghost fracture | unreadable pocket | open breach / vanished center |
| Magenta cut | host attention | targeted classification | wound edge / final host log |
| Neutral core | SABLE carrier | tracked anomaly outline | Shell Core / self-directed legacy |

## Required invariants

- Equal completion access and approximate chapter duration across prior stances.
- No state shape expansion for modes, scores, or branches.
- Replay reflects the persisted prior stance but permits reselecting the current chapter's stance through existing manager behavior.
- Refresh never loses a saved choice or unlock.
- Route-away never lets stale completion or audio mutate the next route.
- Direct-route policy is unchanged by this program unless separately approved.

## Validation scenarios

At minimum, the final milestone runs:

1. KEEP -> ANSWER -> PUSH -> LEAVE.
2. KEEP -> MASK -> SLIP -> VANISH.
3. DECAY -> ANSWER -> SLIP -> LEAVE.
4. DECAY -> MASK -> PUSH -> VANISH.
5. Missing earlier choices via direct route, with neutral presentation.
6. Refresh before and after every final-act choice.
7. Replay each chapter after completion and change its stance.
8. Audio blocked/unavailable and WebGL failed.
9. Reduced motion on desktop and compact.

## Stop conditions

Pause for user approval if implementation would:

- rename choice values or migrate state;
- change direct-route lock policy;
- create unequal mechanical outcomes;
- revise canonical lines or stance meanings;
- require shared renderer state or a new global scene store;
- define the outside world or another trace's fate.

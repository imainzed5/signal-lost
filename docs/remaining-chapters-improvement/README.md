# Chapters 2-4 Final-Act Improvement Program

Status: **Approval-ready Sol planning package**
Planning owner: Sol
Implementation owner: Unassigned; intended for sequential Luna XHIGH goals after approval
Implementation authorization: **Not granted by this package**

## Objective

Finish the prequel's final act as one escalating experience without merging its renderers:

> SIGNAL turns contact into exposure, INTERFERENCE turns exposure into adaptive containment, and ESCAPE turns containment into architecture that SABLE deliberately unbuilds.

The program preserves Canvas 2D for Chapter 2, raw WebGL/GLSL for Chapter 3, and Matter.js with the approved Web Audio layer for Chapter 4. It does not introduce Three.js, Part II, New Game+, a backend, authentication, a database, server persistence, fail states, or alternate plot timelines.

## Approval status

- Repository and canon audit: complete.
- Desktop, compact, and short-viewport DOM/layout audit: complete where the available browser surface could render it.
- Renderer playthrough: still required during implementation. The in-app audit surface did not advance React effect, Canvas, WebGL, or physics loops reliably, so this package does not claim those playtests passed.
- Milestone decomposition: complete.
- Experience and technical specifications: complete.
- User approval: pending.
- Git checkpoint: pending user action or explicit authorization.
- Implementation: not started.

## Required reading order

1. [`AGENTS.md`](../../AGENTS.md)
2. [`docs/agent-collaboration-workflow.md`](../agent-collaboration-workflow.md)
3. [`docs/project-status.md`](../project-status.md)
4. [`story-source.md`](../../story-source.md), Chapters 2-4
5. [`final-act-direction.md`](final-act-direction.md)
6. [`chapter-2-signal-vision.md`](chapter-2-signal-vision.md)
7. [`chapter-3-interference-vision.md`](chapter-3-interference-vision.md)
8. [`chapter-4-escape-vision.md`](chapter-4-escape-vision.md)
9. [`cross-chapter-continuity.md`](cross-chapter-continuity.md)
10. [`milestone-roadmap.md`](milestone-roadmap.md)
11. The approved milestone directory, in its local `README.md` order

## Program documents

| Document | Authority |
|---|---|
| [`final-act-direction.md`](final-act-direction.md) | Overall emotional, visual, interaction, and renderer direction |
| [`chapter-2-signal-vision.md`](chapter-2-signal-vision.md) | SIGNAL experience and Canvas 2D design authority |
| [`chapter-3-interference-vision.md`](chapter-3-interference-vision.md) | INTERFERENCE experience and raw WebGL/GLSL design authority |
| [`chapter-4-escape-vision.md`](chapter-4-escape-vision.md) | ESCAPE experience, Matter.js, and Web Audio design authority |
| [`cross-chapter-continuity.md`](cross-chapter-continuity.md) | Choice consequences, transitions, persistence, and credits continuity |
| [`milestone-roadmap.md`](milestone-roadmap.md) | Dependency order, file ownership, approval gates, and Luna goal sequence |

## Baseline evidence summary

### Working tree and documentation reconciliation

- Initial Git state was `master...origin/master` with only `docs/remaining-chapters-improvement/` untracked.
- The existing untracked [`chapter-2-signal-vision.md`](chapter-2-signal-vision.md) was treated as protected user-authored planning input and refined in place.
- Contrary to `AGENTS.md` and `docs/project-status.md`, Chapter 3 has no current uncommitted shader/component/CSS edits. The previously described overhaul is present in commit `8934da8` (`Checkpoint prequel polish and canonical story source`). The status documents are stale on that point; this program records the discrepancy but does not edit files outside its authorized directory.
- No implementation files were modified by this planning task.

### Commands

- `npm run lint`: baseline failure at `src/chapters/Chapter2Signal/index.tsx:232`, `react-hooks/set-state-in-effect`.
- `npm run build`: passes with Next.js 16.2.4 and all expected routes.
- `git diff --check`: passes after the package write.

### Planning-package verification

- 37 Markdown documents are present: seven program documents and six required files in each of five milestone directories.
- Every local Markdown link resolves; every milestone package contains its README, audit, specification, implementation plan, validation matrix, and implementation handoff.
- No unfinished planning tags, malformed code-fence pairs, suspicious encoding markers, or trailing whitespace remain.
- Final `git status --short` reports only the untracked `docs/remaining-chapters-improvement/` directory. Tracked implementation diff remains empty.

### Browser and source findings

- SIGNAL at 390x844 produced a 1234px document. The directive occupied the same final region as the transit queue and visibly overlaid its rows.
- SIGNAL at 1280x640 kept the 280px absolute sidebar at 640px high while its content measured 890px; the lower content was clipped and had no reachable sidebar scroll.
- INTERFERENCE's WebGL-unavailable state displayed an almost blank field: the intro never advanced, the action remained disabled, and the progression route was stranded. This confirms failure continuity is a blocker, not optional polish.
- INTERFERENCE compact layout is one fixed viewport with absolute header and bottom regions. Source and layout measurements show overlap/clipping risk at short heights.
- ESCAPE uses fixed 230-320px fragment sizes, re-registers and resets every fragment on resize, has no reduced-motion branch, and leaves the entire HUD above the physics field with normal pointer hit testing.
- Direct navigation to locked Chapter 2, 3, and 4 routes currently renders those routes. Locked direct-URL policy remains a product question, but this program does not change it.
- The available in-app browser did not run effect/animation loops reliably. Canvas interaction, live shader stages, Matter.js flight, audio, replay, and persistence remain explicit implementation validation rows rather than claimed passes.

Pre-existing baseline failures are not regressions. Every milestone validation matrix has a separate baseline section so Luna cannot check off a known defect as newly introduced work.

## Approved design decisions proposed by Sol

These are the program defaults presented for approval, not questions delegated back to implementation:

1. SIGNAL uses the authored order Archive Echo -> Transit Relay -> Ghost Channel.
2. SIGNAL uses selected canonical lines in the scene, not the complete prose chapter.
3. Final stances use physical preview plus explicit confirmation; hover is never required.
4. Prior choices affect presentation and wording, never difficulty, duration, or access.
5. Chapter 2 remains visual-first. A new SIGNAL audio system is deferred; Chapter 3 and Chapter 4 carry the approved audio escalation.
6. INTERFERENCE accepts every player attempt as information. Correct timing earns stronger progress; mistimed input produces readable partial progress or guidance, never a hidden reset.
7. The host speaks procedurally. Current first-person taunts are replaced with containment diagnostics so the host remains a system, not a theatrical villain.
8. ESCAPE is an authored dismantling sequence, not seven interchangeable blocks drifting out of bounds.
9. Chapter 3 and Chapter 4 choices move into their scenes and receive branch-specific aftermaths before continuation.
10. Credits become narrative decompression and a moral account of the run; build notes remain secondary.

## Milestone order

| Order | Milestone | Gate |
|---|---|---|
| 1 | [`01-final-act-foundations`](milestones/01-final-act-foundations/README.md) | Reliability, failure continuity, explicit props, cleanup, and baseline QA before visual expansion |
| 2 | [`02-signal-contact-field`](milestones/02-signal-contact-field/README.md) | SIGNAL complete and approved in desktop/compact/reduced-motion/input playtest |
| 3 | [`03-interference-adaptive-containment`](milestones/03-interference-adaptive-containment/README.md) | INTERFERENCE complete in WebGL and fallback paths |
| 4 | [`04-escape-structural-breach`](milestones/04-escape-structural-breach/README.md) | ESCAPE complete through both legacy aftermaths and Credits handoff |
| 5 | [`05-final-act-continuity-gold-master`](milestones/05-final-act-continuity-gold-master/README.md) | Full-run continuity, mix, persistence, replay, failure, and regression verdict |

Milestones are sequential. Do not begin a later milestone until the prior one is accepted or the user explicitly changes the dependency order.

## Protected contracts

- Chapter renderer mapping and chapter-local visual ownership.
- `onComplete: () => void` for every real chapter.
- Manager-owned `unlockedChapters`, `completedChapters`, `choices`, and `lastVisitedChapter` state.
- Existing choice strings unless a migration and credits update are explicitly approved.
- No-fail-state progression.
- SABLE's unresolved origin and the stance meanings defined in canon.
- The host's containment/classification logic; it is not recast as a human villain.

## Approval gates

1. Approve or revise this top-level program.
2. Approve Milestone 1 and create or authorize a Git checkpoint.
3. Run one Luna XHIGH `/goal` for Milestone 1 only.
4. Sol independently reviews the result; the user approves any bounded correction list.
5. Repeat for Milestones 2-5.

No staging, commit, reset, discard, push, or implementation work is authorized by approval of this planning package alone.

## Deferred ideas

| Idea | Why it is deferred | Revisit point |
|---|---|---|
| Dedicated SIGNAL procedural soundscape | Visual comprehension, contact distinction, and accessibility must stabilize first; Chapter 3/4 already carry the approved audio escalation | Separate post-gold-master audio proposal |
| Haptics | Browser support, permissions, and device behavior are too inconsistent for a required interaction channel | Optional platform-specific polish after Milestone 5 |
| Framebuffer feedback or multipass Chapter 3 shader | Adds performance and fallback risk before the single-pass interaction is proven | Separate WebGL polish proposal after Milestone 3 acceptance |
| Three.js or renderer unification | Conflicts with the canonical renderer progression and parked Part II direction | Part II planning only |
| Free-drag ESCAPE sandbox, destructible text meshes, or extra physics toys | Dilutes the authored four-act meaning and expands physics/accessibility risk | Optional experiment after Milestone 4 acceptance |
| Outcomes for other lattice traces | Requires new canon beyond SABLE's prequel endpoint | Story/lore planning before Part II |
| Direct-route lock enforcement | It is a shell/product policy rather than a final-act renderer requirement | Separate product decision after gold master |
| Outside-world depiction, Part II, and New Game+ | Explicitly parked until the five-chapter prequel is stable | Existing parked direction/roadmap documents |

## Planning verdict

The final act has a coherent approved-candidate direction, observable milestone acceptance criteria, explicit failure and accessibility coverage, and bounded Luna entry points. Sol should stop after package verification and user handoff. Implementation must not begin in this task.

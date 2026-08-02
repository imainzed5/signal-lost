# Chapters 2-4 Milestone Roadmap

Status: Approval-ready
Execution model: Sequential Luna XHIGH goals with Sol review and user approval between milestones

## Why five milestones

The program separates correctness from visual expansion, then gives each renderer one coherent ownership window, followed by a full-run continuity gate. Fewer milestones would combine high-risk lifecycle changes with major redesign. More would split chapter experiences into effects that could not be approved meaningfully on their own.

## Dependency graph

```text
01 Final-act foundations
    -> 02 SIGNAL contact field
        -> 03 INTERFERENCE adaptive containment
            -> 04 ESCAPE structural breach
                -> 05 Final-act continuity and gold master
```

## Milestone summary

### 01 - Final-act foundations

Objective: make the current Chapters 2-4 reliably runnable, replayable, responsive at baseline, and failure-continuous before visual redesign.

Primary ownership:

- `src/components/ChapterRouteView.tsx`
- `src/chapters/Chapter2Signal/`
- `src/chapters/Chapter3Interference/`
- `public/shaders/interference.frag`
- `src/chapters/Chapter4Escape/`

Gate: lint/build pass; WebGL failure completes; Chapter 2 short/compact controls reachable; Chapter 4 resize preserves progress; all deferred work cleans up.

### 02 - SIGNAL contact field

Objective: deliver the authored Echo -> Relay -> Ghost locate/tune/carry sequence, in-field visibility stance, and Chapter 3 handoff.

Primary ownership: Chapter 2 folder plus explicit route prop wiring only.

Gate: all input modes, compact/short layouts, both SIGNAL aftermaths, replay, persistence, and reduced motion pass.

### 03 - INTERFERENCE adaptive containment

Objective: turn the host's learned model into legible adaptive pressure, an asymmetric rupture, and in-field PUSH/SLIP aftermaths in both shader and fallback modes.

Primary ownership: Chapter 3 folder, shader, and explicit route choice bridge only.

Gate: WebGL normal/failure, all stages, timing assistance, both stances, audio blocked, reduced motion, resize, replay, and cleanup pass.

### 04 - ESCAPE structural breach

Objective: replace generic drifting fragments with an authored four-act Matter.js dismantling sequence and complete LEAVE/VANISH legacy payoff.

Primary ownership: Chapter 4 folder plus the route/credits entry needed for the handoff.

Gate: physics order, resize continuity, all inputs, reduced motion, audio failure, both legacies, and Credits continuation pass.

### 05 - Final-act continuity and gold master

Objective: integrate non-punitive choice consequences, transitions, credits narrative, audio mix, and full-run proof without redesigning the accepted chapters.

Primary ownership: explicit route wiring, Credits, narrow chapter entry/exit surfaces, and documentation evidence.

Gate: gold-master matrix complete with baseline failures separated from regressions and user playtest ready.

## File ownership rule

Only one implementation task owns these files at a time. Do not run chapter milestone implementations concurrently in the same worktree. A later milestone may edit an earlier chapter only at an entry/exit seam named in its package; discoveries requiring a broader rewrite stop for approval.

## Approval order

1. Approve this program and all top-level visions.
2. Approve Milestone 1; create or authorize a Git checkpoint.
3. Luna implements Milestone 1 with `/goal` and records evidence.
4. Sol reviews; user approves result or bounded fixes.
5. Repeat in numerical order.
6. User performs final playtest after Milestone 5.

## Baseline command policy

Each milestone runs:

```bash
npm run lint
npm run build
git diff --check
```

Browser evidence covers the route and viewports named in its matrix. A command failure known before implementation is recorded under baseline. A new failure is a regression and blocks acceptance.

## Global stop conditions

Stop and ask the user before:

- changing renderer mapping or introducing Three.js;
- changing chapter contracts, state shape, choice values, or direct-route policy;
- revising canon or stance meaning;
- starting Part II/New Game+;
- adding a backend or persistence service;
- sharing live renderer state between chapters;
- expanding a milestone into unrelated shell or Chapter 0/1 cleanup;
- performing any Git mutation without explicit authorization.

## Recommended first Luna goal

```text
/goal Implement the approved Final-Act Foundations milestone for Signal Lost.

Read AGENTS.md, docs/project-status.md, and
docs/remaining-chapters-improvement/milestones/01-final-act-foundations/README.md
in its required order.

Establish the approved Chapters 2-4 correctness, lifecycle, explicit-prop,
responsive-baseline, and failure-continuity foundations without beginning the
major visual redesigns. Preserve renderer mapping, chapter isolation,
onComplete, choice strings, no-fail progression, canon, and unrelated changes.
Update milestone evidence only after checks are performed. Run the specified
commands and route matrix, record baseline failures separately from regressions,
and stop for any material contract or scope change. Do not perform Git mutations
unless explicitly authorized. Finish only when the milestone definition of done
and handoff evidence are complete.
```

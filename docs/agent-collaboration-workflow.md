# Agent Collaboration Workflow

This document is the durable handoff protocol for substantial Signal Lost milestones. It is intended to survive chat boundaries: a new task should be able to read this file, the milestone package, and `AGENTS.md` without relying on earlier conversation history.

Use this workflow when the user refers to the **milestone workflow**, asks **Sol to plan**, or asks **Luna to implement with `/goal`**. Small, self-contained fixes do not need the full process unless the user requests it.

## Roles

### Luna: approved-plan implementation

Luna owns implementation after the user approves the milestone package. XHIGH effort is the default for a broad chapter milestone; lower effort is acceptable only when the user intentionally narrows the work.

Luna is responsible for:

- reading `AGENTS.md`, `docs/project-status.md`, and every required milestone file before editing code;
- executing the approved phases without silently expanding scope;
- preserving unrelated working-tree changes and chapter contracts;
- updating milestone checklists and results as evidence is produced;
- verifying the rendered experience at the agreed viewport sizes and input modes;
- reporting deviations, regressions, discoveries, and deferred work honestly.

### Sol: audit, specification, and independent review

Sol owns the detailed planning package before implementation and the independent review after implementation. Planning should use enough reasoning effort to inspect the actual repository rather than turning a brainstorm into an unchecked wish list.

Sol is responsible for:

- inspecting the current code, working tree, project instructions, status documents, and relevant routes;
- challenging unclear or contradictory ideas;
- checking narrative, interaction, performance, accessibility, responsive, persistence, and architecture risks;
- identifying the smallest coherent implementation slices and their dependencies;
- naming expected file ownership and protected files;
- writing measurable acceptance criteria and a validation matrix;
- separating required work, optional enhancements, and deferred ideas;
- reviewing the completed implementation against the approved package without rewriting it during review.

During the planning task, Sol changes milestone documentation only unless the user explicitly authorizes code changes.

### User: direction, gates, and final approval

The user owns creative direction, scope approval, final taste judgment, and authorization for Git actions.

The user's gates are:

- approve or revise the milestone package before implementation starts;
- create or explicitly authorize the pre-implementation Git checkpoint;
- play the affected route rather than approving from code alone;
- approve, request a focused correction, or reject the result;
- decide which deferred ideas enter a later milestone.

## Standard sequence

Do not collapse the planning, implementation, and independent review into one opaque task.

```text
User direction
    -> Sol repository audit and milestone package
    -> User plan approval
    -> User-created or user-authorized Git checkpoint
    -> Luna XHIGH implementation with /goal
    -> Luna validation and evidence update
    -> Sol independent review
    -> User-approved targeted fixes
    -> User playtest and final approval
```

Each handoff should be written down. Do not rely on conversation history as the only project memory.

## Milestone package

Create one directory per substantial pass:

```text
docs/milestones/<milestone-slug>/
    README.md
    01-current-state-audit.md
    02-experience-and-design-spec.md
    03-implementation-plan.md
    04-validation-matrix.md
    05-implementation-handoff.md
```

Do not create extra files merely to make the package look comprehensive. Add another document only when it has a distinct durable purpose.

### `README.md`: status authority

This is the entry point for every later task. It should contain:

- milestone objective and current status;
- owner of the current phase;
- approved scope and explicit non-goals;
- required reading order with links to the other files;
- phase checklist and acceptance summary;
- protected contracts and known working-tree risks;
- open decisions, blockers, and deferred ideas;
- latest validation/review verdict.

Only this file should summarize overall milestone status. Specialized documents contain the detail; they should not maintain competing status summaries.

### `01-current-state-audit.md`: evidence before ideas

Record:

- inspected files, component boundaries, and current architecture;
- current interaction flow, states, timing, animation, audio, and persistence behavior;
- desktop, compact, short-viewport, keyboard, touch, and reduced-motion observations as relevant;
- lint, type, build, hydration, runtime, and console findings;
- existing working-tree changes and protected areas;
- confirmed defects, likely risks, and facts that still need verification.

Distinguish observed facts from design judgments and proposals.

### `02-experience-and-design-spec.md`: intended player experience

Define:

- the emotional and narrative job of the milestone;
- visual hierarchy, composition, contrast, typography, motion, feedback, and payoff;
- player actions and the response to success, interruption, rejection, and replay;
- responsive and reduced-motion equivalents;
- accessibility expectations;
- references or screenshots and what should be learned from each;
- must-preserve identity and prohibited redesigns.

### `03-implementation-plan.md`: bounded execution phases

For each phase, specify:

- objective and prerequisites;
- expected files and ownership boundaries;
- state/data-flow implications;
- implementation steps ordered by dependency;
- risk notes and rollback/fallback behavior;
- acceptance criteria;
- checks required before the next phase.

Correctness and lifecycle issues come before major visual expansion. Plans should prefer cohesive vertical slices over disconnected tweaks.

### `04-validation-matrix.md`: proof of completion

Include exact checks for the relevant combinations of:

- desktop, laptop, compact mobile, and short viewport;
- mouse/pointer, keyboard, and touch/coarse pointer;
- normal and reduced motion;
- first run, interruption, route-away, refresh, completion, replay, and persisted choice;
- available, blocked, or unavailable audio;
- lint, build, console, hydration, overflow, clipping, and cleanup behavior.

Every row needs an expected result and a place for the observed result. Mark a row complete only after it has been performed. Record pre-existing baseline failures separately from new regressions.

### `05-implementation-handoff.md`: concise Luna entry point

This file translates the approved package into execution instructions:

- required reading order;
- allowed and protected file scope;
- phase order and stop conditions;
- non-negotiable contracts;
- validation commands and browser routes;
- how to update the milestone documents;
- what must be reported at completion.

It should reference the detailed documents instead of duplicating them.

## Planning approval gate

Sol must stop after the milestone package is internally consistent and ready for review. Implementation does not start until the user approves the plan.

Before handoff, confirm that:

- audit claims are supported by repository or browser evidence;
- the experience spec and implementation plan agree;
- acceptance criteria are observable rather than subjective alone;
- the validation matrix covers the stated risks;
- file scope protects unrelated work;
- unresolved choices are visible to the user;
- optional and deferred ideas cannot be mistaken for required work.

After approval, the user creates or authorizes a Git checkpoint. Agents must never infer permission to stage, commit, reset, discard, or push.

## Luna `/goal` handoff

Use one implementation task for one coherent milestone outcome. Keep the `/goal` instruction concise and place detail in the approved milestone files.

Suggested shape:

```text
/goal Implement the approved <milestone name> package in this repository.

Read AGENTS.md, docs/project-status.md, and
docs/milestones/<milestone-slug>/README.md in its required order.

Follow the approved phases and file boundaries. Preserve unrelated user edits,
chapter contracts, narrative text, routing, persistence, responsive behavior,
and reduced-motion behavior unless the package explicitly authorizes a change.

Update milestone checklists only with evidence. Run the specified validation,
record baseline issues separately from regressions, and stop for user direction
if a discovery requires material scope expansion. Do not perform Git mutations
unless explicitly authorized. Finish only when the milestone definition of done
is met and the handoff documents contain the final evidence.
```

The goal text defines the outcome, constraints, and definition of done; the milestone files carry the detailed specification. If the goal cannot fit comfortably in a short prompt, improve the handoff document instead of packing more prose into `/goal`.

## Implementation conduct

During Luna's implementation task:

1. Re-inspect the working tree before editing.
2. Read every document marked required by the milestone `README.md`.
3. Implement phase by phase and validate proportionally after each risky slice.
4. Keep at most one active implementation owner for a set of files.
5. Record material deviations and discoveries before continuing.
6. Ask for direction when a discovery changes approved scope, contracts, narrative, or architecture.
7. Do not mark planned work complete merely because code was written.
8. Finish with exact files changed, validation performed, remaining risks, and deferred work.

If genuine parallel implementation is needed, use separate Git worktrees with non-overlapping ownership. Never run two live tasks against the same files in the same worktree.

## Independent review and correction loop

After Luna reports completion, Sol reviews the result against the approved documents and current diff. Sol should:

- verify acceptance criteria and validation evidence;
- inspect for scope drift, contract regressions, lifecycle leaks, responsive failures, and misleading checklist claims;
- distinguish blocking defects from optional polish;
- write a short review verdict and a bounded correction list;
- avoid editing implementation code unless the user explicitly changes Sol's role for that task.

The user decides which corrections are approved. Luna then receives only that bounded correction list; it does not reopen the entire milestone by default.

## Creative brief

The brief should answer:

- What is the chapter's emotional job?
- What should the player notice, feel, and understand?
- What currently feels wrong or unfinished?
- What must not change?
- Which ideas are exploratory rather than committed?
- What does success look like from the player's point of view?

The brief should remain short enough to guide one milestone and becomes source material for the milestone package rather than a substitute for it.

## Implementation plan

At minimum, Sol's plan should contain:

- a one-sentence objective;
- the exact scope for this pass;
- explicit non-goals;
- files or systems likely to change;
- interaction and visual behavior changes;
- state, timing, audio, or performance risks;
- acceptance criteria;
- desktop, compact/mobile, reduced-motion, and replay checks;
- a deferred-ideas list.

## Scope rules

1. One agent owns implementation of a chapter at a time.
2. Do not have two agents edit the same chapter files concurrently.
3. New ideas discovered during implementation go into the deferred list unless they are necessary to meet an acceptance criterion.
4. Prefer one complete vertical slice over many disconnected visual tweaks.
5. Preserve the chapter's local renderer and architecture unless the plan explicitly approves a structural change.
6. Keep unrelated cleanup out of the pass.
7. Do not use completed checkboxes as intent; they represent verified evidence.
8. Do not revise approved narrative, shared APIs, persistence contracts, or chapter boundaries without surfacing the change to the user.

## Definition of done

A chapter pass is ready for user approval when:

- the intended emotional target is clearly present;
- the primary interaction is understandable without developer explanation;
- the scene completes reliably;
- replay does not retain stale timers, audio, physics, canvas, or WebGL state;
- saved choices and progression still work;
- desktop and compact layouts remain readable;
- reduced-motion and unavailable-audio states remain usable;
- `npm run lint` and `npm run build` have been run, with any remaining issue documented;
- the affected route has been visually inspected;
- deferred ideas are recorded for the next pass.

## Chapter pass record

For work too small to justify a milestone directory, add or update a lightweight pass record with this shape:

```md
## Pass: short name

### Objective

### Approved scope

### Non-goals

### Acceptance criteria

### Validation result

### Deferred ideas

### Final verdict
```

Chapter-specific pass records may live in `docs/` or inside the relevant chapter folder. Substantial multi-phase work should use the milestone package instead.

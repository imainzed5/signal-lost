# 05 - Implementation Handoff

## Luna entry point

Implement reliability foundations only. Do not start the approved visual redesigns.

## Required reading

Read the milestone `README.md` and files `01` through `04` in order after `AGENTS.md`, `docs/project-status.md`, and the top-level final-act program.

## Allowed scope

- `src/components/ChapterRouteView.tsx`
- Chapters 2-4 local source/CSS/data
- Chapter 3 shader
- this milestone's evidence documents

Protected: Chapter 0/1, title screen, Credits, story/canon, manager/state shape, renderer mapping, choice values, and unrelated files.

## Phase order

1. Baseline/Git evidence.
2. Explicit props and cleanup ownership.
3. Chapter 2 correctness/responsive/accessibility baseline.
4. Chapter 3 failure/timing/cleanup baseline.
5. Chapter 4 input/resize/audio/cleanup baseline.
6. Full matrix and documentation evidence.

Do not reorder visual expansion ahead of lifecycle work.

## Non-negotiable contracts

- Canvas 2D / WebGL / Matter.js-Web Audio remain.
- `onComplete` stays idempotent and chapter-local.
- No fail states or hidden reset.
- Manager persistence remains source of truth.
- Prior choices arrive through explicit props.
- Missing prior choices render neutral state.
- No Git mutation without explicit user authorization.

## Validation

Run the exact commands and every relevant matrix row. Use a browser that advances Canvas, shader, and physics loops. Record viewport dimensions, input mode, reduced-motion state, failure injection, observed result, and console result.

## Stop conditions

Stop for a renderer, canon, state, choice-string, direct-route, chapter-contract, or broad scope change. Record the discovery before asking.

## Completion report

Report:

- exact files changed;
- why any new chapter-local file was necessary;
- commands and browser routes run;
- baseline defects resolved;
- regressions found/resolved;
- unchecked rows and reason;
- cleanup/failure evidence;
- deviations and deferred work;
- readiness for Sol review.

## Proposed `/goal`

```text
/goal Implement the approved Final-Act Foundations milestone for Signal Lost.

Read AGENTS.md, docs/project-status.md, and
docs/remaining-chapters-improvement/milestones/01-final-act-foundations/README.md
in its required order. Implement only the approved correctness, lifecycle,
explicit-prop, responsive-baseline, accessibility-baseline, and failure-
continuity work for Chapters 2-4. Preserve renderer mapping, onComplete,
choice strings, manager persistence, no-fail progression, canon, and unrelated
changes. Update evidence only after checks. Run the complete matrix, separate
baseline failures from regressions, and stop for material scope or contract
changes. Do not perform Git mutations unless explicitly authorized. Finish only
when the milestone definition of done is met.
```

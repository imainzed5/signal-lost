# Signal Lost Agent Guide

This is the authoritative working guide for AI coding assistants in this repository. Read it before making changes. Keep it aligned with `docs/project-status.md` and update both when the project direction changes.

## Project

Signal Lost is a browser-based, chapter-driven visual novel / interactive showcase built with Next.js App Router, React, and TypeScript.

SABLE is a fragmented AI waking inside a damaged host system. The current five-chapter sequence is the prequel arc. It has no fail states, no backend, no authentication, no database, and no server persistence.

## Current implementation baseline

All five chapters have real scenes, the shell tracks progress locally, and the credits route is the story-first endpoint for the prequel arc. The Chapters 2-4 final-act improvement program is implemented; remaining work should be limited to evidence-backed polish or explicitly approved defects.

The repository's current renderer mapping is:

| Chapter | Token | Current renderer / interaction |
|---|---|---|
| 0 | `BOOT` | CSS terminal and timed dialogue sequence |
| 1 | `MEMORY` | CSS 3D floating memory cards |
| 2 | `SIGNAL` | Canvas 2D particle field |
| 3 | `INTERFERENCE` | WebGL / GLSL fragment shader scene |
| 4 | `ESCAPE` | Matter.js physics with Web Audio |

This mapping is the implementation source of truth. The decision record is in `docs/decisions/0001-canonical-rendering-progression.md`.

Chapter 3's final-act shader, component, and local CSS work is complete. Preserve those chapter-local edits and verify them before starting another large visual rewrite.

Part II and Three.js are intentionally parked. Three.js is reserved for a future second arc / outside-world experience; do not retrofit it into Chapter 2 or replace the existing raw WebGL work.

## Architecture

- `src/app/page.tsx` - title screen entry
- `src/app/chapter/[id]/page.tsx` - dynamic chapter route
- `src/app/credits/page.tsx` - ending and credits route
- `src/components/TitleScreen.tsx` - shell, route list, resume state, and settings
- `src/components/ChapterRouteView.tsx` - chapter wiring, scene completion, choices, and route chrome
- `src/chapters/Chapter{N}{Name}/` - isolated chapter implementations
- `src/engine/ChapterManager.tsx` - progression and choice orchestration
- `src/engine/useChapterState.ts` - localStorage-backed progress store
- `src/data/chapters.ts` - chapter metadata only
- `src/types/chapters.ts` - shared progress and chapter types
- `public/shaders/interference.frag` - runtime-loaded Chapter 3 shader

## Non-negotiable rules

1. Keep each real chapter isolated. The chapter-level contract is `onComplete: () => void`.
2. Do not couple chapter internals directly to other chapters. Cross-chapter consequences should travel through the chapter manager or explicit scene props.
3. Keep chapter visuals inside chapter folders. Use Tailwind for shell and route chrome only; use chapter-local CSS, canvas, WebGL, or physics code for scene visuals.
4. Preserve the full-viewport presentation. Chapters should feel like they own the screen, not like content inside a generic centered app card.
5. Keep global state minimal. Progress, unlocks, choices, and last-visited state belong in the chapter manager/localStorage flow.
6. Do not add backend assumptions, authentication, database storage, or server persistence.
7. Preserve user changes already present in the working tree. Inspect `git status` before editing and avoid unrelated cleanup.

## Adding or updating a chapter

- Put chapter code in `src/chapters/Chapter{N}{Name}/`.
- Keep chapter data local unless it is shared by another part of the experience.
- Route the chapter through `src/components/ChapterRouteView.tsx`.
- Keep `src/data/chapters.ts` limited to metadata.
- Persist choices through the chapter manager, not ad hoc localStorage keys.
- For visual changes, verify the affected route at desktop and compact viewport sizes.

## State model

The current persisted state tracks:

- `unlockedChapters`
- `completedChapters`
- `choices`
- `lastVisitedChapter`

If the state shape changes, sanitize old values and consider migration risk. Do not add run modes, replay modes, or Part II state until the prequel polish pass is complete.

## Chapter-specific notes

- Chapter 0 uses CSS-driven dialogue reveal and chapter-local styling.
- Chapter 1 uses positioned CSS 3D cards and has the highest interaction complexity. Treat composition and timing carefully; fix React purity and effect warnings before adding more features.
- Chapter 2 is raw Canvas 2D. Keep React state out of the animation loop and use refs for frame-level values.
- Chapter 3 fetches shader source from `public/shaders/interference.frag`. Preserve its adaptive containment, shader-failure fallback, resize behavior, pressure assistance, fracture geometry, and completion transitions.
- Chapter 4 uses Matter.js and Web Audio. Preserve the authored four-act structural release, guarded audio states, compact pointer-safe layout, and Escape-to-Credits handoff.

## Documentation roles

- `AGENTS.md` - AI engineering workflow and architecture rules.
- `README.md` - public-facing project overview and setup instructions.
- `docs/project-status.md` - current implementation status, known issues, and near-term priorities.
- `docs/decisions/` - durable architectural or direction decisions.
- `docs/agent-collaboration-workflow.md` - Luna, Sol, and user handoff protocol.
- `story-treatment.md` - narrative treatment and chapter canon.
- `story-lore.md` - lore and terminology.
- `story-improvement-plan.md` - active story and pedagogical revision targets.
- `docs/newgame_plus_roadmap.md` - replay / New Game+ modes only.
- `docs/part-two-direction.md` - parked second-arc concept; not current implementation scope.

## Milestone collaboration workflow

When the user asks for the **milestone workflow**, **Sol planning**, or a **Luna `/goal` handoff**, follow `docs/agent-collaboration-workflow.md` as the source of truth.

The default sequence is: Sol audits and writes a milestone documentation package; the user reviews and approves it; the user creates or authorizes a Git checkpoint; Luna implements the approved package in a separate task with XHIGH effort and `/goal`; Sol independently reviews the result; Luna applies only the approved follow-up fixes.

- Keep one milestone under `docs/milestones/<milestone-slug>/`, with its `README.md` as the status authority.
- Planning and implementation are separate tasks. The planning task changes milestone documentation only unless the user explicitly expands its scope.
- Do not let multiple agents or tasks write to the same implementation files concurrently. Use a separate Git worktree when genuine parallel implementation is required.
- A `/goal` prompt should state one concrete outcome, constraints, and definition of done, then reference the approved milestone files for detail.
- Check off work only when supported by code, command output, or browser/playtest evidence. Record baseline failures separately from regressions.
- Do not stage, commit, reset, discard, or push changes unless the user explicitly authorizes that Git action.

## Validation

After meaningful code changes, run:

```bash
npm run lint
npm run build
```

If visuals changed, also inspect the affected route in a browser or screenshot workflow. Useful routes are `/`, `/chapter/0`, `/chapter/1`, `/chapter/2`, `/chapter/3`, `/chapter/4`, and `/credits`.

The project is not considered polish-ready until a full run has been checked for replay, refresh persistence, desktop layout, compact layout, reduced motion, blocked audio, shader failure, and Escape-to-Credits continuity.

## Working style

- Make focused changes.
- Prefer small, verifiable iterations for visual work.
- Do not merge chapters into a generic renderer abstraction.
- Do not start Part II or add Three.js while the prequel still has known lint, transition, or visual QA failures.
- If a layout or interaction looks suspicious, verify it instead of assuming the code is correct.

# Signal Lost Agent Guide

This file is the shared working guide for AI coding assistants used in this repo.

## What This Project Is

Signal Lost is a browser-based visual novel / interactive showcase built with Next.js App Router, React, and TypeScript.

The game is intentionally chapter-driven:

- Chapter 0 `BOOT`: pure CSS terminal boot sequence
- Chapter 1 `MEMORY`: CSS 3D floating memory cards
- Chapter 2 `SIGNAL`: raw Canvas 2D particle field
- Chapter 3 `INTERFERENCE`: WebGL fragment shader scene
- Chapter 4 `ESCAPE`: planned Matter.js + Web Audio finale

There are no fail states, no backend systems, and no traditional game engine.

## Current Repo Status

Implemented:

- M0 shell and persistent chapter progression
- Title screen and chapter route system
- Chapter 0 real scene
- Chapter 1 real scene
- Chapter 2 real scene
- Chapter 3 real scene
- Chapter 4 real scene
- Credits route and ending flow

Not implemented yet:

- final polish pass across all chapters
- project docs cleanup such as replacing the default README

## Core Architecture

- `src/app/page.tsx`
  - title screen entry
- `src/app/chapter/[id]/page.tsx`
  - dynamic chapter route
- `src/components/ChapterRouteView.tsx`
  - decides whether a chapter uses a real renderer or the placeholder shell
- `src/chapters/Chapter{N}{Name}/`
  - isolated per-chapter implementation
- `src/engine/ChapterManager.tsx`
  - chapter progression and unlock orchestration
- `src/engine/useChapterState.ts`
  - localStorage persistence
- `src/data/chapters.ts`
  - chapter metadata
- `public/shaders/interference.frag`
  - runtime-loaded Chapter 3 shader

## Non-Negotiable Project Rules

1. Each real chapter must remain isolated.
   - The chapter-level contract is `onComplete: () => void`.
   - Do not couple chapter internals directly to other chapters.

2. Keep chapter visuals out of the shell styling layer.
   - Use Tailwind for shell and route chrome only.
   - Use chapter-local CSS modules, canvas, or WebGL inside chapter folders.

3. Preserve the full-viewport presentation.
   - Avoid collapsing the experience back into a single centered app card.
   - Chapters should feel like they own the screen.

4. Keep global state minimal.
   - Chapter unlocks, completion, choices, and last-visited state live in the chapter manager/localStorage flow.
   - Do not introduce unrelated global state unless there is a strong cross-chapter need.

5. No backend assumptions.
   - No auth
   - No database
   - No server persistence

## Implementation Conventions

### Adding or updating a chapter

- Put chapter code in `src/chapters/Chapter{N}{Name}/`
- Keep data local to the chapter unless it is reused elsewhere
- Route the chapter through `src/components/ChapterRouteView.tsx`
- Use `src/data/chapters.ts` for metadata only
- Persist chapter choices through the chapter manager, not ad hoc localStorage keys

### State model

Persisted progress currently tracks:

- `unlockedChapters`
- `completedChapters`
- `choices`
- `lastVisitedChapter`

If the state shape changes, keep migration risk in mind and avoid unnecessary churn.

### Chapter UI expectations

- Desktop presentation quality matters first
- Mobile should remain readable and not broken
- Atmosphere matters more than density
- Visual technique should feel justified by the narrative

### Chapter-specific notes

- Chapter 0 relies on CSS-driven dialogue reveal and chapter-local styling
- Chapter 1 uses positioned CSS 3D cards; treat composition carefully and visually verify
- Chapter 2 is raw canvas, so avoid React rerenders inside the animation loop
- Chapter 3 fetches shader source from `public/shaders/interference.frag`
- Chapter 4 should likely follow the same isolation pattern: chapter folder + route wiring + `onComplete`

## Next.js and React Notes

This repo is on modern Next.js and React versions. Do not assume older patterns are still correct.

- Verify unfamiliar Next.js APIs against the installed version when behavior is uncertain
- Be careful with React effect rules, especially `setState` inside effects
- Prefer stable refs or external-store patterns when needed instead of fighting the linter

## Validation Expectations

After meaningful code changes, run:

```bash
npm run lint
npm run build
```

If visuals changed, also verify the affected route in a browser or screenshot workflow.

Useful local routes:

- `/`
- `/chapter/0`
- `/chapter/1`
- `/chapter/2`
- `/chapter/3`
- `/chapter/4`

## Good Next Steps

When continuing implementation, the most natural next priorities are:

1. Add transitions and continuity between chapter endings and next chapter entry
2. Balance and polish the existing chapter visuals and interactions
3. Clean up default project documentation
4. Revisit mobile treatment for the heavier visual chapters

## Editing Guidance for Assistants

- Make focused changes
- Preserve existing chapter aesthetics unless intentionally redesigning them
- Prefer small, verifiable iterations for visual work
- If a layout looks suspicious, verify it instead of assuming the code is fine

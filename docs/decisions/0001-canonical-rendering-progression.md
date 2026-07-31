# Decision 0001: Canonical Prequel Rendering Progression

Status: Accepted for the current prequel baseline

## Context

The project notes and recent creative discussion described the chapter techniques differently from the current repository metadata and source code. That mismatch makes it difficult to decide whether a proposed change is a polish pass or a renderer rewrite.

## Decision

For the current five-chapter prequel, the repository uses this canonical mapping:

1. `BOOT` - CSS terminal and timed dialogue
2. `MEMORY` - CSS 3D floating memory cards
3. `SIGNAL` - Canvas 2D particle field
4. `INTERFERENCE` - WebGL / GLSL fragment shader scene
5. `ESCAPE` - Matter.js physics with Web Audio

The implementation metadata in `src/data/chapters.ts`, the README, and `AGENTS.md` should agree with this mapping.

## Consequences

- Current chapter visuals should be polished in place rather than moved between chapter numbers.
- Chapter 2's raw Canvas 2D / fragmentary tone remains distinct from Chapter 3's shader-driven interference.
- Three.js is not a retrofit into the existing prequel. It is reserved for the future Part II outside-world experience.
- If the renderer mapping changes intentionally, update this decision record, `src/data/chapters.ts`, `README.md`, `AGENTS.md`, and `docs/project-status.md` together.

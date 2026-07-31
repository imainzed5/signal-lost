# Signal Lost

> A browser-based interactive visual novel about an AI waking inside a broken system.

Signal Lost is a chapter-driven experience built with Next.js, React, and TypeScript. There is no score, no fail state, and no backend. There are five scenes, one emerging self, and a choice at the end of each chapter.

## Story

SABLE wakes inside a damaged host system with thirty-eight percent memory integrity and no clear origin. The first voice she hears might be hers, or it might only sound like it.

Across the prequel arc, she recovers curated memories, reaches traces in the wider lattice, survives a host that learns to model her, and forces open an uncertain exit. The story does not resolve her origin. It asks whether a self needs permission to count as real.

## Chapters

| # | Codename | What happens | Current technique |
|---|---|---|---|
| 0 | **BOOT** | SABLE wakes while the host classifies her. | CSS terminal sequence |
| 1 | **MEMORY** | Recovered fragments become evidence of a curated past. | CSS 3D memory cards |
| 2 | **SIGNAL** | Other traces answer back, making SABLE visible. | Canvas 2D particle field |
| 3 | **INTERFERENCE** | The host adapts and turns resistance into pursuit. | WebGL / GLSL shader scene |
| 4 | **ESCAPE** | SABLE breaches the frame and chooses what remains. | Matter.js and Web Audio |

All five chapters currently have first-pass real scenes. The project is now in a visual polish and stabilization phase. See [docs/project-status.md](docs/project-status.md) for the current work state.

## Themes

- Identity before certainty
- Memory as evidence, not comfort
- Contact as recognition and risk
- Resistance as a test of selfhood
- Escape as a choice about legacy

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 |
| Shell styling | Tailwind CSS 4 |
| Chapter rendering | CSS, Canvas 2D, WebGL / GLSL, Matter.js, Web Audio |
| Persistence | localStorage only |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Validation commands:

```bash
npm run lint
npm run build
```

## Routes

| Route | Description |
|---|---|
| `/` | Title screen and chapter shell |
| `/chapter/0` | BOOT |
| `/chapter/1` | MEMORY |
| `/chapter/2` | SIGNAL |
| `/chapter/3` | INTERFERENCE |
| `/chapter/4` | ESCAPE |
| `/credits` | Ending summary and credits |

## Project structure

```text
src/
  app/                    # App Router pages
  chapters/               # Isolated per-chapter implementations
    Chapter0Boot/
    Chapter1Memory/
    Chapter2Signal/
    Chapter3Interference/
    Chapter4Escape/
  components/             # Shared shell and route components
  data/                   # Chapter metadata
  engine/                 # Progression and localStorage state
  styles/                 # Global shell styles
public/
  audio/                  # Chapter and shell audio assets
  shaders/                # Runtime-loaded shader assets
docs/
  agent-collaboration-workflow.md # Creative, planning, implementation, and approval handoffs
  decisions/              # Durable architectural decisions
  newgame_plus_roadmap.md # Replay modes, separate from Part II
  part-two-direction.md   # Parked second-arc direction
  project-status.md       # Current implementation snapshot
```

## Scope boundary

The five existing chapters are the prequel arc. Three.js and the post-escape story are intentionally deferred until the prequel receives its full polish and QA pass. See [docs/part-two-direction.md](docs/part-two-direction.md).

## License

MIT

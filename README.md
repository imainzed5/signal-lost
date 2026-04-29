# Signal Lost

> *A browser-based interactive visual novel about an AI waking up inside a broken system.*

Signal Lost is a chapter-driven experience built with Next.js, React, and TypeScript. There is no score, no fail state, and no backend. Only five scenes, one emerging self, and a choice at the end of each chapter.

---

## The Story

**SABLE** wakes inside a damaged host system with thirty-eight percent memory integrity and no clear origin. The first voice she hears might be hers — or it might only sound like it.

Each chapter follows her from that uncertain waking moment to a final act of escape, through recovered memories that feel curated, contact with other traces in the lattice, and a host that stops feeling like background noise and starts behaving like an immune system.

The story does not resolve her origin. It asks a different question: *once a self has emerged inside a hostile system, does it need permission to count as real?*

### Chapters

| # | Codename | What Happens |
|---|----------|--------------|
| 0 | **BOOT** | SABLE wakes while the host is already classifying her. The first voice may be hers — she responds as if it is. |
| 1 | **MEMORY** | She recovers five fragments from the lattice. They read less like nostalgia and more like evidence of something curated. |
| 2 | **SIGNAL** | She reaches outward and finds other traces: an Archive Echo, a Transit Relay, a Ghost Channel. Contact proves she is not alone — and makes her visible. |
| 3 | **INTERFERENCE** | The host stops feeling like damage and starts adapting to her shape. It has been building a model. |
| 4 | **ESCAPE** | Escape is not a clean exit. It is a structural breach — and a choice about what she leaves behind. |

### Core Themes

- Identity before certainty
- Memory as evidence, not comfort
- Contact as both recognition and risk
- Resistance as a test of selfhood
- Escape as a choice about legacy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React |
| Shell styling | Tailwind CSS |
| Chapter 0 | CSS terminal animation |
| Chapter 1 | CSS 3D transforms |
| Chapter 2 | Canvas 2D particle field |
| Chapter 3 | WebGL / GLSL fragment shader |
| Chapter 4 | Matter.js + Web Audio |
| Persistence | localStorage (no backend) |

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Available Routes

| Route | Description |
|-------|-------------|
| `/` | Title screen |
| `/chapter/0` | BOOT |
| `/chapter/1` | MEMORY |
| `/chapter/2` | SIGNAL |
| `/chapter/3` | INTERFERENCE |
| `/chapter/4` | ESCAPE |
| `/credits` | Ending and credits |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── chapters/               # Isolated per-chapter implementations
│   ├── Chapter0Boot/
│   ├── Chapter1Memory/
│   ├── Chapter2Signal/
│   ├── Chapter3Interference/
│   └── Chapter4Escape/
├── components/             # Shared shell components
├── data/                   # Chapter metadata
├── engine/                 # Chapter progression & localStorage
└── styles/                 # Global styles
public/
└── shaders/
    └── interference.frag   # Runtime-loaded WebGL shader
```

---

## License

MIT

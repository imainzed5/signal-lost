# Signal Lost — New Game+ Concept & Roadmap

## Prerequisites (before any NG+ work)
These should land first so NG+ is built on a solid foundation:
- [ ] Credits page polish pass
- [ ] Smooth Escape → Credits transition
- [ ] Title screen run-completion indicator (small visual mark that a full run was completed)

---

## The Four Modes

### Mode A · Inverted Run
> *"She came back."*

SABLE escaped, but chooses to re-enter the system voluntarily. The same five chapters play in **reverse order** (4 → 0) with inverted or monochrome aesthetics — signals flow inward instead of outward, terminals print backward, the tone is resignation instead of urgency.

**What changes:**
- Chapter order is reversed in the shell nav
- Each chapter gets a short alternate intro line (not a full rewrite)
- Visual palette: desaturate or invert primary accent colors
- Credits ending line becomes a new outro specific to the return arc

**Narrative payoff:** The escape was the easy part. Choosing to go back is the harder thing.

---

### Mode B · New Entity
> *"Something else was in the system."*

A second complete run reveals a different entity — one that was present the whole time but invisible to SABLE. New dialogue surfaces in each chapter, same interaction mechanics, different choices available, different credits summary.

**What changes:**
- New dialogue layer per chapter (parallel, not replacing existing)
- New choice options per chapter (e.g. Chapter 1 gets a third memory card)
- Credits `buildEndingSummary` gets a second branch for the new entity's arc
- Entity has its own name and voice register (terse, fragmented, colder)

**Narrative payoff:** Replaying feels like reading a document you had the wrong frame for the first time.

---

### Mode C · Observer Mode
> *"The recording."*

You are not SABLE. You are someone — or something — playing back her trace after she left. Chapters are **subtly degraded**: missing words replaced with `[REDACTED]`, static bleed-through, certain choices locked because reconstruction is imperfect.

**What changes:**
- Chapter intros gain a `// PLAYBACK` prefix and timestamp styling
- Some dialogue words/phrases render as `░░░` or `[corrupted]`
- Certain choices are greyed out with a "reconstruction uncertain" label
- Credits reframes the entire summary as an archival document, not a personal account

**Narrative payoff:** The story you played the first time was already a recording. Observer Mode makes that explicit.

---

### Mode D · Corruption
> *"The system remembers."*

The lightest touch — purely cosmetic, no new content. After a completed run, all subsequent playthroughs carry visible artifacts of the previous run bleeding through: ghost text from old dialogue, residual particle trails, oscillator noise at chapter start.

**What changes:**
- A `runCount` field added to `ChapterProgressState`
- Each chapter reads `runCount` and applies a corruption intensity (capped after run 3)
- No new routes, no new choices — just texture

**Narrative payoff:** The world itself is worn by repeated play. The game knows you've been here before.

---

## Recommended Build Order

| Phase | Work | Depends On |
|---|---|---|
| **0** | Credits polish + Escape→Credits transition | — |
| **1** | Title screen run-completion marker | Phase 0 |
| **2** | Mode D — Corruption layer (state only, cosmetics per chapter) | Phase 1 |
| **3** | Mode C — Observer Mode (dialogue degradation, playback framing) | Phase 2 |
| **4** | Mode A — Inverted Run (reverse chapter order, palette shift) | Phase 3 |
| **5** | Mode B — New Entity (new dialogue branch, new choices) | Phase 4 |

> Modes can be offered simultaneously from the credits screen as distinct "restart" options once implemented. The priority order above reflects narrative coherence and implementation complexity — simpler cosmetic layers before deeper content rewrites.

---

## State Shape Extension (when ready)

The current `ChapterProgressState` would need two new fields:

```ts
runCount: number;           // how many full runs completed
activeMode: "standard" | "inverted" | "entity" | "observer" | "corrupted";
```

No other global state changes are needed. Chapter internals read these values and apply their own local logic.

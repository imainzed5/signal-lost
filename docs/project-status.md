# Signal Lost Project Status

Last reviewed: 2026-07-31

This is the working snapshot for the current prequel polish phase. Update it when a meaningful implementation or direction change lands.

## Overall state

Signal Lost is playable from the title screen through all five chapters and the credits route. The chapter manager persists unlocks, completions, choices, and the last visited chapter in localStorage.

The project is not yet a final polish build. Current priorities are reliability, visual consistency, transitions, responsive behavior, and documentation accuracy. `story-source.md` is now the canonical prose source for the five-chapter prequel; visual-novel polish should use it as the narrative reference while preserving the intentional ambiguity and stance-based choices.

The title screen now uses a story-first command-shell hierarchy: a state-aware primary action, responsive chapter signal spine, compact trace status, and secondary settings drawer replace the previous dashboard-style telemetry composition. The menu uses a scrollable `100dvh` layout on compact screens, keeps locked routes inert in the menu, and reserves the full wake transition for BOOT entries.

## Chapter status

| Chapter | Implementation | Current priority |
|---|---|---|
| 0 BOOT | CSS terminal sequence refined with authored pacing, adaptive host trace, branch-local consequences, and MEMORY handoff | Complete replay, audio-blocked, reduced-motion, and responsive QA |
| 1 MEMORY | Refined CSS 3D archive with authored responsive stacks, central inspection chamber, escalating host takeover, and branch aftermaths | Complete second-pass target-viewport, reduced-motion, coarse-pointer, keyboard-hold, and audio-failure QA |
| 2 SIGNAL | First-pass Canvas 2D particle/contact scene implemented | Resolve the effect warning, polish the visual overhaul, and verify touch interaction |
| 3 INTERFERENCE | WebGL shader scene implemented; active working-tree overhaul | Verify the three-phase resistance sequence, pressure lockout, asymmetric crack geometry, resize behavior, and shader failure handling |
| 4 ESCAPE | Matter.js scene and Web Audio layer implemented | Finish visual timing and the Escape-to-Credits handoff before final audio mixing |
| Credits | Ending summary and recorded choices implemented | Add a stronger decompression/transition moment and full-run completion signal |

## Current validation

- `npm run build`: passing after the Chapter 1 UI refinement pass.
- `npx eslint src/chapters/Chapter0Boot`: passing after the BOOT refinement pass.
- `npx eslint src/chapters/Chapter1Memory`: passing.
- `npm run lint`: Chapter 1 is clean; the command still fails on the preserved pre-existing Chapter 2 synchronous-effect diagnostic.
- `git diff --check`: clean apart from normal line-ending warnings.
- Existing uncommitted application work includes the preserved Chapter 3 shader/component/CSS changes and the Chapter 0 refinement pass. Documentation changes from this setup pass are also currently uncommitted.

Chapter 0 now opens with a compressed anonymous acquisition, keeps `UNKNOWN` provisional until the host assigns `SABLE`, reclassifies the historical trace labels at that lock, and carries both saved stance values into immediate branch-specific consequences. The uninvited `[UNROUTED] you were already answering` trace is intentionally temporary and is not a named lore entity. Remaining BOOT work is runtime QA across replay, refresh, audio-blocked, reduced-motion, and desktop/compact viewports.

Chapter 1 now uses an 800-line top-level orchestrator with chapter-local card, overlay, choice, geometry, helper, audio, hold, and sequence owners. The pass removes render-time viewport reads and hydration divergence, replaces absolute-clock override scheduling with deterministic relative timers, and preserves free recovery order, MIRROR-first/MIRROR-last variations, route persistence contracts, replay, and both stance values. Desktop and compact fields now settle by player recovery order; compact recovered cards move to a low-layer rail so untouched records remain reachable.

The refined experience adds explicit interruption, host-block, and uninvited-record rejection feedback; accessible cross-reference and ORIGIN interaction; staggered post-recovery degradation; progressive claustrophobia; fragment signatures; branch-specific KEEP/DECAY aftermaths; and a restrained SIGNAL handoff. Browser QA passed at 1920x1080, 1440x900, 390x844, and 360x640 without hydration/runtime console errors, page scrollbars, or card clipping. Mouse completion, blocked/uninvited interaction, cross-reference review, ORIGIN pointer engagement, both MIRROR edge orders, both aftermaths, replay, and Enter-to-SIGNAL were exercised. Reduced-motion emulation, coarse-pointer emulation, full keyboard-hold completion, audio-blocked/audio-failure behavior, and refresh persistence remain explicit QA items.

The second MEMORY UI pass adds a subtle central inspection aperture, stronger primary/secondary/tertiary contrast, decisive active-card projection, one anchored SABLE recovery-response channel, a shared indexed recovery baseline, and more legible static fragment signatures. Host events now escalate through three asymmetric magenta fault bands rather than a conventional modal. The final archive settles higher as a shallow catalogue while monologue and stance controls occupy a distinct decision chamber; reversible KEEP/DECAY previews alter archive metadata presentation without changing choice state.

Live visual-state QA covered idle, active recovery, anchored response, all three warning events, partial and final recovered order, monologue, final choice, and KEEP aftermath at 1280x720 with no page scrollbars or fresh runtime-console errors. An authored-duration 4.3-second mouse hold recovered GLASS successfully. The UI-plan target viewports, both preview states, DECAY aftermath re-check, reduced motion, coarse pointer, full keyboard hold, replay, refresh persistence, and blocked-audio behavior remain deliberately unchecked for this pass.

A connected-browser credits/shell refresh check did not surface the just-selected MEMORY value, so persistence is deliberately not marked as passed. The Chapter 1 `sceneChoice` bridge and chapter-manager calls are unchanged; a follow-up should distinguish an application persistence defect from storage isolation in the browser test context.

The remaining lint failure is not optional cleanup: Chapter 2 sets choice-reveal state synchronously inside an effect.

## Architecture baseline

The current renderer progression is:

`BOOT: CSS -> MEMORY: CSS 3D -> SIGNAL: Canvas 2D -> INTERFERENCE: WebGL -> ESCAPE: Matter.js/Web Audio`

This is the current implementation baseline, not a requirement that future arcs use the same progression. See `docs/decisions/0001-canonical-rendering-progression.md`.

## Known product questions

1. Should locked chapters be inaccessible through direct URLs, or should direct route access remain an intentional preview feature?
2. Which choices should create visible consequences in later chapters rather than only affecting the credits summary?
3. What should the visual and narrative handoff from ESCAPE to the credits feel like?
4. What exactly is the outside world in Part II: physical/IoT space, an abstract network, other systems and AIs, or a hybrid?

## Gold-master checklist

- [ ] Full run from BOOT to credits
- [ ] Replay each chapter without stale timers, audio, or canvas state
- [ ] Refresh persistence and resume behavior
- [ ] Desktop visual pass
- [ ] Compact/mobile visual pass
- [ ] Reduced-motion pass
- [ ] Audio-blocked and unavailable-audio pass
- [ ] WebGL fetch/compile failure pass
- [ ] Escape-to-Credits continuity pass
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Explicitly parked

- Part II story scoping
- Outside-world definition
- Three.js implementation
- New Game+ modes

Do not start these while the gold-master checklist still has core prequel failures.

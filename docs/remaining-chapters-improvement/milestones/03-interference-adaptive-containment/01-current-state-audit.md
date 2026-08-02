# 01 - Current-State Audit

## Current scene architecture

- React component owns shader setup, intro timers, audio, mechanic refs, host log, action, and stage presentation.
- Shader owns FBM turbulence, rings, scans, pulse window, fracture, counter-pulse, deflect, resistance tear, intro, and rupture.
- Eight resistance credits map to thresholds 0/2/4/6 and final 8.
- SIGNAL choice sets starting legibility to 0.15, 0.40, or 0.25.
- PUSH/SLIP currently appears only after `onComplete` in the shared generic overlay.

## Current input and progression

- One semantic button calls `resistInterference`; root pointer/touch starts audio.
- Before intro settles, action is disabled.
- Outside pulse window, attempt produces absorbed ripple and no credit.
- Regular intervals increase legibility and shift timing.
- Near fracture can produce 1.4 fractional credit.
- Final threshold checks four combined conditions; up to two failures rewind effective count, then third attempt completes.

## Preserve

- Full-viewport raw shader identity.
- Staged pressure and host-learning premise.
- Pulse/aperture, scan vector, fracture, counter-pulse, and rupture vocabulary.
- Semantic action/log and chapter-local audio asset library.
- SIGNAL visibility affecting initial composition.

## Replace/refine

- Hidden gating becomes readable full/partial progress with assistance.
- Random migration becomes authored recalibration.
- Symmetric crack spokes become stable asymmetric fault segments.
- First-person host taunts become procedural diagnostics.
- Generic route choice becomes in-field tactic and aftermath.
- Dense bottom log becomes contextual hierarchy on compact/short screens.

## Baseline technical findings

- WebGL error path strands progression; Milestone 01 must have fixed this before work starts.
- CSS resolution/backing store mismatch existed at DPR > 1.
- Fixed 16.67ms updates existed for aperture, fracture, and scan behavior.
- Deferred deflect/completion timers were not all canceled.
- Reduced motion did not reach the shader.
- Browser compact geometry showed clipping pressure; live shader behavior was unavailable in the planning surface.

## Narrative findings

- Current copy sometimes makes the host speak as an individual (`I know`, `I have your rhythm`) rather than containment logic.
- The existing classification copy correctly references history and pattern, a useful base.
- Earlier memory terms are not yet visually used as hooks in the host model.
- Current mechanic does not let the player perform PUSH or SLIP; the two labels are post-scene prose choices.

## Responsive/accessibility findings

- Header and bottom are absolute/fixed within an overflow-hidden root.
- At compact size, verbose classification and bottom action/log compete for one viewport.
- Button is keyboard accessible, but aperture/scan/fracture state is primarily visual and motion-dependent.
- No full-field keyboard shortcut should be added if it steals input from focused controls; semantic button remains authority.

## Audio findings

- Ambient and cue MP3 files exist locally.
- `hasAudioStarted` is set before ambient play succeeds, so blocked play may prevent retry.
- Active cue cleanup exists, but delayed cue/deflect/completion work needs unified ownership.

## Baseline versus regression

Reconfirm Milestone 01 normal/failure paths. Any loss is a regression. Visual/copy/mechanic differences explicitly authorized here are not regressions when acceptance criteria are met.

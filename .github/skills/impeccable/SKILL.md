---
name: impeccable
description: "Use when the user wants to design, redesign, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface."
argument-hint: "[target]"
user-invocable: true
---

# Impeccable

Use this skill for high-craft frontend work in Signal Lost, especially chapter routes, shell chrome, landing screens, overlays, motion, copy, and responsive polish.

## Commands

| Command | Use |
|---|---|
| `craft [target]` | Shape then build a feature end to end. |
| `shape [target]` | Plan UX and visual direction before implementation. |
| `teach` | Set up product and design context files. |
| `document` | Generate design documentation from the codebase. |
| `extract [target]` | Pull reusable tokens and components into the design system. |
| `critique [target]` | Review UX clarity, hierarchy, and story fit. |
| `audit [target]` | Check accessibility, responsive behavior, and technical quality. |
| `polish [target]` | Final quality pass before shipping. |
| `bolder [target]` | Push safe or bland design into something more distinct. |
| `quieter [target]` | Tone down something too loud or overstimulated. |
| `distill [target]` | Remove complexity and keep the essence. |
| `harden [target]` | Improve edge cases, errors, and resilience. |
| `onboard [target]` | Design first-run, empty-state, and activation flows. |
| `animate [target]` | Add purposeful motion. |
| `colorize [target]` | Add strategic color to a muted interface. |
| `typeset [target]` | Improve typography, hierarchy, and font choice. |
| `layout [target]` | Fix spacing, rhythm, and visual hierarchy. |
| `delight [target]` | Add personality and memorable details. |
| `overdrive [target]` | Push into technically ambitious visual territory. |
| `clarify [target]` | Improve copy, labels, and user guidance. |
| `adapt [target]` | Tune for different devices and viewports. |
| `optimize [target]` | Improve performance and interaction smoothness. |
| `live` | Iterate visually on elements in the browser. |

## How To Use

- Type `/impeccable` with no arguments to see the command menu.
- Type `/impeccable critique <target>` to review a screen or flow.
- Type `/impeccable polish <target>` to do a final pass.
- Type `/impeccable craft <target>` when you want the full shape-then-build workflow.
- Type `/impeccable live` when you want to explore visual variants interactively.
- Type `/impeccable pin <command>` to create a standalone shortcut such as `/audit`.
- Type `/impeccable unpin <command>` to remove a shortcut.

## Priorities

- Preserve the full-viewport, chapter-owned presentation.
- Keep shell styling separate from chapter visuals.
- Respect chapter isolation and the `onComplete` boundary.
- Avoid generic app-card layouts, default font stacks, purple-on-white defaults, and interchangeable SaaS patterns.
- Favor atmospheric, narrative-driven design choices that fit the chapter being edited.
- Keep global state minimal and localized to the existing chapter manager flow.

## Workflow

1. Start from the nearest concrete surface, usually a route, chapter component, or the UI element the user named.
2. Read the local context that matters most, including `AGENTS.md` and the story files when the task touches tone or progression.
3. Decide whether the task is a critique, polish pass, accessibility fix, responsive fix, or a structural redesign.
4. Make the smallest edit that meaningfully improves hierarchy, clarity, motion, copy, or spatial rhythm.
5. Validate the result in the narrowest way available, then widen only if the first check passes.

## Signal Lost Notes

- Chapter 0, 1, 2, 3, and 4 already have bespoke renderers. Do not collapse them into the shell.
- Chapter-local CSS, canvas, or WebGL belongs inside the chapter folder.
- Route chrome should stay lightweight so the chapter visuals remain dominant.
- If a change affects story pacing or continuity, cross-check `story-treatment.md`, `story-lore.md`, and `story-improvement-plan.md`.

## Output Style

- Findings first when reviewing.
- Concrete recommendations over broad theory.
- Concise, actionable edits over wholesale rewrites unless the user asks for a redesign.
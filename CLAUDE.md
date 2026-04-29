# Claude Repo Notes

This file exists so Claude-oriented tooling can load the shared project guide automatically.

@AGENTS.md

## Claude-Specific Reminders

- Treat `AGENTS.md` as the source of truth for repo workflow and architecture.
- Before implementing, inspect the route or chapter files you are about to touch instead of assuming the current state.
- For visual changes, do not stop at "code looks right." Run the checks and inspect the rendered result.
- Keep chapter work isolated and immersive. If a change makes the experience feel more like a generic app shell, back up and rethink it.
- After changes, prefer validating with:

```bash
npm run lint
npm run build
```

If a future Claude session sees this file first, the intent is simple: load `AGENTS.md`, respect the chapter isolation model, and keep momentum toward finishing Chapter 4 and polish.

# Meal Replay

Meal Replay is a small local-first cooking log for recording what you made, how it went, and whether it deserves another attempt.

## Checkpoint 1 features

- Add, edit, and delete meal entries.
- Record meal name, date, rating, total time, mess level, what worked, what did not work, make-again yes/no, and freeform notes.
- Persist entries in the browser with `localStorage`.
- Search across meal names and replay notes.
- Filter by make-again status and minimum rating.
- Responsive layout intended for desktop and mobile browsers.
- No backend, authentication, external database, paid service, build step, or production deployment.

## Run locally

The app is plain HTML/CSS/JavaScript and has no dependencies.

### Simplest option

1. Clone or download this repository.
2. Open `index.html` in a modern browser.

### Local HTTP server option

Some developers prefer serving static files over HTTP. From the repository directory, if Python 3 is installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Data storage

Meal entries are stored only in that browser's local storage under the key `meal-replay.entries.v1`. Clearing site/browser storage removes the saved entries. Data is not synced to other browsers or devices.

## Project coordination

The `docs/` directory contains the checkpoint definition, current project state, and agent protocol used by the project-management experiment.

# Release Compass

Release Compass (repository: ai-release-guide) is a static web app that helps a team decide how to evaluate an AI product before release.

The user answers questions about the product (who uses it, what a wrong answer can affect,
what data it handles, what it can do). The app shows a risk level and a list of evaluation
practices, each with its source.

Live: https://lanarafaella.github.io/release-compass/

## Scope

- This is a guidance layer. It does not run evaluations and is not an evaluation platform.
- Everything runs in the browser. Answers are not sent anywhere.
- Content is based on public sources only. Each practice shows its source and whether the
  citation has been checked against the original text.
- The app does not suggest pass thresholds. The test-set size estimate sizes each slice on its own threshold, including zero-tolerance slices, using values the user enters; the defaults are examples only.

## Run

```
npm install
npm run dev       # local development
npm test          # logic tests
npm run build     # static build in dist/
```

## How it works

- `src/data/questions.js`: the questions and how each answer is scored.
- `src/data/practices.js`: the evaluation practices, when each one applies, and its sources.
- `src/data/sources.js`: the source registry (links to the original documents).
- `src/logic.js`: risk level (the highest answer wins; "I don't know" counts as High) and practice selection.
- `sources/verified-sources.md`: what was checked against each original, and what was not.

The risk-level rule and the Core and Recommended labels are this project's own guidance. They are not taken from the sources.

## Status

First working version. Open items: the full text of the OWASP Agentic Top 10 and the IMDRF GMLP document have not been read.

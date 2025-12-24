# Vibe Context — Proposed Automated Checks

This repo currently has no automated test runner. Below is a lightweight plan that can be implemented with Node + ts-node (no heavy frameworks). If you want, I can wire this up next.

## Setup (proposed)
- Add devDependencies: `ts-node`, `typescript` (already present), and use built-in `assert`.
- Add script: `"test": "ts-node tests/unit.test.ts"`.

## Unit Checks (pure helpers)
- Drift sensitivity and churn parsing:
  - `isSensitivePath` recognizes auth/config/secrets/env.
  - `parseDiffStat` produces additions/deletions/changes from git `--stat` lines.
- File diff selection:
  - `findFileDiff` matches exact and endsWith paths.
- Drift notify gating:
  - Only warn + high/undefined confidence + file-scoped fire notifications.

## Integration-ish (mocked data)
- Session invariant: starting a second session while active → warning (mock VibeContextExtension and call startSession twice).
- Git guard: when no workspace or only untitled files → `getGitDiffSummary` returns “No git diff…” messages; when outside workspace → reasons listed.
- History: append + pin ordering; label updates; delete/clear behavior keeps cap at 20.

## Optional UI-facing
- Query formatting: snippets truncated with “(truncated)”; per-file diff preferred over session diff; fallback message when no diff.
- Context panel includes drift notification disabled note when toggle is off.

## Next Steps to Implement
- Add `tests/unit.test.ts` with pure-function cases (drift utils, diff parsing, path matching).
- Add `tests/history.test.ts` with mocked history state to verify pin/label/delete/clear ordering.
- Wire `"test"` script in package.json using `ts-node`.


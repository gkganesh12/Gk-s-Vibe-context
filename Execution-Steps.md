# Vibe Context — Execution Steps (Reference)

Purpose: concise, actionable checklist for upcoming work, grounded in `Next Steps.md`, `Feature and tech.md`, and `execution.md`.

## 0) Guardrails

- Local-first; no cloud/AI calls; no chat UI.
- Passive-first, low-noise; one active session at a time.
- Deterministic, intent-centric; append-only history; time-indexed.

## 1) Data Model Lock-in

- Entities: Session (time-bounded), Intent (start/end), Decision (1:N), FileChange (path, timestamps, snippet/diff), DerivedSignal (drift/risk later).
- Rules: append-only per session; no cross-session mutation; time-indexed ordering.

## 2) Capture & Storage Hardening

- Events: start/end session, text change, save, editor focus; add file open/close listeners.
- Per event: timestamp + ordering; skip non-file schemes cleanly.
- Large/untitled/out-of-workspace: track but mark “no git diff (outside workspace/not tracked)”.
- Invariants: single active session; graceful behavior in non-git workspace.
- Add: skip git when no workspace; never run git on untitled/non-file.

## 3) Git Diff & Snippet Fidelity

- In-workspace git-tracked files: include git diff summary (or per-file diff) in session summary.
- Out-of-workspace/untracked: explicit note why diff is empty.
- Snippet: capture window around latest change (already implemented); keep <=50 lines and size-bound.
- Consider optional per-change patch capture for in-workspace files if needed.
- Add: include per-file diff excerpts; cap diff parsing buffers; surface “no diff” reasons inline in summaries/queries.

## 4) Deterministic Prompt Assembly (no AI calls)

- Template: start/end intent, decisions, scoped files with snippets/diffs, git summary, timestamps/duration.
- Scope to current file/session; no free-form expansion; deterministic ordering.

## 5) Context Query Interface (command-driven, read-only)

- Queries to implement:
  - “Why does this code exist?”
  - “What decisions/assumptions affect this file?”
  - “What changed recently and why?”
  - “Show session summary.”
- Scope: current file/cursor; respond <1s; structured text, no chat.

## 6) Silent Drift Foundation (no UI yet)

- Heuristics only: scope expansion, dependency growth, structural deviation.
- Store drift score/reasons per session/file; no surfacing yet; track false positives.
- Add: per-file churn thresholds; cap number of drift signals shown (top N) to avoid noise.

## 7) Minimal Surfacing Plan (later, only when confident)

- Non-blocking note with reason; dismissible; never block editing.
- Trigger only when drift confidence crosses threshold.

## 8) UX Messaging

- Explain missing diffs: “File outside workspace” or “Not tracked by git.”
- Keep prompts optional; avoid forced input.
- Add: small section in summaries/queries listing skipped files/reasons.

## 9) Verification & Quality

- Add targeted tests (where feasible) for: one active session invariant, snippet window selection, git diff inclusion/omission messaging, query commands.
- Manual checks:
  - In-workspace tracked file edit → diff present.
  - Out-of-workspace edit → diff absent with reason.
  - Query commands return scoped, deterministic output.
- Add: test file open/close event capture and “skip git if no workspace” guard.

## 10) What We Won’t Do (now)

- No chat UI, no cloud sync, no team dashboards, no productivity metrics, no AI calls.

## Suggested Implementation Order

1. Data model lock + messaging for out-of-workspace/untracked files.
2. Add file open/close listeners; ensure timestamps/ordering everywhere.
3. Git diff path handling + explicit reasons when absent; per-file diffs.
4. Prompt assembly function (deterministic template).
5. Query commands implementation.
6. Drift signal capture (silent storage).
7. Confidence-based, non-blocking drift surfacing (later).

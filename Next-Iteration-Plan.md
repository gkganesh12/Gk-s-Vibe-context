# Vibe Context — Next Iteration Plan

## Goal
Make the extension cover real-world use by improving recall, guardrails, and reliability.

## Current Strengths
- Session intent/decisions captured; per-file snippets and diffs with reasons when missing.
- Query commands and context panel give on-demand answers.
- Git and workspace guards prevent noisy or unsafe diff attempts.

## Gaps to Close
- History depth: only last ended session is persisted; need multi-session recall.
- Drift quality: heuristics are basic; no high-confidence surfacing.
- Proactive signals: entirely pull-based; no optional nudge on high-risk drift.
- Reliability: manual verification only; no automated checks.

## Scope (this iteration)
1) Multi-session history (local)
   - Store bounded list (e.g., last 20 sessions) in globalState.
   - Add “Context: List Sessions” and “Context: Load Session” commands.
   - Ensure summaries, queries, and context panel work on a selected past session.

2) Drift signal improvements
   - Add type-aware churn thresholds (e.g., stricter for config/auth files).
   - Add a single high-threshold, dismissible notification when severity=warn and within workspace.
   - Keep silent storage for all signals; surface only high confidence.

3) Guardrails & UX
   - Inline skipped-file reasons in query outputs (already in summaries/AI context).
   - Cap per-file diffs/snippets as today; ensure truncation messaging remains.

4) Tests/automation (targeted)
   - Unit test helpers: session invariant, path normalization (workspace/outside/untitled), query formatting.
   - Light integration checks for git guard (no workspace, untitled), and session selection for history commands.

## Out of Scope (this iteration)
- Cloud sync, chat UI, team features, AI model calls.
- Heavy drift analytics beyond heuristics.


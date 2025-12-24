# Vibe Context — Test & Verification Plan

Purpose: quick, repeatable checks for commands, git guards, and the one-active-session invariant.

## Prerequisites

- Workspace: `/Users/ganesh_khetawat/Gk's Vibe CMS`
- Git repo initialized; have at least one tracked file (e.g., `src/extension.ts`)
- Build compiled (`npm run compile`)
- Reload VS Code/Cursor window to load the latest extension

## Core Invariants

- Only one active session allowed; starting a new one while active should warn and not create a second session.
- Git diff runs only when a workspace exists and files are tracked; never runs on untitled/non-file; shows reasons when absent.

## Manual Test Cases

1. One-active-session guard

   - Start a session; attempt to start again → expect warning, no new session.

2. File tracking + open/close

   - With active session, open a new workspace file, edit, save, close; expect file listed in summary with last touched time and snippet.

3. Git diff (in-workspace, tracked)

   - Edit `src/extension.ts` (tracked), save, end session → summary/AI context shows git diff + per-file diff excerpt.

4. Git guard: no workspace

   - Close workspace and try session end (or simulate) → git summary says “No git diff: no workspace open.”

5. Git guard: untitled/non-file

   - Edit untitled file only, end session → git summary says “No git diff: only untitled files were edited.”

6. Outside-workspace file

   - Edit a file outside the workspace, end session → git summary lists skipped reason; no git diff attempt.

7. Query commands

   - After ending a session, open a tracked file and run:
     - `Context: Why does this code exist?`
     - `Context: Decisions for this file`
     - `Context: What changed recently?`
   - Expect scoped intent/decisions/last touched + snippet; git summary present when available.

8. Context Panel

   - Run `Context: Show Context Panel` → markdown summary with intent, decisions, per-file diffs, drift signals, git reasons.

9. Drift signals cap

   - Create a session touching many files with diffs; end session → drift section capped at 20 items with “...and N more” if exceeded.

10. Diff excerpt bounds

- Large diffs: confirm per-file diffs are present but truncated (unified=3, ~2000 chars max, max 10 files).

## Optional Automated Checks (future)

- Unit tests for session invariant, path normalization (workspace vs outside vs untitled), and query formatting helpers.

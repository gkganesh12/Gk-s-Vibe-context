# Vibe Context — Complete Execution Flow for Developers

## 🎯 Overview

This document provides a complete guide for developers to use Vibe Context effectively in their daily workflow. It covers all features, best practices, and real-world scenarios.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start a Session

**When**: Before you begin coding on a feature/task

**How**:

- Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux)
- OR Click "▶ Start Session" in status bar
- OR Command Palette → "Context: Start Session"

**What to Enter**:

- Optional: Enter your intent (e.g., "Add user authentication", "Fix login bug")
- Press Escape to skip if you're not sure yet

**Result**: Session starts tracking automatically

---

### Step 2: Code Normally

**What Happens Automatically**:

- ✅ Files you edit are tracked
- ✅ Code snippets are captured
- ✅ Timestamps are recorded
- ✅ Git diffs are prepared (if in git repo)

**You Don't Need To**:

- ❌ Manually track files
- ❌ Remember to save context
- ❌ Interrupt your flow

---

### Step 3: End Session

**When**: When you finish the feature/task

**How**:

- Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows/Linux)
- OR Click "■ End Session" in status bar
- OR Command Palette → "Context: End Session"

**What to Enter**:

1. **Refine Intent** (optional): Update what you accomplished
2. **Add Decisions** (optional): Record key technical choices

**Result**: Session saved to history with full context

---

### Step 4: Use Context

**When**: You need to remember why code exists or share context with AI

**Options**:

- **View Summary**: `Cmd+Shift+X` → See full session summary
- **Copy for AI**: `Cmd+Shift+C` → Copy context to clipboard
- **Search Sessions**: `Cmd+Shift+F` → Find past sessions
- **Check Quality**: Command Palette → "Context: Check Context Quality"

---

## 📋 Complete Feature Guide

### 1. Session Management

#### Starting a Session

```bash
# Keyboard Shortcut
Cmd+Shift+V (Mac) / Ctrl+Shift+V (Windows/Linux)

# Status Bar
Click "▶ Start Session" button

# Command Palette
Cmd+Shift+P → "Context: Start Session"
```

**Best Practice**: Start session at the beginning of a feature/task, not mid-way.

#### Ending a Session

```bash
# Keyboard Shortcut
Cmd+Shift+E (Mac) / Ctrl+Shift+E (Windows/Linux)

# Status Bar
Click "■ End Session" button (orange when active)

# Command Palette
Cmd+Shift+P → "Context: End Session"
```

**Best Practice**: End session when feature is complete or you're switching tasks.

#### Auto-Detection

- Extension automatically detects first file edit
- Prompts you to start session (optional)
- You can dismiss and start manually later

---

### 2. Context Quality Indicator

#### Understanding Quality Score

- **🟢 80-100%**: Excellent context, ready for AI
- **🟡 60-79%**: Good context, minor improvements possible
- **🟠 40-59%**: Fair context, consider adding more details
- **🔴 0-39%**: Poor context, may lead to AI hallucinations

#### Quality Components

- **Start Intent** (30%): What you planned to do
- **End Intent** (20%): What you accomplished
- **Key Decisions** (20%): Important technical choices
- **Files Tracked** (15%): Files you edited
- **Git Diff** (15%): Version control changes

#### Checking Quality

```bash
# Command Palette
Cmd+Shift+P → "Context: Check Context Quality"

# Status Bar
Quality shown when session is active: "End Session 🟢85%"

# Context Export
Quality warning shown if < 60% when copying to clipboard
```

**Best Practice**: Aim for 80%+ quality for best AI interactions.

---

### 3. Session Search

#### Searching Sessions

```bash
# Keyboard Shortcut
Cmd+Shift+F (Mac) / Ctrl+Shift+F (Windows/Linux)

# Command Palette
Cmd+Shift+P → "Context: Search Sessions"
```

#### Search Options

- **By Intent**: "authentication", "login", "refactor"
- **By Label**: Search custom labels you added
- **By File**: "login.ts", "auth", "components"
- **By Date**: "2024-01", "January", "15"

#### Search Features

- ✅ Case-insensitive
- ✅ Partial matching
- ✅ Multiple criteria (searches all fields)
- ✅ Quick preview in results

**Example Searches**:

- `"auth"` → Finds all authentication-related sessions
- `"2024-01"` → Finds all January 2024 sessions
- `"login.ts"` → Finds sessions that touched login.ts

---

### 4. Related Sessions

#### What Are Related Sessions?

Sessions that are connected to your current session by:

- **Same Files**: Touched overlapping files
- **Similar Intent**: Similar goals/keywords
- **Time Proximity**: Happened within 7 days

#### Viewing Related Sessions

```bash
# Context Panel
Cmd+Shift+P → "Context: Show Context Panel"

# Related sessions appear at bottom of summary
```

#### Use Cases

- **Feature Evolution**: See how a feature developed across sessions
- **Decision Tracking**: Find when decisions were made
- **Context Recovery**: Remember related work when returning to code

**Best Practice**: Review related sessions when starting work on existing features.

---

### 5. Context Queries

#### "Why does this code exist?"

**When**: You see code and wonder why it was written

**How**:

1. Open the file in editor
2. Command Palette → "Context: Why does this code exist?"
3. View explanation with intent and context

**Shows**:

- Initial intent
- Final outcome
- Code snippet
- Related context

---

#### "Decisions for this file"

**When**: You need to understand technical decisions

**How**:

1. Open the file in editor
2. Command Palette → "Context: Decisions for this file"
3. View all key decisions

**Shows**:

- All decisions made during session
- Code snippet
- Context around decisions

---

#### "What changed recently?"

**When**: You want to see recent changes and their context

**How**:

1. Open the file in editor
2. Command Palette → "Context: What changed recently?"
3. View changes with context

**Shows**:

- Last modified timestamp
- Git diff (if available)
- Code snippet
- Session context

---

### 6. Context Export

#### Copy to Clipboard (For AI)

```bash
# Keyboard Shortcut
Cmd+Shift+C (Mac) / Ctrl+Shift+C (Windows/Linux)

# Command Palette
Cmd+Shift+P → "Context: Get Context for AI"
```

**Format**: Markdown, ready to paste into AI chat

**Includes**:

- Intent (start & end)
- Key decisions
- Files modified
- Git changes
- Code snippets
- Quality score

**Best Practice**: Check quality before exporting. Low quality may lead to AI hallucinations.

---

#### Export to JSON

```bash
# Clipboard
Cmd+Shift+P → "Context: Export Current Session (JSON to clipboard)"

# File
Cmd+Shift+P → "Context: Export Current Session to File"
```

**Use Cases**:

- Backup session data
- Share with team
- Import to other tools
- Documentation

---

### 7. Session History Management

#### List All Sessions

```bash
Cmd+Shift+P → "Context: List Sessions"
```

**Shows**:

- All sessions in history (last 20)
- Pinned sessions first
- Intent, date, file count

---

#### Load Session

```bash
Cmd+Shift+P → "Context: Load Session"
```

**Use**: Switch context to a different session for queries

---

#### Pin/Unpin Sessions

```bash
# Pin Current
Cmd+Shift+P → "Context: Pin Current Session"

# Unpin Current
Cmd+Shift+P → "Context: Unpin Current Session"
```

**Use**: Keep important sessions at top of history

---

#### Label Sessions

```bash
# Current Session
Cmd+Shift+P → "Context: Label Current Session"

# From History
Cmd+Shift+P → "Context: Label Session from History"
```

**Use**: Add custom labels for easier searching (e.g., "Sprint 1", "Bug Fix", "Feature X")

---

#### Delete Session

```bash
Cmd+Shift+P → "Context: Delete Session from History"
```

**Use**: Remove sessions you no longer need

---

#### Clear History

```bash
Cmd+Shift+P → "Context: Clear Session History"
```

**Warning**: This removes ALL sessions. Use with caution.

---

## 🎯 Real-World Workflows

### Workflow 1: Feature Development

```
1. Start Session
   └─ Intent: "Add user authentication"

2. Code Feature
   └─ Edit: auth/login.ts, auth/token.ts, auth/middleware.ts
   └─ Make decisions: Use JWT, bcrypt for passwords

3. End Session
   └─ Refine: "User authentication with JWT and password hashing"
   └─ Decisions: "Used JWT tokens", "bcrypt for password hashing"

4. Check Quality
   └─ Should be 80%+ (intent ✓, decisions ✓, files ✓, git ✓)

5. Export for AI (if needed)
   └─ Copy context for AI assistance on related features
```

---

### Workflow 2: Bug Fix

```
1. Start Session
   └─ Intent: "Fix login bug - users can't authenticate"

2. Debug & Fix
   └─ Edit: auth/login.ts, tests/login.test.ts
   └─ Decision: "Token expiration was too short"

3. End Session
   └─ Refine: "Fixed token expiration causing auth failures"

4. Search Later
   └─ "login bug" → Find this session quickly
```

---

### Workflow 3: Code Review Preparation

```
1. Search Related Sessions
   └─ Find all sessions that touched files in PR

2. Review Context
   └─ Check intent, decisions, changes

3. Export Context
   └─ Share with reviewer or add to PR description
```

---

### Workflow 4: Returning to Old Code

```
1. Open File
   └─ See code you wrote weeks ago

2. Query "Why does this code exist?"
   └─ Get instant context about original intent

3. Check Related Sessions
   └─ See how this code evolved over time

4. Load Session
   └─ Switch to original session for full context
```

---

## 💡 Best Practices

### 1. Session Naming

- **Be Specific**: "Add user authentication" not "Work on auth"
- **Include Scope**: "Fix login bug in mobile app"
- **Update on End**: Refine intent to reflect what actually happened

### 2. Decision Capture

- **Capture Early**: Add decisions as you make them
- **Be Clear**: "Used JWT instead of sessions" not "JWT"
- **Include Rationale**: "Used JWT for stateless auth" is better

### 3. Quality Management

- **Aim for 80%+**: Ensures good AI interactions
- **Check Before Export**: Verify quality before sharing with AI
- **Improve Low Scores**: Add missing intent/decisions

### 4. Search Strategy

- **Use Labels**: Label sessions for easier searching
- **Pin Important**: Pin sessions you reference often
- **Search by Intent**: Most effective search method

### 5. Context Export

- **Check Quality First**: Don't export low-quality context
- **Use for AI**: Export when asking AI about code
- **Share with Team**: Export JSON for documentation

---

## 🚨 Common Issues & Solutions

### Issue: "Session quality is low"

**Solution**:

- Add start intent when starting session
- Add end intent when ending session
- Capture key decisions
- Work in git-tracked workspace

### Issue: "Can't find a session"

**Solution**:

- Use search (`Cmd+Shift+F`) instead of list
- Search by intent, file, or date
- Check if session was deleted
- Use labels for easier finding

### Issue: "Context export is incomplete"

**Solution**:

- Check quality score first
- Ensure session is ended (not active)
- Verify files were tracked
- Check git diff is available

### Issue: "Related sessions not showing"

**Solution**:

- Need at least 2 sessions in history
- Sessions need overlapping files or similar intent
- Check time proximity (within 7 days)

---

## 📊 Keyboard Shortcuts Reference

| Action          | Mac           | Windows/Linux  |
| --------------- | ------------- | -------------- |
| Start Session   | `Cmd+Shift+V` | `Ctrl+Shift+V` |
| End Session     | `Cmd+Shift+E` | `Ctrl+Shift+E` |
| View Summary    | `Cmd+Shift+X` | `Ctrl+Shift+X` |
| Copy for AI     | `Cmd+Shift+C` | `Ctrl+Shift+C` |
| Search Sessions | `Cmd+Shift+F` | `Ctrl+Shift+F` |

---

## 🎓 Learning Path

### Beginner (Week 1)

1. ✅ Start/end sessions manually
2. ✅ Add intent when starting
3. ✅ View session summary
4. ✅ Copy context for AI

### Intermediate (Week 2)

1. ✅ Use search to find sessions
2. ✅ Check context quality
3. ✅ Add key decisions
4. ✅ Use context queries

### Advanced (Week 3+)

1. ✅ Pin and label sessions
2. ✅ Use related sessions
3. ✅ Export and share context
4. ✅ Optimize for quality

---

## 🔗 Integration with AI Tools

### Cursor AI

1. Start session before coding
2. End session when done
3. Use "Copy for AI" when asking questions
4. Paste context into Cursor chat

### GitHub Copilot

1. Export context before asking Copilot
2. Include context in prompt
3. Check quality first

### ChatGPT/Claude

1. Export context to clipboard
2. Paste at start of conversation
3. Ask questions about code with full context

---

## ✅ Success Checklist

After using Vibe Context for a week, you should:

- [ ] Have 5+ sessions in history
- [ ] Average quality score > 70%
- [ ] Successfully found a session using search
- [ ] Used context export with AI tool
- [ ] Reviewed related sessions
- [ ] Used context queries successfully

---

## 📞 Getting Help

- **Documentation**: See README.md and other .md files
- **Issues**: Check GitHub issues
- **Features**: See ENHANCEMENT-ROADMAP.md for planned features

---

**Remember**: Vibe Context is designed to be **passive and helpful**. It should never interrupt your flow. If it does, that's a bug - report it!

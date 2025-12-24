# How to Use Vibe Context

## 🚀 Quick Start (2 Minutes)

### 1. Start a Session

Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux), or click **"▶ Start Session"** in the status bar.

**Optional**: Enter what you plan to work on, or press `Escape` to skip.

### 2. Code Normally

The extension automatically tracks:

- ✅ Files you edit
- ✅ Code snippets
- ✅ Git changes
- ✅ Timestamps

### 3. End Session

Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows/Linux), or click **"■ End Session"** in the status bar.

**Optional**: Refine your intent and add key decisions.

### 4. Use Context

- **View Summary**: `Cmd+Shift+X` → See full session details
- **Copy for AI**: `Cmd+Shift+C` → Copy context to clipboard
- **Search Sessions**: `Cmd+Shift+F` → Find past sessions

---

## 📋 Complete Command Reference

### Session Management

| Command                | Shortcut      | Description                       |
| ---------------------- | ------------- | --------------------------------- |
| **Start Session**      | `Cmd+Shift+V` | Begin tracking a coding session   |
| **End Session**        | `Cmd+Shift+E` | End session and save to history   |
| **Show Context Panel** | -             | View detailed session information |

### Context Access

| Command                   | Shortcut      | Description                          |
| ------------------------- | ------------- | ------------------------------------ |
| **Explain From Memory**   | `Cmd+Shift+X` | View formatted session summary       |
| **Get Context for AI**    | `Cmd+Shift+C` | Copy context to clipboard (markdown) |
| **Search Sessions**       | `Cmd+Shift+F` | Search past sessions                 |
| **Check Context Quality** | -             | View quality score and tips          |

### Session History

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| **List Sessions**       | View all past sessions           |
| **Load Session**        | Restore a past session           |
| **Pin Session**         | Mark session as important        |
| **Label Session**       | Add custom label to session      |
| **Export Session**      | Export session to clipboard/file |
| **Export All Sessions** | Backup all sessions              |

### Advanced

| Command                    | Description               |
| -------------------------- | ------------------------- |
| **Show Session Analytics** | View statistics dashboard |
| **Cleanup Old Sessions**   | Remove old sessions       |
| **Import Sessions**        | Restore from backup       |

---

## 🎯 Common Workflows

### Workflow 1: Feature Development

```
1. Start Session (Cmd+Shift+V)
   → Enter: "Add user authentication"

2. Code your feature
   → Extension tracks everything automatically

3. End Session (Cmd+Shift+E)
   → Refine intent: "Implemented JWT auth with refresh tokens"
   → Add decision: "Used bcrypt for password hashing"

4. View Summary (Cmd+Shift+X)
   → Review what was accomplished

5. Copy for AI (Cmd+Shift+C)
   → Share context with AI assistant
```

### Workflow 2: Bug Fixing

```
1. Start Session (Cmd+Shift+V)
   → Enter: "Fix login redirect issue"

2. Investigate and fix
   → Extension tracks investigation files

3. End Session (Cmd+Shift+E)
   → Add decision: "Root cause: missing redirect URL validation"

4. Search Past Sessions (Cmd+Shift+F)
   → Find related authentication sessions
```

### Workflow 3: Code Review Preparation

```
1. Start Session (Cmd+Shift+V)
   → Enter: "Review PR #123"

2. Review code and make notes
   → Extension tracks reviewed files

3. End Session (Cmd+Shift+E)
   → Add decisions: "Approved with minor suggestions"

4. Copy for AI (Cmd+Shift+C)
   → Get AI help with review comments
```

---

## 💡 Tips & Best Practices

### ✅ Do's

- **Start sessions at the beginning** of a feature/task
- **Add intent** when you know what you're working on
- **Refine intent** at the end to capture what you accomplished
- **Add key decisions** for important technical choices
- **Use labels** to organize sessions by project/feature
- **Pin important sessions** you'll reference later
- **Check quality** before exporting to AI

### ❌ Don'ts

- Don't start sessions mid-way through work
- Don't worry about perfect intent - you can refine later
- Don't skip ending sessions - you'll lose context
- Don't forget to search past sessions before starting similar work

---

## 🔍 Advanced Features

### Session Search

Search sessions by:

- **Intent**: Find sessions by what you worked on
- **File Path**: Find sessions that touched specific files
- **Label**: Find sessions with specific labels
- **Date**: Find sessions from specific time periods

**Example**: Search for "authentication" to find all auth-related sessions.

### Context Quality

Quality score (0-100%) indicates how complete your context is:

- **🟢 80-100%**: Excellent - Ready for AI
- **🟡 60-79%**: Good - Minor improvements possible
- **🟠 40-59%**: Fair - Consider adding more details
- **🔴 0-39%**: Poor - May lead to AI hallucinations

**Improve Quality**:

- Add start and end intent
- Record key decisions
- Edit multiple files (more context)
- Make git commits (shows changes)

### Related Sessions

The extension automatically finds sessions related to your current work:

- **File Overlap**: Sessions that touched the same files
- **Intent Similarity**: Sessions with similar goals
- **Time Proximity**: Sessions from recent time periods

View related sessions in the context panel or session summary.

---

## 🛠️ Troubleshooting

### Commands Not Showing?

1. **Reload Window**: `Cmd+Shift+P` → "Developer: Reload Window"
2. **Check Extension**: Extensions view → Verify "Vibe Context" is enabled
3. **Check Output**: View → Output → "Log (Extension Host)" → Look for errors

### Extension Not Tracking Files?

1. **Check Workspace**: Make sure you're in a workspace folder
2. **Check Git**: File tracking works best in git repositories
3. **Check Output**: Look for error messages in Output panel

### Session Not Saving?

1. **Check Storage**: Extension uses VS Code global state
2. **Check Permissions**: Ensure VS Code has write access
3. **Check Output**: Look for storage errors in Output panel

### Quality Score Low?

1. **Add Intent**: Start and end intent improve score significantly
2. **Add Decisions**: Record key technical decisions
3. **Edit More Files**: More files = more context
4. **Make Git Commits**: Git diffs add valuable context

---

## 📚 More Help

- **[Execution Flow Guide](EXECUTION-FLOW.md)** - Complete workflow documentation
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Detailed solutions
- **[README](README.md)** - Feature overview
- **GitHub Issues** - Report bugs or request features

---

**Happy Coding! 🚀**

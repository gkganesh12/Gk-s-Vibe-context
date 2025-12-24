# Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Extension Not Activating

**Symptoms**: Commands don't appear, status bar button missing

**Solutions**:
1. **Reload Window**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Developer: Reload Window`
   - Press Enter

2. **Check Extension Status**
   - Go to Extensions view (`Cmd+Shift+X`)
   - Search for "Vibe Context"
   - Ensure it's enabled (not disabled)

3. **Check Output Logs**
   - View → Output
   - Select "Log (Extension Host)" from dropdown
   - Look for "Vibe Context extension activated!" message
   - Check for any red error messages

4. **Recompile Extension**
   ```bash
   npm run compile
   ```

---

### Commands Not Showing in Command Palette

**Symptoms**: Can't find commands when typing

**Solutions**:
1. **Type Full Command Name**
   - Use: `Context: Start Session` (not just "Start Session")
   - Commands start with "Context:"

2. **Check Extension is Active**
   - See "Extension Not Activating" section above

3. **Restart Extension Host**
   - Press `Cmd+Shift+P`
   - Type: `Developer: Restart Extension Host`
   - Press Enter

---

### Files Not Being Tracked

**Symptoms**: Session shows no files, empty file list

**Solutions**:
1. **Check Workspace**
   - Extension only tracks files in open workspace
   - Make sure you have a folder/workspace open (not just a file)

2. **Check File Edits**
   - Extension tracks files you **edit**, not just open
   - Make actual changes to files (add/remove code)

3. **Check Git Repository**
   - File tracking works best in git repositories
   - Git diffs provide additional context

4. **Check Output Logs**
   - View → Output → "Log (Extension Host)"
   - Look for file tracking messages
   - Check for errors

---

### Session Not Saving

**Symptoms**: Session disappears after ending, not in history

**Solutions**:
1. **Check Storage Permissions**
   - Extension uses VS Code global state
   - Ensure VS Code has write access to its data directory

2. **Check Output Logs**
   - Look for storage errors in Output panel
   - Check for permission errors

3. **Try Export/Import**
   - Export sessions: `Context: Export All Sessions`
   - Check if export works (indicates storage is working)

4. **Check Session Limit**
   - Extension keeps last 50 sessions
   - Older sessions may be automatically removed

---

### Low Context Quality Score

**Symptoms**: Quality score shows red/yellow, warnings appear

**Solutions**:
1. **Add Start Intent**
   - Enter intent when starting session
   - Improves score by 30%

2. **Add End Intent**
   - Refine intent when ending session
   - Improves score by 20%

3. **Add Key Decisions**
   - Record important technical choices
   - Improves score by 20%

4. **Edit More Files**
   - More files = more context
   - Improves score by 15%

5. **Make Git Commits**
   - Git diffs provide valuable context
   - Improves score by 15%

**Quality Breakdown**:
- Start Intent: 30%
- End Intent: 20%
- Key Decisions: 20%
- Files Tracked: 15%
- Git Diff: 15%

---

### Search Not Finding Sessions

**Symptoms**: Search returns no results, even with known sessions

**Solutions**:
1. **Check Search Type**
   - Try different search types (intent, file, label, date)
   - Use "Quick Search" for all fields

2. **Check Search Term**
   - Use partial matches (e.g., "auth" finds "authentication")
   - Search is case-insensitive

3. **Check Session History**
   - Verify sessions exist: `Context: List Sessions`
   - Check if sessions were deleted

4. **Search Limit**
   - Search only checks recent 50 sessions
   - Older sessions may not appear in search

---

### Extension Slowing Down VS Code

**Symptoms**: VS Code feels sluggish, high memory usage

**Solutions**:
1. **Check Session History Size**
   - Large history can slow down operations
   - Use: `Context: Cleanup Old Sessions`
   - Remove sessions older than 30/60/90 days

2. **Check Large Files**
   - Extension skips files > 5MB automatically
   - Very large workspaces may impact performance

3. **Restart Extension Host**
   - Press `Cmd+Shift+P`
   - Type: `Developer: Restart Extension Host`

4. **Check Memory Usage**
   - View → Output → "Log (Extension Host)"
   - Look for memory warnings

---

### Git Diff Not Showing

**Symptoms**: Session summary shows no git diff

**Solutions**:
1. **Check Git Repository**
   - Extension only shows diffs in git repositories
   - Ensure you're in a git repo: `git status`

2. **Check File Changes**
   - Diffs only show for tracked files
   - Make sure files are committed or staged

3. **Check Git Access**
   - Extension needs git command available
   - Verify: `git --version` works in terminal

4. **Check Output Logs**
   - Look for git command errors
   - Check for permission issues

---

### Export/Import Not Working

**Symptoms**: Can't export or import sessions

**Solutions**:
1. **Check File Permissions**
   - Ensure you have write access to export location
   - Check file system permissions

2. **Check File Format**
   - Import requires valid JSON format
   - Verify export file is not corrupted

3. **Check File Size**
   - Very large exports may fail
   - Try exporting individual sessions first

4. **Check Output Logs**
   - Look for export/import errors
   - Check for validation errors

---

### Related Sessions Not Showing

**Symptoms**: No related sessions appear in context panel

**Solutions**:
1. **Check Session History**
   - Need at least 2 sessions for related sessions
   - Related sessions require overlap (files, intent, time)

2. **Check Time Window**
   - Related sessions consider time proximity (7 days)
   - Very old sessions may not be related

3. **Check File Overlap**
   - Sessions need to touch same files
   - Or have similar intents

---

### Keyboard Shortcuts Not Working

**Symptoms**: Shortcuts don't trigger commands

**Solutions**:
1. **Check Shortcut Conflicts**
   - VS Code Settings → Keyboard Shortcuts
   - Search for conflicting shortcuts
   - Customize if needed

2. **Check Extension Active**
   - Ensure extension is enabled
   - Reload window if needed

3. **Try Command Palette**
   - Use `Cmd+Shift+P` → Type command name
   - If command works, it's a shortcut issue

---

## 🐛 Reporting Issues

If you encounter an issue not listed here:

1. **Check Output Logs**
   - View → Output → "Log (Extension Host)"
   - Copy error messages

2. **Check GitHub Issues**
   - Search existing issues: [GitHub Issues](https://github.com/gkganesh12/Gk-s-Vibe-context/issues)
   - See if issue is already reported

3. **Create New Issue**
   - Include:
     - VS Code version
     - Extension version
     - Steps to reproduce
     - Error messages from Output
     - Expected vs actual behavior

---

## 📞 Getting Help

- **Documentation**: See [HOW_TO_USE.md](HOW_TO_USE.md) and [EXECUTION-FLOW.md](EXECUTION-FLOW.md)
- **GitHub Issues**: [Report a bug](https://github.com/gkganesh12/Gk-s-Vibe-context/issues)
- **GitHub Discussions**: [Ask a question](https://github.com/gkganesh12/Gk-s-Vibe-context/discussions)

---

**Still stuck? Open an issue on GitHub with details!** 🚀

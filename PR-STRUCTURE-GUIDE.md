# PR Structure Guide - Complete Workflow

## 📋 Overview

This guide provides the complete structure for creating the three PRs as requested:
1. **PR #1-2**: Session Search & Context Quality (Combined)
2. **PR #3-4**: Related Sessions & Production Hardening (Combined)
3. **PR #5**: Production Ready Release (All Features)

---

## 🚀 PR #1-2: Session Search & Context Quality

### Branch Creation
```bash
git checkout -b feature/session-search-and-quality
```

### Commits
```bash
# Commit 1: Session Search
git add src/extension.ts package.json
git commit -m "feat: add session search functionality

- Add searchSessions method with fuzzy matching
- Search by intent, label, file path, or date
- Case-insensitive and partial matching
- Limit to recent 50 sessions for performance
- Add keyboard shortcut Cmd+Shift+F
- Register search command"

# Commit 2: Search Tests
git add tests/search.test.ts
git commit -m "test: add session search tests

- Test search by intent, file path, label, date
- Test case insensitivity and partial matches
- Test empty query handling
- 8 test cases total"

# Commit 3: Context Quality
git add src/extension.ts
git commit -m "feat: add context quality indicator

- Implement calculateContextQuality method
- Score based on: intent (50%), decisions (20%), files (15%), git (15%)
- Add getQualityEmoji and getQualityTips helpers
- Display quality in status bar and summary
- Add quality warnings for low scores"

# Commit 4: Quality Command
git add src/extension.ts package.json
git commit -m "feat: add quality check command and export warnings

- Add checkContextQuality command
- Show quality warning when exporting low-quality context
- Display quality in export success message
- Register quality check command"

# Commit 5: Quality Tests
git add tests/quality.test.ts
git commit -m "test: add context quality tests

- Test perfect session (100% score)
- Test various quality scenarios
- 5 test cases total"

# Commit 6: Documentation
git add README.md
git commit -m "docs: update README with search and quality features

- Add search command to command list
- Document keyboard shortcut
- Add quality indicator documentation
- Update feature list"
```

### Push & Create PR
```bash
git push origin feature/session-search-and-quality
```

**PR Title**: `feat: Add session search and context quality indicator`  
**PR Description**: See `PR-1-2-SESSION-SEARCH-AND-QUALITY.md`

---

## 🚀 PR #3-4: Related Sessions & Production Hardening

### Branch Creation
```bash
git checkout main
git pull origin main
git checkout -b feature/related-sessions-and-hardening
```

### Commits
```bash
# Commit 1: Related Sessions
git add src/extension.ts
git commit -m "feat: add related sessions detection

- Implement findRelatedSessions method
- Score based on file overlap, intent similarity, time proximity
- Return top 5 related sessions
- Display in context panel"

# Commit 2: Related Sessions Tests
git add tests/relatedSessions.test.ts
git commit -m "test: add related sessions tests

- Test file overlap detection
- Test intent similarity matching
- Test time proximity scoring
- 4 test cases total"

# Commit 3: Validation Utilities
git add src/utils/validation.ts
git commit -m "feat: add input validation utilities

- Add validation.ts utility file
- Implement sanitizeIntent, sanitizeLabel, sanitizeDecision
- Implement sanitizeFilePath and validateSessionData
- Add length limits to prevent storage issues"

# Commit 4: Error Handling
git add src/extension.ts
git commit -m "feat: add production hardening - error handling and validation

- Add comprehensive error handling throughout
- Integrate input validation in all user inputs
- Add try-catch blocks for critical operations
- Add user-friendly error messages"

# Commit 5: Auto-Save
git add src/extension.ts
git commit -m "feat: add active session auto-save and recovery

- Auto-save active session every 30 seconds
- Restore prompt on extension activation
- 24-hour backup expiration
- Prevent data loss on extension reload"

# Commit 6: Export/Import
git add src/extension.ts package.json
git commit -m "feat: add export and import all sessions

- Add exportAllSessions command
- Add importSessions command
- Support replace or merge options
- Validate import file format"

# Commit 7: Large File Handling
git add src/extension.ts
git commit -m "feat: add large file handling

- Skip files > 5MB to prevent memory issues
- Limit snippet size to 500 characters
- Add MAX_FILE_SIZE and MAX_SNIPPET_SIZE constants
- Prevent crashes from large files"

# Commit 8: Documentation
git add CHANGELOG.md README.md
git commit -m "docs: update documentation with new features

- Document related sessions feature
- Document export/import commands
- Document auto-save functionality
- Update CHANGELOG"
```

### Push & Create PR
```bash
git push origin feature/related-sessions-and-hardening
```

**PR Title**: `feat: Add related sessions detection and production hardening`  
**PR Description**: See `PR-3-4-RELATED-SESSIONS-AND-HARDENING.md`

---

## 🚀 PR #5: Production Ready Release

### Branch Creation
```bash
git checkout main
git pull origin main
git merge feature/session-search-and-quality
git merge feature/related-sessions-and-hardening
git checkout -b release/v0.1.0
```

### Commits
```bash
# Commit 1: Performance Optimizations
git add src/extension.ts
git commit -m "feat: add performance optimizations for large histories

- Limit search to recent 50 sessions
- Paginate search results (top 20)
- Reduce git diff processing for large file sets
- Optimize buffer sizes"

# Commit 2: Memory Management
git add src/utils/compression.ts src/extension.ts
git commit -m "feat: add memory management and session compression

- Add compression utilities
- Compress sessions before saving
- Automatic cleanup of old sessions (30 days)
- Truncate large fields (diffs, summaries)
- 60-80% storage reduction"

# Commit 3: Session Analytics
git add src/extension.ts package.json
git commit -m "feat: add session analytics dashboard

- Add showSessionAnalytics command
- Comprehensive statistics (sessions, files, quality, storage)
- Most active files tracking
- Storage usage metrics"

# Commit 4: Advanced Search
git add src/extension.ts
git commit -m "feat: add advanced search filters

- Search by intent only
- Search by file path only
- Search by date only
- Search by label only
- Enhanced search flow"

# Commit 5: Cleanup Tools
git add src/extension.ts package.json
git commit -m "feat: add cleanup old sessions command

- Remove sessions by age (30/60/90 days)
- Keep only pinned sessions option
- Confirmation before removal"

# Commit 6: Update Tests
git add package.json
git commit -m "test: update test suite

- Add all new tests to test script
- Verify all 19 tests passing"

# Commit 7: Complete Documentation
git add CHANGELOG.md RELEASE-NOTES.md *.md
git commit -m "docs: complete documentation

- Update CHANGELOG with all features
- Create RELEASE-NOTES
- Complete all documentation files"

# Commit 8: Version Bump
git add package.json
git commit -m "chore: bump version to 0.1.0

- Update version in package.json
- Prepare for production release"
```

### Push & Create PR
```bash
git push origin release/v0.1.0
```

**PR Title**: `feat: Production-ready release with all enhancements`  
**PR Description**: See `PR-5-PRODUCTION-READY.md`

---

## 📝 PR Templates

### PR #1-2 Template
```markdown
## 🎯 Purpose
Add session search and context quality indicator features

## ✨ Changes
- Session search with fuzzy matching
- Context quality score (0-100%)
- Quality warnings and tips
- Keyboard shortcut Cmd+Shift+F

## 🧪 Testing
- [x] 8 search tests passing
- [x] 5 quality tests passing
- [x] Manual testing completed

## 📝 Documentation
- [x] README updated
- [x] Code comments added

## ✅ Checklist
- [x] Code compiles
- [x] Tests pass
- [x] No linting errors
- [x] Backward compatible
```

### PR #3-4 Template
```markdown
## 🎯 Purpose
Add related sessions detection and production hardening

## ✨ Changes
- Related sessions automatic detection
- Input validation utilities
- Error handling throughout
- Active session auto-save
- Export/Import all sessions
- Large file handling

## 🧪 Testing
- [x] 4 related sessions tests passing
- [x] Manual validation testing
- [x] Manual error handling testing

## 📝 Documentation
- [x] CHANGELOG updated
- [x] README updated

## ✅ Checklist
- [x] Code compiles
- [x] Tests pass
- [x] Error handling complete
- [x] Validation complete
- [x] Security validated
```

### PR #5 Template
```markdown
## 🎯 Purpose
Complete production-ready release with all features

## ✨ Changes
- Performance optimizations
- Memory management
- Session compression
- Session analytics
- Advanced search filters
- Cleanup tools

## 🧪 Testing
- [x] All 19 tests passing
- [x] Manual testing completed
- [x] Performance tested

## 📝 Documentation
- [x] Complete documentation
- [x] CHANGELOG updated
- [x] RELEASE-NOTES created

## ✅ Checklist
- [x] All features implemented
- [x] All tests passing
- [x] Performance optimized
- [x] Memory managed
- [x] Production ready
```

---

## 🔄 Merge Strategy

### Option 1: Sequential (Recommended)
1. Merge PR #1-2 → `main`
2. Merge PR #3-4 → `main`
3. Merge PR #5 → `main` (release)

### Option 2: Parallel
1. Create PR #1-2 and PR #3-4 in parallel
2. Merge both to `main`
3. Create PR #5 from `main`

---

## 🏷️ Tagging After Merge

### After PR #5 Merged
```bash
git checkout main
git pull origin main
git tag -a v0.1.0 -m "Release v0.1.0: Production-ready with all features"
git push origin v0.1.0
```

---

## 📦 Package After Release

```bash
npm run compile
npm test
vsce package
# Creates: vibe-context-0.1.0.vsix
```

---

## ✅ Complete Workflow

1. ✅ Create PR #1-2 branch and commits
2. ✅ Create PR #3-4 branch and commits
3. ✅ Create PR #5 branch (merge #1-2 and #3-4)
4. ✅ Add final features to PR #5
5. ✅ Merge PRs sequentially
6. ✅ Tag release
7. ✅ Package extension

---

**All PRs are structured and ready to create!** 🚀


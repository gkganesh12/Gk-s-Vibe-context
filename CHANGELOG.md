# Changelog

All notable changes to Vibe Context will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-24

### Added
- **Active Session Auto-Save** - Prevents data loss on extension reload
  - Auto-saves every 30 seconds
  - Recovery prompt on activation
  - 24-hour backup expiration
- **Export All Sessions** - Backup all session history
  - Exports history + active + ended sessions
  - JSON format with metadata
  - Command: "Context: Export All Sessions"
- **Import Sessions** - Restore from backup
  - Replace or merge options
  - Validates import format
  - Command: "Context: Import Sessions"
- **Large File Handling** - Prevents memory issues
  - Skips files > 5MB
  - Limits snippet size to 500 chars
  - Prevents crashes from large files
- **Performance Optimizations** - Handles large histories efficiently
  - Limits search to recent 50 sessions
  - Paginates search results (top 20)
  - Reduces git diff processing for large file sets
  - Optimized buffer sizes
- **Memory Management** - Prevents memory leaks
  - Session compression before saving
  - Automatic cleanup of sessions older than 30 days
  - Truncated large fields (diffs, summaries)
  - Limited drift signals per session
- **Session Analytics** - Insights into session patterns
  - Comprehensive statistics dashboard
  - Most active files tracking
  - Storage usage metrics
  - Quality metrics across sessions
- **Advanced Search Filters** - Better search precision
  - Search by intent only
  - Search by file path only
  - Search by date only
  - Search by label only
- **Cleanup Old Sessions** - Manual cleanup capability
  - Remove sessions by age (30/60/90 days)
  - Keep only pinned sessions option
  - Confirmation before removal
- **Session Search** - Search sessions by intent, label, file path, or date with fuzzy matching
  - Keyboard shortcut: `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows/Linux)
  - Case-insensitive and partial matching
  - Quick preview and load functionality

- **Context Quality Indicator** - Visual quality score (0-100%) for session context
  - Quality shown in status bar during active sessions
  - Quality warnings when exporting low-quality context (< 60%)
  - Quality check command with improvement tips
  - Quality components: Intent (50%), Decisions (20%), Files (15%), Git (15%)

- **Related Sessions** - Automatic detection of related sessions
  - Scoring based on file overlap, intent similarity, and time proximity
  - Displayed in context panel
  - Top 5 related sessions shown

- **Input Validation** - Comprehensive validation and sanitization
  - Intent, label, and decision sanitization
  - File path sanitization
  - Session data validation
  - Length limits to prevent storage issues

- **Error Handling** - Robust error handling throughout
  - Try-catch blocks for critical operations
  - User-friendly error messages
  - Console logging for debugging
  - Graceful degradation

- **Comprehensive Testing** - 19 test cases covering all features
  - Session search tests (8 cases)
  - Context quality tests (5 cases)
  - Related sessions tests (4 cases)
  - Existing drift utils and history tests (2 cases)

- **Documentation** - Complete developer documentation
  - Execution Flow guide with real-world workflows
  - Implementation plan and roadmap
  - Git commits and PR structure guide
  - Completion analysis and enhancement roadmap

### Changed
- Enhanced session summary to include quality score and related sessions
- Improved context export with quality warnings
- Status bar now shows quality score during active sessions
- Updated README with new features and keyboard shortcuts

### Fixed
- TypeScript compilation issues with test files
- Session data validation to prevent invalid states
- File path handling for special characters

### Security
- Input sanitization to prevent injection attacks
- File path sanitization
- Length limits to prevent DoS via large inputs

## [0.0.1] - Initial Release

### Added
- Session lifecycle management (start/end)
- Automatic file tracking
- Intent and decision capture
- Git diff summary
- Context queries (why, decisions, changes)
- Context export (clipboard and file)
- Session history management
- Drift detection
- Pin/unpin and label sessions

---

## Upgrade Guide

### From 0.0.1 to 0.1.0

1. **New Features Available**:
   - Use `Cmd+Shift+F` to search sessions
   - Check context quality before exporting
   - View related sessions in context panel

2. **Breaking Changes**: None

3. **Migration**: No migration needed, backward compatible

---

## Future Releases

### Planned for 0.2.0
- Enhanced drift detection with intent keyword matching
- Git commit integration
- Pattern detection across sessions
- Issue/ticket linking

### Planned for 0.3.0
- Context templates
- Export/backup system
- AI suggestion conflict detection
- Performance optimizations for large histories


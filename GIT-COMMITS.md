# Vibe Context — Git Commits & PR Structure

## 📋 Commit Convention

We follow conventional commits format:
```
<type>: <scope> - <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding/updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

---

## 🚀 PR #1: Session Search Feature

### Branch: `feature/session-search`

### Commits:

#### Commit 1: `feat: add session search command`
```bash
git commit -m "feat: add session search command

- Add searchSessions method to extension
- Implement fuzzy search by intent, label, file, and date
- Register search command in extension activation
- Add keyboard shortcut Cmd+Shift+F"
```

#### Commit 2: `feat: implement fuzzy search logic`
```bash
git commit -m "feat: implement fuzzy search logic

- Search across intent, label, file paths, and dates
- Case-insensitive matching
- Partial string matching
- Date format support (full date and month/year)"
```

#### Commit 3: `test: add session search tests`
```bash
git commit -m "test: add session search tests

- Test search by intent
- Test search by file path
- Test search by label
- Test search by date
- Test case insensitivity
- Test partial matches
- Test empty query handling"
```

#### Commit 4: `docs: update README with search feature`
```bash
git commit -m "docs: update README with search feature

- Add search command to command list
- Document keyboard shortcut
- Add search examples
- Update feature list"
```

---

## 🚀 PR #2: Context Quality Indicator

### Branch: `feature/context-quality`

### Commits:

#### Commit 1: `feat: add context quality calculation`
```bash
git commit -m "feat: add context quality calculation

- Implement calculateContextQuality method
- Score based on: intent (50%), decisions (20%), files (15%), git (15%)
- Add getQualityEmoji helper for visual indicators
- Add getQualityTips helper for improvement suggestions"
```

#### Commit 2: `feat: display quality in summary and export`
```bash
git commit -m "feat: display quality in summary and export

- Show quality score in session summary
- Display quality warning for low scores (< 60%)
- Show quality in status bar when session active
- Include quality in context export messages"
```

#### Commit 3: `feat: add quality warning for low scores`
```bash
git commit -m "feat: add quality warning for low scores

- Warn user when exporting low-quality context
- Show quality tips for improvement
- Add checkContextQuality command
- Modal dialog with quality score and tips"
```

#### Commit 4: `test: add quality calculation tests`
```bash
git commit -m "test: add quality calculation tests

- Test perfect session (100% score)
- Test session without intent (50% score)
- Test minimal session (15% score)
- Test empty session (0% score)
- Test session with only start intent"
```

---

## 🚀 PR #3: Related Sessions Feature

### Branch: `feature/related-sessions`

### Commits:

#### Commit 1: `feat: add related sessions detection`
```bash
git commit -m "feat: add related sessions detection

- Implement findRelatedSessions method
- Score based on: file overlap (40%), intent similarity (30%), time proximity (30%)
- Return top 5 related sessions
- Threshold of 20 points minimum"
```

#### Commit 2: `feat: display related sessions in context panel`
```bash
git commit -m "feat: display related sessions in context panel

- Show related sessions section in context panel
- Display intent, date, pin status, and label
- Add convertInternalToData helper
- Handle both SessionData and SessionDataInternal types"
```

#### Commit 3: `test: add related sessions tests`
```bash
git commit -m "test: add related sessions tests

- Test file overlap detection
- Test intent similarity matching
- Test time proximity scoring
- Test unrelated sessions filtering
- Test top 5 limit"
```

---

## 🔧 Configuration & Setup Commits

#### Commit: `chore: update tsconfig to exclude tests`
```bash
git commit -m "chore: update tsconfig to exclude tests

- Add tests directory to exclude array
- Fix TypeScript compilation errors
- Maintain test files outside src directory"
```

#### Commit: `chore: update test script`
```bash
git commit -m "chore: update test script

- Add search.test.ts to test suite
- Add quality.test.ts to test suite
- Add relatedSessions.test.ts to test suite
- Update package.json test command"
```

---

## 📝 Documentation Commits

#### Commit: `docs: add execution flow guide`
```bash
git commit -m "docs: add execution flow guide

- Complete developer workflow guide
- Real-world use cases and examples
- Best practices and tips
- Troubleshooting section
- Keyboard shortcuts reference"
```

#### Commit: `docs: add implementation plan`
```bash
git commit -m "docs: add implementation plan

- Structured implementation roadmap
- PR and commit organization
- Feature prioritization
- Success criteria"
```

#### Commit: `docs: add git commits documentation`
```bash
git commit -m "docs: add git commits documentation

- Commit convention guidelines
- PR structure and commits
- Branch naming strategy
- Commit message examples"
```

---

## 🔄 Example Git Workflow

### Creating PR #1 (Session Search):

```bash
# Create feature branch
git checkout -b feature/session-search

# Make changes and commit
git add src/extension.ts package.json
git commit -m "feat: add session search command"

git add src/extension.ts
git commit -m "feat: implement fuzzy search logic"

git add tests/search.test.ts
git commit -m "test: add session search tests"

git add README.md
git commit -m "docs: update README with search feature"

# Push branch
git push origin feature/session-search

# Create PR on GitHub
# Title: "feat: Add session search functionality"
# Description: See PR template below
```

---

## 📋 PR Template

### Title
```
feat: Add [feature name]
```

### Description
```markdown
## 🎯 Purpose
Brief description of what this PR adds/fixes

## ✨ Changes
- Change 1
- Change 2
- Change 3

## 🧪 Testing
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] No breaking changes

## 📝 Documentation
- [ ] README updated
- [ ] Code comments added
- [ ] Examples provided

## ✅ Checklist
- [ ] Code compiles
- [ ] Tests pass
- [ ] No linting errors
- [ ] Backward compatible
```

---

## 🏷️ Tagging Strategy

### Version Tags
```bash
# After merging all PRs
git tag -a v0.1.0 -m "Release v0.1.0: Core features + enhancements"
git push origin v0.1.0
```

### Feature Tags
```bash
# After each major feature
git tag -a feature/session-search-v1 -m "Session search feature complete"
```

---

## 📊 Commit Statistics

### PR #1: Session Search
- **Files Changed**: 3
- **Lines Added**: ~150
- **Commits**: 4
- **Tests**: 8 test cases

### PR #2: Context Quality
- **Files Changed**: 2
- **Lines Added**: ~200
- **Commits**: 4
- **Tests**: 5 test cases

### PR #3: Related Sessions
- **Files Changed**: 2
- **Lines Added**: ~180
- **Commits**: 3
- **Tests**: 4 test cases

---

## 🔍 Code Review Checklist

For each PR, reviewers should check:
- [ ] Commits follow convention
- [ ] Code is well-commented
- [ ] Tests cover new functionality
- [ ] No breaking changes
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Error handling present
- [ ] Backward compatible

---

## 🚨 Breaking Changes

If a PR contains breaking changes:
1. Update version number (major version bump)
2. Add migration guide
3. Document in CHANGELOG.md
4. Mark in PR description

---

## 📈 Release Process

### Pre-Release
```bash
# Update version in package.json
# Update CHANGELOG.md
# Run all tests
npm test

# Compile
npm run compile

# Package extension
vsce package
```

### Release
```bash
# Create release tag
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# Create GitHub release
# Upload .vsix file
# Add release notes
```

---

**Note**: This structure ensures clean git history, easy code review, and clear project evolution.


# Contributing to Vibe Context

## 🤝 Thank You for Contributing!

We welcome contributions to Vibe Context! This guide will help you get started.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- Git installed
- VS Code or Cursor IDE
- GitHub account

### Setup
```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Gk-s-Vibe-context.git
cd Gk-s-Vibe-context

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test
```

---

## 🔀 Branch Workflow

### Creating a Feature Branch

1. **Update main branch**:
```bash
git checkout main
git pull origin main
```

2. **Create feature branch**:
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes and commit**:
```bash
git add .
git commit -m "feat: your feature description"
```

4. **Push branch**:
```bash
git push origin feature/your-feature-name
```

5. **Create Pull Request** on GitHub

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>: <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### Examples
```bash
feat: add session search functionality
fix: resolve memory leak in session storage
docs: update README with new features
test: add tests for search functionality
```

---

## 🔍 Code Review Process

### Before Submitting PR

- [ ] Code compiles (`npm run compile`)
- [ ] All tests pass (`npm test`)
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Follows code style
- [ ] No breaking changes (or documented)

### PR Requirements

1. **Title**: Follow conventional commits format
2. **Description**: Use PR template
3. **Tests**: Add tests for new features
4. **Documentation**: Update relevant docs
5. **Review**: Wait for approval

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
ts-node tests/search.test.ts
```

### Writing Tests
- Add tests for new features
- Test edge cases
- Test error handling
- Aim for good coverage

---

## 📚 Documentation

### When to Update Docs

- ✅ Adding new features
- ✅ Changing existing features
- ✅ Fixing bugs (update troubleshooting)
- ✅ Changing API/commands

### Documentation Files

- `README.md` - Main documentation
- `CHANGELOG.md` - Version history
- `EXECUTION-FLOW.md` - Usage guide
- Code comments - Inline documentation

---

## 🎯 Branch Protection Rules

### Main Branch Protection

- ✅ **Required**: Pull request before merging
- ✅ **Required**: At least 1 approval
- ✅ **Required**: All status checks pass
- ✅ **Required**: Linear history (squash/rebase)
- ❌ **Blocked**: Direct pushes
- ❌ **Blocked**: Force pushes
- ❌ **Blocked**: Deletions

### What This Means

- You **cannot** push directly to `main`
- You **must** create a PR
- Your PR **must** be approved
- All tests **must** pass
- You **must** use squash/rebase merge

---

## 🔄 PR Workflow

### 1. Create Branch
```bash
git checkout -b feature/your-feature
```

### 2. Make Changes
- Write code
- Add tests
- Update docs

### 3. Commit Changes
```bash
git add .
git commit -m "feat: your feature"
```

### 4. Push Branch
```bash
git push origin feature/your-feature
```

### 5. Create PR
- Go to GitHub
- Click "New Pull Request"
- Fill out PR template
- Request review

### 6. Address Feedback
- Make requested changes
- Push updates
- Respond to comments

### 7. Merge
- Wait for approval
- Ensure checks pass
- Maintainer will merge

---

## ✅ PR Checklist

Before submitting, ensure:

- [ ] Code follows project style
- [ ] All tests pass
- [ ] Code compiles
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] PR description complete
- [ ] Commits follow convention
- [ ] Branch is up to date

---

## 🚫 What Not to Do

- ❌ Don't push directly to `main`
- ❌ Don't force push to protected branches
- ❌ Don't merge your own PR without review
- ❌ Don't skip tests
- ❌ Don't ignore linting errors
- ❌ Don't commit large files
- ❌ Don't commit secrets/keys

---

## 🎨 Code Style

### TypeScript
- Use strict typing
- Follow existing patterns
- Add JSDoc comments for public APIs
- Keep functions focused

### Naming
- Use descriptive names
- Follow camelCase for variables/functions
- Follow PascalCase for classes
- Use UPPER_CASE for constants

---

## 🐛 Reporting Issues

### Bug Reports

Include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots (if applicable)

### Feature Requests

Include:
- Description of the feature
- Use case
- Proposed solution
- Alternatives considered

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/gkganesh12/Gk-s-Vibe-context/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gkganesh12/Gk-s-Vibe-context/discussions)
- **Documentation**: See README.md and other .md files

---

## 🙏 Thank You!

Your contributions make Vibe Context better for everyone!

---

**Happy Contributing!** 🚀


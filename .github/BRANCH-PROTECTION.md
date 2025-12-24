# Branch Protection Setup Guide

## 🛡️ Quick Setup (5 Minutes)

### Step 1: Navigate to Settings
1. Go to your GitHub repository
2. Click **Settings** → **Branches**

### Step 2: Add Protection Rule
1. Click **"Add rule"**
2. Enter `main` in "Branch name pattern"

### Step 3: Configure Protection Rules

#### ✅ Enable These:
- **Require a pull request before merging**
  - Required approvals: `1`
  - ✅ Dismiss stale reviews
  - ✅ Require code owner reviews
  
- **Require status checks to pass before merging**
  - ✅ Require branches to be up to date
  - Required checks: `compile`, `test`
  
- **Require conversation resolution before merging**
- **Require linear history**
- **Include administrators**

#### ❌ Disable These:
- **Allow force pushes** (unchecked)
- **Allow deletions** (unchecked)

### Step 4: Save
Click **"Create"** button

---

## ✅ Protection Active!

Your `main` branch is now protected. All PRs must:
- ✅ Have at least 1 approval
- ✅ Pass all status checks
- ✅ Resolve all conversations
- ✅ Use linear history (squash/rebase only)

---

## 🧪 Test Protection

Try pushing directly to main (should fail):
```bash
git checkout main
git commit --allow-empty -m "test"
git push origin main
# Expected: "protected branch hook declined" ✅
```

---

## 📋 Essential Files

- **`.github/workflows/pr-checks.yml`** - GitHub Actions for PR checks
- **`.github/CODEOWNERS`** - Code ownership rules
- **`.github/CONTRIBUTING.md`** - Contribution guidelines
- **`.github/setup-branch-protection.sh`** - Automated setup script

---

## 🚀 Alternative: Automated Setup

Run the setup script:
```bash
./.github/setup-branch-protection.sh
```

**Requirements**: GitHub CLI (`gh`) installed and authenticated

---

**Your main branch is now protected!** 🛡️

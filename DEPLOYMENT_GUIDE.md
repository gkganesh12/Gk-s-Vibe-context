# 🚀 Deployment Guide - VS Code & Cursor Marketplace

This guide will help you publish the Vibe Context extension to the VS Code Marketplace, making it available for both VS Code and Cursor users.

---

## 📋 Prerequisites

1. **Microsoft Account** - You'll need a Microsoft account
2. **Personal Access Token (PAT)** - For publishing
3. **Publisher ID** - Create one on the marketplace
4. **vsce Tool** - VS Code Extension Manager

---

## 🔧 Step 1: Install vsce

```bash
npm install -g @vscode/vsce
```

Verify installation:
```bash
vsce --version
```

---

## 🔑 Step 2: Create Publisher Account

1. Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Click **"Create Publisher"**
4. Fill in:
   - **Publisher ID**: `gkganesh12` (or your preferred ID)
   - **Publisher Name**: Your name or organization
   - **Email**: Your email
   - **Support URL**: (Optional) Your GitHub repo URL
5. Click **"Create"**

> 💡 **Note**: Publisher ID must be unique and cannot be changed later!

---

## 🔐 Step 3: Create Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with your Microsoft account
3. Click your profile icon → **"Personal Access Tokens"**
4. Click **"New Token"**
5. Configure:
   - **Name**: `VSCode Extension Publishing`
   - **Organization**: `All accessible organizations`
   - **Expiration**: Choose duration (or custom)
   - **Scopes**: Select **"Custom defined"**
     - Check: **"Marketplace"** → **"Manage"**
6. Click **"Create"**
7. **Copy the token immediately** (you won't see it again!)

---

## 📦 Step 4: Prepare package.json

Make sure your `package.json` has all required fields:

```json
{
  "name": "vibe-context",
  "displayName": "Vibe Context",
  "description": "Captures session-level developer intent during coding",
  "version": "0.0.1",
  "publisher": "gkganesh12",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "keywords": [
    "context",
    "session",
    "intent",
    "developer",
    "productivity",
    "tracking"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/gkganesh12/Gk-s-Vibe-context.git"
  },
  "bugs": {
    "url": "https://github.com/gkganesh12/Gk-s-Vibe-context/issues"
  },
  "homepage": "https://github.com/gkganesh12/Gk-s-Vibe-context#readme",
  "license": "MIT",
  "icon": "icon.png"
}
```

> ⚠️ **Important**: 
> - `publisher` must match your Publisher ID
> - Add an `icon.png` (128x128px) in the root directory (optional but recommended)

---

## 🎨 Step 5: Add Extension Icon (Optional but Recommended)

1. Create a 128x128px PNG image
2. Save it as `icon.png` in the root directory
3. The icon will appear in the marketplace

---

## 📝 Step 6: Create LICENSE File

Create a `LICENSE` file (MIT License example):

```text
MIT License

Copyright (c) 2025 Ganesh Khetawat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🏗️ Step 7: Build the Extension

```bash
# Make sure everything compiles
npm run compile

# Package the extension
vsce package
```

This creates a `.vsix` file (e.g., `vibe-context-0.0.1.vsix`)

---

## 📤 Step 8: Publish to Marketplace

### Option A: Publish via vsce (Recommended)

```bash
vsce publish
```

When prompted:
- **Personal Access Token**: Paste your PAT from Step 3
- The extension will be published automatically!

### Option B: Manual Upload

1. Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Sign in
3. Find your publisher account
4. Click **"New Extension"** → **"Visual Studio Code"**
5. Upload your `.vsix` file
6. Fill in the details
7. Click **"Publish"**

---

## ✅ Step 9: Verify Publication

1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
2. Search for "Vibe Context"
3. Your extension should appear!

---

## 🔄 Step 10: Update Extension

When you make changes:

1. **Update version** in `package.json`:
   ```json
   "version": "0.0.2"
   ```

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update: New features"
   git push
   ```

3. **Publish update**:
   ```bash
   vsce publish
   ```

---

## 🎯 For Cursor Users

**Good News!** Cursor uses VS Code extensions, so:

- ✅ Your extension will automatically work in Cursor
- ✅ Users can install it from VS Code Marketplace
- ✅ Or install the `.vsix` file directly in Cursor

### Installing in Cursor:

1. **From Marketplace** (same as VS Code):
   - Open Cursor
   - Go to Extensions (`Cmd+Shift+X`)
   - Search "Vibe Context"
   - Click Install

2. **From VSIX file**:
   - Download the `.vsix` file
   - In Cursor: Extensions → `...` menu → "Install from VSIX..."
   - Select the file

---

## 📊 Marketplace Listing

After publishing, you can enhance your listing:

1. Go to [Marketplace Management](https://marketplace.visualstudio.com/manage)
2. Click on your extension
3. Add:
   - **Screenshots** (1280x720px recommended)
   - **Detailed description**
   - **Tags/Categories**
   - **Release notes**

---

## 🔒 Security Best Practices

1. **Never commit your PAT** to git
2. **Use environment variables** for PAT:
   ```bash
   export VSCE_PAT="your-token-here"
   vsce publish
   ```
3. **Rotate tokens** periodically
4. **Use minimal scopes** for tokens

---

## 🐛 Troubleshooting

### "Publisher ID not found"
- Make sure you created the publisher account
- Verify `publisher` in `package.json` matches your Publisher ID

### "Invalid Personal Access Token"
- Check token hasn't expired
- Verify token has "Marketplace → Manage" scope
- Try creating a new token

### "Extension already exists"
- Update version number in `package.json`
- Use semantic versioning: `0.0.1` → `0.0.2` → `0.1.0`

### "Package validation failed"
- Run `vsce package` first to check for errors
- Fix any validation errors shown
- Make sure all required fields in `package.json` are present

---

## 📈 Post-Publication

### Monitor Your Extension

1. **Analytics**: Check downloads and ratings
2. **Issues**: Monitor GitHub issues
3. **Reviews**: Respond to user feedback
4. **Updates**: Keep extension updated

### Promote Your Extension

- Share on social media
- Add to your portfolio
- Write a blog post
- Share in developer communities

---

## 🎉 Quick Reference

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# Publish extension
vsce publish

# Check extension
vsce ls

# Show extension info
vsce show <publisher>.<extension-name>
```

---

## 📚 Resources

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Marketplace Management](https://marketplace.visualstudio.com/manage)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)

---

## ✅ Checklist Before Publishing

- [ ] `package.json` has correct `publisher` field
- [ ] Version number is set correctly
- [ ] Extension compiles without errors (`npm run compile`)
- [ ] README.md is complete and clear
- [ ] LICENSE file exists
- [ ] Icon.png added (optional but recommended)
- [ ] Tested extension locally (`F5` in VS Code)
- [ ] All files are committed to git
- [ ] Personal Access Token created
- [ ] Publisher account created

---

**Ready to publish?** Follow the steps above and your extension will be live in the marketplace! 🚀


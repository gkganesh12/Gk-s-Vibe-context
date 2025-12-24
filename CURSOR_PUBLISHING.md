# 🎯 Publishing to Cursor (Open VSX Registry)

Cursor uses the **Open VSX Registry** instead of the VS Code Marketplace. You need to publish your extension there separately.

---

## 📋 Steps to Publish to Cursor

### Step 1: Install Open VSX CLI

```bash
npm install -g ovsx
```

Verify installation:
```bash
ovsx --version
```

---

### Step 2: Create Open VSX Account

1. Go to: https://open-vsx.org/
2. Click **"Sign In"** (top right)
3. Sign in with:
   - **GitHub** (recommended)
   - **GitLab**
   - **Eclipse** account
4. Complete the registration

---

### Step 3: Create Publisher on Open VSX

1. After signing in, go to: https://open-vsx.org/user-settings/namespaces
2. Click **"Create Namespace"**
3. Enter your publisher name: `GaneshKhetawat`
4. Click **"Create"**

> 💡 **Note**: Publisher name should match your VS Code publisher ID if possible

---

### Step 4: Generate Personal Access Token

1. Go to: https://open-vsx.org/user-settings/tokens
2. Click **"Create Token"**
3. Give it a name: `Vibe Context Publishing`
4. Click **"Create"**
5. **Copy the token immediately** (you won't see it again!)

---

### Step 5: Publish to Open VSX

```bash
cd "/Users/ganesh_khetawat/Gk's Vibe CMS"

# Publish using the token
ovsx publish -p YOUR_ACCESS_TOKEN
```

Or set as environment variable:
```bash
export OVSX_PAT="your-token-here"
ovsx publish
```

---

## ✅ Verify in Cursor

1. Open Cursor
2. Go to Extensions (`Cmd+Shift+X`)
3. Search for **"Vibe Context"**
4. It should appear and be installable!

---

## 🔄 Updating the Extension

When you update your extension:

1. **Update version** in `package.json`:
   ```json
   "version": "0.0.2"
   ```

2. **Publish to both marketplaces**:
   ```bash
   # VS Code Marketplace
   vsce publish -p YOUR_VSCE_TOKEN
   
   # Open VSX (Cursor)
   ovsx publish -p YOUR_OVSX_TOKEN
   ```

---

## 📝 Quick Reference

| Action | VS Code Marketplace | Open VSX (Cursor) |
|--------|---------------------|-------------------|
| **CLI Tool** | `vsce` | `ovsx` |
| **Registry** | marketplace.visualstudio.com | open-vsx.org |
| **Account** | Microsoft/Azure DevOps | GitHub/GitLab/Eclipse |
| **Token** | Azure DevOps PAT | Open VSX PAT |
| **Publish** | `vsce publish` | `ovsx publish` |

---

## 🎯 Both Marketplaces

Your extension will be available in:
- ✅ **VS Code**: Via VS Code Marketplace
- ✅ **Cursor**: Via Open VSX Registry
- ✅ **VSCodium**: Via Open VSX Registry
- ✅ **Other VS Code forks**: Via Open VSX Registry

---

## 🔗 Links

- **Open VSX Registry**: https://open-vsx.org/
- **Your Extension**: https://open-vsx.org/extension/GaneshKhetawat/vibe-context
- **Open VSX CLI**: https://github.com/eclipse/openvsx/wiki/CLI

---

**Ready to publish to Cursor?** Follow the steps above! 🚀


# 🔧 Troubleshooting Publishing Issues

## Error: TF400813 - User not authorized

This error means your Personal Access Token (PAT) doesn't have the right permissions or is invalid.

### ✅ Solution Steps:

#### 1. Verify Publisher ID
Make sure your `package.json` has the correct publisher:
```json
"publisher": "GaneshKhetawat"
```

#### 2. Create a New Personal Access Token

1. Go to: https://dev.azure.com
2. Sign in with your Microsoft account
3. Click your profile icon (top right)
4. Select **"Personal Access Tokens"**
5. Click **"New Token"**
6. Configure:
   - **Name**: `VSCode Extension Publishing - Vibe Context`
   - **Organization**: Select your organization (or "All accessible organizations")
   - **Expiration**: 90 days (or custom)
   - **Scopes**: 
     - ✅ **Marketplace** → **Manage** (REQUIRED)
     - ✅ **Code** → **Read & Write** (optional but recommended)
7. Click **"Create"**
8. **Copy the token immediately** (you won't see it again!)

#### 3. Verify Token Permissions

The token MUST have:
- ✅ **Marketplace** → **Manage** scope
- ✅ Access to the organization where your publisher is registered

#### 4. Try Publishing Again

```bash
# Method 1: Set as environment variable
export VSCE_PAT="your-new-token-here"
vsce publish

# Method 2: Pass directly
vsce publish -p your-new-token-here
```

### Common Issues:

#### Issue: Token doesn't have Marketplace scope
**Fix**: Create a new token with **Marketplace → Manage** permission

#### Issue: Wrong organization
**Fix**: Make sure the token has access to the organization where your publisher account is registered

#### Issue: Token expired
**Fix**: Create a new token with longer expiration

#### Issue: Publisher ID mismatch
**Fix**: Verify `package.json` has `"publisher": "GaneshKhetawat"` (exact match, case-sensitive)

---

## Alternative: Manual Upload via Web

If `vsce publish` continues to fail:

1. Package the extension:
   ```bash
   vsce package
   ```

2. Go to: https://marketplace.visualstudio.com/manage
3. Sign in
4. Find your publisher: **GaneshKhetawat**
5. Click **"New Extension"** → **"Visual Studio Code"**
6. Upload the `.vsix` file manually
7. Fill in the details
8. Click **"Publish"**

---

## Verify Your Setup

Check these before publishing:

- [ ] Publisher ID in `package.json` matches your marketplace account
- [ ] Personal Access Token has **Marketplace → Manage** scope
- [ ] Token hasn't expired
- [ ] Token has access to the correct organization
- [ ] Extension compiles: `npm run compile`
- [ ] Package validates: `vsce ls`

---

## Still Having Issues?

1. **Check token expiration**: Create a new token
2. **Verify publisher account**: Go to https://marketplace.visualstudio.com/manage
3. **Try manual upload**: Use the web interface instead
4. **Check vsce version**: `vsce --version` (should be latest)
5. **Update vsce**: `npm install -g @vscode/vsce@latest`


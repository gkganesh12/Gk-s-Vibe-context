# Vibe Context Extension - Testing & Deployment Guide

## Prerequisites

- Node.js (v16 or higher)
- VS Code or Cursor IDE
- npm (comes with Node.js)

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@types/vscode` - TypeScript definitions for VS Code API
- `@types/node` - TypeScript definitions for Node.js
- `typescript` - TypeScript compiler

## Step 2: Compile the Extension

```bash
npm run compile
```

This compiles TypeScript to JavaScript in the `out/` directory.

**Note:** If you make changes, you can use:
```bash
npm run watch
```
This watches for changes and recompiles automatically.

## Step 3: Test in VS Code/Cursor (Development Mode)

### Method 1: Using F5 (Recommended)

1. **Open the extension folder** in VS Code/Cursor
2. **Press `F5`** or go to `Run > Start Debugging`
3. A new **Extension Development Host** window will open
4. This is a separate VS Code instance with your extension loaded

### Method 2: Using Command Palette

1. Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type: `Debug: Start Debugging`
3. Select "Run Extension"

### Testing the Extension

In the **Extension Development Host** window:

1. **Start a Session:**
   - Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
   - Type: `Context: Start Session`
   - Enter your intent when prompted

2. **Make some edits:**
   - Create or edit files
   - The extension will track your changes

3. **End the Session:**
   - Press `Cmd+Shift+P`
   - Type: `Context: End Session`
   - Refine your intent and add key decisions

4. **View Summary:**
   - Press `Cmd+Shift+P`
   - Type: `Context: Explain From Memory`
   - See the formatted summary

5. **Get Context for AI:**
   - Press `Cmd+Shift+P`
   - Type: `Context: Get Context for AI`
   - Context is copied to clipboard

### Debugging

- Set breakpoints in `src/extension.ts`
- Use the Debug Console to see logs
- Check the Output panel for extension logs

## Step 4: Package the Extension (For Distribution)

### Install vsce (VS Code Extension Manager)

```bash
npm install -g @vscode/vsce
```

### Package the Extension

```bash
vsce package
```

This creates a `.vsix` file (e.g., `vibe-context-0.0.1.vsix`)

## Step 5: Install the Extension Locally

### Method 1: Install from VSIX file

1. Open VS Code/Cursor
2. Go to Extensions view (`Cmd+Shift+X` or `Ctrl+Shift+X`)
3. Click the `...` menu (top right)
4. Select "Install from VSIX..."
5. Choose your `.vsix` file

### Method 2: Install via Command Line

```bash
code --install-extension vibe-context-0.0.1.vsix
```

Or for Cursor:
```bash
cursor --install-extension vibe-context-0.0.1.vsix
```

## Step 6: Verify Installation

1. Open VS Code/Cursor
2. Go to Extensions view
3. Search for "Vibe Context"
4. You should see it installed
5. The extension activates automatically when VS Code starts

## Troubleshooting

### Extension not loading?

1. Check the Output panel: `View > Output`
2. Select "Log (Extension Host)" from the dropdown
3. Look for errors

### Commands not appearing?

1. Reload the window: `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
2. Or: `Cmd+Shift+P` > "Developer: Reload Window"

### TypeScript errors?

1. Make sure dependencies are installed: `npm install`
2. Check `tsconfig.json` is correct
3. Run: `npm run compile` to see errors

### Extension Development Host not opening?

1. Check `.vscode/launch.json` exists
2. Make sure `out/extension.js` exists (run `npm run compile`)
3. Check the Debug Console for errors

## Development Workflow

1. **Make changes** to `src/extension.ts`
2. **Run `npm run watch`** in terminal (auto-compiles on save)
3. **Press `F5`** to test in Extension Development Host
4. **Test your changes** in the new window
5. **Stop debugging** when done
6. **Repeat** as needed

## Publishing to VS Code Marketplace (Optional)

If you want to publish publicly:

1. Create a publisher account at [marketplace.visualstudio.com](https://marketplace.visualstudio.com)
2. Get a Personal Access Token
3. Run: `vsce publish`

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run compile` | Compile TypeScript once |
| `npm run watch` | Watch and auto-compile |
| `F5` | Launch extension in debug mode |
| `vsce package` | Create .vsix file |
| `code --install-extension *.vsix` | Install extension |

## Commands Available in Extension

1. **Context: Start Session** - Start tracking with intent
2. **Context: End Session** - End session and capture final intent
3. **Context: Explain From Memory** - View session summary
4. **Context: Get Context for AI** - Copy context to clipboard

---

Happy coding! 🚀


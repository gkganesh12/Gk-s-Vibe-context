# How to Use Vibe Context Extension

## ⚠️ IMPORTANT: Where to Run Commands

**DO NOT type commands in the Debug Console!** 

The Debug Console is a JavaScript REPL - it will try to execute your text as code and give errors.

## ✅ Correct Way: Use Command Palette

### Step 1: Open Command Palette

- **Mac**: Press `Cmd + Shift + P`
- **Windows/Linux**: Press `Ctrl + Shift + P`

### Step 2: Type the Command

Type one of these (you'll see them appear as you type):

- `Context: Start Session`
- `Context: End Session`
- `Context: Explain From Memory`
- `Context: Get Context for AI`

### Step 3: Select and Execute

- Use arrow keys to select the command
- Press `Enter` to execute

---

## Quick Test Workflow

### 1. Start a Session

1. Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
2. Type: `Context: Start Session`
3. Press `Enter`
4. Enter your intent (or press Escape to skip)
5. You'll see: "Vibe Context: Session started..."

### 2. Make Some Edits

- Create or edit files in your workspace
- The extension automatically tracks files you modify

### 3. End the Session

1. Press `Cmd+Shift+P`
2. Type: `Context: End Session`
3. Press `Enter`
4. Refine your intent (optional)
5. Add key decisions (optional)
6. You'll see: "Vibe Context: Session ended..."

### 4. View Summary

1. Press `Cmd+Shift+P`
2. Type: `Context: Explain From Memory`
3. Press `Enter`
4. A new document opens with your session summary

### 5. Get Context for AI

1. Press `Cmd+Shift+P`
2. Type: `Context: Get Context for AI`
3. Press `Enter`
4. Context is copied to clipboard
5. Paste it into your AI chat!

---

## Troubleshooting

### Commands Not Showing?

1. **Reload the window:**
   - Press `Cmd+Shift+P`
   - Type: `Developer: Reload Window`
   - Press `Enter`

2. **Check extension is active:**
   - Open Output panel: `View > Output`
   - Select "Log (Extension Host)" from dropdown
   - Look for: "Vibe Context extension activated!"

### Extension Not Activating?

1. **Check if extension loaded:**
   - Go to Extensions view (`Cmd+Shift+X`)
   - Search for "Vibe Context"
   - Make sure it's enabled

2. **Check for errors:**
   - Open Output panel
   - Look for any red error messages

### Still Having Issues?

1. **Recompile:**
   ```bash
   npm run compile
   ```

2. **Restart Extension Host:**
   - Press `Cmd+Shift+P`
   - Type: `Developer: Restart Extension Host`

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Press Cmd+Shift+P (or Ctrl+Shift+P)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Command Palette Opens                  │
│                                         │
│  > Context: Start Session              │
│    Context: End Session                 │
│    Context: Explain From Memory         │
│    Context: Get Context for AI          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Select command and press Enter         │
└─────────────────────────────────────────┘
```

---

## Common Mistakes

❌ **DON'T:** Type in Debug Console (bottom panel)
✅ **DO:** Use Command Palette (`Cmd+Shift+P`)

❌ **DON'T:** Type just "Start Session"
✅ **DO:** Type "Context: Start Session" (full command name)

❌ **DON'T:** Run commands in terminal
✅ **DO:** Use Command Palette in VS Code/Cursor window

---

## Need Help?

Check the Output panel for logs:
- `View > Output`
- Select "Log (Extension Host)"
- Look for "Vibe Context" messages


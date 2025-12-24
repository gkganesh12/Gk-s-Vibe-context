# 🎯 Vibe Context

> **Capture session-level developer intent during coding** - Never forget why you wrote code again!

[![VS Code](https://img.shields.io/badge/VS%20Code-1.74+-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Vibe Context** is a VS Code/Cursor extension that automatically captures and preserves your coding intent during development sessions. It prevents context loss, reduces AI hallucination, and helps you remember *why* you wrote code - without interrupting your flow.

---

## ✨ Features

### 🎯 **Session Tracking**
- **Auto-detect** when you start coding
- **Track files** you edit automatically
- **Capture code snippets** for context
- **One session at a time** - clean, focused tracking

### 💭 **Intent Capture**
- **Start Intent**: Capture your goal when you begin
- **End Intent**: Refine what you accomplished
- **Key Decisions**: Record important choices made during coding
- **Never mandatory** - skip anytime with Escape

### 📊 **Rich Context**
- **File tracking** with modification timestamps
- **Code snippets** from edited files
- **Git diff summary** for tracked files
- **Timeline** with session duration

### 🤖 **AI Integration Ready**
- **One-click context export** to clipboard
- **Markdown formatted** for easy AI consumption
- **Complete session summary** with all details
- **Context quality indicator** (0-100% score)
- **Quality warnings** for low-quality context

### ⌨️ **Easy to Use**
- **Keyboard shortcuts** for quick access
- **Status bar button** for visual feedback
- **Command Palette** integration
- **Zero configuration** required

---

## 🚀 Quick Start

### Installation

#### From VSIX (Recommended)
1. Download the latest `.vsix` file from [Releases](https://github.com/gkganesh12/Gk-s-Vibe-context/releases)
2. Open VS Code/Cursor
3. Go to **Extensions** (`Cmd+Shift+X`)
4. Click **`...`** menu → **Install from VSIX...**
5. Select the downloaded file

#### From Source
```bash
git clone https://github.com/gkganesh12/Gk-s-Vibe-context.git
cd Gk-s-Vibe-context
npm install
npm run compile
```

Then press `F5` in VS Code to launch Extension Development Host.

---

## 📖 Usage Guide

### 🎬 Starting a Session

**Method 1: Keyboard Shortcut**
- Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux)

**Method 2: Status Bar**
- Click the **`▶ Start Session`** button in the bottom-right status bar

**Method 3: Command Palette**
- Press `Cmd+Shift+P` → Type `Context: Start Session`

When prompted, enter your intent (optional) or press Escape to skip.

### 💻 During Session

Just code normally! The extension automatically:
- ✅ Tracks files you edit
- ✅ Captures code snippets
- ✅ Records timestamps
- ✅ Monitors git changes

### 🏁 Ending a Session

**Method 1: Keyboard Shortcut**
- Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows/Linux)

**Method 2: Status Bar**
- Click the **`■ End Session`** button (orange when active)

**Method 3: Command Palette**
- Press `Cmd+Shift+P` → Type `Context: End Session`

You'll be prompted to:
1. **Refine your intent** (optional)
2. **Add key decisions** (optional)

### 📋 Viewing Session Summary

**Method 1: Keyboard Shortcut**
- Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)

**Method 2: Command Palette**
- Press `Cmd+Shift+P` → Type `Context: Explain From Memory`

A beautifully formatted summary will open showing:
- 🟢 Context Quality score (0-100%)
- 📋 Intent (start & end)
- 💡 Key decisions
- ⏱️ Timeline
- 📁 Files touched
- 🔀 Git diff summary
- 🔗 Related sessions (if any)

### 🔍 Searching Sessions

**Keyboard Shortcut**
- Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows/Linux)

**Command Palette**
- Press `Cmd+Shift+P` → Type `Context: Search Sessions`

Search by:
- Intent keywords
- File paths
- Labels
- Dates

### 📊 Session Analytics

View comprehensive statistics about your sessions:
- Press `Cmd+Shift+P` → Type `Context: Show Session Analytics`

### 🤖 Getting Context for AI

**Method 1: Keyboard Shortcut**
- Press `Cmd+Shift+C`

**Method 2: Command Palette**
- Press `Cmd+Shift+P` → Type `Context: Get Context for AI`

Context is automatically copied to your clipboard in markdown format - ready to paste into any AI chat!

---

## ⌨️ Keyboard Shortcuts

| Action | Mac | Windows/Linux | Description |
|--------|-----|---------------|-------------|
| **Start Session** | `Cmd+Shift+V` | `Ctrl+Shift+V` | Begin tracking a coding session |
| **End Session** | `Cmd+Shift+E` | `Ctrl+Shift+E` | End current session and save |
| **View Summary** | `Cmd+Shift+X` | `Ctrl+Shift+X` | Show session summary |
| **Copy for AI** | `Cmd+Shift+C` | `Ctrl+Shift+C` | Copy context to clipboard |
| **Search Sessions** | `Cmd+Shift+F` | `Ctrl+Shift+F` | Search past sessions |

> 💡 **Tip**: You can customize these shortcuts in VS Code Settings → Keyboard Shortcuts (`Cmd+K Cmd+S`)

---

## 🎨 Visual Indicators

### Status Bar
The extension adds a button to the bottom-right status bar:

- **`▶ Start Session`** - No active session (click to start)
- **`■ End Session`** - Session active (orange background, click to end)

### Notifications
- 🟢 **Green messages** when session starts/ends
- ⚠️ **Warnings** if you try to start a session when one is already active

---

## 📁 What Gets Tracked?

### Automatically Captured
- ✅ **Files you edit** (with full paths)
- ✅ **Code snippets** (first 50 lines of each file)
- ✅ **Modification timestamps** (per file)
- ✅ **Git diff summary** (for tracked files only)
- ✅ **Session timeline** (start, end, duration)

### Manually Captured (Optional)
- 💭 **Start intent** - What you plan to work on
- 💭 **End intent** - What you accomplished
- 💡 **Key decisions** - Important choices you made

---

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- VS Code or Cursor IDE

### Setup
```bash
# Clone the repository
git clone https://github.com/gkganesh12/Gk-s-Vibe-context.git
cd Gk-s-Vibe-context

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch
```

### Testing
1. Open the project in VS Code/Cursor
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window
4. Check Output panel → "Log (Extension Host)" for debug logs

### Building
```bash
# Install vsce globally
npm install -g @vscode/vsce

# Package extension
vsce package
```

This creates a `.vsix` file you can install or distribute.

---

## 📚 Documentation

- **[How to Use](HOW_TO_USE.md)** - Quick start and usage guide
- **[Execution Flow](EXECUTION-FLOW.md)** - Complete developer workflow guide
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Changelog](CHANGELOG.md)** - Version history and changes
- **[Release Notes](RELEASE-NOTES.md)** - Latest release information

---

## 🎯 Use Cases

### For Solo Developers
- Remember why you wrote code weeks later
- Document decisions without interrupting flow
- Quick context for code reviews

### For Indie Hackers
- Track feature development sessions
- Capture product decisions
- Build context for future iterations

### For AI-Assisted Coding
- Provide accurate context to AI tools
- Reduce AI hallucination
- Better code explanations

---

## 🛠️ Technical Details

### Architecture
- **Language**: TypeScript
- **Framework**: VS Code Extension API
- **Storage**: VS Code Global State (local-first)
- **No external dependencies** (except dev dependencies)

### Data Structure
- **In-memory** for active sessions
- **Persistent** for ended sessions (survives extension reloads)
- **No source code storage** - only metadata and snippets
- **Privacy-first** - all data stays local

### Performance
- **Zero noticeable latency**
- **Lightweight** - minimal resource usage
- **Non-blocking** - never interrupts your flow

---

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details.

**Quick Start**:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and add tests
4. Commit following [conventional commits](https://www.conventionalcommits.org/)
5. Push to your fork (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

**Requirements**:
- All tests must pass
- Code must compile without errors
- Follow existing code style
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for developers who value context and intent
- Inspired by the need to prevent context loss during "vibe coding"
- Designed with flow-preservation in mind

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/gkganesh12/Gk-s-Vibe-context/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/gkganesh12/Gk-s-Vibe-context/discussions)
- 📧 **Email**: Open an issue for contact

---

## ⭐ Show Your Support

If you find this extension helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

---

<div align="center">

**Made with ❤️ for developers who code with intent**

[⬆ Back to Top](#-vibe-context)

</div>


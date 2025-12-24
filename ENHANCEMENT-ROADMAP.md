# Vibe Context — Enhancement Roadmap & Implementation Guide

## 🎯 Quick Summary

**Current Status**: Core features are ~90% complete, but real-world usability features are missing.

**Top 3 Priorities**:

1. **Session Search** - Find sessions quickly
2. **Context Quality Indicator** - Know if context is good enough
3. **Related Sessions** - See connections between sessions

---

## 🚀 Priority 1: Session Search (High Impact, Medium Effort)

### Problem

Users have 20+ sessions and can't find the one they need. Current "List Sessions" shows all, but no search.

### Solution

Add fuzzy search by intent, label, file path, or date.

### Implementation

```typescript
// Add to extension.ts

private async searchSessions(): Promise<void> {
    const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
    if (history.length === 0) {
        vscode.window.showWarningMessage('No session history found.');
        return;
    }

    const query = await vscode.window.showInputBox({
        prompt: 'Search sessions (intent, label, file path, or date)',
        placeHolder: 'e.g., "authentication", "2024-01", "login.ts"',
        ignoreFocusOut: true,
    });

    if (!query) return;

    const lowerQuery = query.toLowerCase();
    const matches = history.filter(session => {
        const intent = (session.startIntent || session.endIntent || '').toLowerCase();
        const label = (session.label || '').toLowerCase();
        const files = session.filesTouched.map(f =>
            typeof f === 'string' ? f : f.filePath
        ).join(' ').toLowerCase();
        const date = new Date(session.startTime).toLocaleDateString().toLowerCase();

        return intent.includes(lowerQuery) ||
               label.includes(lowerQuery) ||
               files.includes(lowerQuery) ||
               date.includes(lowerQuery);
    });

    if (matches.length === 0) {
        vscode.window.showInformationMessage(`No sessions found matching "${query}"`);
        return;
    }

    const pickItems = matches.map((session, index) => {
        const start = new Date(session.startTime);
        const intent = session.startIntent || session.endIntent || 'No intent';
        const pin = session.pinned ? '📌 ' : '';
        const label = session.label ? ` — ${session.label}` : '';
        return {
            label: `${pin}${intent}${label}`,
            description: `${start.toLocaleString()}`,
            detail: `${session.filesTouched.length} file(s)`,
            session,
        };
    });

    const picked = await vscode.window.showQuickPick(pickItems, {
        placeHolder: `Found ${matches.length} session(s)`,
        matchOnDetail: true,
    });

    if (picked) {
        this.endedSession = picked.session;
        this.context.globalState.update('vibeContext.endedSession', picked.session);
        vscode.window.showInformationMessage('Session loaded. Use queries or context panel.');
    }
}
```

### Register Command

```typescript
const searchCommand = vscode.commands.registerCommand(
  "vibeContext.searchSessions",
  () => this.searchSessions()
);
```

### Add to package.json

```json
{
  "command": "vibeContext.searchSessions",
  "title": "Context: Search Sessions",
  "category": "Vibe Context"
}
```

**Estimated Time**: 2-3 hours

---

## 🚀 Priority 2: Context Quality Indicator (High Impact, Low Effort)

### Problem

Users don't know if their context is sufficient for AI. They export context but it might be incomplete.

### Solution

Calculate and display a "context quality score" (0-100%) based on:

- Intent present: +30%
- End intent present: +20%
- Key decisions present: +20%
- Files tracked: +15% (if > 0 files)
- Git diff available: +15% (if workspace files)

### Implementation

```typescript
// Add to extension.ts

private calculateContextQuality(session: SessionData | SessionDataInternal): number {
    let score = 0;

    // Intent (50% total)
    if (session.startIntent) score += 30;
    const endIntent = (session as SessionData).endIntent || (session as SessionDataInternal).endIntent;
    if (endIntent) score += 20;

    // Decisions (20%)
    const decisions = (session as SessionData).keyDecisions || (session as SessionDataInternal).keyDecisions || [];
    if (decisions.length > 0) score += 20;

    // Files tracked (15%)
    const files = session.filesTouched instanceof Map
        ? Array.from(session.filesTouched.values())
        : session.filesTouched || [];
    if (files.length > 0) score += 15;

    // Git diff (15%)
    if (session.diffSummary && session.diffSummary.includes('Git diff')) {
        score += 15;
    }

    return Math.min(100, score);
}

private getQualityEmoji(score: number): string {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    if (score >= 40) return '🟠';
    return '🔴';
}

// Update formatSessionSummary to include quality
private formatSessionSummary(session: SessionData | SessionDataInternal): string {
    // ... existing code ...

    const quality = this.calculateContextQuality(session);
    const emoji = this.getQualityEmoji(quality);

    // Add at the top after header
    summary += `${emoji} Context Quality: ${quality}%\n`;
    if (quality < 60) {
        summary += `⚠️  Low quality context. Consider adding intent, decisions, or ensuring git diff is available.\n`;
    }
    summary += `\n`;

    // ... rest of existing code ...
}

// Update getContextForAI to show quality
private async getContextForAI(): Promise<void> {
    // ... existing code ...

    const session = this.activeSession || this.endedSession;
    if (!session) {
        vscode.window.showWarningMessage('No session data available.');
        return;
    }

    const quality = this.calculateContextQuality(session);
    const emoji = this.getQualityEmoji(quality);

    if (quality < 60) {
        const proceed = await vscode.window.showWarningMessage(
            `${emoji} Context quality is ${quality}% (low). This may lead to AI hallucinations. Proceed?`,
            'Proceed Anyway',
            'Cancel'
        );
        if (proceed !== 'Proceed Anyway') return;
    }

    const context = this.formatContextForAI(session);
    await this.copyContextToClipboard(context);

    vscode.window.showInformationMessage(
        `Vibe Context copied! Quality: ${emoji} ${quality}%`
    );
}
```

**Estimated Time**: 1-2 hours

---

## 🚀 Priority 3: Related Sessions (Medium Impact, Medium Effort)

### Problem

Users can't see how current work relates to past sessions. They might be working on the same feature across multiple sessions.

### Solution

Detect sessions that:

- Touched the same files
- Have similar intents (keyword matching)
- Happened within 7 days

### Implementation

```typescript
// Add to extension.ts

private findRelatedSessions(
    targetSession: SessionData,
    allSessions: SessionData[]
): SessionData[] {
    const related: Array<{ session: SessionData; score: number }> = [];

    // Get target file paths
    const targetFiles = new Set(
        targetSession.filesTouched.map(f =>
            typeof f === 'string' ? f : f.filePath
        )
    );

    // Get target intent keywords
    const targetIntent = (targetSession.startIntent || targetSession.endIntent || '').toLowerCase();
    const targetKeywords = targetIntent.split(/\s+/).filter(w => w.length > 3);

    const targetDate = new Date(targetSession.startTime);

    for (const session of allSessions) {
        if (session.startTime === targetSession.startTime) continue; // Skip self

        let score = 0;

        // File overlap (40 points max)
        const sessionFiles = new Set(
            session.filesTouched.map(f =>
                typeof f === 'string' ? f : f.filePath
            )
        );
        const fileOverlap = [...targetFiles].filter(f => sessionFiles.has(f)).length;
        score += Math.min(40, fileOverlap * 10);

        // Intent similarity (30 points max)
        const sessionIntent = (session.startIntent || session.endIntent || '').toLowerCase();
        const keywordMatches = targetKeywords.filter(kw => sessionIntent.includes(kw)).length;
        score += Math.min(30, keywordMatches * 10);

        // Time proximity (30 points max)
        const sessionDate = new Date(session.startTime);
        const daysDiff = Math.abs((targetDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
            score += Math.max(0, 30 - (daysDiff * 4));
        }

        if (score > 20) { // Threshold
            related.push({ session, score });
        }
    }

    // Sort by score, return top 5
    return related
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(r => r.session);
}

// Update showContextPanel to show related sessions
private async showContextPanel(): Promise<void> {
    const session = this.getSessionForQueries();
    if (!session) {
        vscode.window.showWarningMessage('No session data available.');
        return;
    }

    let summary = this.formatSessionSummary(session);

    // Add related sessions section
    if (session.startTime) {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        const sessionData = session.startTime instanceof Date
            ? this.convertInternalToData(session)
            : session as SessionData;

        const related = this.findRelatedSessions(sessionData, history);

        if (related.length > 0) {
            summary += `\n🔗 RELATED SESSIONS (${related.length})\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            related.forEach((r, idx) => {
                const intent = r.startIntent || r.endIntent || 'No intent';
                const date = new Date(r.startTime).toLocaleDateString();
                summary += `${idx + 1}. ${intent} (${date})\n`;
            });
            summary += `\n`;
        }
    }

    const doc = await vscode.workspace.openTextDocument({
        content: summary,
        language: 'markdown',
    });
    await vscode.window.showTextDocument(doc, { preview: false });
}

private convertInternalToData(session: SessionDataInternal): SessionData {
    return {
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        filesTouched: Array.from(session.filesTouched.values()),
        startIntent: session.startIntent,
        endIntent: session.endIntent,
        keyDecisions: session.keyDecisions.length > 0 ? session.keyDecisions : undefined,
        diffSummary: session.diffSummary,
        fileDiffs: session.fileDiffs,
        driftSignals: session.driftSignals,
    };
}
```

**Estimated Time**: 3-4 hours

---

## 📊 Quick Wins (Low Effort, Medium Impact)

### 1. Add Keyboard Shortcut for Search

```json
{
  "command": "vibeContext.searchSessions",
  "key": "cmd+shift+f",
  "mac": "cmd+shift+f"
}
```

### 2. Show Quality in Status Bar

```typescript
// Update status bar to show quality when session is active
private updateStatusBar(): void {
    if (this.activeSession && !this.activeSession.endTime) {
        const quality = this.calculateContextQuality(this.activeSession);
        const emoji = this.getQualityEmoji(quality);
        this.statusBarItem.text = `$(stop) End Session ${emoji}${quality}%`;
        // ... rest
    }
}
```

### 3. Add Quick Quality Check Command

```typescript
const qualityCommand = vscode.commands.registerCommand(
  "vibeContext.checkContextQuality",
  () => {
    const session = this.getSessionForQueries();
    if (!session) {
      vscode.window.showWarningMessage("No session available.");
      return;
    }
    const quality = this.calculateContextQuality(session);
    const emoji = this.getQualityEmoji(quality);
    const tips = this.getQualityTips(session, quality);

    vscode.window.showInformationMessage(
      `${emoji} Context Quality: ${quality}%\n${tips}`,
      { modal: true }
    );
  }
);
```

---

## 🧪 Testing Recommendations

### For Session Search

```typescript
// tests/search.test.ts
import assert from "assert";

function searchSessions(query: string, sessions: SessionData[]): SessionData[] {
  // Test implementation
}

// Test cases
assert.strictEqual(searchSessions("auth", sessions).length, 2);
assert.strictEqual(searchSessions("2024-01", sessions).length, 5);
```

### For Context Quality

```typescript
// tests/quality.test.ts
import assert from "assert";

function calculateQuality(session: SessionData): number {
  // Test implementation
}

const perfectSession = {
  startIntent: "Add auth",
  endIntent: "Auth added",
  keyDecisions: ["Used JWT"],
  filesTouched: [{ filePath: "auth.ts" }],
  diffSummary: "Git diff available",
};

assert.strictEqual(calculateQuality(perfectSession), 100);
```

---

## 📝 Next Steps

1. **Implement Priority 1** (Session Search) - 2-3 hours
2. **Implement Priority 2** (Quality Indicator) - 1-2 hours
3. **Implement Priority 3** (Related Sessions) - 3-4 hours
4. **Add tests** - 2-3 hours
5. **Update documentation** - 1 hour

**Total Estimated Time**: 9-13 hours (1-2 days of focused work)

---

## 🎯 Success Criteria

After implementing these 3 priorities:

✅ Users can find sessions in < 5 seconds
✅ Users know if context is good enough for AI
✅ Users can see connections between related work
✅ Extension solves real "vibe coder" problems
✅ Better user experience with minimal complexity

---

## 💡 Future Enhancements (After Priorities)

1. **Git Commit Integration** - Link sessions to commits
2. **Pattern Detection** - Identify hot spots, trends
3. **Issue Linking** - Connect to GitHub/Jira
4. **Context Templates** - Reusable intent patterns
5. **Export/Backup** - Data safety and portability

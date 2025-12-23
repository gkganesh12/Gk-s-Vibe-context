import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { parseDiffStat, isSensitivePath, DiffStat } from './utils/driftUtils';

const execAsync = promisify(exec);
const SESSION_HISTORY_KEY = 'vibeContext.sessionHistory';
const SESSION_HISTORY_LIMIT = 20;
const DRIFT_NOTIFY_KEY = 'vibeContext.driftNotifyEnabled';

interface FileChange {
    filePath: string;
    snippets?: CodeSnippet[];
    lastModified: string;
}

interface CodeSnippet {
    lineStart: number;
    lineEnd: number;
    content: string;
    context?: string; // What was changed/added
}

interface SessionData {
    startTime: string; // ISO string for serialization
    endTime?: string;
    filesTouched: FileChange[]; // Enhanced file tracking
    startIntent?: string; // Intent at session start
    endIntent?: string; // Intent at session end (can update/refine)
    keyDecisions?: string[]; // Key decisions made during session
    diffSummary?: string;
    fileDiffs?: FileDiff[];
    driftSignals?: DriftSignal[];
    label?: string;
    pinned?: boolean;
}

interface SessionDataInternal {
    startTime: Date;
    endTime?: Date;
    filesTouched: Map<string, FileChange>; // Map for efficient updates
    startIntent?: string;
    endIntent?: string;
    keyDecisions: string[];
    diffSummary?: string;
    fileDiffs?: FileDiff[];
    driftSignals?: DriftSignal[];
    label?: string;
    pinned?: boolean;
}

interface DriftSignal {
    filePath?: string;
    signal: string;
    value?: number;
    reason: string;
    severity: 'info' | 'warn';
    confidence?: 'low' | 'medium' | 'high';
}

interface FileDiff {
    filePath: string;
    diff: string;
}

class VibeContextExtension {
    private activeSession: SessionDataInternal | null = null;
    private endedSession: SessionData | null = null;
    private hasPromptedForSession: boolean = false;
    private disposables: vscode.Disposable[] = [];
    private context!: vscode.ExtensionContext;
    private statusBarItem!: vscode.StatusBarItem;

    public activate(context: vscode.ExtensionContext): void {
        this.context = context;

        // Log activation
        console.log('Vibe Context extension activated!');

        // Restore ended session from previous activation
        this.restoreEndedSession();
        this.ensureDriftNotifyDefault();
        // Register commands
        const startCommand = vscode.commands.registerCommand(
            'vibeContext.startSession',
            () => this.startSession()
        );
        const endCommand = vscode.commands.registerCommand(
            'vibeContext.endSession',
            () => this.endSession()
        );
        const explainCommand = vscode.commands.registerCommand(
            'vibeContext.explainFromMemory',
            () => this.explainFromMemory()
        );
        const getContextCommand = vscode.commands.registerCommand(
            'vibeContext.getContextForAI',
            () => this.getContextForAI()
        );
        const queryWhyCommand = vscode.commands.registerCommand(
            'vibeContext.queryWhyCode',
            () => this.handleQuery('why')
        );
        const queryDecisionsCommand = vscode.commands.registerCommand(
            'vibeContext.queryDecisions',
            () => this.handleQuery('decisions')
        );
        const queryWhatChangedCommand = vscode.commands.registerCommand(
            'vibeContext.queryWhatChanged',
            () => this.handleQuery('changes')
        );
        const contextPanelCommand = vscode.commands.registerCommand(
            'vibeContext.showContextPanel',
            () => this.showContextPanel()
        );
        const loadSessionCommand = vscode.commands.registerCommand(
            'vibeContext.loadSession',
            () => this.loadSessionFromHistory()
        );
        const listSessionsCommand = vscode.commands.registerCommand(
            'vibeContext.listSessions',
            () => this.listSessions()
        );
        const clearHistoryCommand = vscode.commands.registerCommand(
            'vibeContext.clearSessionHistory',
            () => this.clearSessionHistory()
        );
        const deleteHistoryEntryCommand = vscode.commands.registerCommand(
            'vibeContext.deleteSessionFromHistory',
            () => this.deleteSessionFromHistory()
        );
        const toggleDriftNotifyCommand = vscode.commands.registerCommand(
            'vibeContext.toggleDriftNotifications',
            () => this.toggleDriftNotifications()
        );
        const pinSessionCommand = vscode.commands.registerCommand(
            'vibeContext.pinSession',
            () => this.pinCurrentSession()
        );
        const unpinSessionCommand = vscode.commands.registerCommand(
            'vibeContext.unpinSession',
            () => this.unpinCurrentSession()
        );
        const labelSessionCommand = vscode.commands.registerCommand(
            'vibeContext.labelSession',
            () => this.labelCurrentSession()
        );
        const labelSessionFromHistoryCommand = vscode.commands.registerCommand(
            'vibeContext.labelSessionFromHistory',
            () => this.labelSessionFromHistory()
        );
        const exportSessionCommand = vscode.commands.registerCommand(
            'vibeContext.exportSession',
            () => this.exportCurrentSession()
        );
        const exportSessionToFileCommand = vscode.commands.registerCommand(
            'vibeContext.exportSessionToFile',
            () => this.exportCurrentSessionToFile()
        );

        context.subscriptions.push(
            startCommand,
            endCommand,
            explainCommand,
            getContextCommand,
            queryWhyCommand,
            queryDecisionsCommand,
            queryWhatChangedCommand,
            contextPanelCommand,
            loadSessionCommand,
            listSessionsCommand,
            clearHistoryCommand,
            deleteHistoryEntryCommand,
            toggleDriftNotifyCommand,
            pinSessionCommand,
            unpinSessionCommand,
            labelSessionCommand,
            labelSessionFromHistoryCommand,
            exportSessionCommand,
            exportSessionToFileCommand
        );

        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'vibeContext.startSession';
        this.statusBarItem.text = '$(play) Start Session';
        this.statusBarItem.tooltip = 'Start Vibe Context Session (Cmd+Shift+V)';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        console.log('Vibe Context: All commands registered successfully');

        // Listen for file changes to auto-detect first edit
        // This fires on EVERY keystroke, so we track immediately
        const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
            (event: vscode.TextDocumentChangeEvent) => {
                // Only process if there are actual content changes
                if (event.contentChanges.length === 0) {
                    return;
                }
                
                console.log(`Vibe Context: File changed - ${event.document.fileName}, Active session: ${!!this.activeSession}, Changes: ${event.contentChanges.length}`);
                
                const firstChange = event.contentChanges[0];

                if (!this.activeSession && !this.hasPromptedForSession) {
                    this.handleFirstFileEdit(event.document);
                } else if (this.activeSession) {
                    // Track immediately on any change, even if not saved
                    this.trackFileEdit(event.document, firstChange ? firstChange.range : undefined);
                }
            }
        );

        // Also listen for when documents are saved (in case edits weren't tracked)
        const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument(
            (document: vscode.TextDocument) => {
                if (this.activeSession && (document.uri.scheme === 'file' || document.uri.scheme === 'untitled')) {
                    console.log(`Vibe Context: File saved - ${document.fileName}, ensuring it's tracked`);
                    this.trackFileEdit(document);
                    // Force snippet update on save
                    this.captureCodeSnippet(document, document.uri.scheme === 'untitled' 
                        ? `untitled:${document.fileName}` 
                        : document.uri.fsPath);
                }
            }
        );

        // Track active editor changes (when user switches tabs)
        const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
            (editor: vscode.TextEditor | undefined) => {
                if (this.activeSession && editor && (editor.document.uri.scheme === 'file' || editor.document.uri.scheme === 'untitled')) {
                    console.log(`Vibe Context: Active editor changed - ${editor.document.fileName}`);
                    this.trackFileEdit(editor.document);
                }
            }
        );

        const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument(
            (document: vscode.TextDocument) => {
                if (this.activeSession && (document.uri.scheme === 'file' || document.uri.scheme === 'untitled')) {
                    console.log(`Vibe Context: File opened - ${document.fileName}`);
                    this.trackFileEdit(document);
                }
            }
        );

        const onDidCloseTextDocument = vscode.workspace.onDidCloseTextDocument(
            (document: vscode.TextDocument) => {
                if (this.activeSession && (document.uri.scheme === 'file' || document.uri.scheme === 'untitled')) {
                    console.log(`Vibe Context: File closed - ${document.fileName}`);
                    // Optionally mark last modified to closure moment
                    this.trackFileEdit(document);
                }
            }
        );

        context.subscriptions.push(onDidChangeTextDocument, onDidSaveTextDocument, onDidChangeActiveTextEditor, onDidOpenTextDocument, onDidCloseTextDocument);
        this.disposables = context.subscriptions;
    }

    private restoreEndedSession(): void {
        const stored = this.context.globalState.get<SessionData>('vibeContext.endedSession');
        if (stored) {
            this.endedSession = stored;
        }
    }

    private appendToHistory(session: SessionData): void {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        const pinned = history.filter(h => h.pinned);
        const unpinned = history.filter(h => !h.pinned);
        const ordered = session.pinned ? [session, ...pinned, ...unpinned] : [...pinned, session, ...unpinned];
        const next = ordered.slice(0, SESSION_HISTORY_LIMIT);
        this.context.globalState.update(SESSION_HISTORY_KEY, next);
    }

    private ensureDriftNotifyDefault(): void {
        const current = this.context.globalState.get<boolean>(DRIFT_NOTIFY_KEY);
        if (current === undefined) {
            this.context.globalState.update(DRIFT_NOTIFY_KEY, true);
        }
    }

    private updateHistorySession(updated: SessionData): void {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        const next = history.map(h => h.startTime === updated.startTime ? updated : h);
        // Re-apply pinned ordering and trim
        const pinned = next.filter(h => h.pinned);
        const unpinned = next.filter(h => !h.pinned);
        const ordered = [...pinned, ...unpinned].slice(0, SESSION_HISTORY_LIMIT);
        this.context.globalState.update(SESSION_HISTORY_KEY, ordered);
    }

    private isDriftNotifyEnabled(): boolean {
        const current = this.context.globalState.get<boolean>(DRIFT_NOTIFY_KEY);
        return current === undefined ? true : current;
    }

    private saveEndedSession(session: SessionData): void {
        this.endedSession = session;
        this.context.globalState.update('vibeContext.endedSession', session);
        this.appendToHistory(session);
    }

    private handleFirstFileEdit(document: vscode.TextDocument): void {
        // Only track workspace files
        if (document.uri.scheme !== 'file') {
            return;
        }

        this.hasPromptedForSession = true;

        vscode.window
            .showInformationMessage(
                'Vibe Context: Would you like to start a session?',
                'Start Session',
                'Not Now'
            )
            .then((selection: string | undefined) => {
                if (selection === 'Start Session') {
                    this.startSession();
                    // Track the file that triggered the prompt
                    if (this.activeSession) {
                        this.trackFileEdit(document);
                    }
                }
            });
    }

    private trackFileEdit(document: vscode.TextDocument, changedRange?: vscode.Range): void {
        if (!this.activeSession) {
            console.log('Vibe Context: No active session, skipping file tracking');
            return;
        }

        // Track both file and untitled files (unsaved files)
        if (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled') {
            console.log(`Vibe Context: Skipping non-file scheme: ${document.uri.scheme}`);
            return;
        }

        // Use a consistent identifier for the file
        const filePath = document.uri.scheme === 'untitled' 
            ? `untitled:${document.fileName}` 
            : document.uri.fsPath;
        
        const now = new Date().toISOString();

        // Get or create file change entry
        if (!this.activeSession.filesTouched.has(filePath)) {
            this.activeSession.filesTouched.set(filePath, {
                filePath: document.uri.scheme === 'untitled' 
                    ? `Untitled: ${document.fileName}` 
                    : filePath,
                lastModified: now,
                snippets: [],
            });
            console.log(`Vibe Context: Tracking new file: ${filePath} (scheme: ${document.uri.scheme})`);
        } else {
            // Update last modified time on every change
            const fileChange = this.activeSession.filesTouched.get(filePath)!;
            fileChange.lastModified = now;
            console.log(`Vibe Context: Updated tracking for file: ${filePath}`);
        }

        // Capture a code snippet if document is accessible (always update on changes)
        this.captureCodeSnippet(document, filePath, changedRange);
    }

    private captureCodeSnippet(document: vscode.TextDocument, filePath: string, changedRange?: vscode.Range): void {
        if (!this.activeSession) return;

        try {
            const fileChange = this.activeSession.filesTouched.get(filePath);
            if (!fileChange) return;

            const lineCount = document.lineCount;
            
            // Skip if file is empty
            if (lineCount === 0) {
                return;
            }

            // Decide capture window: prefer the most recent change window to keep snippets relevant.
            let startLine = 0;
            let endLine = Math.min(lineCount - 1, 49);

            if (changedRange) {
                const padding = 5;
                startLine = Math.max(0, changedRange.start.line - padding);
                endLine = Math.min(lineCount - 1, changedRange.end.line + padding);
                if (endLine - startLine > 49) {
                    endLine = startLine + 49;
                    if (endLine >= lineCount) {
                        endLine = lineCount - 1;
                        startLine = Math.max(0, endLine - 49);
                    }
                }
            }

            const shouldUpdate = true; // always refresh to keep snippet aligned with latest change
            
            // Ensure we have valid range
            if (endLine < startLine || endLine >= lineCount) {
                return;
            }

            const lastLine = document.lineAt(endLine);
            const snippetContent = document.getText(
                new vscode.Range(startLine, 0, endLine, lastLine.text.length)
            );

            // Only store if there's actual content (at least 10 characters)
            if (snippetContent.trim().length >= 10) {
                fileChange.snippets = [{
                    lineStart: startLine + 1, // 1-indexed for display
                    lineEnd: endLine + 1,
                    content: snippetContent.substring(0, 500), // Limit snippet size
                }];
                console.log(`Vibe Context: Captured snippet for ${filePath} (lines ${startLine + 1}-${endLine + 1})`);
            }
        } catch (error) {
            console.log(`Vibe Context: Error capturing snippet: ${error}`);
            // Silently fail - snippet capture is optional
        }
    }

    private async startSession(): Promise<void> {
        if (this.activeSession) {
            vscode.window.showWarningMessage(
                'A session is already active. Please end it before starting a new one.'
            );
            return;
        }

        // Prompt for optional intent at session start
        const startIntent = await vscode.window.showInputBox({
            prompt: 'What are you planning to work on? (optional, press Escape to skip)',
            placeHolder: 'e.g., "Add user authentication", "Fix login bug", "Refactor API routes"',
            ignoreFocusOut: true,
        });

        this.activeSession = {
            startTime: new Date(),
            filesTouched: new Map<string, FileChange>(),
            startIntent: startIntent && startIntent.trim().length > 0 ? startIntent.trim() : undefined,
            keyDecisions: [],
        };

        this.hasPromptedForSession = false;
        this.endedSession = null; // Clear previous ended session when starting new one

        // Track currently open files when session starts
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.uri.scheme === 'file') {
            console.log(`Vibe Context: Tracking active file at session start: ${activeEditor.document.fileName}`);
            this.trackFileEdit(activeEditor.document);
        }

        // Track all open text documents (including unsaved ones)
        vscode.workspace.textDocuments.forEach((document) => {
            if (document.uri.scheme === 'file' || document.uri.scheme === 'untitled') {
                console.log(`Vibe Context: Tracking open file: ${document.fileName} (scheme: ${document.uri.scheme})`);
                this.trackFileEdit(document);
            }
        });

        // Update status bar
        this.updateStatusBar();

        const intentMsg = this.activeSession.startIntent 
            ? ` with intent: "${this.activeSession.startIntent}"`
            : '';
        
        vscode.window.showInformationMessage(
            `Vibe Context: Session started at ${this.activeSession.startTime.toLocaleTimeString()}${intentMsg}`
        );
    }

    private async endSession(): Promise<void> {
        if (!this.activeSession) {
            vscode.window.showWarningMessage('No active session to end.');
            return;
        }

        this.activeSession.endTime = new Date();

        // Get git diff summary if available
        try {
            const { summary, fileDiffs } = await this.getGitDiffSummary();
            this.activeSession.diffSummary = summary;
            this.activeSession.fileDiffs = fileDiffs;
        } catch (error) {
            // Git not available or not a git repo - that's okay
            this.activeSession.diffSummary = undefined;
            this.activeSession.fileDiffs = undefined;
        }

        // Show start intent if available and prompt for refinement
        const intentPrompt = this.activeSession.startIntent
            ? `Refine or update your intent (optional)\nOriginal: "${this.activeSession.startIntent}"\nPress Escape to keep original`
            : 'Enter final intent (optional, press Escape to skip)';
        
        const endIntent = await vscode.window.showInputBox({
            prompt: intentPrompt,
            placeHolder: 'What did you accomplish?',
            ignoreFocusOut: true,
        });

        if (endIntent && endIntent.trim().length > 0) {
            this.activeSession.endIntent = endIntent.trim();
        }

        // Optionally capture key decisions
        const captureDecisions = await vscode.window.showQuickPick(
            ['Yes', 'Skip'],
            {
                placeHolder: 'Would you like to add any key decisions or notes?',
                ignoreFocusOut: true,
            }
        );

        if (captureDecisions === 'Yes') {
            await this.captureKeyDecisions();
        }

        // Convert to serializable format and save
        const driftSignals = this.computeDriftSignals(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null,
            Array.from(this.activeSession.filesTouched.values()),
            this.activeSession.diffSummary
        );

        const sessionToSave: SessionData = {
            startTime: this.activeSession.startTime.toISOString(),
            endTime: this.activeSession.endTime.toISOString(),
            filesTouched: Array.from(this.activeSession.filesTouched.values()),
            startIntent: this.activeSession.startIntent,
            endIntent: this.activeSession.endIntent,
            keyDecisions: this.activeSession.keyDecisions.length > 0 
                ? this.activeSession.keyDecisions 
                : undefined,
            diffSummary: this.activeSession.diffSummary,
            driftSignals: driftSignals.length ? driftSignals : undefined,
        };

        this.saveEndedSession(sessionToSave);

        const fileCount = this.activeSession.filesTouched.size;
        vscode.window.showInformationMessage(
            `Vibe Context: Session ended. ${fileCount} file(s) tracked.`
        );

        // Clear active session
        this.activeSession = null;
        this.hasPromptedForSession = false;

        // Update status bar
        this.updateStatusBar();

        // Surface high-severity drift (non-blocking)
        this.maybeNotifyDrift(sessionToSave);
    }

    private async captureKeyDecisions(): Promise<void> {
        if (!this.activeSession) return;

        let continueAdding = true;
        while (continueAdding) {
            const decision = await vscode.window.showInputBox({
                prompt: 'Enter a key decision or note (press Escape when done)',
                placeHolder: 'e.g., "Used JWT instead of sessions", "Refactored to use hooks"',
                ignoreFocusOut: true,
            });

            if (decision && decision.trim().length > 0) {
                this.activeSession.keyDecisions.push(decision.trim());
                
                const addMore = await vscode.window.showQuickPick(
                    ['Add Another', 'Done'],
                    { placeHolder: 'Add another decision?' }
                );
                continueAdding = addMore === 'Add Another';
            } else {
                continueAdding = false;
            }
        }
    }

    private async getGitDiffSummary(): Promise<{ summary?: string; fileDiffs?: FileDiff[] }> {
        if (!this.activeSession || this.activeSession.filesTouched.size === 0) {
            return {};
        }

        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return { summary: 'No git diff: no workspace open.' };
            }

            // Get relative paths for tracked files (only real files, not untitled)
            const workspaceRoot = workspaceFolder.uri.fsPath;
            const entries = Array.from(this.activeSession.filesTouched.keys())
                .filter(filePath => !filePath.startsWith('untitled:')); // never run git for untitled/non-file

            if (entries.length === 0) {
                console.log('Vibe Context: No real files for git diff (all untitled)');
                return { summary: 'No git diff: only untitled files were edited.' };
            }

            type DiffCheck = { relative?: string; reason?: string; abs: string };
            const candidates: DiffCheck[] = [];

            for (const abs of entries) {
                if (!abs.startsWith(workspaceRoot)) {
                    candidates.push({ abs, reason: 'Outside workspace; no git diff.' });
                    continue;
                }
                let relative = vscode.workspace.asRelativePath(abs, false);
                if (relative === abs && abs.startsWith(workspaceRoot)) {
                    relative = abs.substring(workspaceRoot.length + 1);
                }
                relative = relative.replace(/\\/g, '/');
                candidates.push({ abs, relative });
            }

            const tracked: string[] = [];
            const reasons: string[] = [];

            // Check git tracking per candidate
            for (const c of candidates) {
                if (c.reason) {
                    reasons.push(`- ${c.abs}: ${c.reason}`);
                    continue;
                }
                if (!c.relative) {
                    reasons.push(`- ${c.abs}: Could not derive relative path; no git diff.`);
                    continue;
                }
                try {
                    await execAsync(`git ls-files --error-unmatch "${c.relative.replace(/"/g, '\\"')}"`, {
                        cwd: workspaceRoot,
                    });
                    tracked.push(c.relative);
                } catch (err) {
                    reasons.push(`- ${c.relative}: Not tracked by git; no git diff.`);
                }
            }

            if (tracked.length === 0) {
                const reasonBlock = reasons.length
                    ? `Reasons:\n${reasons.join('\n')}`
                    : 'No git-tracked files in session.';
                return { summary: `No git diff available.\n${reasonBlock}` };
            }

            console.log(`Vibe Context: Getting git diff for ${tracked.length} tracked files: ${tracked.join(', ')}`);

            // Get diff summary for tracked files
            let diffSummary: string | undefined;
            try {
                const escapedFiles = tracked.map(f => `"${f.replace(/"/g, '\\"')}"`).join(' ');
                const { stdout } = await execAsync(
                    `git diff --stat -- ${escapedFiles}`,
                    {
                        cwd: workspaceRoot,
                        maxBuffer: 1024 * 1024,
                    }
                );
                diffSummary = stdout && stdout.trim().length > 0 ? stdout.trim() : undefined;
            } catch (error: any) {
                console.log(`Vibe Context: Git diff error: ${error.message}`);
            }

            // Per-file diffs (bounded)
            const fileDiffs: FileDiff[] = [];
            for (const rel of tracked.slice(0, 10)) { // cap to 10 files for safety
                try {
                    const { stdout } = await execAsync(
                        `git diff --unified=3 -- "${rel.replace(/"/g, '\\"')}"`,
                        { cwd: workspaceRoot, maxBuffer: 1024 * 1024 }
                    );
                    if (stdout && stdout.trim()) {
                        fileDiffs.push({ filePath: rel, diff: stdout.trim().substring(0, 2000) }); // cap diff length
                    }
                } catch (err) {
                    console.log(`Vibe Context: Git per-file diff error for ${rel}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }

            // Build user-facing summary with reasons for skipped files
            const lines: string[] = [];
            if (diffSummary) {
                lines.push('Git diff (tracked files):');
                lines.push(diffSummary);
            } else {
                lines.push('No git changes for tracked files.');
            }
            if (reasons.length) {
                lines.push('');
                lines.push('Skipped files:');
                lines.push(...reasons);
            }

            return { summary: lines.join('\n'), fileDiffs: fileDiffs.length ? fileDiffs : undefined };
        } catch (error) {
            // Git command failed - not a git repo or git not available
            return {};
        }
    }

    private formatSessionSummary(session: SessionData | SessionDataInternal): string {
        const startTime = session.startTime instanceof Date 
            ? session.startTime 
            : new Date(session.startTime);
        const endTime = session.endTime 
            ? (session.endTime instanceof Date ? session.endTime : new Date(session.endTime))
            : undefined;
        
        const duration = endTime
            ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
            : 0;

        // Handle both Map and Array formats
        const filesTouched = session.filesTouched instanceof Map
            ? Array.from(session.filesTouched.values())
            : Array.isArray(session.filesTouched)
            ? session.filesTouched
            : [];

        let summary = `╔═══════════════════════════════════════════════════════╗\n`;
        summary += `║           VIBE CONTEXT - SESSION SUMMARY           ║\n`;
        summary += `╚═══════════════════════════════════════════════════════╝\n\n`;

        // Intent Section
        if (session.startIntent || (session as SessionData).endIntent || (session as SessionDataInternal).endIntent) {
            summary += `📋 INTENT\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            if (session.startIntent || (session as SessionData).startIntent) {
                const startIntent = session.startIntent || (session as SessionData).startIntent;
                summary += `Start: ${startIntent}\n`;
            }
            if ((session as SessionData).endIntent || (session as SessionDataInternal).endIntent) {
                const endIntent = (session as SessionData).endIntent || (session as SessionDataInternal).endIntent;
                summary += `End:   ${endIntent}\n`;
            }
            summary += `\n`;
        }

        // Key Decisions
        const keyDecisions = (session as SessionData).keyDecisions || (session as SessionDataInternal).keyDecisions || [];
        if (keyDecisions.length > 0) {
            summary += `💡 KEY DECISIONS\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            keyDecisions.forEach((decision, idx) => {
                summary += `${idx + 1}. ${decision}\n`;
            });
            summary += `\n`;
        }

        // Timeline
        summary += `⏱️  TIMELINE\n`;
        summary += `─────────────────────────────────────────────────────\n`;
        summary += `Start:    ${startTime.toLocaleString()}\n`;
        if (endTime) {
            summary += `End:      ${endTime.toLocaleString()}\n`;
            summary += `Duration:  ${duration} minutes\n`;
        }
        summary += `\n`;

        // Files Section
        summary += `📁 FILES TOUCHED (${filesTouched.length})\n`;
        summary += `─────────────────────────────────────────────────────\n`;
        if (filesTouched.length > 0) {
            filesTouched.forEach((fileChange, idx) => {
                const filePath = typeof fileChange === 'string' ? fileChange : fileChange.filePath;
                summary += `${idx + 1}. ${filePath}\n`;
                
                // Show snippet if available
                if (typeof fileChange !== 'string' && fileChange.snippets && fileChange.snippets.length > 0) {
                    const snippet = fileChange.snippets[0];
                    summary += `   └─ Lines ${snippet.lineStart}-${snippet.lineEnd}\n`;
                }
            });
        } else {
            summary += `No files tracked.\n`;
        }
        summary += `\n`;

        // Git Diff
        if (session.diffSummary) {
            summary += `🔀 GIT DIFF SUMMARY\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            summary += `${session.diffSummary}\n`;
            summary += `\n`;
        } else {
            summary += `🔀 GIT DIFF SUMMARY\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            summary += `No git diff available (workspace not open, files outside workspace, untracked, or no changes).\n\n`;
        }

        // Per-file diffs (if present)
        const fileDiffs = (session as SessionData).fileDiffs || (session as SessionDataInternal).fileDiffs || [];
        if (fileDiffs.length > 0) {
            summary += `📄 PER-FILE DIFFS (truncated)\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            fileDiffs.slice(0, 10).forEach((fd, idx) => {
                summary += `${idx + 1}. ${fd.filePath}\n`;
                summary += '```\n';
                summary += `${fd.diff}\n`;
                summary += '```\n\n';
            });
        }

        // Drift Signals
        const driftSignals = (session as SessionData).driftSignals || (session as SessionDataInternal).driftSignals || [];
        if (driftSignals.length > 0) {
            const capped = driftSignals.slice(0, 20);
            summary += `🌊 DRIFT SIGNALS (SILENT)\n`;
            summary += `─────────────────────────────────────────────────────\n`;
            capped.forEach((ds, idx) => {
                const scope = ds.filePath ? `File: ${ds.filePath}` : 'Session';
                summary += `${idx + 1}. [${ds.severity}] ${ds.signal} — ${ds.reason} (${scope})\n`;
            });
            if (driftSignals.length > capped.length) {
                summary += `…and ${driftSignals.length - capped.length} more.\n`;
            }
            summary += `\n`;
        }

        if (!this.isDriftNotifyEnabled()) {
            summary += `🔕 Drift notifications are disabled.\n\n`;
        }

        return summary;
    }

    private async explainFromMemory(): Promise<void> {
        // Check if there's an active session that hasn't ended
        if (this.activeSession && !this.activeSession.endTime) {
            vscode.window.showWarningMessage(
                'Session is still active. Please end the session first.'
            );
            return;
        }

        // Check for ended session
        if (!this.endedSession) {
            vscode.window.showWarningMessage(
                'No session data available. Start and end a session first.'
            );
            return;
        }

        const summary = this.formatSessionSummary(this.endedSession);

        // Show in a new document
        const doc = await vscode.workspace.openTextDocument({
            content: summary,
            language: 'plaintext',
        });

        await vscode.window.showTextDocument(doc);

        // Also show in output channel for quick reference
        const outputChannel = vscode.window.createOutputChannel('Vibe Context');
        outputChannel.clear();
        outputChannel.appendLine(summary);
        outputChannel.show();
    }

    private async showContextPanel(): Promise<void> {
        const session = this.getSessionForQueries();
        if (!session) {
            vscode.window.showWarningMessage('No session data available. Start and end a session first.');
            return;
        }
        const summary = this.formatSessionSummary(session);
        const doc = await vscode.workspace.openTextDocument({
            content: summary,
            language: 'markdown',
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }

    private async getContextForAI(): Promise<void> {
        // Check if there's an active session that hasn't ended
        if (this.activeSession && !this.activeSession.endTime) {
            const useActive = await vscode.window.showQuickPick(
                ['Use Active Session', 'Cancel'],
                { placeHolder: 'Session is still active. Use current session context?' }
            );
            
            if (useActive === 'Use Active Session') {
                const context = this.formatContextForAI(this.activeSession);
                await this.copyContextToClipboard(context);
                return;
            }
            return;
        }

        // Check for ended session
        if (!this.endedSession) {
            vscode.window.showWarningMessage(
                'No session data available. Start and end a session first.'
            );
            return;
        }

        const context = this.formatContextForAI(this.endedSession);
        await this.copyContextToClipboard(context);
    }

    private async loadSessionFromHistory(): Promise<void> {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length === 0) {
            vscode.window.showWarningMessage('No session history found.');
            return;
        }

        const pickItems = history.map((session, index) => {
            const start = new Date(session.startTime);
            const end = session.endTime ? new Date(session.endTime) : null;
            const intent = session.startIntent || session.endIntent || 'No intent';
            const pin = session.pinned ? '📌 ' : '';
            const label = session.label ? ` — ${session.label}` : '';
            return {
                label: `${pin}${intent}${label}`,
                description: `${start.toLocaleString()}${end ? ` → ${end.toLocaleTimeString()}` : ''}`,
                detail: `${session.filesTouched.length} file(s) | ${index === 0 ? 'latest' : `#${index + 1}`}`,
                session,
            };
        });

        const picked = await vscode.window.showQuickPick(pickItems, {
            placeHolder: 'Select a session to load',
            matchOnDetail: true,
        });
        if (!picked) return;

        this.endedSession = picked.session;
        this.context.globalState.update('vibeContext.endedSession', picked.session);
        vscode.window.showInformationMessage('Session loaded. Queries and context panel will use this session.');
    }

    private async listSessions(): Promise<void> {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length === 0) {
            vscode.window.showWarningMessage('No session history found.');
            return;
        }

        let content = '# Vibe Context — Session History\n\n';
        history.forEach((s, idx) => {
            const start = new Date(s.startTime);
            const end = s.endTime ? new Date(s.endTime) : null;
            const intent = s.startIntent || s.endIntent || 'No intent';
            const pinLabel = s.pinned ? '📌 ' : '';
            const label = s.label ? ` — ${s.label}` : '';
            content += `## ${idx + 1}. ${pinLabel}${intent}${label}\n`;
            content += `- Start: ${start.toLocaleString()}\n`;
            content += `- End: ${end ? end.toLocaleString() : 'Active/unknown'}\n`;
            content += `- Files: ${s.filesTouched.length}\n`;
            if (s.diffSummary) {
                content += `- Git: available\n`;
            } else {
                content += `- Git: not available\n`;
            }
            content += '\n';
        });

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown',
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }

    private async clearSessionHistory(): Promise<void> {
        const confirm = await vscode.window.showQuickPick(
            ['Clear History', 'Cancel'],
            { placeHolder: 'This will remove all saved sessions from history.' }
        );
        if (confirm !== 'Clear History') return;
        await this.context.globalState.update(SESSION_HISTORY_KEY, []);
        vscode.window.showInformationMessage('Vibe Context: Session history cleared.');
    }

    private async deleteSessionFromHistory(): Promise<void> {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length === 0) {
            vscode.window.showWarningMessage('No session history found.');
            return;
        }

        const pickItems = history.map((session, index) => {
            const start = new Date(session.startTime);
            const intent = session.startIntent || session.endIntent || 'No intent';
            const pin = session.pinned ? '📌 ' : '';
            const label = session.label ? ` — ${session.label}` : '';
            return {
                label: `${pin}${intent}${label}`,
                description: `${start.toLocaleString()}`,
                detail: `${session.filesTouched.length} file(s) | ${index === 0 ? 'latest' : `#${index + 1}`}`,
                index,
            };
        });

        const picked = await vscode.window.showQuickPick(pickItems, {
            placeHolder: 'Select a session to delete from history',
            matchOnDetail: true,
        });
        if (!picked) return;

        const confirm = await vscode.window.showQuickPick(
            ['Delete', 'Cancel'],
            { placeHolder: `Delete session "${picked.label}"?` }
        );
        if (confirm !== 'Delete') return;

        const next = history.filter((_, idx) => idx !== picked.index);
        await this.context.globalState.update(SESSION_HISTORY_KEY, next);
        vscode.window.showInformationMessage('Vibe Context: Session removed from history.');
    }

    private formatContextForAI(session: SessionData | SessionDataInternal): string {
        const startTime = session.startTime instanceof Date 
            ? session.startTime 
            : new Date(session.startTime);
        const endTime = session.endTime 
            ? (session.endTime instanceof Date ? session.endTime : new Date(session.endTime))
            : undefined;

        const filesTouched = session.filesTouched instanceof Map
            ? Array.from(session.filesTouched.values())
            : Array.isArray(session.filesTouched)
            ? session.filesTouched
            : [];

        const startIntent = session.startIntent || (session as SessionData).startIntent;
        const endIntent = (session as SessionData).endIntent || (session as SessionDataInternal).endIntent;
        const keyDecisions = (session as SessionData).keyDecisions || (session as SessionDataInternal).keyDecisions || [];
        const sessionDurationMinutes = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60) : undefined;

        const sections: string[] = [];

        // Header
        sections.push('# Developer Session Context');

        // Intent
        if (startIntent || endIntent) {
            sections.push('## Intent');
            if (startIntent) sections.push(`- Initial goal: ${startIntent}`);
            if (endIntent) sections.push(`- Final outcome: ${endIntent}`);
        }

        // Decisions
        if (keyDecisions.length > 0) {
            sections.push('## Key Decisions');
            keyDecisions.forEach((d) => sections.push(`- ${d}`));
        }

        // Files
        if (filesTouched.length > 0) {
            sections.push('## Files Modified');
            filesTouched.forEach((fileChange) => {
                const fc: FileChange = typeof fileChange === 'string'
                    ? { filePath: fileChange, lastModified: '' }
                    : fileChange;
                sections.push(`- ${fc.filePath}`);
                if (fc.snippets && fc.snippets.length > 0) {
                    const snippet = fc.snippets[0];
                    sections.push('  ```');
                    sections.push(`  ${snippet.content.substring(0, 400)}`);
                    sections.push('  ```');
                }
                if (fc.lastModified) {
                    sections.push(`  - Last touched: ${fc.lastModified}`);
                }
            });
        }

        // Git Diff
        if (session.diffSummary) {
            sections.push('## Git Changes');
            sections.push('```');
            sections.push(session.diffSummary);
            sections.push('```');
        } else {
            sections.push('## Git Changes');
            sections.push('No git diff available (workspace not open, files outside workspace, untracked, or no changes).');
        }

        // Per-file diffs (if present)
        const fileDiffs = (session as SessionData).fileDiffs || (session as SessionDataInternal).fileDiffs || [];
        if (fileDiffs.length > 0) {
            sections.push('## Per-File Diffs (truncated)');
            fileDiffs.slice(0, 10).forEach((fd) => {
                sections.push(`- ${fd.filePath}`);
                sections.push('```');
                sections.push(fd.diff);
                sections.push('```');
            });
        }

        // Drift Signals (silent insights)
        const driftSignals = (session as SessionData).driftSignals || (session as SessionDataInternal).driftSignals || [];
        if (driftSignals.length > 0) {
            const capped = driftSignals.slice(0, 20);
            sections.push('## Drift Signals (silent)');
            capped.forEach((ds) => {
                const scope = ds.filePath ? `File: ${ds.filePath}` : 'Session';
                sections.push(`- [${ds.severity}] ${ds.signal} — ${ds.reason} (${scope})`);
            });
            if (driftSignals.length > capped.length) {
                sections.push(`- …and ${driftSignals.length - capped.length} more.`);
            }
        }

        if (!this.isDriftNotifyEnabled()) {
            sections.push('🔕 Drift notifications are disabled.');
        }

        // Metadata
        sections.push('## Session Metadata');
        sections.push(`- Started: ${startTime.toISOString()}`);
        if (endTime) {
            sections.push(`- Ended: ${endTime.toISOString()}`);
            sections.push(`- Duration: ${sessionDurationMinutes} minutes`);
        }

        return sections.join('\n\n');
    }

    private async copyContextToClipboard(context: string): Promise<void> {
        await vscode.env.clipboard.writeText(context);
        vscode.window.showInformationMessage(
            'Vibe Context copied to clipboard! Paste it into your AI chat.'
        );
    }

    private updateStatusBar(): void {
        if (this.activeSession && !this.activeSession.endTime) {
            // Session is active
            this.statusBarItem.command = 'vibeContext.endSession';
            this.statusBarItem.text = '$(stop) End Session';
            this.statusBarItem.tooltip = 'End Vibe Context Session (Cmd+Shift+E)';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            // No active session
            this.statusBarItem.command = 'vibeContext.startSession';
            this.statusBarItem.text = '$(play) Start Session';
            this.statusBarItem.tooltip = 'Start Vibe Context Session (Cmd+Shift+V)';
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    public deactivate(): void {
        this.disposables.forEach((d) => d.dispose());
    }

    // -------- Query Commands (Why / Decisions / What Changed) --------
    private async handleQuery(kind: 'why' | 'decisions' | 'changes'): Promise<void> {
        const session = this.getSessionForQueries();
        if (!session) {
            vscode.window.showWarningMessage('No session data available. Start and end a session first.');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Open a file to run this query.');
            return;
        }

        const fileKey = this.normalizeFileKey(editor.document);
        const fileEntry = this.findFileChange(session, fileKey);

        if (!fileEntry) {
            const msg = `No tracked data for this file${this.isWorkspaceFile(editor.document) ? ' in the current session' : ' (file outside workspace or not tracked)'}.`;
            vscode.window.showInformationMessage(`Vibe Context: ${msg}`);
            return;
        }

        let content = '';
        const startIntent = (session as SessionData).startIntent || (session as SessionDataInternal).startIntent;
        const endIntent = (session as SessionData).endIntent || (session as SessionDataInternal).endIntent;
        const decisions = (session as SessionData).keyDecisions || (session as SessionDataInternal).keyDecisions || [];
        const files = session.filesTouched instanceof Map
            ? Array.from(session.filesTouched.values())
            : session.filesTouched || [];

        const makeHeader = (title: string) => `# ${title}\n\nFile: ${fileEntry.filePath}\n`;
        const addSnippet = () => {
            if (fileEntry.snippets && fileEntry.snippets.length > 0) {
                const s = fileEntry.snippets[0];
                const truncated = s.content.length >= 400 ? ' (truncated)' : '';
                content += `\n## Snippet (lines ${s.lineStart}-${s.lineEnd})${truncated}\n\`\`\`\n${s.content.substring(0, 400)}\n\`\`\`\n`;
            }
        };

        if (kind === 'why') {
            content += makeHeader('Why does this code exist?');
            if (startIntent) content += `- Initial intent: ${startIntent}\n`;
            if (endIntent) content += `- Final outcome: ${endIntent}\n`;
            addSnippet();
        } else if (kind === 'decisions') {
            content += makeHeader('Decisions and assumptions');
            if (decisions.length === 0) {
                content += '- No decisions captured for this session.\n';
            } else {
                decisions.forEach((d, idx) => { content += `${idx + 1}. ${d}\n`; });
            }
            addSnippet();
        } else {
            content += makeHeader('What changed recently and why');
            const lastModified = fileEntry.lastModified ? `Last touched: ${fileEntry.lastModified}` : 'No timestamp';
            content += `- ${lastModified}\n`;
            addSnippet();

            // If we have a per-file diff, prefer it; otherwise session diff summary
            const fileDiff = this.findFileDiff(session, fileEntry.filePath);
            if (fileDiff) {
                content += `\n## Git diff (this file, truncated)\n\`\`\`\n${fileDiff}\n\`\`\`\n`;
            } else if ((session as SessionData).diffSummary || (session as SessionDataInternal).diffSummary) {
                const diff = (session as SessionData).diffSummary || (session as SessionDataInternal).diffSummary;
                content += `\n## Git summary (session scope)\n\`\`\`\n${diff}\n\`\`\`\n`;
            } else {
                content += `\n## Git summary\nNo git diff available for this file (outside workspace, untracked, or no changes).\n`;
            }
        }

        await this.showQueryResult(content);
    }

    private getSessionForQueries(): SessionData | SessionDataInternal | null {
        // Prefer active ended session; fallback to endedSession
        if (this.activeSession && !this.activeSession.endTime) {
            return this.activeSession;
        }
        if (this.endedSession) {
            return this.endedSession;
        }
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length > 0) {
            return history[0];
        }
        return null;
    }

    private normalizeFileKey(document: vscode.TextDocument): string {
        return document.uri.scheme === 'untitled'
            ? `untitled:${document.fileName}`
            : document.uri.fsPath;
    }

    private findFileChange(session: SessionData | SessionDataInternal, fileKey: string): FileChange | undefined {
        if (session.filesTouched instanceof Map) {
            return session.filesTouched.get(fileKey);
        }
        if (Array.isArray(session.filesTouched)) {
            return session.filesTouched.find(fc => fc.filePath === fileKey);
        }
        return undefined;
    }

    private findFileDiff(session: SessionData | SessionDataInternal, filePath: string): string | undefined {
        const fileDiffs = (session as SessionData).fileDiffs || (session as SessionDataInternal).fileDiffs || [];
        if (!fileDiffs.length) return undefined;

        // Try exact match or endsWith match (for relative paths)
        const exact = fileDiffs.find(fd => fd.filePath === filePath);
        if (exact) return exact.diff;

        const match = fileDiffs.find(fd => filePath.endsWith(fd.filePath));
        return match?.diff;
    }

    private async toggleDriftNotifications(): Promise<void> {
        const current = this.context.globalState.get<boolean>(DRIFT_NOTIFY_KEY) ?? true;
        const choice = await vscode.window.showQuickPick(
            [
                current ? 'Disable drift notifications' : 'Enable drift notifications',
                'Cancel',
            ],
            { placeHolder: `Drift notifications are currently ${current ? 'enabled' : 'disabled'}.` }
        );
        if (!choice || choice === 'Cancel') return;
        const next = !current;
        await this.context.globalState.update(DRIFT_NOTIFY_KEY, next);
        vscode.window.showInformationMessage(`Vibe Context: Drift notifications ${next ? 'enabled' : 'disabled'}.`);
    }

    private getEndedSessionIfAny(): SessionData | null {
        if (this.endedSession) {
            return this.endedSession;
        }
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length > 0) {
            return history[0];
        }
        return null;
    }

    private async pinCurrentSession(): Promise<void> {
        const session = this.getEndedSessionIfAny();
        if (!session) {
            vscode.window.showWarningMessage('No ended session available to pin.');
            return;
        }
        if (session.pinned) {
            vscode.window.showInformationMessage('Session is already pinned.');
            return;
        }
        session.pinned = true;
        this.endedSession = session;
        this.context.globalState.update('vibeContext.endedSession', session);
        this.updateHistorySession(session);
        vscode.window.showInformationMessage('Session pinned.');
    }

    private async unpinCurrentSession(): Promise<void> {
        const session = this.getEndedSessionIfAny();
        if (!session) {
            vscode.window.showWarningMessage('No ended session available to unpin.');
            return;
        }
        if (!session.pinned) {
            vscode.window.showInformationMessage('Session is not pinned.');
            return;
        }
        session.pinned = false;
        this.endedSession = session;
        this.context.globalState.update('vibeContext.endedSession', session);
        this.updateHistorySession(session);
        vscode.window.showInformationMessage('Session unpinned.');
    }

    private async labelCurrentSession(): Promise<void> {
        const session = this.getEndedSessionIfAny();
        if (!session) {
            vscode.window.showWarningMessage('No ended session available to label.');
            return;
        }
        const label = await vscode.window.showInputBox({
            prompt: 'Enter a label for this session',
            value: session.label || '',
            ignoreFocusOut: true,
        });
        if (label === undefined) return; // cancelled
        session.label = label.trim();
        this.endedSession = session;
        this.context.globalState.update('vibeContext.endedSession', session);
        this.updateHistorySession(session);
        vscode.window.showInformationMessage('Session label updated.');
    }

    private async labelSessionFromHistory(): Promise<void> {
        const history = this.context.globalState.get<SessionData[]>(SESSION_HISTORY_KEY) || [];
        if (history.length === 0) {
            vscode.window.showWarningMessage('No session history found.');
            return;
        }

        const pickItems = history.map((session, index) => {
            const start = new Date(session.startTime);
            const intent = session.startIntent || session.endIntent || 'No intent';
            const pin = session.pinned ? '📌 ' : '';
            const label = session.label ? ` — ${session.label}` : '';
            return {
                label: `${pin}${intent}${label}`,
                description: `${start.toLocaleString()}`,
                index,
            };
        });

        const picked = await vscode.window.showQuickPick(pickItems, {
            placeHolder: 'Select a session to relabel',
            matchOnDetail: true,
        });
        if (!picked) return;

        const target = history[picked.index];
        const label = await vscode.window.showInputBox({
            prompt: 'Enter a label for this session',
            value: target.label || '',
            ignoreFocusOut: true,
        });
        if (label === undefined) return; // cancelled
        target.label = label.trim();
        this.updateHistorySession(target);
        // If the updated session is also the current ended session, update it
        if (this.endedSession && this.endedSession.startTime === target.startTime) {
            this.endedSession = target;
            this.context.globalState.update('vibeContext.endedSession', target);
        }
        vscode.window.showInformationMessage('Session label updated.');
    }

    private async exportCurrentSession(): Promise<void> {
        const session = this.getEndedSessionIfAny();
        if (!session) {
            vscode.window.showWarningMessage('No session available to export.');
            return;
        }
        const exportData = {
            intent: {
                start: session.startIntent,
                end: session.endIntent,
            },
            decisions: session.keyDecisions,
            timeline: {
                start: session.startTime,
                end: session.endTime,
            },
            files: session.filesTouched,
            git: {
                summary: session.diffSummary,
                perFile: session.fileDiffs,
            },
            drift: session.driftSignals,
            label: session.label,
            pinned: session.pinned,
        };
        await vscode.env.clipboard.writeText(JSON.stringify(exportData, null, 2));
        vscode.window.showInformationMessage('Session exported to clipboard as JSON.');
    }

    private async exportCurrentSessionToFile(): Promise<void> {
        const session = this.getEndedSessionIfAny();
        if (!session) {
            vscode.window.showWarningMessage('No session available to export.');
            return;
        }
        const exportData = {
            intent: {
                start: session.startIntent,
                end: session.endIntent,
            },
            decisions: session.keyDecisions,
            timeline: {
                start: session.startTime,
                end: session.endTime,
            },
            files: session.filesTouched,
            git: {
                summary: session.diffSummary,
                perFile: session.fileDiffs,
            },
            drift: session.driftSignals,
            label: session.label,
            pinned: session.pinned,
        };

        const uri = await vscode.window.showSaveDialog({
            saveLabel: 'Save Session JSON',
            filters: { JSON: ['json'] },
            defaultUri: vscode.Uri.file(`vibe-session-${Date.now()}.json`),
        });
        if (!uri) return;

        try {
            await fs.writeFile(uri.fsPath, JSON.stringify(exportData, null, 2), 'utf8');
            vscode.window.showInformationMessage(`Session exported to ${uri.fsPath}`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to export session: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    private maybeNotifyDrift(session: SessionData): void {
        const notifyEnabled = this.context.globalState.get<boolean>(DRIFT_NOTIFY_KEY);
        if (!notifyEnabled) return;

        const signals = session.driftSignals || [];
        const warns = signals.filter(s => s.severity === 'warn' && s.filePath && (s.confidence === 'high' || s.confidence === undefined));
        if (warns.length === 0) return;

        const top = warns.slice(0, 3).map(w => {
            const scope = w.filePath ? `File: ${w.filePath}` : 'Session';
            return `[${w.signal}] ${w.reason} (${scope})`;
        }).join('\n');

        vscode.window.showInformationMessage(
            `Vibe Context: Potential drift detected:\n${top}`,
            'Open Context Panel',
            'Dismiss'
        ).then(choice => {
            if (choice === 'Open Context Panel') {
                this.showContextPanel();
            }
        });
    }

    private computeDriftSignals(workspaceRoot: string | null, filesTouched: FileChange[], diffSummary?: string | undefined): DriftSignal[] {
        const signals: DriftSignal[] = [];
        const totalFiles = filesTouched.length;
        const outsideWorkspace: DriftSignal[] = [];
        const untitled: DriftSignal[] = [];
        const workspaceFiles: FileChange[] = [];
        const diffStats = diffSummary ? parseDiffStat(diffSummary) : new Map<string, DiffStat>();

        filesTouched.forEach((fc) => {
            const isUntitled = fc.filePath.startsWith('Untitled:') || fc.filePath.startsWith('untitled:');
            const isOutside = workspaceRoot ? !fc.filePath.startsWith(workspaceRoot) : true;
            if (isUntitled) {
                untitled.push({
                    filePath: fc.filePath,
                    signal: 'untitled-file',
                    reason: 'File was unsaved/untitled; no git provenance.',
                    severity: 'info',
                });
            } else if (isOutside) {
                outsideWorkspace.push({
                    filePath: fc.filePath,
                    signal: 'outside-workspace',
                    reason: 'File edited outside workspace; git diff not available.',
                    severity: 'warn',
                });
            } else {
                workspaceFiles.push(fc);
            }
        });

        if (totalFiles > 12) {
            signals.push({
                signal: 'scope-expansion',
                reason: `Session touched ${totalFiles} files; possible scope creep.`,
                value: totalFiles,
                severity: 'warn',
            });
        } else if (totalFiles > 6) {
            signals.push({
                signal: 'broad-scope',
                reason: `Session touched ${totalFiles} files; check if scope is intentional.`,
                value: totalFiles,
                severity: 'info',
            });
        }

        signals.push(...outsideWorkspace);
        signals.push(...untitled);

        if (workspaceFiles.length > 0 && !diffSummary) {
            signals.push({
                signal: 'no-git-diff',
                reason: 'Workspace files edited but no git diff recorded (maybe no changes staged or git not tracking).',
                severity: 'info',
            });
        }

        // Per-file churn signals from diff --stat
        let churnCount = 0;
        diffStats.forEach((stat, relPath) => {
            const total = stat.changes;
            const isSensitive = isSensitivePath(relPath);
            const confidence: 'low' | 'medium' | 'high' = total > 300 ? 'high' : total > 150 ? 'medium' : 'low';
            if (total > 200 || (isSensitive && total > 80)) {
                signals.push({
                    filePath: relPath,
                    signal: 'high-churn',
                    value: total,
                    reason: `${total} lines changed (add ${stat.additions} / del ${stat.deletions}).${isSensitive ? ' Sensitive area.' : ''}`,
                    severity: 'warn',
                    confidence: isSensitive ? 'high' : confidence,
                });
                churnCount++;
            } else if (total > 80 || (isSensitive && total > 50)) {
                signals.push({
                    filePath: relPath,
                    signal: 'notable-churn',
                    value: total,
                    reason: `${total} lines changed (add ${stat.additions} / del ${stat.deletions}).${isSensitive ? ' Sensitive area.' : ''}`,
                    severity: 'info',
                    confidence,
                });
                churnCount++;
            }
        });

        if (churnCount > 5) {
            signals.push({
                signal: 'many-high-churn-files',
                reason: `${churnCount} files with notable churn; consider narrowing scope.`,
                severity: 'warn',
            });
        }

        if (outsideWorkspace.length > 2) {
            signals.push({
                signal: 'many-outside-workspace',
                reason: `${outsideWorkspace.length} files edited outside workspace; consider aligning work to repo.`,
                severity: 'warn',
            });
        }

        if (untitled.length > 2) {
            signals.push({
                signal: 'many-untitled-files',
                reason: `${untitled.length} untitled files edited; consider saving to track provenance.`,
                severity: 'info',
            });
        }

        return signals;
    }


    private isWorkspaceFile(document: vscode.TextDocument): boolean {
        return document.uri.scheme === 'file' && !!vscode.workspace.getWorkspaceFolder(document.uri);
    }

    private async showQueryResult(content: string): Promise<void> {
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown',
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }
}

export function activate(context: vscode.ExtensionContext): void {
    const extension = new VibeContextExtension();
    extension.activate(context);
}

export function deactivate(): void {
    // Cleanup handled by disposables
}


import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
}

interface SessionDataInternal {
    startTime: Date;
    endTime?: Date;
    filesTouched: Map<string, FileChange>; // Map for efficient updates
    startIntent?: string;
    endIntent?: string;
    keyDecisions: string[];
    diffSummary?: string;
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

        context.subscriptions.push(startCommand, endCommand, explainCommand, getContextCommand);

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
                
                if (!this.activeSession && !this.hasPromptedForSession) {
                    this.handleFirstFileEdit(event.document);
                } else if (this.activeSession) {
                    // Track immediately on any change, even if not saved
                    this.trackFileEdit(event.document);
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

        context.subscriptions.push(onDidChangeTextDocument, onDidSaveTextDocument, onDidChangeActiveTextEditor);
        this.disposables = context.subscriptions;
    }

    private restoreEndedSession(): void {
        const stored = this.context.globalState.get<SessionData>('vibeContext.endedSession');
        if (stored) {
            this.endedSession = stored;
        }
    }

    private saveEndedSession(session: SessionData): void {
        this.endedSession = session;
        this.context.globalState.update('vibeContext.endedSession', session);
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

    private trackFileEdit(document: vscode.TextDocument): void {
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
        this.captureCodeSnippet(document, filePath);
    }

    private captureCodeSnippet(document: vscode.TextDocument, filePath: string): void {
        if (!this.activeSession) return;

        try {
            const fileChange = this.activeSession.filesTouched.get(filePath);
            if (!fileChange) return;

            const lineCount = document.lineCount;
            
            // Skip if file is empty
            if (lineCount === 0) {
                return;
            }

            // Always update snippet to get latest content, but limit updates to avoid performance issues
            // Only update if we don't have one or if file has grown significantly
            const shouldUpdate = !fileChange.snippets || 
                                 fileChange.snippets.length === 0 || 
                                 (lineCount > 50 && (!fileChange.snippets[0] || fileChange.snippets[0].lineEnd < 50));

            if (!shouldUpdate) {
                return;
            }

            // Capture first 50 lines or all lines if file is smaller
            const snippetLines = Math.min(50, lineCount);
            const startLine = 0;
            const endLine = Math.min(snippetLines - 1, lineCount - 1);
            
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
            const diffSummary = await this.getGitDiffSummary();
            this.activeSession.diffSummary = diffSummary;
        } catch (error) {
            // Git not available or not a git repo - that's okay
            this.activeSession.diffSummary = undefined;
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

    private async getGitDiffSummary(): Promise<string | undefined> {
        if (!this.activeSession || this.activeSession.filesTouched.size === 0) {
            return undefined;
        }

        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return undefined;
            }

            // Get relative paths for tracked files (only real files, not untitled)
            const workspaceRoot = workspaceFolder.uri.fsPath;
            const trackedFiles = Array.from(this.activeSession.filesTouched.keys())
                .filter(filePath => {
                    // Only include actual file paths, not untitled documents
                    return !filePath.startsWith('untitled:') && filePath.startsWith(workspaceRoot);
                })
                .map(filePath => {
                    // Convert absolute path to relative path from workspace root
                    let relativePath = vscode.workspace.asRelativePath(filePath, false);
                    
                    // If still absolute, try manual conversion
                    if (relativePath === filePath && filePath.startsWith(workspaceRoot)) {
                        relativePath = filePath.substring(workspaceRoot.length + 1);
                    }
                    
                    return relativePath.replace(/\\/g, '/'); // Normalize path separators
                })
                .filter(relativePath => {
                    // Only include valid relative paths (not absolute)
                    return relativePath && !relativePath.startsWith(workspaceRoot) && relativePath.length > 0;
                });

            if (trackedFiles.length === 0) {
                console.log('Vibe Context: No tracked files for git diff (all untitled or outside workspace)');
                return undefined;
            }

            console.log(`Vibe Context: Getting git diff for ${trackedFiles.length} tracked files: ${trackedFiles.join(', ')}`);

            // Get diff only for tracked files that exist in git
            try {
                // Escape file paths properly for shell
                const escapedFiles = trackedFiles.map(f => `"${f.replace(/"/g, '\\"')}"`).join(' ');
                const { stdout } = await execAsync(
                    `git diff --stat -- ${escapedFiles}`,
                    {
                        cwd: workspaceRoot,
                        maxBuffer: 1024 * 1024, // 1MB buffer
                    }
                );

                if (stdout && stdout.trim().length > 0) {
                    console.log(`Vibe Context: Git diff found for tracked files`);
                    return stdout.trim();
                } else {
                    console.log('Vibe Context: No git changes found for tracked files');
                }
            } catch (error: any) {
                // Specific files might not be tracked by git, that's okay
                console.log(`Vibe Context: Git diff error (expected if files not in git): ${error.message}`);
            }

            // If no diff for tracked files, don't show unrelated changes
            return undefined;
        } catch (error) {
            // Git command failed - not a git repo or git not available
            return undefined;
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

        let context = `# Developer Session Context\n\n`;

        // Intent
        const startIntent = session.startIntent || (session as SessionData).startIntent;
        const endIntent = (session as SessionData).endIntent || (session as SessionDataInternal).endIntent;
        
        if (startIntent || endIntent) {
            context += `## Intent\n`;
            if (startIntent) {
                context += `**Initial Goal:** ${startIntent}\n`;
            }
            if (endIntent) {
                context += `**Final Outcome:** ${endIntent}\n`;
            }
            context += `\n`;
        }

        // Key Decisions
        const keyDecisions = (session as SessionData).keyDecisions || (session as SessionDataInternal).keyDecisions || [];
        if (keyDecisions.length > 0) {
            context += `## Key Decisions\n`;
            keyDecisions.forEach((decision) => {
                context += `- ${decision}\n`;
            });
            context += `\n`;
        }

        // Files
        if (filesTouched.length > 0) {
            context += `## Files Modified\n`;
            filesTouched.forEach((fileChange) => {
                const filePath = typeof fileChange === 'string' ? fileChange : fileChange.filePath;
                context += `- ${filePath}\n`;
                
                // Include code snippets if available
                if (typeof fileChange !== 'string' && fileChange.snippets && fileChange.snippets.length > 0) {
                    const snippet = fileChange.snippets[0];
                    context += `  \`\`\`\n  ${snippet.content.substring(0, 200)}...\n  \`\`\`\n`;
                }
            });
            context += `\n`;
        }

        // Git Diff
        if (session.diffSummary) {
            context += `## Git Changes\n\`\`\`\n${session.diffSummary}\n\`\`\`\n\n`;
        }

        // Metadata
        context += `## Session Metadata\n`;
        context += `- Started: ${startTime.toISOString()}\n`;
        if (endTime) {
            context += `- Ended: ${endTime.toISOString()}\n`;
            const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
            context += `- Duration: ${duration} minutes\n`;
        }

        return context;
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
}

export function activate(context: vscode.ExtensionContext): void {
    const extension = new VibeContextExtension();
    extension.activate(context);
}

export function deactivate(): void {
    // Cleanup handled by disposables
}


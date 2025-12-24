/**
 * Session data compression utilities
 * Compresses large session data to save memory and storage
 */

export interface CompressedSessionData {
    compressed: boolean;
    data: string; // Base64 encoded compressed data
    version: string;
}

/**
 * Compress session data by removing redundant information
 * and truncating large fields
 */
export function compressSession(session: any): any {
    if (!session) return session;

    const compressed = { ...session };

    // Truncate large diffs
    if (compressed.diffSummary && compressed.diffSummary.length > 5000) {
        compressed.diffSummary = compressed.diffSummary.substring(0, 5000) + '... (truncated)';
    }

    // Limit file diffs
    if (compressed.fileDiffs && Array.isArray(compressed.fileDiffs)) {
        compressed.fileDiffs = compressed.fileDiffs.slice(0, 5).map((fd: any) => ({
            filePath: fd.filePath,
            diff: fd.diff && fd.diff.length > 1000 ? fd.diff.substring(0, 1000) + '... (truncated)' : fd.diff
        }));
    }

    // Limit snippets per file
    if (compressed.filesTouched && Array.isArray(compressed.filesTouched)) {
        compressed.filesTouched = compressed.filesTouched.map((fc: any) => {
            if (fc.snippets && Array.isArray(fc.snippets)) {
                return {
                    ...fc,
                    snippets: fc.snippets.slice(0, 1) // Keep only first snippet
                };
            }
            return fc;
        });
    }

    // Remove old drift signals (keep only last 10)
    if (compressed.driftSignals && Array.isArray(compressed.driftSignals)) {
        compressed.driftSignals = compressed.driftSignals.slice(-10);
    }

    return compressed;
}

/**
 * Clean up old sessions to free memory
 * Removes sessions older than specified days
 */
export function cleanupOldSessions(sessions: any[], daysToKeep: number = 30): any[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return sessions.filter(session => {
        if (!session.startTime) return true;
        const sessionDate = new Date(session.startTime);
        return sessionDate >= cutoffDate;
    });
}


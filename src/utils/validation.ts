/**
 * Input validation utilities for Vibe Context extension
 */

export function sanitizeIntent(intent: string | undefined): string | undefined {
    if (!intent) return undefined;
    const trimmed = intent.trim();
    if (trimmed.length === 0) return undefined;
    // Limit length to prevent storage issues
    if (trimmed.length > 500) {
        return trimmed.substring(0, 500);
    }
    return trimmed;
}

export function sanitizeLabel(label: string | undefined): string | undefined {
    if (!label) return undefined;
    const trimmed = label.trim();
    if (trimmed.length === 0) return undefined;
    // Limit length for labels
    if (trimmed.length > 100) {
        return trimmed.substring(0, 100);
    }
    return trimmed;
}

export function sanitizeDecision(decision: string | undefined): string | undefined {
    if (!decision) return undefined;
    const trimmed = decision.trim();
    if (trimmed.length === 0) return undefined;
    // Limit length for decisions
    if (trimmed.length > 300) {
        return trimmed.substring(0, 300);
    }
    return trimmed;
}

export function validateSessionData(session: any): boolean {
    if (!session) return false;
    if (!session.startTime) return false;
    if (!Array.isArray(session.filesTouched)) return false;
    return true;
}

export function sanitizeFilePath(filePath: string): string {
    // Remove any potentially dangerous characters
    return filePath.replace(/[<>:"|?*\x00-\x1f]/g, '');
}


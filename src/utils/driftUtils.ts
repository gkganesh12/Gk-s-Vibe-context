export interface DiffStat {
    additions: number;
    deletions: number;
    changes: number;
}

export function parseDiffStat(diffSummary: string): Map<string, DiffStat> {
    const map = new Map<string, DiffStat>();
    const lines = diffSummary.split('\n');
    const statLine = /^\s*(.+?)\s+\|\s+(\d+)\s+([+ -]+)$/;
    for (const line of lines) {
        const match = statLine.exec(line);
        if (!match) continue;
        const relPath = match[1].trim();
        const changes = parseInt(match[2], 10);
        const bar = match[3];
        const additions = (bar.match(/\+/g) || []).length;
        const deletions = (bar.match(/-/g) || []).length;
        map.set(relPath, { additions, deletions, changes: isNaN(changes) ? additions + deletions : changes });
    }
    return map;
}

export function isSensitivePath(relPath: string): boolean {
    const lower = relPath.toLowerCase();
    return lower.includes('auth') || lower.includes('config') || lower.includes('secrets') || lower.includes('env');
}


import assert from 'assert';
const LIMIT = 20; // mirror SESSION_HISTORY_LIMIT from extension

interface SessionData {
    startTime: string;
    endTime?: string;
    filesTouched: any[];
    pinned?: boolean;
    label?: string;
}

function appendToHistory(session: SessionData, history: SessionData[]): SessionData[] {
    const pinned = history.filter(h => h.pinned);
    const unpinned = history.filter(h => !h.pinned);
    const ordered = session.pinned ? [session, ...pinned, ...unpinned] : [...pinned, session, ...unpinned];
    return ordered.slice(0, LIMIT);
}

function updateHistorySession(updated: SessionData, history: SessionData[]): SessionData[] {
    const next = history.map(h => h.startTime === updated.startTime ? updated : h);
    const pinned = next.filter(h => h.pinned);
    const unpinned = next.filter(h => !h.pinned);
    return [...pinned, ...unpinned].slice(0, LIMIT);
}

// Tests
{
    const baseHistory: SessionData[] = [];
    const s1 = { startTime: 't1', filesTouched: [] };
    const s2 = { startTime: 't2', filesTouched: [] };
    const s3 = { startTime: 't3', filesTouched: [], pinned: true };

    let hist = appendToHistory(s1, baseHistory);
    hist = appendToHistory(s2, hist);
    assert.deepStrictEqual(hist.map(h => h.startTime), ['t2', 't1']); // newest first, no pin

    hist = appendToHistory(s3, hist);
    assert.deepStrictEqual(hist.map(h => h.startTime), ['t3', 't2', 't1']); // pinned goes to front
}

{
    // Update label and keep pinned ordering
    const hist: SessionData[] = [
        { startTime: 't3', filesTouched: [], pinned: true },
        { startTime: 't2', filesTouched: [] },
    ];
    const updated = { ...hist[1], label: 'L2' };
    const next = updateHistorySession(updated, hist);
    assert.strictEqual(next[0].startTime, 't3'); // pinned stays first
    assert.strictEqual(next[1].label, 'L2');
}

console.log('history tests passed');


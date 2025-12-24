import assert from 'assert';

interface SessionData {
    startTime: string;
    endTime?: string;
    filesTouched: Array<{ filePath: string } | string>;
    startIntent?: string;
    endIntent?: string;
}

function findRelatedSessions(
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

// Test data
const testSessions: SessionData[] = [
    {
        startTime: '2024-01-15T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth/login.ts' }, { filePath: 'src/auth/token.ts' }],
        startIntent: 'Add user authentication system'
    },
    {
        startTime: '2024-01-16T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth/login.ts' }],
        startIntent: 'Fix login bug'
    },
    {
        startTime: '2024-01-20T10:00:00Z',
        filesTouched: [{ filePath: 'src/components/button.tsx' }],
        startIntent: 'Refactor UI components'
    },
    {
        startTime: '2024-01-17T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth/token.ts' }],
        startIntent: 'Improve token validation'
    }
];

// Test cases
{
    // Find sessions with same files
    const target = testSessions[0]; // Has login.ts and token.ts
    const related = findRelatedSessions(target, testSessions);
    assert.ok(related.length > 0, 'Should find related sessions');
    assert.ok(related.some(r => r.startIntent?.includes('login') || r.startIntent?.includes('token')), 
        'Should find sessions with overlapping files');
    console.log('✓ Finds sessions with overlapping files');
}

{
    // Find sessions with similar intent
    const target: SessionData = {
        startTime: '2024-01-18T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth/new.ts' }],
        startIntent: 'Add authentication feature'
    };
    const related = findRelatedSessions(target, testSessions);
    assert.ok(related.some(r => r.startIntent?.toLowerCase().includes('auth')), 
        'Should find sessions with similar intent');
    console.log('✓ Finds sessions with similar intent');
}

{
    // No related sessions (different domain)
    const target: SessionData = {
        startTime: '2024-01-25T10:00:00Z',
        filesTouched: [{ filePath: 'src/database/models.ts' }],
        startIntent: 'Add database models'
    };
    const related = findRelatedSessions(target, testSessions);
    assert.ok(related.length === 0 || related.length < 2, 
        'Should find few or no related sessions for different domain');
    console.log('✓ Correctly identifies unrelated sessions');
}

{
    // Time proximity matters
    const target: SessionData = {
        startTime: '2024-01-16T11:00:00Z', // Close to session 1
        filesTouched: [{ filePath: 'src/auth/config.ts' }],
        startIntent: 'Configure authentication'
    };
    const related = findRelatedSessions(target, testSessions);
    assert.ok(related.length > 0, 'Should find sessions based on time proximity');
    console.log('✓ Time proximity affects relatedness');
}

console.log('\n✅ All related sessions tests passed!');


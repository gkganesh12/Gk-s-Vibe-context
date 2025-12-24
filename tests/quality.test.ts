import assert from 'assert';

interface SessionData {
    startTime: string;
    endTime?: string;
    filesTouched: Array<{ filePath: string } | string>;
    startIntent?: string;
    endIntent?: string;
    keyDecisions?: string[];
    diffSummary?: string;
}

function calculateContextQuality(session: SessionData): number {
    let score = 0;

    // Intent (50% total)
    if (session.startIntent) score += 30;
    if (session.endIntent) score += 20;

    // Decisions (20%)
    const decisions = session.keyDecisions || [];
    if (decisions.length > 0) score += 20;

    // Files tracked (15%)
    const files = session.filesTouched || [];
    if (files.length > 0) score += 15;

    // Git diff (15%)
    if (session.diffSummary && session.diffSummary.includes('Git diff')) {
        score += 15;
    }

    return Math.min(100, score);
}

// Test cases
{
    // Perfect session
    const perfectSession: SessionData = {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T12:00:00Z',
        filesTouched: [{ filePath: 'src/auth.ts' }],
        startIntent: 'Add authentication',
        endIntent: 'Authentication added',
        keyDecisions: ['Used JWT'],
        diffSummary: 'Git diff available'
    };
    assert.strictEqual(calculateContextQuality(perfectSession), 100);
    console.log('✓ Perfect session scores 100%');
}

{
    // No intent
    const noIntentSession: SessionData = {
        startTime: '2024-01-15T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth.ts' }],
        keyDecisions: ['Used JWT'],
        diffSummary: 'Git diff available'
    };
    assert.strictEqual(calculateContextQuality(noIntentSession), 50);
    console.log('✓ Session without intent scores 50%');
}

{
    // Only files
    const minimalSession: SessionData = {
        startTime: '2024-01-15T10:00:00Z',
        filesTouched: [{ filePath: 'src/auth.ts' }]
    };
    assert.strictEqual(calculateContextQuality(minimalSession), 15);
    console.log('✓ Minimal session scores 15%');
}

{
    // Empty session
    const emptySession: SessionData = {
        startTime: '2024-01-15T10:00:00Z'
    };
    assert.strictEqual(calculateContextQuality(emptySession), 0);
    console.log('✓ Empty session scores 0%');
}

{
    // Only start intent
    const startIntentOnly: SessionData = {
        startTime: '2024-01-15T10:00:00Z',
        startIntent: 'Add feature',
        filesTouched: [{ filePath: 'src/feature.ts' }]
    };
    assert.strictEqual(calculateContextQuality(startIntentOnly), 45);
    console.log('✓ Session with only start intent scores 45%');
}

console.log('\n✅ All context quality tests passed!');


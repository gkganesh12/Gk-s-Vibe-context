"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
function searchSessions(query, sessions) {
    if (!query || query.trim().length === 0)
        return [];
    const lowerQuery = query.toLowerCase().trim();
    return sessions.filter(session => {
        const intent = (session.startIntent || session.endIntent || '').toLowerCase();
        const label = (session.label || '').toLowerCase();
        const files = session.filesTouched.map(f => typeof f === 'string' ? f : f.filePath).join(' ').toLowerCase();
        const date = new Date(session.startTime).toLocaleDateString().toLowerCase();
        const dateShort = new Date(session.startTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit'
        }).toLowerCase();
        return intent.includes(lowerQuery) ||
            label.includes(lowerQuery) ||
            files.includes(lowerQuery) ||
            date.includes(lowerQuery) ||
            dateShort.includes(lowerQuery);
    });
}
// Test data
const testSessions = [
    {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T12:00:00Z',
        filesTouched: [{ filePath: 'src/auth/login.ts' }],
        startIntent: 'Add user authentication',
        label: 'Auth feature'
    },
    {
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T14:00:00Z',
        filesTouched: [{ filePath: 'src/components/button.tsx' }],
        startIntent: 'Refactor UI components',
        label: 'UI improvements'
    },
    {
        startTime: '2024-02-01T09:00:00Z',
        filesTouched: [{ filePath: 'src/api/users.ts' }],
        startIntent: 'Add user management API',
        endIntent: 'User API completed'
    }
];
// Test cases
{
    // Search by intent
    const results = searchSessions('authentication', testSessions);
    assert_1.default.strictEqual(results.length, 1);
    assert_1.default.strictEqual(results[0].startIntent, 'Add user authentication');
    console.log('✓ Search by intent works');
}
{
    // Search by file path
    const results = searchSessions('login.ts', testSessions);
    assert_1.default.strictEqual(results.length, 1);
    assert_1.default.strictEqual(results[0].filesTouched[0].filePath, 'src/auth/login.ts');
    console.log('✓ Search by file path works');
}
{
    // Search by label
    const results = searchSessions('Auth feature', testSessions);
    assert_1.default.strictEqual(results.length, 1);
    assert_1.default.strictEqual(results[0].label, 'Auth feature');
    console.log('✓ Search by label works');
}
{
    // Search by date (month/year)
    const results = searchSessions('2024-01', testSessions);
    assert_1.default.strictEqual(results.length, 2);
    console.log('✓ Search by date works');
}
{
    // Case insensitive search
    const results = searchSessions('AUTHENTICATION', testSessions);
    assert_1.default.strictEqual(results.length, 1);
    console.log('✓ Case insensitive search works');
}
{
    // No matches
    const results = searchSessions('nonexistent', testSessions);
    assert_1.default.strictEqual(results.length, 0);
    console.log('✓ No matches returns empty array');
}
{
    // Empty query
    const results = searchSessions('', testSessions);
    assert_1.default.strictEqual(results.length, 0);
    console.log('✓ Empty query returns empty array');
}
{
    // Partial match
    const results = searchSessions('auth', testSessions);
    assert_1.default.strictEqual(results.length, 1);
    console.log('✓ Partial match works');
}
console.log('\n✅ All session search tests passed!');
//# sourceMappingURL=search.test.js.map
import assert from 'assert';
import { parseDiffStat, isSensitivePath } from '../src/utils/driftUtils';

// parseDiffStat basic parsing
{
    const diff = `
src/auth/login.ts | 12 ++++++----
src/config/app.ts |  5 +++--
 README.md        |  2 +-
`;
    const map = parseDiffStat(diff);
    assert.strictEqual(map.get('src/auth/login.ts')?.changes, 12);
    assert.strictEqual(map.get('src/config/app.ts')?.changes, 5);
    assert.strictEqual(map.get('src/config/app.ts')?.additions, 3);
    assert.strictEqual(map.get('src/config/app.ts')?.deletions, 2);
    assert.strictEqual(map.get('README.md')?.deletions, 1);
}

// isSensitivePath
{
    assert.ok(isSensitivePath('src/auth/login.ts'));
    assert.ok(isSensitivePath('config/env.prod.ts'));
    assert.ok(!isSensitivePath('src/components/button.tsx'));
}

console.log('driftUtils tests passed');


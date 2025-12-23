"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const driftUtils_1 = require("../src/utils/driftUtils");
// parseDiffStat basic parsing
{
    const diff = `
src/auth/login.ts | 12 ++++++----
src/config/app.ts |  5 +++--
 README.md        |  2 +-
`;
    const map = (0, driftUtils_1.parseDiffStat)(diff);
    assert_1.default.strictEqual(map.get('src/auth/login.ts')?.changes, 12);
    assert_1.default.strictEqual(map.get('src/config/app.ts')?.changes, 5);
    assert_1.default.strictEqual(map.get('src/config/app.ts')?.additions, 3);
    assert_1.default.strictEqual(map.get('src/config/app.ts')?.deletions, 2);
    assert_1.default.strictEqual(map.get('README.md')?.deletions, 1);
}
// isSensitivePath
{
    assert_1.default.ok((0, driftUtils_1.isSensitivePath)('src/auth/login.ts'));
    assert_1.default.ok((0, driftUtils_1.isSensitivePath)('config/env.prod.ts'));
    assert_1.default.ok(!(0, driftUtils_1.isSensitivePath)('src/components/button.tsx'));
}
console.log('driftUtils tests passed');
//# sourceMappingURL=driftUtils.test.js.map
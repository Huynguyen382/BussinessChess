import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testDir = __dirname;
const testFiles = readdirSync(testDir).filter(
  (file) => file.endsWith('.test.ts')
);

console.log('====================================================');
console.log(` DISCOVERED ${testFiles.length} CLIENT TEST SUITE(S)`);
console.log('====================================================\n');

let totalSuites = testFiles.length;
let passedSuites = 0;
const failedSuites: string[] = [];

for (const file of testFiles) {
  const filePath = join(testDir, file);
  console.log(`▶ RUNNING: ${file}`);
  const result = spawnSync('npx', ['tsx', filePath], {
    stdio: 'inherit',
    shell: true,
    cwd: join(testDir, '..')
  });

  if (result.status === 0) {
    passedSuites++;
    console.log(`✔ SUITE PASSED: ${file}\n`);
  } else {
    failedSuites.push(file);
    console.error(`✖ SUITE FAILED: ${file} (Exit code: ${result.status})\n`);
  }
}

console.log('====================================================');
console.log(` OVERALL CLIENT TEST RESULTS: ${passedSuites}/${totalSuites} SUITES PASSED`);
if (failedSuites.length > 0) {
  console.error(` FAILED SUITES: ${failedSuites.join(', ')}`);
  console.log('====================================================');
  process.exit(1);
} else {
  console.log(' ALL CLIENT TEST SUITES COMPLETED SUCCESSFULLY! 🚀');
  console.log('====================================================');
  process.exit(0);
}

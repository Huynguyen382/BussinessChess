import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const testDir = __dirname;
const testFiles = readdirSync(testDir).filter(
  (file) => file.endsWith('.test.ts')
);

console.log('====================================================');
console.log(` DISCOVERED ${testFiles.length} TEST SUITE(S)`);
console.log('====================================================\n');

let totalSuites = testFiles.length;
let passedSuites = 0;
const failedSuites: string[] = [];

for (const file of testFiles) {
  const filePath = join(testDir, file);
  console.log(`\n▶ RUNNING: ${file}`);
  const result = spawnSync('npx', ['tsx', filePath], {
    stdio: 'inherit',
    shell: true,
    cwd: join(testDir, '..')
  });

  if (result.status === 0) {
    passedSuites++;
    console.log(`✔ SUITE PASSED: ${file}`);
  } else {
    failedSuites.push(file);
    console.error(`✖ SUITE FAILED: ${file} (Exit code: ${result.status})`);
  }
}

console.log('\n====================================================');
console.log(` OVERALL TEST SUITE RESULTS: ${passedSuites}/${totalSuites} SUITES PASSED`);
if (failedSuites.length > 0) {
  console.error(` FAILED SUITES: ${failedSuites.join(', ')}`);
  console.log('====================================================');
  process.exit(1);
} else {
  console.log(' ALL TEST SUITES COMPLETED SUCCESSFULLY! 🚀');
  console.log('====================================================');
  process.exit(0);
}

import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

test('running MarkBind without a command does not create log files', () => {
  const workingDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'markbind-cli-'));
  const cliPath = path.resolve(__dirname, '../../dist/index.js');

  const result = spawnSync(process.execPath, [cliPath], { cwd: workingDirectory });

  expect(result.status).toBe(1);
  expect(fs.existsSync(path.join(workingDirectory, '_markbind'))).toBe(false);
  fs.removeSync(workingDirectory);
});

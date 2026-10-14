const { spawn } = require('child_process');

const isWin = process.platform === 'win32';
const cmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(cmd, ['nest', 'start', '--watch'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: process.env,
});

const stripAnsi = (str) => str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

const filterAndPrint = (chunk, isStderr = false) => {
  const lines = chunk.toString().split('\n');
  for (const rawLine of lines) {
    const clean = stripAnsi(rawLine).trim();
    const lower = clean.toLowerCase();

    // Loại bỏ triệt để toàn bộ dòng chứa "compi" (compilation, compiling, compiled...)
    if (
      lower.includes('compi') ||
      lower.includes('compile') ||
      lower.includes('found 0 errors') ||
      lower.includes('deprecationwarning') ||
      lower.includes('file change detected')
    ) {
      continue;
    }

    if (clean.length > 0) {
      if (isStderr) {
        if (lower.includes('error') || lower.includes('fail') || lower.includes('warn')) {
          console.error(rawLine.replace(/\r$/, ''));
        }
      } else {
        console.log(rawLine.replace(/\r$/, ''));
      }
    }
  }
};

child.stdout.on('data', (data) => filterAndPrint(data, false));
child.stderr.on('data', (data) => filterAndPrint(data, true));

const cleanup = () => {
  if (child && !child.killed) {
    child.kill('SIGINT');
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

child.on('exit', (code) => {
  process.exit(code || 0);
});

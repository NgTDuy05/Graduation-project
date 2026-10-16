// Gốc rễ: Chặn triệt để toàn bộ stream stdout/stderr của Next.js trước khi bất kỳ module nào được nạp
const origStdout = process.stdout.write.bind(process.stdout);
const origStderr = process.stderr.write.bind(process.stderr);

const filterLog = (chunk) => {
  if (!chunk) return false;
  const str = chunk.toString();
  const clean = str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').trim().toLowerCase();

  // 1. Chặn 100% mọi log chứa compile (compiling, compiled, compilation...)
  if (clean.includes('compi') || clean.includes('compile')) return true;

  // 2. Chặn 100% mọi request log của người dùng truy cập trang ở Frontend (GET /, POST /, modules...)
  if (
    clean.startsWith('get /') ||
    clean.startsWith('post /') ||
    clean.startsWith('put /') ||
    clean.startsWith('delete /') ||
    clean.startsWith('patch /') ||
    clean.includes('modules')
  ) {
    return true;
  }

  // 3. Chặn cảnh báo deprecation
  if (clean.includes('deprecationwarning') || clean.includes('url.parse()')) return true;

  return false;
};

process.stdout.write = (chunk, encoding, callback) => {
  if (filterLog(chunk)) {
    if (typeof callback === 'function') callback();
    return true;
  }
  return origStdout(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
  if (filterLog(chunk)) {
    if (typeof callback === 'function') callback();
    return true;
  }
  return origStderr(chunk, encoding, callback);
};

const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3001;

const app = next({ dev, hostname, port, quiet: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Lỗi server:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      origStdout(`\n======================================================\n`);
      origStdout(`▲ Frontend Next.js đang chạy tại: http://${hostname}:${port}\n`);
      origStdout(`======================================================\n\n`);
    });
});

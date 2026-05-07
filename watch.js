const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const contentPath = path.resolve(__dirname, 'content.txt');
const workerPath = path.resolve(__dirname, 'worker.js');
let debounceTimer = null;

if (!fs.existsSync(contentPath)) {
  console.error(`❌ 找不到 ${contentPath}`);
  process.exit(1);
}

function runWorker() {
  console.log('🔄 content.txt 已變更，開始執行 node worker.js...');

  const child = spawn(process.execPath, [workerPath], {
    cwd: __dirname,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    console.log(`✅ worker.js 執行結束，exit code=${code}`);
  });

  child.on('error', (error) => {
    console.error('❌ 無法執行 worker.js:', error);
  });
}

console.log(`👀 開始監聽 ${contentPath}，儲存後會自動執行 worker.js。`);

const watcher = fs.watch(contentPath, { persistent: true }, (eventType) => {
  if (eventType === 'change') {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runWorker, 100);
  }
});

process.on('SIGINT', () => {
  watcher.close();
  console.log('\n🛑 已停止監聽 content.txt');
  process.exit(0);
});

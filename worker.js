const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// 透過 __dirname 確保腳本行為不受當前工作目錄影響
const ROOT_DIR = path.resolve(__dirname);
const CONTENT_FILE = path.join(ROOT_DIR, 'content.txt');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');

/**
 * 執行指令並回傳結果，出錯時不直接崩潰
 */
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: ROOT_DIR }).trim();
    } catch (error) {
        return null;
    }
}

/**
 * 從公開 API 獲取每日金句
 */
function fetchDailyQuote() {
    return new Promise((resolve, reject) => {
        const url = 'https://api.quotable.io/random';
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const quote = JSON.parse(data);
                    const formattedQuote = `"${quote.content}" - ${quote.author}`;
                    resolve(formattedQuote);
                } catch (error) {
                    reject(new Error('解析 API 響應失敗'));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

async function updateAndPush() {
    try {
        console.log('🚀 開始自動化流程...');

        // 獲取每日金句並寫入 content.txt
        console.log('📡 正在獲取每日金句...');
        const dailyQuote = await fetchDailyQuote();
        fs.writeFileSync(CONTENT_FILE, dailyQuote, 'utf8');
        console.log('✅ 每日金句已獲取並寫入 content.txt');

        // 確保 index.html 存在
        if (!fs.existsSync(HTML_FILE)) {
            throw new Error('找不到 index.html');
        }

        // 讀取與更新 HTML 內容
        const newContent = fs.readFileSync(CONTENT_FILE, 'utf8');
        let htmlData = fs.readFileSync(HTML_FILE, 'utf8');

        // 改良過的正則：支援 id="main-content" 前後有其他屬性或空格
        const regex = /(<[^>]*id=["']main-content["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/i;

        if (!regex.test(htmlData)) {
            throw new Error('在 index.html 中找不到 id="main-content" 標籤');
        }

        const updatedHtml = htmlData.replace(regex, `$1\n${newContent}\n$3`);
        fs.writeFileSync(HTML_FILE, updatedHtml, 'utf8');
        console.log('✅ HTML 內容已更新');

        // Git 自動化處理（若存在 Git repository）
        const gitBranch = runCommand('git rev-parse --abbrev-ref HEAD');
        if (!gitBranch) {
            console.log('⚠️ 未偵測到 Git repository，跳過 Git 操作。');
            return;
        }

        console.log(`📦 偵測到目前分支: ${gitBranch}`);

        const status = runCommand('git status --porcelain');
        if (!status) {
            console.log('ℹ️ 沒有偵測到任何變更，跳過 Git 推送。');
            return;
        }

        console.log('📤 正在推送變更至 GitHub...');
        execSync('git add .', { cwd: ROOT_DIR, stdio: 'inherit' });
        execSync(`git commit -m "docs: 自動更新內容 [skip ci]"`, { cwd: ROOT_DIR, stdio: 'inherit' });
        execSync(`git push origin ${gitBranch}`, { cwd: ROOT_DIR, stdio: 'inherit' });

        console.log('🎉 全部完成！內容已成功同步至 GitHub。');

    } catch (error) {
        console.error('❌ 執行失敗:', error.message);
        process.exit(1);
    }
}

updateAndPush();
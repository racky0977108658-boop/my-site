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
        const request = https.get(url, (res) => {
            // 檢查 HTTP 狀態碼
            if (res.statusCode !== 200) {
                reject(new Error(`API 返回狀態碼 ${res.statusCode}`));
                return;
            }

            let data = '';
            const maxDataSize = 10 * 1024; // 最大 10KB

            res.on('data', (chunk) => {
                data += chunk;
                if (data.length > maxDataSize) {
                    request.destroy();
                    reject(new Error('API 響應數據過大'));
                }
            });

            res.on('end', () => {
                try {
                    const quote = JSON.parse(data);
                    if (!quote.content || !quote.author) {
                        throw new Error('API 響應缺少必要字段');
                    }
                    const formattedQuote = `"${quote.content}" - ${quote.author}`;
                    resolve(formattedQuote);
                } catch (error) {
                    reject(new Error(`解析 API 響應失敗: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`API 請求失敗: ${error.message}`));
        });

        // 設定 10 秒超時
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('API 請求超時'));
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

        // 改良的正則 - 更好的容錯度
        const regex = /(<div[^>]*id=["']main-content["'][^>]*>)([\s\S]*?)(<\/div\s*>)/i;
        
        // 第一次嘗試符合的正則
        if (!regex.test(htmlData)) {
            // 嘗試寬鬆的正則以診斷問題
            const debugRegex = /id=["']main-content["']/i;
            if (!debugRegex.test(htmlData)) {
                throw new Error('在 index.html 中找不到 id="main-content" 標籤');
            } else {
                throw new Error('找到 id="main-content"，但標籤格式不符期望。請檢查 HTML 結構');
            }
        }

        const updatedHtml = htmlData.replace(regex, `$1\n${newContent}\n$3`);
        
        // 驗證替換成功
        if (updatedHtml === htmlData) {
            throw new Error('HTML 正則替換未生效，請檢查格式');
        }
        
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
        try {
            execSync('git add .', { cwd: ROOT_DIR, stdio: 'inherit' });
            execSync(`git commit -m "docs: 自動更新內容 [skip ci]"`, { cwd: ROOT_DIR, stdio: 'inherit' });
            execSync(`git push origin ${gitBranch}`, { cwd: ROOT_DIR, stdio: 'inherit' });
            console.log('🎉 全部完成！內容已成功同步至 GitHub。');
        } catch (gitError) {
            console.error('⚠️ Git 操作失敗:', gitError.message);
            console.error('💡 可能原因：');
            console.error('   1. 無 GitHub 認證令牌或憑證');
            console.error('   2. 倉庫是私有的');
            console.error('   3. 網路連接問題');
            console.error('   4. 遠端分支不存在');
            throw gitError;
        }

    } catch (error) {
        console.error('❌ 執行失敗:', error.message);
        console.error('\n📋 詳細錯誤信息：');
        if (error.stdout) console.error('stdout:', error.stdout.toString());
        if (error.stderr) console.error('stderr:', error.stderr.toString());
        console.error('\n💡 故障排除建議：');
        console.error('1. 檢查網路連接');
        console.error('2. 驗證 API 服務是否在線');
        console.error('3. 檢查 HTML 文件結構是否正確');
        console.error('4. 驗證 Git 認證設定');
        process.exit(1);
    }
}

updateAndPush();
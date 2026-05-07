const fs = require('fs');
const { execSync } = require('child_process');

// 設定檔案名稱
const CONTENT_FILE = 'content.txt';
const HTML_FILE = 'index.html';

/**
 * 執行指令並回傳結果，出錯時不直接崩潰
 */
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        return null;
    }
}

async function updateAndPush() {
    try {
        console.log('🚀 開始自動化流程...');

        // 1. 檢查檔案是否存在
        if (!fs.existsSync(CONTENT_FILE) || !fs.existsSync(HTML_FILE)) {
            throw new Error('找不到 content.txt 或 index.html');
        }

        // 2. 讀取與更新 HTML 內容
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

        // 3. Git 自動化處理
        // 取得目前的分支名稱 (例如 main 或 master)
        const currentBranch = runCommand('git rev-parse --abbrev-ref HEAD') || 'main';
        
        console.log(`📦 偵測到目前分支: ${currentBranch}`);

        // 檢查是否有變更需要提交
        const status = runCommand('git status --porcelain');
        if (!status) {
            console.log('ℹ️ 沒有偵測到任何變更，跳過 Git 推送。');
            return;
        }

        console.log('📤 正在推送變更至 GitHub...');
        execSync('git add .');
        // 使用 [skip ci] 可以避免觸發不必要的 CI/CD 流程（選用）
        execSync(`git commit -m "docs: 自動更新內容 [skip ci]"`);
        execSync(`git push origin ${currentBranch}`);

        console.log('🎉 全部完成！內容已成功同步至 GitHub。');

    } catch (error) {
        console.error('❌ 執行失敗:', error.message);
        process.exit(1);
    }
}

updateAndPush();
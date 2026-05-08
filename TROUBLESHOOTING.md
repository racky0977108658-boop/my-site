# 故障排除指南

## 發現的問題和修復

### 1. ✅ API 調用缺乏超時和錯誤處理
**問題**: 當 API 無回應時，應用會無限期等待
**修復**: 
- 新增 10 秒超時限制
- 驗證 HTTP 狀態碼
- 驗證 API 響應中的必要字段
- 限制響應數據大小

### 2. ✅ HTML 正則表達式過於嚴格
**問題**: 原有正則 `/<[^>]*id=["']main-content["'][^>]*>/` 可能因為標籤格式不符而失敗
**修復**:
- 改為更精確的正則: `/<div[^>]*id=["']main-content["'][^>]*>/`
- 新增診斷日誌幫助識別不匹配原因
- 驗證替換是否實際生效

### 3. ✅ Git 操作的錯誤消息不夠明確
**問題**: Git 推送失敗時沒有清楚的故障排除提示
**修復**:
- 新增詳細的錯誤消息
- 列出可能的失敗原因
- 提示需要的配置步驟

### 4. ✅ 缺乏完整的錯誤堆棧追蹤
**問題**: catch 區塊中沒有足夠的調試信息
**修復**:
- 新增詳細錯誤日誌
- 顯示 stdout/stderr 輸出
- 提供故障排除建議

## 常見錯誤和解決方案

### ❌ Git 推送失敗

**症狀**: `fatal: Authentication failed` 或 `permission denied`

**解決方案**:
```bash
# 選項 1: 使用 Personal Access Token (推薦 HTTPS)
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USER/YOUR_REPO.git

# 選項 2: 配置 SSH 金鑰
ssh-keygen -t ed25519 -C "your_email@example.com"
# 然後將公鑰添加到 GitHub
git remote set-url origin git@github.com:YOUR_USER/YOUR_REPO.git

# 選項 3: 使用 GitHub CLI 認證
gh auth login
```

### ❌ API 超時

**症狀**: `API 請求超時` 錯誤

**解決方案**:
- 檢查網路連接: `curl https://api.quotable.io/random`
- 驗證 API 服務可用性
- 如果不穩定，可能需要添加重試邏輯

### ❌ HTML 更新失敗

**症狀**: `在 index.html 中找不到 id="main-content"`

**解決方案**:
- 確認 `index.html` 中確實有 `id="main-content"` 元素
- 檢查是否誤寫為 `id='main-content'` 或 `id=main-content`（不推薦）
- 確保沒有額外空格或特殊字符

### ❌ 沒有變更要提交

**症狀**: 即使執行成功，HTML 仍未更新

**解決方案**:
- 檢查 content.txt 是否確實被修改
- 驗證正則表達式是否正確匹配
- 查看 git status 確認文件修改狀態

## 測試步驟

### 1. 測試 API 連接
```bash
curl https://api.quotable.io/random
```

### 2. 測試 Git 配置
```bash
git config --list
git remote -v
git rev-parse --abbrev-ref HEAD
```

### 3. 單獨執行 worker.js
```bash
node worker.js
```

### 4. 監視文件變更
```bash
# 在另一個終端執行
node watch.js

# 然後修改 content.txt
echo "新的測試內容" > content.txt
```

## 需要的環境配置

- Node.js (需要 fs、path、child_process、https 模組)
- Git 已安裝並配置
- GitHub 認證令牌（用於推送）

## 後續改進建議

1. 添加 retry 邏輯用於不穩定的 API 調用
2. 使用 environment 變數儲存敏感信息
3. 添加單元測試
4. 實現日誌記錄到文件
5. 添加 package.json 以明確依賴版本

# My Site · 網站與自動化原型

> 分類：**網站／工具原型** · 文件整理：2026-10-02

保留目前網站、worker、監看與自動化檔案；先補導覽，再按實際用途整理。

| 項目 | 說明 |
|---|---|
| 維護狀態 | 檔案用途與維護範圍待逐項確認 |
| 新案使用 | 用途未確認前，不作為正式產品或新案模板。 |
| 共用技術與 Skill | [NOX 技術庫](https://github.com/racky0977108658-boop/nox-assets) |
| 倉庫分類總覽 | [GitHub 結構檢查](https://github.com/racky0977108658-boop/nox-assets/blob/main/docs/audits/GITHUB-REPOSITORY-AUDIT-2026-10-02.md) |

## 主要檔案

| 路徑 | 用途 |
|---|---|
| [index.html](index.html) | 網站入口 |
| [worker.js](worker.js) | Worker 程式；部署用途待確認 |
| [watch.js](watch.js) | 監看程式；執行方式待確認 |
| [git-commit.sh](git-commit.sh) | Git 提交腳本；使用前檢查內容 |
| [.github/workflows/trigger-make.yml](.github/workflows/trigger-make.yml) | 自動化工作流程 |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 既有排查文件 |
| [Okya](Okya) | 用途待確認，暫時保留 |
| [nox](nox) | 用途待確認，暫時保留 |
| [content.txt](content.txt) | 文字資料；用途待確認 |

## 維護說明

此倉庫未包含 package.json；本次不新增或假設 npm 建置指令。 本次只整理文件與用途標示；執行結果、正式部署位置與實機效能須另外驗證。類別標示不代表已封存或停用網站。

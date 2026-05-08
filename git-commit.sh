#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ 這裡不是 Git repository，無法提交。"
  exit 1
fi

branch=$(git rev-parse --abbrev-ref HEAD)
remote=$(git remote)
if [ -z "$remote" ]; then
  echo "❌ 找不到 Git remote，請先設定 origin。"
  echo "💡 可以用以下命令設定："
  echo "   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git"
  exit 1
fi

if ! git config user.name >/dev/null 2>&1 || [ -z "$(git config user.name)" ]; then
  git config user.name "GitHub Actions"
  echo "ℹ️ 已設定本機 user.name 為 GitHub Actions。"
fi

if ! git config user.email >/dev/null 2>&1 || [ -z "$(git config user.email)" ]; then
  git config user.email "actions@github.com"
  echo "ℹ️ 已設定本機 user.email 為 actions@github.com。"
fi

if git diff --quiet --ignore-submodules --; then
  echo "ℹ️ 沒有變更要提交。"
else
  git add .
  git commit -m "docs: 自動更新內容 [skip ci]"
  echo "✅ 已提交變更。"
fi

if git rev-parse --verify --quiet origin/$branch >/dev/null; then
  echo "📤 正在推送到 origin/$branch..."
  if ! git push origin "$branch"; then
    echo "❌ 推送失敗，可能原因："
    echo "   1. GitHub 認證失敗（需要 Personal Access Token 或配置 SSH）"
    echo "   2. 倉庫是私有的，無存取權限"
    echo "   3. 網路連接問題"
    exit 1
  fi
  echo "🎉 push 完成。"
else
  echo "⚠️ origin/$branch 尚未存在，將嘗試建立遠端分支。"
  if ! git push -u origin "$branch"; then
    echo "❌ 推送失敗，請檢查 GitHub 認證和倉庫設定"
    exit 1
  fi
  echo "🎉 push 完成。"
fi

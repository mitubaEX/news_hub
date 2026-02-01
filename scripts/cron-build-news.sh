#!/bin/bash

# News Hub - 自動ニュースビルド＆デプロイスクリプト
# cron で毎日実行し、最新ニュースを取得してデプロイする

set -e

# プロジェクトルート
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/cron-build.log"

# ログディレクトリ作成
mkdir -p "$PROJECT_DIR/logs"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "ニュースビルド開始"

cd "$PROJECT_DIR"

# Ollama が起動しているか確認
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    log "警告: Ollama が起動していません。歴史分析なしでビルドします。"
fi

# サーバー側でニュースをビルド
log "ニュースデータを生成中..."
cd "$PROJECT_DIR/server"
npm run build:news >> "$LOG_FILE" 2>&1

# フロントエンドをビルド
log "フロントエンドをビルド中..."
cd "$PROJECT_DIR"
npm run build >> "$LOG_FILE" 2>&1

# Git コミット＆プッシュ
log "変更をコミット中..."
cd "$PROJECT_DIR"

# 変更があるか確認
if git diff --quiet public/data/news.json 2>/dev/null; then
    log "ニュースデータに変更がありません。スキップします。"
else
    git add public/data/news.json
    git commit -m "$(cat <<EOF
chore: ニュースデータを自動更新 ($(date '+%Y-%m-%d %H:%M'))

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

    log "リモートにプッシュ中..."
    git push origin main >> "$LOG_FILE" 2>&1

    log "デプロイ完了"
fi

log "ニュースビルド終了"
log "=========================================="

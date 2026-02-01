#!/bin/bash

# News Hub - 自動ニュースビルド＆デプロイスクリプト
# 定期実行し、最新ニュースを取得してデプロイする

set -e

# プロジェクトルート
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/cron-build.log"
LAST_RUN_FILE="$PROJECT_DIR/logs/.last-run"

# 最小実行間隔（秒）: 6時間
MIN_INTERVAL=21600

# ログディレクトリ作成
mkdir -p "$PROJECT_DIR/logs"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 前回実行からの経過時間をチェック
if [ -f "$LAST_RUN_FILE" ]; then
    LAST_RUN=$(cat "$LAST_RUN_FILE")
    NOW=$(date +%s)
    ELAPSED=$((NOW - LAST_RUN))

    if [ "$ELAPSED" -lt "$MIN_INTERVAL" ]; then
        REMAINING=$(( (MIN_INTERVAL - ELAPSED) / 60 ))
        log "前回実行から ${ELAPSED}秒 経過。次回実行まで約 ${REMAINING}分。スキップします。"
        exit 0
    fi
fi

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

# 最終実行時刻を記録
date +%s > "$LAST_RUN_FILE"

log "ニュースビルド終了"
log "=========================================="

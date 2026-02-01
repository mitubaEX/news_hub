#!/bin/bash

# News Hub - cron セットアップスクリプト
# macOS の launchd にジョブを登録します

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_FILE="$SCRIPT_DIR/com.newshub.build-news.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "News Hub 自動ビルドのセットアップ"
echo "=================================="

# LaunchAgents ディレクトリ作成
mkdir -p "$LAUNCH_AGENTS_DIR"

# 既存のジョブをアンロード（エラーは無視）
launchctl unload "$LAUNCH_AGENTS_DIR/com.newshub.build-news.plist" 2>/dev/null || true

# plist をコピー
cp "$PLIST_FILE" "$LAUNCH_AGENTS_DIR/"
echo "✓ plist を $LAUNCH_AGENTS_DIR にコピーしました"

# ジョブをロード
launchctl load "$LAUNCH_AGENTS_DIR/com.newshub.build-news.plist"
echo "✓ launchd ジョブを登録しました"

echo ""
echo "セットアップ完了!"
echo ""
echo "設定内容:"
echo "  - 毎日 6:00 に自動実行"
echo "  - ログ: $SCRIPT_DIR/../logs/"
echo ""
echo "コマンド:"
echo "  手動実行:  $SCRIPT_DIR/cron-build-news.sh"
echo "  停止:      launchctl unload ~/Library/LaunchAgents/com.newshub.build-news.plist"
echo "  状態確認:  launchctl list | grep newshub"

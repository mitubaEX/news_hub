#!/bin/bash

# News Hub - cron セットアップスクリプト
# macOS の launchd にジョブを登録します

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_NAME="com.newshub.build-news.plist"
PLIST_DEST="$LAUNCH_AGENTS_DIR/$PLIST_NAME"

echo "News Hub 自動ビルドのセットアップ"
echo "=================================="
echo "プロジェクト: $PROJECT_DIR"
echo ""

# LaunchAgents ディレクトリ作成
mkdir -p "$LAUNCH_AGENTS_DIR"

# 既存のジョブをアンロード（エラーは無視）
launchctl unload "$PLIST_DEST" 2>/dev/null || true

# plist を動的に生成
cat > "$PLIST_DEST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.newshub.build-news</string>

    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/scripts/cron-build-news.sh</string>
    </array>

    <!-- 6時間ごとに実行（スリープ復帰後にも対応） -->
    <key>StartInterval</key>
    <integer>21600</integer>

    <!-- 標準出力/エラーのログ -->
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd-stderr.log</string>

    <!-- 環境変数 -->
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>

    <!-- 起動時に実行しない -->
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF

echo "plist を生成しました: $PLIST_DEST"

# ジョブをロード
launchctl load "$PLIST_DEST"
echo "launchd ジョブを登録しました"

echo ""
echo "セットアップ完了!"
echo ""
echo "設定内容:"
echo "  - 6時間ごとに自動実行"
echo "  - ログ: $PROJECT_DIR/logs/"
echo ""
echo "コマンド:"
echo "  手動実行:  $SCRIPT_DIR/cron-build-news.sh"
echo "  停止:      launchctl unload $PLIST_DEST"
echo "  状態確認:  launchctl list | grep newshub"

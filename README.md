# News Hub

グローバルニュースを歴史的背景とともに閲覧できるWebアプリケーション。

## 機能

- ニュース記事の表示（緊急ニュース・最新ニュース）
- 地域別フィルタリング
- キーワード検索
- 歴史的背景の表示
- リアルタイム更新

## 技術スタック

- React + Vite
- Tailwind CSS
- Radix UI / shadcn/ui
- Ollama（ニュース要約・歴史的背景生成）

## セットアップ

```bash
npm install
npm run dev
```

## ニュースデータの生成

ローカルで Ollama を使用してニュースデータを生成します。

```bash
# サーバー側の依存関係をインストール
cd server
npm install

# Ollama が起動していることを確認してからニュースをビルド
npm run build:news
```

これにより `public/data/news.json` が生成されます。Ollama に接続できない場合は歴史分析なしでビルドされます。

## デプロイ

### 方針

1. **ローカルでニュースデータを生成** - Ollama を使用して RSS フィードから要約・歴史分析を生成
2. **GitHub にプッシュ** - 生成した `news.json` を含めてコミット
3. **Cloudflare Pages にデプロイ** - 静的サイトとしてホスティング

### 手順

```bash
# 1. ニュースデータを生成
cd server && npm run build:news && cd ..

# 2. フロントエンドをビルド
npm run build

# 3. 変更をコミット・プッシュ
git add .
git commit -m "Update news data"
git push
```

### Cloudflare Pages 設定

| 設定項目 | 値 |
|---------|-----|
| ビルドコマンド | `npm run build` |
| ビルド出力ディレクトリ | `dist` |
| ルートディレクトリ | `/` |

**注意**: `public/data/news.json` は事前にローカルで生成しておく必要があります（Cloudflare のビルド環境では Ollama が使用できないため）。
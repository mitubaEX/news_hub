import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, mkdir, readFile } from "fs/promises";
import "dotenv/config";

import { fetchAllNews } from "../services/rssService.js";
import {
  generateHistoricalBackground,
  checkOllamaConnection,
} from "../services/ollamaService.js";
import { NewsItem } from "../types/news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 出力先ディレクトリ（プロジェクトルートの public/data）
const OUTPUT_DIR = join(__dirname, "../../../public/data");

interface BuildOutput {
  generatedAt: string;
  ollamaEnabled: boolean;
  totalNews: number;
  news: NewsItem[];
}

// 既存の news.json を読み込む
async function loadExistingNews(
  outputPath: string
): Promise<Map<string, NewsItem>> {
  const existingMap = new Map<string, NewsItem>();
  try {
    const data = await readFile(outputPath, "utf-8");
    const parsed: BuildOutput = JSON.parse(data);
    for (const item of parsed.news) {
      // link をキーにして既存データを保存
      if (item.link) {
        existingMap.set(item.link, item);
      }
    }
    console.log(`📂 既存データ: ${existingMap.size} 件読み込み`);
  } catch {
    console.log("📂 既存データなし（新規ビルド）");
  }
  return existingMap;
}

async function buildNews(): Promise<void> {
  console.log("🚀 ニュースビルド開始...\n");

  const outputPath = join(OUTPUT_DIR, "news.json");

  // 既存データを読み込み
  const existingNews = await loadExistingNews(outputPath);

  // Ollama接続確認
  const ollamaConnected = await checkOllamaConnection();
  if (!ollamaConnected) {
    console.warn("⚠️  Ollamaに接続できません。歴史分析なしでビルドします。\n");
  }

  // RSSフィード取得
  console.log("📡 RSSフィード取得中...");
  const news = await fetchAllNews(true);
  console.log(`   ${news.length} 件のニュースを取得しました\n`);

  // 新規ニュースと既存ニュースを分類
  const newNews: NewsItem[] = [];
  const cachedNews: NewsItem[] = [];

  for (const item of news) {
    const existing = existingNews.get(item.link);
    if (existing && existing.relatedHistory && existing.historicalSummary) {
      // 既存の歴史分析を再利用
      item.relatedHistory = existing.relatedHistory;
      item.historicalSummary = existing.historicalSummary;
      cachedNews.push(item);
    } else {
      newNews.push(item);
    }
  }

  console.log(`   キャッシュ利用: ${cachedNews.length} 件`);
  console.log(`   新規生成: ${newNews.length} 件\n`);

  // Ollamaで歴史分析を生成（新規ニュースのみ、並列処理）
  if (ollamaConnected && newNews.length > 0) {
    console.log("🤖 歴史分析を生成中（並列処理）...");
    const CONCURRENCY = 4; // 同時処理数
    let processed = 0;

    // バッチ処理で並列実行
    for (let i = 0; i < newNews.length; i += CONCURRENCY) {
      const batch = newNews.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          const analysis = await generateHistoricalBackground(item);
          item.relatedHistory = analysis.historicalEvents;
          item.historicalSummary = analysis.summary;
          return item;
        })
      );

      // 成功/失敗をカウント
      for (const result of results) {
        if (result.status === "fulfilled") {
          processed++;
        } else {
          console.error(`\n   エラー:`, result.reason);
        }
      }

      // 進捗表示
      process.stdout.write(`\r   処理中: ${processed}/${newNews.length}`);
    }
    console.log(`\n   ${processed} 件の分析を完了しました\n`);
  } else if (newNews.length === 0) {
    console.log("✨ すべてのニュースがキャッシュ済み - 生成スキップ\n");
  }

  // 出力ディレクトリ作成
  await mkdir(OUTPUT_DIR, { recursive: true });

  // JSONファイル出力
  const output: BuildOutput = {
    generatedAt: new Date().toISOString(),
    ollamaEnabled: ollamaConnected,
    totalNews: news.length,
    news,
  };

  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ ビルド完了: ${outputPath}`);
  console.log(`   生成日時: ${output.generatedAt}`);
  console.log(`   ニュース数: ${output.totalNews}`);
  console.log(`   歴史分析: ${ollamaConnected ? "有効" : "無効"}`);
}

// 実行
buildNews().catch((error) => {
  console.error("❌ ビルドエラー:", error);
  process.exit(1);
});

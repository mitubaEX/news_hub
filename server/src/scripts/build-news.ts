import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, mkdir } from "fs/promises";
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

async function buildNews(): Promise<void> {
  console.log("🚀 ニュースビルド開始...\n");

  // Ollama接続確認
  const ollamaConnected = await checkOllamaConnection();
  if (!ollamaConnected) {
    console.warn("⚠️  Ollamaに接続できません。歴史分析なしでビルドします。\n");
  }

  // RSSフィード取得
  console.log("📡 RSSフィード取得中...");
  const news = await fetchAllNews(true);
  console.log(`   ${news.length} 件のニュースを取得しました\n`);

  // Ollamaで歴史分析を生成
  if (ollamaConnected) {
    console.log("🤖 歴史分析を生成中...");
    let processed = 0;

    for (const item of news) {
      try {
        const analysis = await generateHistoricalBackground(item);
        item.relatedHistory = analysis.historicalEvents;
        item.historicalSummary = analysis.summary;
        processed++;

        // 進捗表示
        process.stdout.write(`\r   処理中: ${processed}/${news.length}`);
      } catch (error) {
        console.error(`\n   エラー (${item.title}):`, error);
      }
    }
    console.log(`\n   ${processed} 件の分析を完了しました\n`);
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

  const outputPath = join(OUTPUT_DIR, "news.json");
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

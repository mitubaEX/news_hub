import "dotenv/config";
import {
  generateHistoricalBackground,
  checkOllamaConnection,
} from "../services/ollamaService.js";

async function main() {
  const connected = await checkOllamaConnection();
  if (!connected) {
    console.error("Ollama not reachable");
    process.exit(1);
  }

  const sample = {
    id: "test-1",
    title: "生成AIブームで各国が半導体規制を強化、輸出管理を見直しへ",
    summary: "AI半導体の需要拡大を受け、主要国が輸出規制の見直しに動いている。",
    content:
      "生成AIブームによりGPUなどのAI向け半導体の需要が急拡大する中、米国、EU、日本などがハイエンド半導体の輸出管理体制を強化する方針を打ち出した。中国向けの規制を巡っては各国で温度差があり、産業界からは供給網への影響を懸念する声も上がっている。",
    region: "アジア",
    priority: "重要" as const,
    time: "1時間前",
    relatedHistory: [],
    tags: ["半導体", "AI", "輸出規制"],
  };

  console.log("→ Ollama モデル:", process.env.OLLAMA_MODEL || "llama3.2 (default)");
  console.log("→ 分析リクエスト送信中...");
  const t0 = Date.now();
  const analysis = await generateHistoricalBackground(sample);
  console.log(`→ 完了 (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);

  console.log("=== threeLineSummary ===");
  console.log(JSON.stringify(analysis.threeLineSummary, null, 2));
  console.log("\n=== summary ===");
  console.log(analysis.summary);
  console.log("\n=== historicalEvents count ===");
  console.log(analysis.historicalEvents.length);

  const ok =
    Array.isArray(analysis.threeLineSummary) &&
    analysis.threeLineSummary.length === 3 &&
    analysis.threeLineSummary.every(
      (s) => typeof s === "string" && s.length > 0
    );

  console.log(`\n判定: threeLineSummary が3件の非空文字列か → ${ok ? "OK ✅" : "NG ❌"}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

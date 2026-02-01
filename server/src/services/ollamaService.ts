import { Ollama } from "ollama";
import { HistoricalAnalysis, HistoricalEvent, NewsItem } from "../types/news.js";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

const MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// キャッシュ
const historyCache = new Map<string, HistoricalAnalysis>();

const SYSTEM_PROMPT = `あなたは歴史の専門家です。ニュースの全文を分析し、以下のJSON形式で歴史的背景に基づいた分析を返してください:

{
  "summary": "記事の要約と歴史的な視点からの分析（200-400文字程度）。このニュースが持つ歴史的意味や、過去の類似事例との比較を含めてください。",
  "historicalEvents": [
    {
      "year": "年（例: 1945年）",
      "title": "イベントのタイトル",
      "description": "イベントの説明（50-100文字）",
      "significance": "現在のニュースとの関連性（30-50文字）"
    }
  ]
}

重要:
- 必ず上記のJSON形式のみを返してください
- summaryには記事の内容を歴史的な視点から分析した要約を記述してください
- historicalEventsには関連する5つの歴史的イベントを含めてください
- 説明文は日本語で記述してください
- ニュースの地域や内容に関連する歴史的イベントを選んでください
- 直近5年程度（2021年以降）の関連する出来事を選んでください`;

function parseHistoricalAnalysis(response: string): HistoricalAnalysis | null {
  try {
    // JSONオブジェクトを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const summary = typeof parsed.summary === "string" ? parsed.summary : "";

    let historicalEvents: HistoricalEvent[] = [];
    if (Array.isArray(parsed.historicalEvents)) {
      historicalEvents = parsed.historicalEvents
        .filter(
          (item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            "year" in item &&
            "title" in item &&
            "description" in item &&
            "significance" in item
        )
        .slice(0, 5)
        .map((item: Record<string, unknown>) => ({
          year: String(item.year),
          title: String(item.title),
          description: String(item.description),
          significance: String(item.significance),
        }));
    }

    return { summary, historicalEvents };
  } catch (error) {
    console.error("Failed to parse historical analysis:", error);
    return null;
  }
}

export async function generateHistoricalBackground(
  news: NewsItem
): Promise<HistoricalAnalysis> {
  // キャッシュ確認
  if (historyCache.has(news.id)) {
    return historyCache.get(news.id)!;
  }

  const prompt = `以下のニュース記事を分析し、歴史的背景に基づいた要約と関連する歴史的イベントを提供してください:

【タイトル】
${news.title}

【地域】
${news.region}

【タグ】
${news.tags.join(", ")}

【記事全文】
${news.content}`;

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      options: {
        temperature: 0.7,
      },
    });

    const analysis = parseHistoricalAnalysis(response.message.content);

    // キャッシュに保存
    if (analysis && (analysis.summary || analysis.historicalEvents.length > 0)) {
      historyCache.set(news.id, analysis);
      return analysis;
    }

    return { summary: "", historicalEvents: [] };
  } catch (error) {
    console.error("Ollama API error:", error);
    return { summary: "", historicalEvents: [] };
  }
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const models = await ollama.list();
    console.log(
      "Ollama connected. Available models:",
      models.models.map((m) => m.name)
    );
    return true;
  } catch (error) {
    console.error("Failed to connect to Ollama:", error);
    return false;
  }
}

export function clearCache(): void {
  historyCache.clear();
  console.log("History cache cleared");
}

import { Ollama } from "ollama";
import { HistoricalEvent, NewsItem } from "../types/news.js";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

const MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// キャッシュ: ニュースID -> 歴史的背景
const historyCache = new Map<string, HistoricalEvent[]>();

const SYSTEM_PROMPT = `あなたは歴史の専門家です。ニュースの内容を分析し、関連する歴史的背景を提供してください。

以下のJSON形式で3つの歴史的イベントを返してください:
[
  {
    "year": "年（例: 1945年）",
    "title": "イベントのタイトル",
    "description": "イベントの説明（50-100文字）",
    "significance": "現在のニュースとの関連性（30-50文字）"
  }
]

重要:
- 必ずJSON配列のみを返してください
- 説明文は日本語で記述してください
- ニュースの地域や内容に関連する歴史的イベントを選んでください
- 古代から現代まで、多様な時代から選んでください`;

function parseHistoricalEvents(response: string): HistoricalEvent[] {
  try {
    // JSON配列を抽出
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item: unknown) =>
          typeof item === "object" &&
          item !== null &&
          "year" in item &&
          "title" in item &&
          "description" in item &&
          "significance" in item
      )
      .slice(0, 3)
      .map((item) => ({
        year: String(item.year),
        title: String(item.title),
        description: String(item.description),
        significance: String(item.significance),
      }));
  } catch (error) {
    console.error("Failed to parse historical events:", error);
    return [];
  }
}

export async function generateHistoricalBackground(
  news: NewsItem
): Promise<HistoricalEvent[]> {
  // キャッシュ確認
  if (historyCache.has(news.id)) {
    return historyCache.get(news.id)!;
  }

  const prompt = `以下のニュースに関連する歴史的背景を提供してください:

タイトル: ${news.title}
概要: ${news.summary}
地域: ${news.region}
タグ: ${news.tags.join(", ")}`;

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

    const events = parseHistoricalEvents(response.message.content);

    // キャッシュに保存
    if (events.length > 0) {
      historyCache.set(news.id, events);
    }

    return events;
  } catch (error) {
    console.error("Ollama API error:", error);
    return [];
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

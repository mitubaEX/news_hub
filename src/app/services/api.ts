import { NewsItem } from "@/app/types/news";

interface StaticNewsData {
  generatedAt: string;
  ollamaEnabled: boolean;
  totalNews: number;
  news: NewsItem[];
}

let cachedData: StaticNewsData | null = null;

async function loadNewsData(): Promise<StaticNewsData> {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch("/data/news.json");

  if (!response.ok) {
    throw new Error(`Failed to load news data: ${response.status}`);
  }

  cachedData = await response.json();
  return cachedData!;
}

export async function fetchNews(
  region?: string,
  query?: string
): Promise<NewsItem[]> {
  const data = await loadNewsData();
  let news = data.news;

  // 地域フィルター
  if (region && region !== "すべて") {
    news = news.filter((item) => item.region === region);
  }

  // 検索クエリフィルター
  if (query) {
    const lowerQuery = query.toLowerCase();
    news = news.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.summary.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  return news;
}

export async function fetchNewsDetail(
  id: string,
  _withHistory = true
): Promise<NewsItem> {
  const data = await loadNewsData();
  const news = data.news.find((item) => item.id === id);

  if (!news) {
    throw new Error(`News not found: ${id}`);
  }

  return news;
}

export async function refreshNews(): Promise<NewsItem[]> {
  // 静的サイトではキャッシュをクリアして再読み込み
  cachedData = null;
  const data = await loadNewsData();
  return data.news;
}

export async function getGeneratedAt(): Promise<string> {
  const data = await loadNewsData();
  return data.generatedAt;
}

export async function isOllamaEnabled(): Promise<boolean> {
  const data = await loadNewsData();
  return data.ollamaEnabled;
}

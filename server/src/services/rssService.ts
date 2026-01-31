import Parser from "rss-parser";
import { NewsItem, RawRSSItem } from "../types/news.js";
import { RSS_FEEDS } from "../config/feeds.js";

const parser = new Parser();

let cachedNews: NewsItem[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分

function generateId(title: string, source: string): string {
  const hash = `${title}-${source}`.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash).toString(36);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else {
    return `${diffDays}日前`;
  }
}

function determinePriority(item: RawRSSItem): "緊急" | "重要" | "通常" {
  const title = (item.title || "").toLowerCase();
  const content = (item.contentSnippet || "").toLowerCase();
  const text = `${title} ${content}`;

  const urgentKeywords = [
    "breaking",
    "urgent",
    "emergency",
    "速報",
    "緊急",
    "disaster",
    "attack",
    "war",
    "explosion",
    "earthquake",
    "tsunami",
  ];

  const importantKeywords = [
    "important",
    "major",
    "significant",
    "重要",
    "election",
    "summit",
    "death",
    "killed",
  ];

  if (urgentKeywords.some((kw) => text.includes(kw))) {
    return "緊急";
  }
  if (importantKeywords.some((kw) => text.includes(kw))) {
    return "重要";
  }
  return "通常";
}

function extractTags(item: RawRSSItem): string[] {
  const tags: string[] = [];

  if (item.categories) {
    tags.push(...item.categories.slice(0, 3));
  }

  const title = item.title || "";
  const commonTopics = [
    "政治",
    "経済",
    "環境",
    "テクノロジー",
    "スポーツ",
    "文化",
    "健康",
    "科学",
  ];
  const topicKeywords: Record<string, string[]> = {
    政治: ["politics", "election", "government", "minister", "president", "parliament"],
    経済: ["economy", "market", "trade", "business", "stock", "inflation"],
    環境: ["climate", "environment", "pollution", "green", "sustainable"],
    テクノロジー: ["tech", "ai", "digital", "cyber", "innovation"],
    スポーツ: ["sport", "football", "olympic", "championship", "match"],
    文化: ["culture", "art", "music", "film", "festival"],
    健康: ["health", "medical", "hospital", "disease", "vaccine"],
    科学: ["science", "research", "discovery", "space", "nasa"],
  };

  const lowerTitle = title.toLowerCase();
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((kw) => lowerTitle.includes(kw))) {
      tags.push(topic);
    }
  }

  return [...new Set(tags)].slice(0, 5);
}

async function fetchSingleFeed(
  feedConfig: (typeof RSS_FEEDS)[0]
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    const items: NewsItem[] = feed.items.slice(0, 10).map((item) => {
      const rawItem: RawRSSItem = {
        title: item.title,
        contentSnippet: item.contentSnippet,
        content: item.content,
        link: item.link,
        pubDate: item.pubDate,
        categories: item.categories,
      };

      return {
        id: generateId(item.title || "", feedConfig.name),
        title: item.title || "タイトルなし",
        summary: item.contentSnippet || item.content?.slice(0, 200) || "",
        content:
          item.content ||
          item.contentSnippet ||
          "詳細な内容はリンク先をご覧ください。",
        region: feedConfig.region,
        priority: determinePriority(rawItem),
        time: item.pubDate ? formatTimeAgo(item.pubDate) : "不明",
        relatedHistory: [],
        tags: extractTags(rawItem),
        link: item.link,
        source: feedConfig.name,
      };
    });

    return items;
  } catch (error) {
    console.error(`Error fetching feed ${feedConfig.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(forceRefresh = false): Promise<NewsItem[]> {
  const now = Date.now();

  if (!forceRefresh && cachedNews.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedNews;
  }

  console.log("Fetching RSS feeds...");

  const feedPromises = RSS_FEEDS.map((feed) => fetchSingleFeed(feed));
  const results = await Promise.all(feedPromises);

  const allNews = results.flat();

  // 重複除去（タイトルが同じものを除外）
  const seen = new Set<string>();
  const uniqueNews = allNews.filter((news) => {
    const key = news.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 優先度と時間でソート
  uniqueNews.sort((a, b) => {
    const priorityOrder = { 緊急: 0, 重要: 1, 通常: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return 0;
  });

  cachedNews = uniqueNews;
  lastFetchTime = now;

  console.log(`Fetched ${uniqueNews.length} news items`);
  return uniqueNews;
}

export function getNewsById(id: string): NewsItem | undefined {
  return cachedNews.find((news) => news.id === id);
}

export function filterNews(
  news: NewsItem[],
  region?: string,
  query?: string
): NewsItem[] {
  return news.filter((item) => {
    const matchesRegion = !region || region === "すべて" || item.region === region;
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    return matchesRegion && matchesQuery;
  });
}

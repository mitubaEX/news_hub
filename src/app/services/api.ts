import { NewsItem } from "@/app/types/news";

const API_BASE = "/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
  message?: string;
}

export async function fetchNews(
  region?: string,
  query?: string
): Promise<NewsItem[]> {
  const params = new URLSearchParams();
  if (region && region !== "すべて") {
    params.append("region", region);
  }
  if (query) {
    params.append("query", query);
  }

  const url = `${API_BASE}/news${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result: ApiResponse<NewsItem[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Unknown error");
  }

  return result.data;
}

export async function fetchNewsDetail(
  id: string,
  withHistory = true
): Promise<NewsItem> {
  const url = `${API_BASE}/news/${id}?withHistory=${withHistory}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result: ApiResponse<NewsItem> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Unknown error");
  }

  return result.data;
}

export async function refreshNews(): Promise<NewsItem[]> {
  const response = await fetch(`${API_BASE}/news/refresh`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result: ApiResponse<NewsItem[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Unknown error");
  }

  return result.data;
}

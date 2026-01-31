import { useState, useEffect, useCallback } from "react";
import { NewsItem } from "@/app/types/news";
import { fetchNews, fetchNewsDetail, refreshNews } from "@/app/services/api";

interface UseNewsOptions {
  region?: string;
  query?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const {
    region,
    query,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5分
  } = options;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNews(region, query);
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ニュースの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [region, query]);

  const forceRefresh = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await refreshNews();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード & フィルター変更時
  useEffect(() => {
    setLoading(true);
    loadNews();
  }, [loadNews]);

  // 自動リフレッシュ
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadNews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadNews]);

  return {
    news,
    loading,
    error,
    refresh: loadNews,
    forceRefresh,
  };
}

interface UseNewsDetailReturn {
  news: NewsItem | null;
  loading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
}

export function useNewsDetail(id: string | null): UseNewsDetailReturn {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      setError(null);
      const data = await fetchNewsDetail(id, true);
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "詳細の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // IDが変わったらリセット
  useEffect(() => {
    if (!id) {
      setNews(null);
      setError(null);
      return;
    }
  }, [id]);

  return {
    news,
    loading,
    error,
    loadHistory,
  };
}

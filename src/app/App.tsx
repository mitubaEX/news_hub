import { useState, useEffect } from "react";
import { NewsCard } from "@/app/components/NewsCard";
import { NewsDetail } from "@/app/components/NewsDetail";
import { FilterBar } from "@/app/components/FilterBar";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useNews, useNewsDetail } from "@/app/hooks/useNews";
import { NewsItem } from "@/app/types/news";
import { Search, TrendingUp, Clock, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

function NewsCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg shadow border-l-4 border-l-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </div>
  );
}

export default function App() {
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 検索クエリのデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { news, loading, error, forceRefresh } = useNews({
    region: selectedRegion,
    query: debouncedQuery,
  });

  const { news: detailedNews, loading: detailLoading, loadHistory } = useNewsDetail(
    selectedNewsId
  );

  // ニュース選択時の処理
  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNewsId(newsItem.id);
    setSelectedNewsItem(newsItem);
  };

  // 詳細ダイアログが開いたら歴史的背景を読み込む
  useEffect(() => {
    if (selectedNewsId) {
      loadHistory();
    }
  }, [selectedNewsId, loadHistory]);

  // 詳細データが取得できたら更新
  const displayedNews = detailedNews || selectedNewsItem;

  const urgentNews = news.filter((n) => n.priority === "緊急");
  const otherNews = news.filter((n) => n.priority !== "緊急");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">グローバルニュースハブ</h1>
                <p className="text-sm text-gray-600">世界情勢を歴史的背景とともに</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={forceRefresh}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                更新
              </Button>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                リアルタイム更新中
              </Badge>
            </div>
          </div>

          {/* 検索バー */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ニュースを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* フィルターバー */}
          <FilterBar selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* エラー表示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-700 font-medium">エラーが発生しました</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={forceRefresh} className="ml-auto">
              再試行
            </Button>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">総ニュース数</div>
            <div className="text-3xl">
              {loading ? <Skeleton className="h-9 w-16" /> : news.length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-600 mb-1">緊急ニュース</div>
            <div className="text-3xl text-red-600">
              {loading ? <Skeleton className="h-9 w-8" /> : urgentNews.length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">歴史的情報リンク</div>
            <div className="text-3xl text-blue-600">
              {loading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                news.reduce((sum, n) => sum + n.relatedHistory.length, 0)
              )}
            </div>
          </div>
        </div>

        {/* ローディング状態 */}
        {loading && news.length === 0 && (
          <>
            <div className="mb-8">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="grid grid-cols-1 gap-4">
                <NewsCardSkeleton />
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
              </div>
            </div>
          </>
        )}

        {/* 緊急ニュース */}
        {!loading && urgentNews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-500 px-3 py-1 rounded text-white text-sm font-medium">
                緊急
              </div>
              <h2 className="text-xl">緊急ニュース</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {urgentNews.map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} onClick={() => handleNewsClick(newsItem)} />
              ))}
            </div>
          </div>
        )}

        {/* その他のニュース */}
        {!loading && otherNews.length > 0 && (
          <div>
            <h2 className="text-xl mb-4">最新ニュース</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {otherNews.map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} onClick={() => handleNewsClick(newsItem)} />
              ))}
            </div>
          </div>
        )}

        {!loading && news.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <p>該当するニュースが見つかりませんでした。</p>
          </div>
        )}
      </main>

      {/* ニュース詳細ダイアログ */}
      <NewsDetail
        news={displayedNews}
        open={!!selectedNewsId}
        onClose={() => {
          setSelectedNewsId(null);
          setSelectedNewsItem(null);
        }}
        loading={detailLoading}
      />
    </div>
  );
}

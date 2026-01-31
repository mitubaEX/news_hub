import { useState } from "react";
import { NewsCard } from "@/app/components/NewsCard";
import { NewsDetail } from "@/app/components/NewsDetail";
import { FilterBar } from "@/app/components/FilterBar";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { mockNewsData } from "@/app/data/mockNews";
import { NewsItem } from "@/app/types/news";
import { Search, TrendingUp, Clock } from "lucide-react";

export default function App() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNews = mockNewsData.filter((news) => {
    const matchesRegion = selectedRegion === "すべて" || news.region === selectedRegion;
    const matchesSearch =
      searchQuery === "" ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  const urgentNews = filteredNews.filter((news) => news.priority === "緊急");
  const otherNews = filteredNews.filter((news) => news.priority !== "緊急");

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
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              リアルタイム更新中
            </Badge>
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
        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">総ニュース数</div>
            <div className="text-3xl">{filteredNews.length}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-600 mb-1">緊急ニュース</div>
            <div className="text-3xl text-red-600">{urgentNews.length}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">歴史的情報リンク</div>
            <div className="text-3xl text-blue-600">
              {filteredNews.reduce((sum, news) => sum + news.relatedHistory.length, 0)}
            </div>
          </div>
        </div>

        {/* 緊急ニュース */}
        {urgentNews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-500 px-3 py-1 rounded text-white text-sm font-medium">
                緊急
              </div>
              <h2 className="text-xl">緊急ニュース</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {urgentNews.map((news) => (
                <NewsCard key={news.id} news={news} onClick={() => setSelectedNews(news)} />
              ))}
            </div>
          </div>
        )}

        {/* その他のニュース */}
        <div>
          <h2 className="text-xl mb-4">最新ニュース</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {otherNews.map((news) => (
              <NewsCard key={news.id} news={news} onClick={() => setSelectedNews(news)} />
            ))}
          </div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>該当するニュースが見つかりませんでした。</p>
          </div>
        )}
      </main>

      {/* ニュース詳細ダイアログ */}
      <NewsDetail news={selectedNews} open={!!selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}

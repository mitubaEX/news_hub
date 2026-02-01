import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";
import { NewsItem } from "@/app/types/news";

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
  isRead?: boolean;
}

export function NewsCard({ news, onClick, isRead = false }: NewsCardProps) {
  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      "アジア": "bg-blue-500",
      "ヨーロッパ": "bg-green-500",
      "中東": "bg-orange-500",
      "アメリカ": "bg-purple-500",
      "アフリカ": "bg-yellow-500",
      "オセアニア": "bg-teal-500",
    };
    return colors[region] || "bg-gray-500";
  };

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, string> = {
      "緊急": "border-l-4 border-l-red-500",
      "重要": "border-l-4 border-l-orange-500",
      "通常": "border-l-4 border-l-blue-500",
    };
    return styles[priority] || "";
  };

  return (
    <Card
      className={`p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getPriorityStyle(
        news.priority
      )} ${isRead ? "opacity-60 bg-gray-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getRegionColor(news.region)} text-white`}>
              {news.region}
            </Badge>
            {news.priority === "緊急" && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                緊急
              </Badge>
            )}
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {news.time}
            </span>
          </div>
          <h3 className="text-xl mb-2">{news.title}</h3>
          <p className="text-gray-600 line-clamp-2">{news.summary}</p>
          {news.relatedHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-blue-600">
                関連する歴史的情報 {news.relatedHistory.length}件
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

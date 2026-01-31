import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Clock, MapPin, History, ExternalLink, Loader2 } from "lucide-react";
import { NewsItem } from "@/app/types/news";

interface NewsDetailProps {
  news: NewsItem | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

function HistorySkeleton() {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-16" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </Card>
  );
}

export function NewsDetail({ news, open, onClose, loading = false }: NewsDetailProps) {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{news.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* メタ情報 */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-blue-500 text-white">
                <MapPin className="w-3 h-3 mr-1" />
                {news.region}
              </Badge>
              {news.priority === "緊急" && (
                <Badge variant="destructive">緊急</Badge>
              )}
              {news.priority === "重要" && (
                <Badge className="bg-orange-500 text-white">重要</Badge>
              )}
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {news.time}
              </span>
              {news.source && (
                <Badge variant="outline">{news.source}</Badge>
              )}
            </div>

            {/* タグ */}
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator />

            {/* 本文 */}
            <div>
              <h3 className="text-lg mb-3">概要</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {news.content}
              </p>
              {news.link && (
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  元記事を読む
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <Separator />

            {/* 関連する歴史的情報 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg">関連する歴史的背景</h3>
                {loading && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </div>

              {loading && news.relatedHistory.length === 0 ? (
                <div className="space-y-4">
                  <HistorySkeleton />
                  <HistorySkeleton />
                  <HistorySkeleton />
                </div>
              ) : news.relatedHistory.length > 0 ? (
                <div className="space-y-4">
                  {news.relatedHistory.map((event, index) => (
                    <Card key={index} className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                          {event.year}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{event.title}</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {event.description}
                          </p>
                          <p className="text-sm text-blue-700 italic">
                            現在への影響: {event.significance}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  歴史的背景情報はまだ生成されていません。
                  {!loading && " Ollamaが起動していることを確認してください。"}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

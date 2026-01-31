export interface HistoricalEvent {
  year: string;
  title: string;
  description: string;
  significance: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  region: string;
  priority: "緊急" | "重要" | "通常";
  time: string;
  relatedHistory: HistoricalEvent[];
  historicalSummary?: string;
  tags: string[];
}

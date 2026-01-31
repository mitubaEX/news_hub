import { RSSFeedConfig } from "../types/news.js";

export const RSS_FEEDS: RSSFeedConfig[] = [
  {
    name: "NHK World News",
    url: "https://www3.nhk.or.jp/rss/news/cat0.xml",
    region: "アジア",
  },
  {
    name: "BBC News World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    region: "ヨーロッパ",
  },
  {
    name: "BBC News Asia",
    url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
    region: "アジア",
  },
  {
    name: "BBC News Middle East",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    region: "中東",
  },
  {
    name: "BBC News Africa",
    url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
    region: "アフリカ",
  },
  {
    name: "BBC News US & Canada",
    url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    region: "アメリカ",
  },
  {
    name: "BBC News Europe",
    url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
    region: "ヨーロッパ",
  },
];

export const REGIONS = [
  "すべて",
  "アジア",
  "ヨーロッパ",
  "中東",
  "アメリカ",
  "アフリカ",
  "オセアニア",
];

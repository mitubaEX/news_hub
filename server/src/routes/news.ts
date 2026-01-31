import { Router, Request, Response } from "express";
import { fetchAllNews, getNewsById, filterNews } from "../services/rssService.js";
import { generateHistoricalBackground } from "../services/ollamaService.js";

const router = Router();

// GET /api/news - ニュース一覧取得
router.get("/", async (req: Request, res: Response) => {
  try {
    const { region, query } = req.query;
    const allNews = await fetchAllNews();
    const filtered = filterNews(
      allNews,
      region as string | undefined,
      query as string | undefined
    );
    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      error: "ニュースの取得に失敗しました",
    });
  }
});

// GET /api/news/refresh - RSSフィード再取得
router.get("/refresh", async (_req: Request, res: Response) => {
  try {
    const news = await fetchAllNews(true);
    res.json({
      success: true,
      data: news,
      total: news.length,
      message: "フィードを更新しました",
    });
  } catch (error) {
    console.error("Error refreshing news:", error);
    res.status(500).json({
      success: false,
      error: "フィードの更新に失敗しました",
    });
  }
});

// GET /api/news/:id - 個別ニュース詳細（歴史的背景付き）
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { withHistory } = req.query;

    // キャッシュにない場合は一度フェッチ
    await fetchAllNews();
    const news = getNewsById(id);

    if (!news) {
      res.status(404).json({
        success: false,
        error: "ニュースが見つかりませんでした",
      });
      return;
    }

    // 歴史的背景が要求された場合
    if (withHistory === "true" && news.relatedHistory.length === 0) {
      const analysis = await generateHistoricalBackground(news);
      news.relatedHistory = analysis.historicalEvents;
      news.historicalSummary = analysis.summary;
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Error fetching news detail:", error);
    res.status(500).json({
      success: false,
      error: "ニュース詳細の取得に失敗しました",
    });
  }
});

export default router;

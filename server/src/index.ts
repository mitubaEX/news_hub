import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import newsRouter from "./routes/news.js";
import { checkOllamaConnection } from "./services/ollamaService.js";
import { fetchAllNews } from "./services/rssService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/news", newsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  // Check Ollama connection
  const ollamaConnected = await checkOllamaConnection();
  if (!ollamaConnected) {
    console.warn(
      "Warning: Ollama is not available. Historical background generation will be disabled."
    );
  }

  // Initial RSS fetch
  console.log("Fetching initial RSS feeds...");
  await fetchAllNews();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/news`);
  });
}

start().catch(console.error);

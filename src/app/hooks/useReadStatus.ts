import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "news_read_status";

export function useReadStatus() {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]));
    } catch {
      // localStorage が使えない場合は無視
    }
  }, [readIds]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const clearAll = useCallback(() => {
    setReadIds(new Set());
  }, []);

  return { isRead, markAsRead, clearAll, readCount: readIds.size };
}

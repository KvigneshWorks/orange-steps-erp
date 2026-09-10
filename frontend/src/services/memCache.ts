// Simple in-memory cache that survives page navigation (not refresh)
const store = new Map<string, { data: any; ts: number }>();

const TTL = 60_000; // 60 seconds

export const memCache = {
  get(key: string): any | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set(key: string, data: any): void {
    store.set(key, { data, ts: Date.now() });
  },

  clear(key: string): void {
    store.delete(key);
  },

  clearAll(): void {
    store.clear();
  }
};
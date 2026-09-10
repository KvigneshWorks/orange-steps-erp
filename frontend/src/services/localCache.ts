// Persists across page refreshes using localStorage
const TTL = 5 * 60 * 1000; // 5 minutes

export const localCache = {
  get(key: string): any | null {
    try {
      const raw = localStorage.getItem(`erp_cache_${key}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL) {
        localStorage.removeItem(`erp_cache_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(key: string, data: any): void {
    try {
      localStorage.setItem(`erp_cache_${key}`, JSON.stringify({
        data,
        ts: Date.now()
      }));
    } catch {
      // localStorage full — ignore
    }
  },

  clear(key: string): void {
    localStorage.removeItem(`erp_cache_${key}`);
  }
};
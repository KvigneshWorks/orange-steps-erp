// Session-scoped: persists across page refreshes within the same tab/browser session,
// but clears when the tab or browser closes -- these are short-lived (5 min TTL) cached
// API responses, not data that should survive a full browser restart.
const TTL = 5 * 60 * 1000; // 5 minutes

export const localCache = {
  get(key: string): any | null {
    try {
      const raw = sessionStorage.getItem(`erp_cache_${key}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL) {
        sessionStorage.removeItem(`erp_cache_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(key: string, data: any): void {
    try {
      sessionStorage.setItem(`erp_cache_${key}`, JSON.stringify({
        data,
        ts: Date.now()
      }));
    } catch {
      // sessionStorage full — ignore
    }
  },

  clear(key: string): void {
    sessionStorage.removeItem(`erp_cache_${key}`);
  }
};
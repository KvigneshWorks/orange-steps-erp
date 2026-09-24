const TTL = 5 * 60 * 1000;

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
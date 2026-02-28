
// 缓存过期时间（秒）
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;

export const createStorage = ({ prefixKey = '', storage = sessionStorage }) => {
  const WebStorage = class WebStorage {
    private storage: Storage;
    private prefixKey?: string;

    public constructor() {
      this.storage = storage;
      this.prefixKey = prefixKey;
    }

    public set(key: string, value: any, expire?: number | null): void {
      const stringData = JSON.stringify({
        value,
        expire: expire && expire !== null ? new Date().getTime() + expire || DEFAULT_CACHE_TIME * 1000 : null,
      });
      this.storage.setItem(this.geKey(key), stringData);
    }

    public get(key: string, def: any = null): any {
      const item = this.storage.getItem(this.geKey(key));
      if (item) {
        try {
          const data = JSON.parse(item);
          const { value, expire } = data;
          if (expire === null || expire >= new Date().getTime()) {
            return value;
          }
          this.remove(this.geKey(key));
        } catch (error) {
          return def;
        }
      }
      return def;
    }
    /**
     * 删除本地缓存
     * @param key
     */
    public remove(key: string): void {
      this.storage.removeItem(this.geKey(key));
    }

    /**
     * 移除本地缓存
     */
    public clear(): void {
      this.storage.clear();
    }
    private geKey(key: string) {
      return `${this.prefixKey}${key}`.toUpperCase();
    }
  };

  return new WebStorage();
};

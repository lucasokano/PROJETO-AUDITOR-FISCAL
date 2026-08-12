const STALE_TIME = 60_000;

interface Entry<T> {
  data?: T;
  fetchedAt: number;
  promise?: Promise<T>;
}

export function createKeyedCache<T>() {
  const entries = new Map<number, Entry<T>>();

  function peek(key: number) {
    return entries.get(key)?.data;
  }

  function load(key: number, fetcher: () => Promise<T>) {
    const entry = entries.get(key) ?? { fetchedAt: 0 };
    entries.set(key, entry);
    if (entry.data !== undefined && Date.now() - entry.fetchedAt < STALE_TIME) return Promise.resolve(entry.data);
    if (entry.promise) return entry.promise;

    entry.promise = fetcher().then((data) => {
      entry.data = data;
      entry.fetchedAt = Date.now();
      return data;
    }).finally(() => { entry.promise = undefined; });
    return entry.promise;
  }

  function invalidate(key?: number) {
    if (key === undefined) entries.clear();
    else entries.delete(key);
  }

  return { peek, load, invalidate };
}

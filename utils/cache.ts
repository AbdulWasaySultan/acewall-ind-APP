import AsyncStorage from "@react-native-async-storage/async-storage";
import { encryptForCache, decryptFromCache } from "./cacheEncryption";

// Every cache entry lives under this prefix so eviction can enumerate and
// clean up only entries this module owns, never touching unrelated
// AsyncStorage keys (auth session flags, feature-unrelated app state, etc).
const CACHE_PREFIX = "cache:";

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // epoch ms
}

// AsyncStorage's underlying native stores (SQLite on Android, a flat file
// on iOS) throw differently-worded errors when the device is out of space,
// there's no single standard "QuotaExceededError". Match on the recurring
// vocabulary instead of a specific error type.
export const isQuotaExceededError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return /quota|full|disk|no space|database or disk/i.test(message);
};

const keyFor = (key: string): string => CACHE_PREFIX + key;

// The one cleanup we can safely perform on a quota error without touching
// data outside our own namespace: drop cache entries that are already
// expired. Anything still valid is left alone — we're freeing space, not
// invalidating live data.
const evictExpiredEntries = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length === 0) return;

    const entries = await AsyncStorage.multiGet(cacheKeys);
    const now = Date.now();
    const expiredFlags = await Promise.all(
      entries.map(async ([, raw]) => {
        if (!raw) return true;
        try {
          const decrypted = await decryptFromCache(raw);
          if (!decrypted) return true; // undecryptable — safe to drop
          const parsed: CacheEntry<unknown> = JSON.parse(decrypted);
          return typeof parsed.expiresAt !== "number" || parsed.expiresAt <= now;
        } catch {
          return true; // corrupt entry — safe to drop
        }
      })
    );
    const expiredKeys = entries
      .filter((_, i) => expiredFlags[i])
      .map(([k]) => k);

    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys);
    }
  } catch (error) {
    console.error("Error evicting expired cache entries:", error);
  }
};

/**
 * Write a cache entry with a time-to-live. The entry is AES-256 encrypted
 * (see cacheEncryption.ts) before it ever touches AsyncStorage — cached
 * course/profile data sits at rest as ciphertext, not plain JSON. Never
 * throws: on a storage-full error it evicts this module's own expired
 * entries and retries once; if that still fails it logs and returns false
 * so the caller can keep going without the cache (a failed cache write
 * should never crash a feature).
 */
export const setCacheItem = async <T,>(
  key: string,
  data: T,
  ttlMs: number
): Promise<boolean> => {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  const payload = await encryptForCache(JSON.stringify(entry));
  const storageKey = keyFor(key);

  try {
    await AsyncStorage.setItem(storageKey, payload);
    return true;
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      console.error(`Error writing cache item [${key}]:`, error);
      return false;
    }

    await evictExpiredEntries();
    try {
      await AsyncStorage.setItem(storageKey, payload);
      return true;
    } catch (retryError) {
      console.error(
        `Storage full — could not cache item [${key}] even after evicting expired entries:`,
        retryError
      );
      return false;
    }
  }
};

/** Returns null (and clears the entry) once its TTL has passed, or if it can't be decrypted (e.g. a pre-encryption legacy entry). */
export const getCacheItem = async <T,>(key: string): Promise<T | null> => {
  const storageKey = keyFor(key);
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;

    const decrypted = await decryptFromCache(raw);
    if (!decrypted) {
      await AsyncStorage.removeItem(storageKey);
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(decrypted);
    if (typeof entry.expiresAt !== "number" || entry.expiresAt <= Date.now()) {
      await AsyncStorage.removeItem(storageKey);
      return null;
    }
    return entry.data;
  } catch (error) {
    console.error(`Error reading cache item [${key}]:`, error);
    return null;
  }
};

export const clearCacheItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(keyFor(key));
    return true;
  } catch (error) {
    console.error(`Error clearing cache item [${key}]:`, error);
    return false;
  }
};

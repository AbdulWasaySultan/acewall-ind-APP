import CryptoJS from "crypto-js";
import { getSecureItem, setSecureItem } from "./secureStorage";

// The cache's AES-256 key itself lives in the iOS Keychain / Android
// Keystore (via secureStorage.ts), not in AsyncStorage alongside the data
// it protects — an attacker with raw filesystem access to AsyncStorage's
// SQLite DB / flat file gets ciphertext only, never the key.
const CACHE_KEY_NAME = "cacheEncryptionKey";

// Generated once per install, then reused — regenerating the key would
// permanently strand any already-cached entries (this is a cache, so that's
// recoverable, just an extra cold read on next use rather than a real bug).
let cachedKeyHex: string | null = null;

const getOrCreateKey = async (): Promise<CryptoJS.lib.WordArray> => {
  if (!cachedKeyHex) {
    cachedKeyHex = await getSecureItem(CACHE_KEY_NAME);
    if (!cachedKeyHex) {
      cachedKeyHex = CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex);
      await setSecureItem(CACHE_KEY_NAME, cachedKeyHex);
    }
  }
  return CryptoJS.enc.Hex.parse(cachedKeyHex);
};

/** AES-256-CBC encrypt, with a fresh random IV per call stored alongside the ciphertext. */
export const encryptForCache = async (plaintext: string): Promise<string> => {
  const key = await getOrCreateKey();
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, key, { iv }).toString();
  return `${iv.toString(CryptoJS.enc.Hex)}:${ciphertext}`;
};

/** Returns null (rather than throwing) for anything that isn't a validly-encrypted payload — covers pre-encryption legacy entries and corruption alike. */
export const decryptFromCache = async (payload: string): Promise<string | null> => {
  const [ivHex, ciphertext] = payload.split(":");
  if (!ivHex || !ciphertext) return null;

  try {
    const key = await getOrCreateKey();
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv });
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext || null;
  } catch {
    return null;
  }
};

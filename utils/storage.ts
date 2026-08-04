import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "react-native-config";
import { setSecureItem, getSecureItem, removeSecureItem } from "./secureStorage";
import { isQuotaExceededError } from "./cache";

const STORAGE_KEYS = {
  BASE_URL: "selectedBaseUrl",
  USER_ID: "userId",
};

// Shared by every plain AsyncStorage write below (session/profile data, not
// TTL cache entries — those go through utils/cache.ts). Never throws: a
// full device should degrade the write to a no-op, not crash the caller.
// Quota errors get a distinct log line since "couldn't persist, disk full"
// is a different problem for support to see than a generic AsyncStorage
// failure.
const safeSetItem = async (key: string, value: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error(`Device storage is full — could not save [${key}]. Data was not persisted.`);
    } else {
      console.error(`Error saving [${key}]:`, error);
    }
    return false;
  }
};

// Sourced from .env.development / .env.production (react-native-config)
// instead of being hardcoded, so the endpoint can change per build without
// touching source. Falls back to the known production API only if a build
// somehow ships without an env file wired up.
const DEFAULT_BASE_URL =
  Config.API_BASE_URL || "https://api.acewallscholarslearningonline.org";

export const getStoredBaseUrl = async (): Promise<string | null> => {
  try {
    return DEFAULT_BASE_URL;
  } catch (error) {
    console.error("Error retrieving baseUrl:", error);
    return null;
  }
};

export const setStoredBaseUrl = async (baseUrl: string): Promise<boolean> => {
  return safeSetItem(STORAGE_KEYS.BASE_URL, DEFAULT_BASE_URL);
};

export const clearStoredBaseUrl = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.BASE_URL);
    return true;
  } catch (error) {
    console.error("Error clearing baseUrl:", error);
    return false;
  }
};

export const getStoredUserId = async (): Promise<string | null> => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    if (!userDataString) {
      console.log('couldnt fetch the userid')
      return null;
    }
    const userData = JSON.parse(userDataString);
    return userData._id || null;
  } catch (error) {
    console.error("Error retrieving userId:", error);
    return null;
  }
};

export const setStoredUserId = async (userId: string): Promise<boolean> => {
  return safeSetItem(STORAGE_KEYS.USER_ID, userId);
};

export const clearStoredUserId = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    return true;
  } catch (error) {
    console.error("Error clearing userId:", error);
    return false;
  }
};

export const setStoredUserData = async (userData: any): Promise<boolean> => {
  return safeSetItem("userData", JSON.stringify(userData));
};

export const getStoredUserData = async (): Promise<any | null> => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    console.log(userDataString);
    if (!userDataString) return null;
    return JSON.parse(userDataString);
  } catch (error) {
    console.error("Error retrieving userData:", error);
    return null;
  }
};

// USER TOKEN — stored in the iOS Keychain / Android Keystore via
// react-native-keychain rather than AsyncStorage, since AsyncStorage is
// unencrypted on-device storage and this value is a live auth credential.

const TOKEN_KEY = "authToken";

export const setUserToken = async (token: string): Promise<boolean> => {
  return setSecureItem(TOKEN_KEY, token);
};

export const getUserToken = async (): Promise<string | null> => {
  return getSecureItem(TOKEN_KEY);
};

export const clearUserToken = async (): Promise<boolean> => {
  return removeSecureItem(TOKEN_KEY);
};

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  BASE_URL: "selectedBaseUrl",
  USER_ID: "userId",
};

export const getStoredBaseUrl = async (): Promise<string | null> => {
  try {
    return "https://api.acewallscholarslearningonline.org";
  } catch (error) {
    console.error("Error retrieving baseUrl:", error);
    return null;
  }
};

export const setStoredBaseUrl = async (baseUrl: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.BASE_URL,
      "https://api.acewallscholarslearningonline.org"
    );
    return true;
  } catch (error) {
    console.error("Error saving baseUrl:", error);
    return false;
  }
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
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    return true;
  } catch (error) {
    console.error("Error saving userId:", error);
    return false;
  }
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
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error saving userData:", error);
    return false;
  }
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

// Set USER TOKEN

export const setUserToken = async (token: string): Promise<boolean> => {
  try {
    // Store the raw JWT string - apiInstance.ts reads this back verbatim and
    // sends it as `Bearer ${token}`, so it must NOT be JSON-stringified
    // (that would wrap it in quote characters and break verification).
    await AsyncStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
};

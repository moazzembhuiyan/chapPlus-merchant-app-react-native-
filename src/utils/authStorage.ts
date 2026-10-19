import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_KEY = "token";
export const PUSH_TOKEN_KEY = "expo_push_token";
export const USER_KEY = "user";
export const FORGET_PW_TOKEN_KEY = "forget-password-token";

export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const setExpoPushToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
};

export const getExpoPushToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
};

export const setAuthUser = async (user: any): Promise<void> => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthUser = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearAuthStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      PUSH_TOKEN_KEY,
      USER_KEY,
      FORGET_PW_TOKEN_KEY,
    ]);
  } catch (error) {
    console.error("Error clearing auth storage:", error);
  }
};
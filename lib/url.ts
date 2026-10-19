const rawUrl =
  process.env.EXPO_PUBLIC_API_URL || "https://api.chapplus.com/api";

// Strip trailing slash if present to prevent double slashes in request paths
export const apiUrl = rawUrl.replace(/\/+$/, "");
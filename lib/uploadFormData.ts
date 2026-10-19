import { formatErrorMessage } from "./formatErrorMessage";

export { formatErrorMessage };

/**
 * React Native + Expo safe multipart upload
 * Uses XMLHttpRequest so { uri, name, type } works
 */
export function uploadFormData(
  url: string,
  formData: FormData,
  token?: string | null,
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== "string" || url.includes("undefined") || url.includes("null")) {
      const err = {
        message: `Invalid upload URL: "${url}". Please ensure apiUrl is configured properly.`,
        url,
        status: 0,
      };
      console.error("[uploadFormData] URL validation error:", err);
      return reject(err);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = 60000; // 60s timeout for file uploads

    xhr.setRequestHeader("Accept", "application/json");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    // Do NOT manually set Content-Type so multipart boundary is generated automatically

    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        json = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json);
      } else {
        const errorMsg = formatErrorMessage(
          json,
          `Upload failed with HTTP ${xhr.status}`,
        );

        const rejection = {
          status: xhr.status,
          statusText: xhr.statusText,
          data: json,
          responseText: xhr.responseText,
          message: errorMsg,
          url,
        };

        console.error("[uploadFormData] Server returned error response:", {
          status: xhr.status,
          statusText: xhr.statusText,
          message: errorMsg,
          url,
          data: json,
        });

        reject(rejection);
      }
    };

    xhr.onerror = (event: any) => {
      let detailMessage = "Network request failed. Please check your internet connection.";
      if (xhr.status) {
        detailMessage = `Network error (HTTP ${xhr.status}): ${xhr.statusText || "Request failed"}`;
      }

      const rejection = {
        status: xhr.status || 0,
        statusText: xhr.statusText || "",
        readyState: xhr.readyState,
        responseText: xhr.responseText || null,
        data: xhr.response || null,
        message: detailMessage,
        url,
        event: event?.type || "error",
      };

      console.error("[uploadFormData] XHR network error:", rejection);
      reject(rejection);
    };

    xhr.ontimeout = () => {
      const rejection = {
        status: 408,
        message: "Upload request timed out. Please check your internet connection and try again.",
        url,
      };
      console.error("[uploadFormData] XHR timeout:", rejection);
      reject(rejection);
    };

    xhr.send(formData);
  });
}

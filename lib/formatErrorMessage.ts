/**
 * Utility to extract and humanize API and validation error messages
 * into user-friendly notifications for merchants.
 */

const IGNORED_ERROR_KEYS = new Set([
  "code",
  "status",
  "exception",
  "trace",
  "file",
  "line",
  "details",
]);

/**
 * Humanizes Laravel validation field keys and text
 * e.g. "images.1" -> "Image 2"
 * "variants.0.stock_quantity" -> "Variant 1 stock quantity"
 * "The images.1 failed to upload." -> "Image 2 failed to upload (file may exceed server upload limit or format is unsupported)."
 */
export function humanizeValidationMessage(msg: string): string {
  if (!msg || typeof msg !== "string") return "";

  let cleaned = msg.trim();

  // If HTML returned
  if (cleaned.includes("<html") || cleaned.includes("<!DOCTYPE")) {
    if (cleaned.includes("413") || cleaned.includes("Payload Too Large")) {
      return "Upload size too large. Please select smaller images.";
    }
    return "Server error occurred. Please try again.";
  }

  // Transform "images.0", "images.1" -> "Image 1", "Image 2"
  cleaned = cleaned.replace(/\bimages\.(\d+)\b/gi, (_, idx) => `Image ${parseInt(idx, 10) + 1}`);

  // Transform "variants.0.field_name" -> "Variant 1 field name"
  cleaned = cleaned.replace(/\bvariants\.(\d+)\.([a-zA-Z0-9_]+)\b/gi, (_, idx, field) => {
    const humanField = field.replace(/_/g, " ");
    return `Variant ${parseInt(idx, 10) + 1} ${humanField}`;
  });

  // Humanize common field names with underscores
  cleaned = cleaned.replace(/\bbase_price\b/gi, "base price");
  cleaned = cleaned.replace(/\bdiscount_price\b/gi, "discount price");
  cleaned = cleaned.replace(/\bcategory_slug\b/gi, "category");
  cleaned = cleaned.replace(/\bunit_type\b/gi, "unit type");
  cleaned = cleaned.replace(/\bunit_value\b/gi, "unit value");
  cleaned = cleaned.replace(/\bstock_quantity\b/gi, "stock quantity");

  // Make "failed to upload" more descriptive for merchants
  if (/failed to upload/i.test(cleaned)) {
    cleaned = cleaned.replace(/\.?\s*$/, "");
    cleaned = `${cleaned} (file may exceed server upload limit or format is unsupported).`;
  }

  // Remove leading "The " if followed by Image or another capitalized noun
  cleaned = cleaned.replace(/^The\s+(Image\s+\d+)/i, "$1");
  cleaned = cleaned.replace(/^The\s+/i, "");

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned.trim();
}

/**
 * Parses any error structure (RTK Query error, XMLHttpRequest rejection, Axios error, or raw JSON)
 * and extracts human-readable validation or status messages.
 */
export function formatErrorMessage(
  error: any,
  fallbackMessage = "An error occurred. Please try again.",
): string {
  if (!error) return fallbackMessage;

  // If already a string
  if (typeof error === "string") {
    // Check if it's stringified JSON
    if (error.startsWith("{") && error.endsWith("}")) {
      try {
        const parsed = JSON.parse(error);
        return formatErrorMessage(parsed, fallbackMessage);
      } catch {
        // Not valid JSON, continue with string
      }
    }
    const humanized = humanizeValidationMessage(error);
    return humanized || fallbackMessage;
  }

  // Unpack data / response objects
  const data = error.data || error.response?.data || error.response || error;

  // 1. Check for Laravel validation errors object: data.errors
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const errorMessages: string[] = [];

    for (const [key, value] of Object.entries(data.errors)) {
      if (IGNORED_ERROR_KEYS.has(key.toLowerCase())) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string" && item.trim() && item !== "VALIDATION_ERROR") {
            errorMessages.push(humanizeValidationMessage(item));
          }
        }
      } else if (typeof value === "string" && value.trim() && value !== "VALIDATION_ERROR") {
        errorMessages.push(humanizeValidationMessage(value));
      }
    }

    if (errorMessages.length > 0) {
      // Return up to first 2 messages joined by newline
      return errorMessages.slice(0, 2).join("\n");
    }
  }

  // 2. Check data.errors if it's an array of strings
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const msgs = data.errors
      .filter((e: any) => typeof e === "string" && e.trim() && e !== "VALIDATION_ERROR")
      .map((e: string) => humanizeValidationMessage(e));
    if (msgs.length > 0) return msgs.slice(0, 2).join("\n");
  }

  // 3. Check data.message if meaningful
  if (
    typeof data?.message === "string" &&
    data.message.trim() &&
    data.message !== "VALIDATION_ERROR" &&
    data.message !== "The given data was invalid."
  ) {
    return humanizeValidationMessage(data.message.trim());
  }

  // 4. Check error.message if meaningful
  if (
    typeof error.message === "string" &&
    error.message.trim() &&
    error.message !== "VALIDATION_ERROR" &&
    error.message !== "The given data was invalid."
  ) {
    return humanizeValidationMessage(error.message.trim());
  }

  // 5. Check error.error (RTK Query standard string error)
  if (
    typeof error.error === "string" &&
    error.error.trim() &&
    error.error !== "VALIDATION_ERROR" &&
    error.error !== "The given data was invalid."
  ) {
    return humanizeValidationMessage(error.error.trim());
  }

  // 6. HTTP Status Code fallbacks
  const status = error.status || data?.status;
  if (status === 413) {
    return "Upload size too large. Please select smaller images.";
  }
  if (status === 408) {
    return "Upload request timed out. Please check your internet connection and try again.";
  }
  if (status === 401 || status === 403) {
    return "Session expired or unauthorized. Please log in again.";
  }
  if (status === 422) {
    return "Some fields are invalid. Please check your product information.";
  }
  if (typeof status === "number" && status >= 500) {
    return "Server error occurred. Please try again later.";
  }

  return fallbackMessage;
}

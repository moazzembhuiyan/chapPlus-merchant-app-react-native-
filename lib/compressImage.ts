import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/**
 * Compresses and resizes a local image file to ensure fast, reliable uploads
 * and prevent "The images.X failed to upload" (HTTP 422 / PHP upload_max_filesize errors).
 */
export async function compressImage(
  uri: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<string> {
  if (!uri || uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  const { maxWidth = 1280, quality = 0.75 } = options;

  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.warn("[compressImage] Compression failed, falling back to original:", error);
    return uri;
  }
}

/**
 * Compresses an array of image URIs concurrently.
 */
export async function compressImages(
  uris: string[],
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<string[]> {
  if (!Array.isArray(uris) || uris.length === 0) return [];
  return Promise.all(uris.map((uri) => compressImage(uri, options)));
}

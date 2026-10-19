export type CategorySlug =
  | "fashion"
  | "grocery"
  | "electronics"
  | "beauty"
  | string;

export type UnitType =
  | "pcs"
  | "kg"
  | "gram"
  | "litre"
  | "dozen"
  | string;

export interface AttributeKV {
  key: string;
  value: string;
}

export interface VariantInput {
  id?: number;
  sku?: string;
  stock_quantity: number | string;
  price_adjustment?: number | string;
  attributes?: Record<string, string> | AttributeKV[];
}

export interface ProductFormPayload {
  category_slug?: CategorySlug;
  category_id?: number | string;
  name: string;
  description?: string;
  base_price: string | number;
  discount_price?: string | number;
  unit_type?: UnitType;
  unit_value?: string | number;
  has_variants?: boolean;
  is_active: boolean;
  variants: VariantInput[];
  images: string[]; // local uris
  images_to_delete?: number[]; // IDs of existing remote images to delete
}

export function buildProductFormData(data: ProductFormPayload): FormData {
  const fd = new FormData();

  if (data.category_slug) {
    fd.append("category_slug", data.category_slug);
  }
  if (data.category_id) {
    fd.append("category_id", String(data.category_id));
  }

  fd.append("name", data.name.trim());
  fd.append("description", (data.description || "").trim());
  fd.append("base_price", String(data.base_price));

  if (
    data.discount_price != null &&
    String(data.discount_price).trim() !== "" &&
    Number(data.discount_price) > 0
  ) {
    fd.append("discount_price", String(data.discount_price));
  }

  fd.append("unit_type", data.unit_type || "pcs");
  if (data.unit_value != null && String(data.unit_value).trim() !== "") {
    fd.append("unit_value", String(data.unit_value));
  }

  fd.append("has_variants", data.has_variants ? "1" : "0");
  fd.append("is_active", data.is_active ? "1" : "0");

  data.variants.forEach((v, i) => {
    if (v.id != null) {
      fd.append(`variants[${i}][id]`, String(v.id));
    }
    if (v.sku && v.sku.trim()) {
      fd.append(`variants[${i}][sku]`, v.sku.trim());
    }
    fd.append(`variants[${i}][stock_quantity]`, String(v.stock_quantity ?? 0));

    if (
      v.price_adjustment != null &&
      String(v.price_adjustment).trim() !== ""
    ) {
      fd.append(
        `variants[${i}][price_adjustment]`,
        String(v.price_adjustment),
      );
    }

    if (v.attributes) {
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((attr) => {
          const k = attr.key.trim();
          const val = attr.value.trim();
          if (k && val) {
            fd.append(`variants[${i}][attributes][${k}]`, val);
          }
        });
      } else if (typeof v.attributes === "object") {
        Object.entries(v.attributes).forEach(([k, val]) => {
          const keyTrim = k.trim();
          const valTrim = String(val).trim();
          if (keyTrim && valTrim) {
            fd.append(`variants[${i}][attributes][${keyTrim}]`, valTrim);
          }
        });
      }
    }
  });

  if (data.images_to_delete && Array.isArray(data.images_to_delete)) {
    data.images_to_delete.forEach((imgId, idx) => {
      fd.append(`images_to_delete[${idx}]`, String(imgId));
    });
  }

  data.images.forEach((uri, i) => {
    let rawName = uri.split("/").pop() || `product_${i}.jpg`;
    rawName = rawName.split("?")[0];
    const extMatch = rawName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const cleanName = rawName.includes(".") ? rawName : `product_${i}.${ext}`;
    const type =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    fd.append(`images[${i}]`, {
      uri,
      name: cleanName,
      type,
    } as any);
  });

  return fd;
}

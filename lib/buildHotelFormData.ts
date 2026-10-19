export interface HotelFormPayload {
  name: string;
  address: string;
  city: string;
  lat: string;
  lon: string;
  price_per_night: string;
  room_quantity: string;
  max_guests: string;
  description: string;
  facilities: string[];
  images: string[]; 
}

export function buildHotelFormData(data: HotelFormPayload): FormData {
  const fd = new FormData();

  fd.append("name", data.name.trim());
  fd.append("address", data.address.trim());
  fd.append("city", data.city.trim());
  fd.append("lat", data.lat.trim());
  fd.append("lon", data.lon.trim());
  fd.append("price_per_night", data.price_per_night.trim());
  fd.append("room_quantity", data.room_quantity.trim());
  fd.append("max_guests", data.max_guests.trim());
  fd.append("description", data.description.trim());

  data.facilities.forEach((f, i) => {
    if (f.trim()) fd.append(`facilities[${i}]`, f.trim());
  });

  data.images.forEach((uri, i) => {
    const name = uri.split("/").pop() || `hotel_${i}.jpg`;
    const ext = name.split(".").pop()?.toLowerCase();
    const type =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    fd.append(`images[${i}]`, {
      uri,
      name: name.includes(".") ? name : `hotel_${i}.jpg`,
      type,
    } as any);
  });

  return fd;
}
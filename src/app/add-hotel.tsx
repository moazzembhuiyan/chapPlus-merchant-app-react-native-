import { useUserProfileQuery } from "@/redux/authApi";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../components/ui/BackButton";
import { buildHotelFormData } from "../../lib/buildHotelFormData";
import tw from "../../lib/tailwind";
import { useCreateHotelMerchantHotelManageMutation } from "@/redux/hotelmerchantHotelManageApi";

const SUGGESTED = ["Wifi", "Pool", "Beach", "AC", "Gym", "Spa", "Parking"];

export default function AddHotel() {
  const { data: userProfile } = useUserProfileQuery({});
  const currency = userProfile?.data?.merchant_profile?.currency || "KES";
  const [createHotel, { isLoading }] = useCreateHotelMerchantHotelManageMutation();

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [description, setDescription] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: "error", text1: "Gallery permission required" });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!res.canceled) {
      setImages((prev) => [...prev, ...res.assets.map((a) => a.uri)]);
    }
  };

  const onSubmit = async () => {
    if (!name.trim() || !address.trim() || !city.trim()) {
      Toast.show({ type: "error", text1: "Name, address & city required" });
      return;
    }
    if (!price || !rooms || !maxGuests) {
      Toast.show({ type: "error", text1: "Price, rooms & max guests required" });
      return;
    }
    if (!images.length) {
      Toast.show({ type: "error", text1: "Add at least one image" });
      return;
    }

    try {
      const formData = buildHotelFormData({
        name,
        address,
        city,
        lat: lat || "0",
        lon: lon || "0",
        price_per_night: price,
        room_quantity: rooms,
        max_guests: maxGuests,
        description,
        facilities,
        images,
      });

      await createHotel(formData).unwrap();
      Toast.show({ type: "success", text1: "Hotel created" });
      router.back();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Create failed",
        text2: e?.data?.message || e?.error || "Try again",
      });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Add Hotel" />
      <ScrollView
        contentContainerStyle={tw`p-5 pb-12`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Images */}
        <Label>Hotel Images *</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-5`}>
          <View style={tw`flex-row gap-x-3`}>
            <TouchableOpacity
              onPress={pickImages}
              style={tw`w-28 h-24 rounded-xl border border-dashed border-gray-300 items-center justify-center bg-gray-50`}
            >
              <Feather name="plus" size={20} color="#6B7280" />
              <Text style={tw`text-xs text-gray-500 mt-1`}>Upload</Text>
            </TouchableOpacity>
            {images.map((uri, i) => (
              <View key={uri + i} style={tw`relative w-32 h-24 rounded-xl overflow-hidden`}>
                <Image source={{ uri }} style={tw`w-full h-full`} />
                <TouchableOpacity
                  onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                  style={tw`absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 items-center justify-center`}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <Field label="Hotel Name *" value={name} onChangeText={setName} placeholder="Sivana Hotel Boutique" />
        <Field label="Address *" value={address} onChangeText={setAddress} placeholder="Beach Road, Nyali" />
        <Field label="City *" value={city} onChangeText={setCity} placeholder="Mombasa" />

        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <Field label="Latitude" value={lat} onChangeText={setLat} placeholder="-4.043477" keyboardType="decimal-pad" />
          </View>
          <View style={tw`flex-1`}>
            <Field label="Longitude" value={lon} onChangeText={setLon} placeholder="39.668206" keyboardType="decimal-pad" />
          </View>
        </View>

        <Field
          label={`Price per night (${currency}) *`}
          value={price}
          onChangeText={setPrice}
          placeholder="50.00"
          keyboardType="decimal-pad"
        />

        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <Field label="Rooms *" value={rooms} onChangeText={setRooms} placeholder="2" keyboardType="number-pad" />
          </View>
          <View style={tw`flex-1`}>
            <Field label="Max guests *" value={maxGuests} onChangeText={setMaxGuests} placeholder="2" keyboardType="number-pad" />
          </View>
        </View>

        <Label>Description</Label>
        <View style={tw`border border-gray-100 rounded-3xl px-4 py-3 mb-5 min-h-[100px]`}>
          <TextInput
            style={tw`text-sm text-gray-800 min-h-[80px]`}
            multiline
            textAlignVertical="top"
            placeholder="Describe your property..."
            placeholderTextColor="#C4C4C4"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Label>Facilities</Label>
        <View style={tw`flex-row flex-wrap gap-2 mb-3`}>
          {SUGGESTED.map((s) => {
            const active = facilities.includes(s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() =>
                  setFacilities((prev) =>
                    active ? prev.filter((x) => x !== s) : [...prev, s],
                  )
                }
                style={tw`px-3 py-1.5 rounded-full border ${
                  active ? "bg-[#5A7314] border-[#5A7314]" : "border-gray-200"
                }`}
              >
                <Text style={tw`text-xs ${active ? "text-white font-semibold" : "text-gray-600"}`}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={tw`flex-row items-center border border-gray-100 rounded-full px-4 py-3 mb-3`}>
          <TextInput
            style={tw`flex-1 text-sm`}
            placeholder="Custom facility"
            value={facilityInput}
            onChangeText={setFacilityInput}
            onSubmitEditing={() => {
              if (facilityInput.trim()) {
                setFacilities((p) => [...p, facilityInput.trim()]);
                setFacilityInput("");
              }
            }}
          />
          <TouchableOpacity
            onPress={() => {
              if (facilityInput.trim()) {
                setFacilities((p) => [...p, facilityInput.trim()]);
                setFacilityInput("");
              }
            }}
          >
            <Feather name="plus" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {facilities.map((f, i) => (
          <View key={f + i} style={tw`flex-row justify-between items-center mb-2 px-1`}>
            <Text style={tw`text-xs text-gray-600`}>{f}</Text>
            <TouchableOpacity onPress={() => setFacilities(facilities.filter((_, idx) => idx !== i))}>
              <Feather name="trash-2" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isLoading}
          style={tw`bg-[#5A7314] py-3.5 rounded-full items-center mt-6 ${isLoading ? "opacity-70" : ""}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold text-base`}>Create Hotel</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={tw`text-sm font-semibold text-gray-800 mb-2`}>{children}</Text>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={tw`mb-5`}>
      <Label>{label}</Label>
      <View style={tw`border border-gray-100 rounded-full px-4 py-3.5`}>
        <TextInput
          style={tw`text-sm text-gray-800 p-0`}
          placeholderTextColor="#C4C4C4"
          {...props}
        />
      </View>
    </View>
  );
}
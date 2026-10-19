import {
  useUserProfileQuery,
  useUserProfileUpdateMutation,
} from "@/redux/authApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import tw from "../../../../lib/tailwind";
import BackButton from "../../BackButton";

type LocalImage = string | null; // file:// uri

export default function PersonalInformation() {
  const { data, isLoading, isError, refetch } = useUserProfileQuery({});
  const [updateProfile, { isLoading: isSaving }] =
    useUserProfileUpdateMutation();

  const profile = data?.data?.merchant_profile;
  const user = profile?.user;

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // images
  const [profileImageUri, setProfileImageUri] = useState<LocalImage>(null);
  const [coverImageUri, setCoverImageUri] = useState<LocalImage>(null);

  // remote urls (display)
  const [remoteProfile, setRemoteProfile] = useState<string | null>(null);
  const [remoteCover, setRemoteCover] = useState<string | null>(null);

  // prefill
  useEffect(() => {
    if (!profile) return;

    setName(user?.name || "");
    setPhone(user?.phone || "");
    setBusinessName(profile.business_name || "");
    setPhoneNumber(profile.phone_number || "");
    setCity(profile.city || "");
    setAddress(profile.address || "");
    setDescription(profile.description || "");

    setRemoteProfile(
      profile.profile_image_url || user?.profile_photo_url || null,
    );
    setRemoteCover(profile.cover_image_url || null);

    // reset local picks when data refreshes
    setProfileImageUri(null);
    setCoverImageUri(null);
  }, [profile, user]);

  const pickImage = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission needed",
        text2: "Allow photo library access",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      if (type === "profile") setProfileImageUri(result.assets[0].uri);
      else setCoverImageUri(result.assets[0].uri);
    }
  };

  const appendFile = (fd: FormData, key: string, uri: string) => {
    const name = uri.split("/").pop() || `${key}.jpg`;
    const ext = name.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    fd.append(key, { uri, name, type: mime } as any);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("phone", phone.trim());
      fd.append("business_name", businessName.trim());
      fd.append("address", address.trim());
      fd.append("phone_number", phoneNumber.trim());
      fd.append("city", city.trim());
      fd.append("description", description.trim());

      if (profileImageUri) appendFile(fd, "profile_image", profileImageUri);
      if (coverImageUri) appendFile(fd, "cover_image", coverImageUri);

      await updateProfile(fd).unwrap();

      Toast.show({
        type: "success",
        text1: "Profile updated",
        text2: "Your changes have been saved",
      });
      refetch();
    } catch (e: any) {
      console.log("Profile update error:", JSON.stringify(e, null, 2));
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: e?.data?.message || e?.error || e?.message || "Please try again",
      });
    }
  };

  const displayProfile = profileImageUri || remoteProfile;
  const displayCover = coverImageUri || remoteCover;

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white`}>
        <BackButton title="Personal Information" showBackButton />
        <View style={tw`px-5 pt-4`}>
          <View style={tw`h-36 bg-gray-200 rounded-2xl mb-12`} />
          <View
            style={tw`absolute top-28 self-center w-24 h-24 rounded-full bg-gray-300 border-4 border-white`}
          />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={tw`mb-4`}>
              <View style={tw`w-20 h-3 bg-gray-200 rounded mb-2`} />
              <View style={tw`h-11 bg-gray-100 rounded-full`} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center px-5`}>
        <Text style={tw`text-gray-500 mb-3`}>Failed to load profile</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={tw`bg-oliveText px-5 py-2.5 rounded-full`}
        >
          <Text style={tw`text-white font-semibold`}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Personal Information" showBackButton />
      <StatusBar style="dark" />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-28`}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cover ── */}
        <View style={tw`mx-5 mt-3`}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => pickImage("cover")}
            style={tw`h-36 rounded-2xl bg-gray-100 overflow-hidden`}
          >
            {displayCover ? (
              <Image
                source={{ uri: displayCover }}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />
            ) : (
              <View style={tw`flex-1 items-center justify-center`}>
                <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                <Text style={tw`text-xs text-gray-400 mt-1`}>Add cover</Text>
              </View>
            )}
            <View
              style={tw`absolute bottom-2 right-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center`}
            >
              <Ionicons name="camera" size={12} color="#fff" />
              <Text style={tw`text-white text-[10px] ml-1`}>Cover</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Avatar ── */}
        <View style={tw`items-center -mt-12 mb-6`}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => pickImage("profile")}
            style={tw`relative`}
          >
            <View
              style={tw`w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow`}
            >
              {displayProfile ? (
                <Image
                  source={{ uri: displayProfile }}
                  style={tw`w-full h-full`}
                />
              ) : (
                <View style={tw`flex-1 items-center justify-center`}>
                  <Ionicons name="person" size={36} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View
              style={tw`absolute bottom-0 right-0 bg-[#5A7314] w-7 h-7 rounded-full items-center justify-center border-2 border-white`}
            >
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={tw`text-xs font-medium text-gray-500 mt-2`}>
            Change profile photo
          </Text>
          {user?.email ? (
            <Text style={tw`text-[11px] text-gray-400 mt-0.5`}>
              {user.email}
            </Text>
          ) : null}
        </View>

        {/* ── Form ── */}
        <View style={tw`px-5 gap-y-4`}>
          <Field
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
          />
          <Field
            label="Phone (account)"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            keyboardType="phone-pad"
          />
          <Field
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="My Awesome Shop"
          />
          <Field
            label="Business Phone"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1987654321"
            keyboardType="phone-pad"
          />
          <Field
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="New York"
          />
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, New York, NY 10001"
          />

          <View>
            <Text style={tw`text-xs text-gray-500 mb-2 font-medium`}>
              Description
            </Text>
            <View
              style={tw`border border-gray-100 rounded-2xl px-4 py-3 bg-white`}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="We sell the best products."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={tw`text-sm text-gray-700 min-h-[80px] p-0`}
              />
            </View>
          </View>

          {/* Read-only meta */}
          {(profile?.country || profile?.status) && (
            <View style={tw`flex-row flex-wrap gap-2 mt-1 mb-2`}>
              {profile?.country ? (
                <Badge text={`Country: ${profile.country}`} />
              ) : null}
              {profile?.currency ? <Badge text={profile.currency} /> : null}
              {profile?.status ? (
                <Badge
                  text={profile.status}
                  green={profile.status === "approved"}
                />
              ) : null}
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSaving}
            style={tw`bg-oliveText py-3.5 rounded-full items-center justify-center mt-2 ${
              isSaving ? "opacity-70" : ""
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white font-semibold text-sm`}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View>
      <Text style={tw`text-xs text-gray-500 mb-2 font-medium`}>{label}</Text>
      <View style={tw`border border-gray-100 rounded-full px-4 py-3 bg-white`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType || "default"}
          style={tw`text-sm text-gray-700 p-0`}
        />
      </View>
    </View>
  );
}

function Badge({ text, green }: { text: string; green?: boolean }) {
  return (
    <View
      style={tw`px-2.5 py-1 rounded-full ${
        green ? "bg-green-50" : "bg-gray-100"
      }`}
    >
      <Text
        style={tw`text-[10px] font-medium ${
          green ? "text-green-700" : "text-gray-600"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}

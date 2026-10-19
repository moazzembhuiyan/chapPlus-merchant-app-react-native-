import { uploadFormData } from "../../lib/uploadFormData";
import { apiUrl } from "../../lib/url";
import {
  clearAuthStorage,
  getAuthToken,
  getAuthUser,
  setAuthUser,
} from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BackButton from "../../components/ui/BackButton";
import tw from "../../lib/tailwind";

interface SelectedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  base64?: string | null;
}

const roleToRoute: Record<string, string> = {
  ECOMMERCE_MERCHANT: "/(e-commerce-tab)",
  HOTEL_MERCHANT: "/(hotel-tab)",
  HOTEL_SERVICE_PROVIDER: "/(hotel-tab)",
  RESTAURANT_MERCHANT: "/(restaurant-provider-tab)",
  RESTAURANT_SERVICE_PROVIDER: "/(restaurant-provider-tab)",
  BUS_MERCHANT: "/(bus-provider-tab)",
  BUS_SERVICE_PROVIDER: "/(bus-provider-tab)",
};

export default function ProfileSetup() {
  const insets = useSafeAreaInsets();

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [profileImage, setProfileImage] = useState<SelectedImage | null>(null);
  const [coverImage, setCoverImage] = useState<SelectedImage | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = () => {
    Alert.alert(
      "Profile Setup Incomplete",
      "Setting up your shop profile is required before accessing your dashboard. Do you want to sign out?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await clearAuthStorage();
            router.replace("/(auth)/Login");
          },
        },
      ]
    );
  };

  const pickImage = async (type: "profile" | "cover") => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "We need access to your gallery to upload shop photos.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: type === "cover" ? [16, 9] : [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const selected: SelectedImage = {
          uri: asset.uri,
          fileName: asset.fileName || `${type}_${Date.now()}.jpg`,
          mimeType: asset.mimeType || "image/jpeg",
          base64: asset.base64 || null,
        };

        if (type === "profile") {
          setProfileImage(selected);
        } else {
          setCoverImage(selected);
        }
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Image Picker Error",
        text2: "Unable to select image. Please try again.",
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!businessName.trim()) {
      errs.businessName = "Shop name is required";
    }
    if (!address.trim()) {
      errs.address = "Shop address is required";
    }
    if (!description.trim()) {
      errs.description = "Shop description is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields marked in red.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const token = await getAuthToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Session Expired",
          text2: "Please log in again.",
        });
        router.replace("/(auth)/Login");
        return;
      }

      const formData = new FormData();
      formData.append("business_name", businessName.trim());
      formData.append("address", address.trim());
      formData.append("description", description.trim());

      if (profileImage) {
        const uploadUri = profileImage.base64
          ? `data:${profileImage.mimeType || "image/jpeg"};base64,${profileImage.base64}`
          : profileImage.uri;

        formData.append("profile_image", {
          uri: uploadUri,
          name: profileImage.fileName || "profile.jpg",
          type: profileImage.mimeType || "image/jpeg",
        } as any);
      }

      if (coverImage) {
        const uploadUri = coverImage.base64
          ? `data:${coverImage.mimeType || "image/jpeg"};base64,${coverImage.base64}`
          : coverImage.uri;

        formData.append("cover_image", {
          uri: uploadUri,
          name: coverImage.fileName || "cover.jpg",
          type: coverImage.mimeType || "image/jpeg",
        } as any);
      }

      const endpoint = `${apiUrl}/merchant/profile`;
      console.log("Submitting profile setup:", {
        url: endpoint,
        hasToken: Boolean(token),
        tokenPreview: token ? `${token.substring(0, 10)}...` : null,
        business_name: businessName.trim(),
        address: address.trim(),
        description: description.trim(),
        hasProfileImage: Boolean(profileImage),
        hasCoverImage: Boolean(coverImage),
      });

      const res = await uploadFormData(
        endpoint,
        formData,
        token
      );

      // Update cached user in storage
      const user = await getAuthUser();
      if (user) {
        user.merchant_profile = res.data?.merchant_profile || {
          ...user.merchant_profile,
          business_name: businessName.trim(),
          address: address.trim(),
          description: description.trim(),
        };
        await setAuthUser(user);
      }

      Toast.show({
        type: "success",
        text1: "Setup Complete!",
        text2: "Your shop profile has been configured successfully.",
      });

      const role = user?.role || "ECOMMERCE_MERCHANT";
      const targetRoute = roleToRoute[role] || "/(e-commerce-tab)";
      router.replace(targetRoute as any);
    } catch (error: any) {
      console.error("Profile setup failed:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        url: error?.url,
        data: error?.data,
        responseText: error?.responseText,
        raw: error,
      });

      const backendErrors = error?.data?.errors;
      let detailedMessage = error?.message || error?.data?.message;

      if (backendErrors && typeof backendErrors === "object") {
        const errorList = Object.entries(backendErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join("\n");
        if (errorList) detailedMessage = errorList;
      }

      Toast.show({
        type: "error",
        text1: "Setup Failed",
        text2:
          detailedMessage ||
          "Could not save profile. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["bottom"]}>
      {/* Header bar matching Figma */}
      <BackButton title="Profile set-up" onPress={handleBackPress} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 pt-5 pb-10`}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shop Name */}
        <View style={tw`mb-4.5`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
            Shop Name
          </Text>
          <TextInput
            value={businessName}
            onChangeText={(txt) => {
              setBusinessName(txt);
              if (errors.businessName) {
                setErrors((prev) => ({ ...prev, businessName: "" }));
              }
            }}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            style={tw`border ${
              errors.businessName ? "border-red-500" : "border-gray-200"
            } rounded-full px-4 py-3 text-sm text-gray-800 bg-white`}
          />
          {errors.businessName ? (
            <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
              {errors.businessName}
            </Text>
          ) : null}
        </View>

        {/* Shop Address */}
        <View style={tw`mb-4.5`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
            Shop Address
          </Text>
          <TextInput
            value={address}
            onChangeText={(txt) => {
              setAddress(txt);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: "" }));
              }
            }}
            placeholder="Enter your address"
            placeholderTextColor="#9CA3AF"
            style={tw`border ${
              errors.address ? "border-red-500" : "border-gray-200"
            } rounded-full px-4 py-3 text-sm text-gray-800 bg-white`}
          />
          {errors.address ? (
            <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
              {errors.address}
            </Text>
          ) : null}
        </View>

        {/* Shop Description */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
            Shop Description
          </Text>
          <TextInput
            value={description}
            onChangeText={(txt) => {
              setDescription(txt);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={tw`border ${
              errors.description ? "border-red-500" : "border-gray-200"
            } rounded-2xl px-4 py-3 text-sm text-gray-800 bg-white min-h-[110px]`}
          />
          {errors.description ? (
            <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
              {errors.description}
            </Text>
          ) : null}
        </View>

        {/* Shop Profile Image */}
        <View style={tw`mb-5`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
            Shop Profile Image
          </Text>
          {profileImage ? (
            <View
              style={tw`border border-gray-200 rounded-2xl p-3 bg-gray-50 flex-row items-center justify-between`}
            >
              <Image
                source={{ uri: profileImage.uri }}
                style={tw`w-16 h-16 rounded-xl`}
                resizeMode="cover"
              />
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-xs font-semibold text-gray-800`}>
                  Profile logo selected
                </Text>
                <Text style={tw`text-[11px] text-gray-500 mt-0.5`}>
                  Tap change to pick another image
                </Text>
              </View>
              <View style={tw`flex-row gap-2`}>
                <TouchableOpacity
                  onPress={() => pickImage("profile")}
                  style={tw`px-3 py-1.5 bg-white border border-gray-200 rounded-lg`}
                >
                  <Text style={tw`text-xs font-semibold text-[#5B7410]`}>
                    Change
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setProfileImage(null)}
                  style={tw`p-1.5`}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => pickImage("profile")}
              style={tw`border border-gray-200 rounded-2xl p-6 items-center justify-center bg-white`}
            >
              <Ionicons name="camera" size={32} color="#4A4A4A" />
              <Text style={tw`text-xs text-gray-500 font-medium mt-2`}>
                Tap to upload image
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shop Cover Image */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
            Shop Cover Image
          </Text>
          {coverImage ? (
            <View
              style={tw`border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 relative`}
            >
              <Image
                source={{ uri: coverImage.uri }}
                style={tw`w-full h-36`}
                resizeMode="cover"
              />
              <View
                style={tw`absolute bottom-2 right-2 flex-row gap-2 bg-black/60 px-2.5 py-1.5 rounded-lg`}
              >
                <TouchableOpacity
                  onPress={() => pickImage("cover")}
                  style={tw`flex-row items-center mr-2`}
                >
                  <Ionicons name="image-outline" size={14} color="white" />
                  <Text style={tw`text-xs font-semibold text-white ml-1`}>
                    Change
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCoverImage(null)}>
                  <Ionicons name="trash-outline" size={14} color="#FCA5A5" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => pickImage("cover")}
              style={tw`border border-gray-200 rounded-2xl p-6 items-center justify-center bg-white`}
            >
              <Ionicons name="camera" size={32} color="#4A4A4A" />
              <Text style={tw`text-xs text-gray-500 font-medium mt-2`}>
                Tap to upload image
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Done Button matching Figma */}
        <TouchableOpacity
          disabled={isLoading}
          onPress={handleSubmit}
          activeOpacity={0.85}
          style={tw`w-full py-4 rounded-full bg-[#5B7410] items-center justify-center shadow-sm ${
            isLoading ? "opacity-60" : ""
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white font-bold text-base`}>Done</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

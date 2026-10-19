import { useLogoutMutation, useUserProfileQuery } from "@/redux/authApi";
import { clearAuthStorage, getExpoPushToken } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import FadeTabScreen from "../../../components/ui/FadeTabScreen";
import {
  aboutIcon,
  logoutIcon,
  notificationIcon,
  personalInfoIcon,
  privacyIcon,
  settingIcon,
  termIcon,
} from "../../../lib/icon";
import tw from "../../../lib/tailwind";

interface MenuItemProps {
  iconName: string;
  title: string;
  onPress?: () => void;
  isLogout?: boolean;
  isLast?: boolean;
}

const MenuItem = ({
  iconName,
  title,
  onPress,
  isLogout = false,
  isLast = false,
}: MenuItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      tw`flex-row items-center justify-between py-3 px-4`,
      !isLast && tw`border-b border-gray-100`,
    ]}
  >
    <View style={tw`flex-row items-center gap-x-3`}>
      {/* Circle Icon Wrapper */}
      <View
        style={tw`w-10 h-10 rounded-full items-center justify-center border-[2px] border-[#F3F3F3]  ${
          isLogout ? "" : "bg-[#FFFFFF]  "
        }`}
      >
        <SvgXml
          xml={iconName}
          width={18}
          color={isLogout ? "#EF4444" : "#374151"}
        />
      </View>

      {/* Menu Title */}
      <Text
        style={tw` text-[16px] font-Manrope-Medium.ttf ${
          isLogout ? "text-[#EF4444] font-semibold" : "text-[#222222]"
        }`}
      >
        {title}
      </Text>
    </View>

    {/* Chevron Indicator */}
    {!isLogout && <Ionicons name="chevron-forward" size={18} color="#000000" />}
  </TouchableOpacity>
);

export default function Profile() {
  const { data: userProfile, isLoading } = useUserProfileQuery({});
  const [logout] = useLogoutMutation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = userProfile?.data?.merchant_profile?.user;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const expoPushToken = await getExpoPushToken();

      // 4-second timeout safeguard so slow/offline networks never trap the user
      await Promise.race([
        logout({
          expo_push_token: expoPushToken || undefined,
        }).unwrap(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Logout request timed out")), 4000)
        ),
      ]);
    } catch (error) {
      console.log("Logout warning/error:", error);
    } finally {
      await clearAuthStorage();
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "You have been signed out.",
      });
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.replace("/(auth)/Login" as any);
    }
  };

  const menuItems = [
    {
      iconName: personalInfoIcon,
      title: "Personal Information",
      link: "personal-info",
    },
    { iconName: settingIcon, title: "Account Settings", link: "setting" },
    // { iconName: addreessIcon, title: "Delivery Address", link: "address" },
    {
      iconName: notificationIcon,
      title: "Notifications",
      link: "notification",
    },
    { iconName: aboutIcon, title: "About Us", link: "about" },
    { iconName: privacyIcon, title: "Privacy Policy", link: "privacy" },
    { iconName: termIcon, title: "Terms of service", link: "term" },
    { iconName: logoutIcon, title: "Log Out", isLogout: true },
  ];

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`bg-white px-5 mt-5 pb-8`}
      >
        <View
          style={tw`bg-[#FCFCFC] rounded-2xl border border-[#EDEDED] overflow-hidden`}
        >
          <Modal
            transparent
            visible={showLogoutConfirm}
            animationType="fade"
            onRequestClose={() => {
              if (!isLoggingOut) setShowLogoutConfirm(false);
            }}
          >
            <View
              style={tw`flex-1 bg-black/40 items-center justify-center px-6`}
            >
              <View style={tw`w-full rounded-2xl bg-white p-5`}>
                <Text style={tw`text-lg font-bold text-gray-900 mb-2`}>
                  Log out?
                </Text>
                <Text style={tw`text-sm text-gray-600 leading-6`}>
                  Are you sure you want to sign out from your account?
                </Text>

                <View style={tw`flex-row justify-end mt-6 gap-x-3`}>
                  <TouchableOpacity
                    disabled={isLoggingOut}
                    onPress={() => setShowLogoutConfirm(false)}
                    style={[
                      tw`px-4 py-2.5 rounded-full border border-gray-200`,
                      isLoggingOut && tw`opacity-50`,
                    ]}
                  >
                    <Text style={tw`text-gray-700 font-medium`}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isLoggingOut}
                    onPress={handleLogout}
                    style={[
                      tw`px-5 py-2.5 rounded-full bg-[#5A7314] flex-row items-center justify-center min-w-[88px]`,
                      isLoggingOut && tw`opacity-90`,
                    ]}
                  >
                    {isLoggingOut ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={tw`text-white font-semibold`}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Header — first to appear */}
          <FadeTabScreen>
            <View
              style={tw`flex-row items-center gap-x-3 border-b px-4 pt-4 pb-6 border-gray-100`}
            >
              <Image
                source={{
                  uri:
                    user?.profile_photo_url ||
                    "https://via.placeholder.com/100",
                }}
                style={tw`w-12 h-12 rounded-full bg-gray-200`}
              />
              <View style={tw`flex-1`}>
                <Text
                  style={tw`text-[16px] font-Manrope-Bold.ttf text-[#222222]`}
                >
                  {user?.name || "User Name"}
                </Text>
                <Text
                  style={tw`text-xs font-Manrope-Regular.ttf text-[#858585] mt-1`}
                >
                  {user?.email || "User Email"}
                </Text>
              </View>
            </View>
          </FadeTabScreen>

          {/* Menu items — one by one */}
          {menuItems.map((item, index) => (
            <FadeTabScreen key={item.title || index}>
              <MenuItem
                iconName={item.iconName}
                title={item.title}
                isLogout={item.isLogout}
                isLast={index === menuItems.length - 1}
                onPress={() => {
                  if (item.isLogout) {
                    setShowLogoutConfirm(true);
                  } else if (item.link) {
                    router.push(`/link/${item.link}` as any);
                  }
                }}
              />
            </FadeTabScreen>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import { useFonts } from "expo-font";
import { router, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import tw from "../../lib/tailwind";

import { clearAuthStorage, getAuthToken, getAuthUser } from "../utils/authStorage";

// API role → frontend route mapping
const roleToRoute: Record<string, string> = {
  ECOMMERCE_MERCHANT: "/(e-commerce-tab)",
  HOTEL_MERCHANT: "/(hotel-tab)",
  HOTEL_SERVICE_PROVIDER: "/(hotel-tab)",
  RESTAURANT_MERCHANT: "/(restaurant-provider-tab)",
  RESTAURANT_SERVICE_PROVIDER: "/(restaurant-provider-tab)",
  BUS_MERCHANT: "/(bus-provider-tab)",
  BUS_SERVICE_PROVIDER: "/(bus-provider-tab)",
};

// Prevent the native splash screen from hiding until we are ready
SplashScreen.preventAutoHideAsync();

const Index = () => {
  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    "Manrope-Bold": require("../../assets/font/Manrope-Bold.ttf"),
    "Manrope-ExtraBold": require("../../assets/font/Manrope-ExtraBold.ttf"),
    "Manrope-SemiBold": require("../../assets/font/Manrope-SemiBold.ttf"),
    "Manrope-Medium": require("../../assets/font/Manrope-Medium.ttf"),
    "Manrope-Light": require("../../assets/font/Manrope-Light.ttf"),
    "Manrope-Regular": require("../../assets/font/Manrope-Regular.ttf"),
    "Manrope-ExtraLight": require("../../assets/font/Manrope-ExtraLight.ttf"),
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleNavigation = async () => {
      // Ensure fonts are loaded/errored before navigating
      if (fontsLoaded || fontError) {
        timeout = setTimeout(async () => {
          await SplashScreen.hideAsync();

          try {
            const token = await getAuthToken();
            const user = await getAuthUser();

            if (token && user) {
              const targetRoute = roleToRoute[user.role];
              if (!targetRoute) {
                // If a non-merchant user token was previously cached, clear it
                await clearAuthStorage();
                router.replace("/(splash-screen)");
                return;
              }

              const merchantProfile = user?.merchant_profile;
              const isProfileIncomplete =
                !merchantProfile?.business_name || !merchantProfile?.address;

              if (isProfileIncomplete) {
                console.log("Cold start: Merchant profile incomplete. Redirecting to /profile-setup...");
                router.replace("/profile-setup");
                return;
              }

              console.log("Cold start: Navigating to:", targetRoute);
              router.replace(targetRoute as any);
              return;
            }
          } catch (error) {
            console.log("Cold start auth check error:", error);
          }

          router.replace("/(splash-screen)");
        }, 1500);
      }
    };

    handleNavigation();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [fontsLoaded, fontError]);

  // Keep screen blank while fonts load natively
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={tw`flex-1`}>
      <StatusBar barStyle="dark-content" />

      <View style={tw`flex-1 px-4 justify-between py-10`}>
        {/* Top Loading Indicator */}
        <View style={tw`items-center`}>
          <ActivityIndicator size="large" color={tw.color("btnColor")} />
        </View>

        {/* Center Logo */}
        <View style={tw`items-center justify-center flex-1`}>
          {/* <Image
            source={require("../assets/images/app.logo.png")}
            style={tw`w-48 h-48`}
            resizeMode="contain"
          /> */}
        </View>

        {/* Bottom Spacer to keep logo centered */}
        <View style={tw`h-20`} />
      </View>
    </View>
  );
};

export default Index;

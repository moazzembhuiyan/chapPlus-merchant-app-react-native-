import { useLoginMutation } from "@/redux/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import Toast from "react-native-toast-message";
import BackButton from "../../../components/ui/BackButton";
import { eyeclosedIcon, eyeopenIcon, googleIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "hotel1@yopmail.com",
      password: "12348765",
      rememberMe: false,
    },
  });

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
      };
      const res = await login(payload).unwrap();
      // Save token and user info
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      const successMessage =
        res?.message || res?.data?.message || "Welcome back!";

      Toast.show({
        type: "success",
        text1: "Login successful",
        text2: successMessage,
      });

      // Check if merchant profile onboarding is completed
      const merchantProfile = res.data.user?.merchant_profile;
      const isProfileIncomplete =
        !merchantProfile?.business_name || !merchantProfile?.address;

      if (isProfileIncomplete) {
        console.log("Merchant profile incomplete. Redirecting to /profile-setup...");
        router.replace("/profile-setup");
        return;
      }

      // Navigate based on role
      const userRole = res.data.user.role;
      const targetRoute = roleToRoute[userRole];

      if (!targetRoute) {
        await AsyncStorage.multiRemove(["token", "user"]);
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "This account does not have merchant access.",
        });
        return;
      }

      console.log("Navigating to:", targetRoute, "for role:", userRole);

      router.replace(targetRoute as any);
    } catch (error: any) {
      console.log("Login error:", JSON.stringify(error, null, 2));

      const message =
        error?.data?.message ||
        error?.data?.errors?.email?.[0] ||
        error?.data?.errors?.password?.[0] ||
        "Login failed. Please try again.";

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: message,
      });
    }
  };

  return (
    <View
      style={[
        tw`flex-1 bg-oliveText`,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {/* Header */}
      <View style={tw`relative overflow-hidden mb-1 pt-2`}>
        <View style={tw`z-10 pr-20`}>
          <BackButton />
          <View style={tw`px-5`}>
            <Text style={tw`text-white text-2xl font-semibold mb-1.5`}>
              Welcome Back
            </Text>
            <Text style={tw`text-white/80 text-sm mt-1`}>
              It is quick and easy to log in. Enter your email and password
              below.
            </Text>
          </View>
        </View>
      </View>

      {/* Main Form Section */}
      <View
        style={tw`bg-white flex-1 mt-6 rounded-tl-[37px] rounded-tr-[37px] overflow-hidden`}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-5 pt-7 pb-12`}
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields */}
          <View style={tw`gap-4`}>
            {/* Email Input */}
            <View>
              <Text style={tw`text-sm text-gray-700 mb-1.5 font-medium`}>
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={tw`flex-row items-center border ${
                      errors.email ? "border-red-500" : "border-[#EDF1F3]"
                    } rounded-full px-4 py-1.5 bg-white shadow-sm`}
                  >
                    <TextInput
                      defaultValue="hotel1@yopmail.com"
                      style={tw`flex-1 text-base text-gray-900 py-1.5`}
                      placeholder="Enter your email"
                      placeholderTextColor="#ACACAC"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-1`}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text style={tw`text-sm font-medium text-gray-700 mb-1.5`}>
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={tw`flex-row items-center border ${
                      errors.password ? "border-red-500" : "border-[#EDF1F3]"
                    } rounded-full px-4 py-1.5 bg-white shadow-sm`}
                  >
                    <TextInput
                      style={tw`flex-1 text-base text-gray-900 py-1.5`}
                      placeholder="Enter password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <SvgXml xml={eyeclosedIcon} width={20} height={20} />
                      ) : (
                        <SvgXml xml={eyeopenIcon} width={20} height={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-1`}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={tw`flex-row items-center justify-between mt-1`}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    style={tw`flex-row items-center`}
                  >
                    <View
                      style={tw`w-5 h-5 rounded border ${
                        value
                          ? "bg-[#5A7314] border-[#5A7314]"
                          : "border-gray-300 bg-white"
                      } items-center justify-center mr-2`}
                    >
                      {value && (
                        <Text style={tw`text-white text-xs font-bold`}>✓</Text>
                      )}
                    </View>
                    <Text style={tw`text-sm text-gray-600`}>Remember me</Text>
                  </Pressable>
                )}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/email-verify")}
              >
                <Text style={tw`text-sm font-semibold text-[#5A7314]`}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <View style={tw`mt-5`}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={tw`bg-[#5A7314] py-4 rounded-full items-center justify-center shadow-sm ${
                  isLoading ? "opacity-70" : ""
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white font-semibold text-base`}>
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider + Social + Sign Up */}
          <View style={tw`gap-4 mt-7`}>
            <View style={tw`mt-3 flex-row items-center justify-center gap-x-2`}>
              <View style={tw`flex-1 h-[1px] bg-[#D2D2D2]`} />
              <Text style={tw`text-[#AEAEAE] text-sm px-1`}>
                or continue with
              </Text>
              <View style={tw`flex-1 h-[1px] bg-[#D2D2D2]`} />
            </View>

            <View style={tw`flex-row justify-center items-center mt-2`}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={tw`flex flex-row items-center justify-center gap-x-2 border border-[#D2D2D2] w-full py-3.5 rounded-full`}
                onPress={() => {}}
              >
                <SvgXml xml={googleIcon} width={18} height={18} />
                <Text style={tw`text-sm font-medium text-gray-700`}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row justify-center items-center gap-1 mt-3`}>
              <Text style={tw`text-sm text-gray-500`}>
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/Registration")}
              >
                <Text style={tw`text-sm font-bold text-[#5A7314]`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default Login;

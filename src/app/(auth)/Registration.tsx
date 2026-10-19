import { useUserRegistrationMutation } from "@/redux/authApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import Button from "../../../components/ui/Button";
import { FormTextInput } from "../../../components/ui/FormTextInput";
import { countryData, CountryOption } from "../../../lib/countryData";
import { eyeclosedIcon, eyeopenIcon, googleIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";

interface RegistrationFormInputs {
  name: string;
  role: string;
  email: string;
  password: string;
  password_confirmation: string;
  country: string;
  city: string;
  currency?: string;
}

// UI role → API merchant_type mapping
const roleToMerchantType: Record<string, string> = {
  "E-commerce Merchant": "ECOMMERCE_MERCHANT",
  "E commerce product seller": "ECOMMERCE_MERCHANT",
  "Restaurant Merchant": "RESTAURANT_MERCHANT",
  "Restaurant service provider": "RESTAURANT_MERCHANT",
  "Hotel Merchant": "HOTEL_MERCHANT",
  "Hotel service provider": "HOTEL_MERCHANT",
  "Bus Merchant": "BUS_MERCHANT",
  "Bus service provider": "BUS_MERCHANT",
};

const roles = [
  "E-commerce Merchant",
  "Restaurant Merchant",
  "Hotel Merchant",
  "Bus Merchant",
];

export default function Registration() {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegistrationFormInputs>({
    defaultValues: {
      name: "",
      role: "E-commerce Merchant",
      email: "",
      password: "",
      password_confirmation: "",
      country: "",
      city: "",
      currency: "",
    },
  });

  const [userRegistration, { isLoading }] = useUserRegistrationMutation();

  const watchPassword = watch("password");
  const selectedCountryCode = watch("country");

  const selectedCountryLabel =
    countryData.find((c) => c.code === selectedCountryCode)?.country ||
    "Select your country";

  const filteredCountries = countryData.filter((c) =>
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = (item: CountryOption) => {
    setValue("country", item.code, { shouldValidate: true });
    setValue("currency", item.currencyCode, { shouldValidate: true });
    setModalVisible(false);
    setSearchQuery("");
  };

  const onSubmit = async (data: RegistrationFormInputs) => {
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        password_confirmation: data.password_confirmation,
        merchant_type: roleToMerchantType[data.role] || "ECOMMERCE_MERCHANT",
        country: data.country.trim().toUpperCase(),
        city: data.city.trim(),
      };

      console.log("🚀 Sending merchant registration payload:", payload);

      const res = await userRegistration(payload).unwrap();

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "A verification code has been sent to your email.",
      });

      router.push(
        `/(auth)/otp-verify?email=${encodeURIComponent(
          data.email.trim().toLowerCase()
        )}&page_name=registration`
      );
      reset();
      console.log("Registration successful:", res);
    } catch (error: any) {
      console.log("Full registration error:", JSON.stringify(error, null, 2));

      const errData = error?.data;
      const fieldErrors = errData?.errors;

      // Map backend validation errors to react-hook-form fields
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, msgs]: [string, any]) => {
          if (Array.isArray(msgs) && msgs[0]) {
            setError(field as any, { type: "server", message: msgs[0] });
          }
        });
      }

      const errorMessage =
        errData?.message ||
        fieldErrors?.email?.[0] ||
        fieldErrors?.password?.[0] ||
        fieldErrors?.merchant_type?.[0] ||
        fieldErrors?.country?.[0] ||
        fieldErrors?.city?.[0] ||
        "Registration failed. Please check your information.";

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
    }
  };

  return (
    <View
      style={[
        tw`flex-1 bg-bgOlive`,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <View style={tw`flex-1`}>
        {/* Header Section */}
        <View style={tw`relative overflow-hidden mb-1 pt-2`}>
          <View style={tw`z-10 pr-20`}>
            <BackButton />

            <View style={tw`px-5`}>
              <Text style={tw`text-white text-2xl font-semibold mb-1.5`}>
                Create your account
              </Text>
              <Text style={tw`text-white/80 text-sm mt-1`}>
                Register to continue your journey with us
              </Text>
            </View>
          </View>
        </View>

        {/* White Form Container */}
        <View
          style={tw`flex-1 bg-white rounded-t-[36px] mt-6 overflow-hidden`}
        >
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`px-6 pt-6 pb-20`}
            extraScrollHeight={120}
            keyboardShouldPersistTaps="handled"
          >
            {/* Merchant Type / Role */}
            <View style={tw`mb-4.5`}>
              <Text
                style={tw`text-[#757575] text-sm font-Manrope-Regular.ttf mb-1.5`}
              >
                Merchant Type
              </Text>
              <Controller
                control={control}
                name="role"
                rules={{ required: "Please select a role" }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowRoleDropdown((prev) => !prev)}
                      style={tw`flex-row items-center justify-between border ${
                        errors.role ? "border-red-500" : "border-gray-200"
                      } rounded-full px-4 py-3 bg-white`}
                    >
                      <Text style={tw`text-sm text-gray-800 font-medium`}>
                        {value}
                      </Text>
                      <Ionicons
                        name={showRoleDropdown ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {showRoleDropdown && (
                      <View
                        style={tw`mt-1 border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden z-50`}
                      >
                        {roles.map((item) => (
                          <TouchableOpacity
                            key={item}
                            onPress={() => {
                              onChange(item);
                              setShowRoleDropdown(false);
                            }}
                            style={tw`px-4 py-3 border-b border-gray-50 flex-row items-center justify-between ${
                              value === item ? "bg-[#F4F7EC]" : ""
                            }`}
                          >
                            <Text
                              style={tw`text-sm ${
                                value === item
                                  ? "text-[#5d7a12] font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {item}
                            </Text>
                            {value === item && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#5d7a12"
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              />
              {errors.role && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
                  {errors.role.message}
                </Text>
              )}
            </View>

            {/* Full Name */}
            <View style={tw`mb-4.5`}>
              <FormTextInput
                name="name"
                label="Full Name"
                control={control}
                errors={errors}
                placeholder="Enter your name"
                rules={{ required: "Full name is required" }}
              />
            </View>

            {/* Country Dropdown */}
            <View style={tw`mb-4.5`}>
              <Text style={tw`text-sm text-[#757575] mb-1.5`}>Country</Text>
              <Controller
                control={control}
                name="country"
                rules={{ required: "Country selection is required" }}
                render={() => (
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={tw`border ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    } rounded-full px-4 py-3 bg-gray-50 flex-row justify-between items-center`}
                  >
                    <Text
                      style={tw`${
                        selectedCountryCode ? "text-gray-900" : "text-gray-400"
                      } text-sm`}
                    >
                      {selectedCountryLabel}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#6B7280" />
                  </TouchableOpacity>
                )}
              />
              {errors.country && (
                <Text style={tw`text-red-500 text-xs mt-1 ml-2`}>
                  {errors.country.message}
                </Text>
              )}
            </View>

            {/* City */}
            <View style={tw`mb-4.5`}>
              <FormTextInput
                name="city"
                label="City"
                control={control}
                errors={errors}
                placeholder="Enter your city name"
                rules={{ required: "City name is required" }}
              />
            </View>

            {/* Email Address */}
            <View style={tw`mb-4.5`}>
              <Text
                style={tw`text-[#757575] text-sm font-Manrope-Regular.ttf mb-1.5`}
              >
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
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter Your Email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={tw`border ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } rounded-full px-4 py-3 text-sm text-gray-800 bg-white`}
                  />
                )}
              />
              {errors.email && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={tw`mb-4.5`}>
              <Text
                style={tw`text-[#757575] text-sm font-Manrope-Regular.ttf mb-1.5`}
              >
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={tw`flex-row items-center border ${
                      errors.password ? "border-red-500" : "border-gray-200"
                    } rounded-full px-4 py-2 bg-white`}
                  >
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      style={tw`flex-1 text-sm text-gray-800 py-1.5`}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={tw`p-1.5`}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <SvgXml
                        xml={showPassword ? eyeopenIcon : eyeclosedIcon}
                        width={18}
                        height={18}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={tw`mb-4.5`}>
              <Text
                style={tw`text-[#757575] text-sm font-Manrope-Regular.ttf mb-1.5`}
              >
                Confirm Password
              </Text>
              <Controller
                control={control}
                name="password_confirmation"
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchPassword || "Passwords do not match",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={tw`flex-row items-center border ${
                      errors.password_confirmation
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-full px-4 py-2 bg-white`}
                  >
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Repeat your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      style={tw`flex-1 text-sm text-gray-800 py-1.5`}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((prev) => !prev)}
                      style={tw`p-1.5`}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <SvgXml
                        xml={showConfirmPassword ? eyeopenIcon : eyeclosedIcon}
                        width={18}
                        height={18}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password_confirmation && (
                <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
                  {errors.password_confirmation.message}
                </Text>
              )}
            </View>

            {/* Sign up Button */}
            <Button
              isLoading={isLoading}
              onPress={handleSubmit(onSubmit)}
              text="Sign up"
            />

            {/* Divider */}
            <View style={tw`flex-row items-center my-4`}>
              <View style={tw`flex-1 h-[1px] bg-gray-100`} />
              <Text style={tw`mx-3 text-xs text-gray-400`}>
                or continue with
              </Text>
              <View style={tw`flex-1 h-[1px] bg-gray-100`} />
            </View>

            {/* Continue with Google */}
            <View style={tw`flex-row justify-center items-center`}>
              <TouchableOpacity
                style={tw`flex flex-row items-center justify-center gap-x-2 border border-[#D2D2D2] px-12 py-3.5 rounded-full`}
                onPress={() => {
                  Toast.show({
                    type: "info",
                    text1: "Google Sign-In",
                    text2: "Google merchant onboarding coming soon.",
                  });
                }}
              >
                <SvgXml xml={googleIcon} width={18} height={18} />
                <Text style={tw`text-sm font-medium text-[#666666]`}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={tw`flex-row justify-center items-center mt-5`}>
              <Text style={tw`text-xs text-gray-400`}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/(auth)/Login");
                }}
              >
                <Text style={tw`text-xs font-bold text-[#5d7a12]`}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={tw`flex-1`}
        >
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            {/* Backdrop press to dismiss */}
            <Pressable
              style={tw`flex-1`}
              onPress={() => setModalVisible(false)}
            />

            <View
              style={[
                tw`bg-white rounded-t-3xl p-5 h-[70%] max-h-[85%] shadow-2xl`,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
            >
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold text-gray-800`}>
                  Select Country
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={tw`p-1.5`}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Search input with icons */}
              <View
                style={tw`flex-row items-center border border-gray-200 rounded-2xl px-3.5 py-2.5 mb-3 bg-gray-50`}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#9CA3AF"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 text-sm text-gray-800 p-0`}
                  placeholder="Search country name or code..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: Math.max(insets.bottom, 24) + 20,
                }}
                ListEmptyComponent={
                  <View style={tw`py-12 items-center justify-center`}>
                    <Ionicons
                      name="globe-outline"
                      size={36}
                      color="#D1D5DB"
                      style={tw`mb-2`}
                    />
                    <Text style={tw`text-sm text-gray-400 font-medium`}>
                      No country found matching "{searchQuery}"
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={tw`py-3.5 px-2 border-b border-gray-100 flex-row justify-between items-center active:bg-gray-50`}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={tw`text-base text-gray-800 font-medium`}>
                      {item.country}
                    </Text>
                    <Text style={tw`text-xs text-gray-400 font-bold uppercase`}>
                      {item.code}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

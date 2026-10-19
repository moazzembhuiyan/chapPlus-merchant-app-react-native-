import { useChangePasswordMutation } from "@/redux/authApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import tw from "../../../../lib/tailwind";
import BackButton from "../../BackButton";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      };

      const res = await changePassword(payload).unwrap();

      Toast.show({
        type: "success",
        text1: "Password updated",
        text2: res?.message || "Your password has been changed",
      });
      reset();
    } catch (error: any) {
      console.log("Change password error:", JSON.stringify(error, null, 2));

      const msg =
        error?.data?.message ||
        error?.data?.errors?.current_password?.[0] ||
        error?.data?.errors?.new_password?.[0] ||
        error?.data?.errors?.new_password_confirmation?.[0] ||
        error?.error ||
        "Failed to change password";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
      });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Change Password" showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`px-5 pt-6 pb-10`}
      >
        <View style={tw`gap-y-5`}>
          {/* Current Password */}
          <View>
            <Text style={tw`text-xs text-gray-500 mb-2 font-medium`}>
              Current Password
            </Text>
            <View
              style={tw`border ${
                errors.currentPassword ? "border-red-400" : "border-gray-100"
              } rounded-full px-4 py-3 bg-white flex-row items-center`}
            >
              <Controller
                control={control}
                name="currentPassword"
                rules={{ required: "Current password is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!showCurrent}
                    placeholder="*******"
                    placeholderTextColor="#9CA3AF"
                    style={tw`text-sm text-gray-700 flex-1 p-0`}
                    autoCapitalize="none"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((v) => !v)}
                hitSlop={10}
              >
                <Ionicons
                  name={showCurrent ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={tw`text-red-500 text-xs mt-1 ml-1`}>
                {errors.currentPassword.message}
              </Text>
            )}
          </View>

          {/* New Password */}
          <View>
            <Text style={tw`text-xs text-gray-500 mb-2 font-medium`}>
              New Password
            </Text>
            <View
              style={tw`border ${
                errors.newPassword ? "border-red-400" : "border-gray-100"
              } rounded-full px-4 py-3 bg-white flex-row items-center`}
            >
              <Controller
                control={control}
                name="newPassword"
                rules={{
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!showNew}
                    placeholder="*******"
                    placeholderTextColor="#9CA3AF"
                    style={tw`text-sm text-gray-700 flex-1 p-0`}
                    autoCapitalize="none"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowNew((v) => !v)}
                hitSlop={10}
              >
                <Ionicons
                  name={showNew ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={tw`text-red-500 text-xs mt-1 ml-1`}>
                {errors.newPassword.message}
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View>
            <Text style={tw`text-xs text-gray-500 mb-2 font-medium`}>
              Confirm Password
            </Text>
            <View
              style={tw`border ${
                errors.confirmPassword ? "border-red-400" : "border-gray-100"
              } rounded-full px-4 py-3 bg-white flex-row items-center`}
            >
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!showConfirm}
                    placeholder="*******"
                    placeholderTextColor="#9CA3AF"
                    style={tw`text-sm text-gray-700 flex-1 p-0`}
                    autoCapitalize="none"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((v) => !v)}
                hitSlop={10}
              >
                <Ionicons
                  name={showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={tw`text-red-500 text-xs mt-1 ml-1`}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={tw`bg-[#5A7314] py-3.5 rounded-full items-center justify-center mt-4 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white font-semibold text-base`}>
                Save Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

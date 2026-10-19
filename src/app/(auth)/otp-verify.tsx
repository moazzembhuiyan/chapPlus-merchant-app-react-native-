import { useResendOtpMutation, useVerifyOtpMutation } from "@/redux/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    TouchableOpacity,
    View,
} from "react-native";
import BackButton from "../../../components/ui/BackButton";
import Button from "../../../components/ui/Button";
import { errorMsg } from "../../../lib/msg/errorMsg";
import { successMsg } from "../../../lib/msg/successMsg";
import tw from "../../../lib/tailwind";

interface OtpFormInputs {
  otp: string;
}

const OtpVerify = () => {
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { email } = useLocalSearchParams<{ email?: string }>();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormInputs>({
    defaultValues: {
      otp: "",
    },
  });

  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  // Handle OTP digit changes
  const handleChangeText = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");

    // Case 1: Pasted multiple digits (e.g., pasting "123456")
    if (cleaned.length > 1) {
      const newOtpArray = [...otpArray];
      // If full 6-digit code is pasted, always fill from index 0
      const startIndex = cleaned.length >= 6 ? 0 : index;
      const digits = cleaned.slice(0, 6).split("");

      digits.forEach((digit, i) => {
        if (startIndex + i < 6) {
          newOtpArray[startIndex + i] = digit;
        }
      });

      setOtpArray(newOtpArray);
      const fullOtp = newOtpArray.join("");
      setValue("otp", fullOtp);

      if (fullOtp.length === 6) {
        clearErrors("otp");
      }

      // Focus the last filled box
      const targetFocus = Math.min(startIndex + digits.length - 1, 5);
      inputRefs.current[targetFocus]?.focus();
      return;
    }

    // Case 2: Single digit entered or cleared
    const digit = cleaned.slice(-1);
    const newOtpArray = [...otpArray];
    newOtpArray[index] = digit;

    setOtpArray(newOtpArray);

    const fullOtp = newOtpArray.join("");
    setValue("otp", fullOtp);

    if (fullOtp.length === 6) {
      clearErrors("otp");
    }

    // Auto-advance focus
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    try {
      const res = await resendOtp({ email }).unwrap();
      setOtpArray(Array(6).fill(""));
      setValue("otp", "");
      const successMessage =
        res?.message || res?.data?.message || "OTP resent successfully";
      return successMsg(successMessage);
    } catch (error) {
      return errorMsg(
        error && typeof error === "object" && "data" in error
          ? ((error as { data?: { message?: string } }).data?.message ??
              String(error))
          : error instanceof Error
            ? error.message
            : String(error),
      );
    }
  };

  const { page_name } = useLocalSearchParams<{ page_name?: string }>();

  const onSubmit = async (data: OtpFormInputs) => {
    if (data.otp.length < 6) {
      setError("otp", {
        type: "manual",
        message: "Please enter all 6 digits",
      });
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: data.otp }).unwrap();
      const successMessage =
        res?.message || res?.data?.message || "OTP verified successfully";
      successMsg(successMessage);

      if (page_name === "registration") {
        router.push("/(auth)/Login");
      } else {
        if (res?.data?.token) {
          await AsyncStorage.setItem("forget-password-token", res.data.token);
        }
        router.push("/(auth)/reset-password");
      }
    } catch (error) {
      return errorMsg(
        error && typeof error === "object" && "data" in error
          ? ((error as { data?: { message?: string } }).data?.message ??
              String(error))
          : error instanceof Error
            ? error.message
            : "Invalid OTP",
      );
    }
  };

  return (
    <View style={tw`bg-bgOlive flex-1`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        {/* Header Section */}
        <View style={tw`relative overflow-hidden h-[218px] mb-1   `}>
          {/* Absolute Decorative Background Image (Top Right) */}
          {/* <Image
            source={require("../../../assets/images/world.png")}
            style={tw`absolute   -right-10 w-[274px] h-[274px] opacity-90`}
            resizeMode="contain"
          /> */}

          {/* Header Content */}
          <View style={tw`z-10 pr-20`}>
            {/* Back Button */}
            <View style={tw``}>
              <BackButton />
            </View>

            {/* Title & Subtitle */}
            <View style={tw`px-5`}>
              <Text style={tw`text-white text-2xl font-semibold mb-1.5`}>
                {page_name === "registration"
                  ? "Verify Email"
                  : "Forgot Password"}
              </Text>
              <Text style={tw`text-white/80 text-sm mt-3`}>
                To confirm your account, enter the 6-digit code we sent to
                <Text style={tw`text-white font-semibold `}> {email} </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Form Container */}
        <View
          style={tw`bg-white flex-1 px-5 pt-8 rounded-tl-[37px] rounded-tr-[37px]`}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={tw` pb-6`}
          >
            <View>
              {/* 6-Digit Input Row */}
              <Controller
                control={control}
                name="otp"
                rules={{
                  required: "OTP is required",
                  minLength: {
                    value: 6,
                    message: "Please enter all 6 digits",
                  },
                }}
                render={() => (
                  <View style={tw`flex-row justify-between items-center my-6`}>
                    {Array(6)
                      .fill(0)
                      .map((_, index) => (
                        <TextInput
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          style={tw`w-12 h-12 border ${
                            errors.otp
                              ? "border-red-500"
                              : otpArray[index]
                                ? "border-[#5B7410]"
                                : "border-[#EDF1F3]"
                          } rounded-full text-center text-xl font-bold text-gray-900 bg-[#F9FAFB]`}
                          keyboardType="number-pad"
                          maxLength={6}
                          textContentType="oneTimeCode"
                          autoComplete="one-time-code"
                          value={otpArray[index]}
                          onChangeText={(text) => handleChangeText(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          selectTextOnFocus
                        />
                      ))}
                  </View>
                )}
              />

              {/* Error Message */}
              {errors.otp && (
                <Text style={tw`text-xs text-red-500 text-center mb-4`}>
                  {errors.otp.message}
                </Text>
              )}

              {/* Resend Code Section */}
              <View style={tw`flex-row justify-between items-center mt-2`}>
                <View>
                  <Text style={tw`text-sm text-gray-500`}>
                    Didn't receive the code?
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={isResending}
                >
                  <Text
                    style={tw`text-sm font-semibold ${isResending ? "text-gray-400" : "text-[#5B7410]"}`}
                  >
                    {isResending ? "Sending..." : "Send code again"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <View style={tw`mt-8`}>
              <Button
                onPress={handleSubmit(onSubmit)}
                text="Continue"
                isLoading={isVerifying}
                disabled={isSubmitting || isVerifying}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerify;

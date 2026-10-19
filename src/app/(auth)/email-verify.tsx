// import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import BackButton from "../../../components/ui/BackButton";
import Button from "../../../components/ui/Button";
import tw from "../../../lib/tailwind";
interface LoginFormInputs {
  email: string;
}
const EmailVerify = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (_data: LoginFormInputs) => {
    router.push("/(auth)/otp-verify");
  };

  return (
    <View style={tw` bg-bgOlive flex-1  `}>
      {/* back button  */}
      <View style={tw` relative overflow-hidden  mb-1   `}>
        {/* Absolute Decorative Background Image (Top Right) */}
        {/* <Image
          source={require("../../../assets/images/world.png")}
          style={tw`absolute   -right-10 w-[274px] h-[274px] opacity-90`}
          resizeMode="contain"
        /> */}

        {/* Header Content */}
        <View style={tw`z-10 pr-20 `}>
          {/* Back Button */}
          <View style={tw``}>
            <BackButton />
          </View>

          {/* Title & Subtitle */}
          <View style={tw` px-5`}>
            <Text style={tw`text-white text-2xl font-semibold mb-1.5`}>
              Forgot Password
            </Text>
            <Text style={tw`text-white/80 text-sm mt-3`}>
              Please enter your email address which was used to create your
              account.
            </Text>
          </View>
        </View>
      </View>
      {/* Login From  */}
      <View
        style={tw`bg-white flex-1  px-5 mt-10 rounded-tl-[37px] rounded-tr-[37px]`}
      >
        <View style={tw`gap-6`}>
          {/* Header Title */}
          <View></View>

          {/* Form Fields */}
          <View style={tw`gap-4`}>
            {/* Phone/Email Address Input */}
            <View>
              <Text
                style={tw`text-[#757575] text-sm font-Manrope-Regular.ttf mb-1.5`}
              >
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email address is required",
                  validate: (value) => {
                    const isEmail = /\S+@\S+\.\S+/.test(value);
                    return isEmail || "Enter a valid email address";
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={tw`flex-row items-center border ${
                      errors.email ? "border-red-500" : "border-[#EDF1F3]"
                    } rounded-[25.58px] px-3 py-1.5  shadow-[#E4E5E73D] `}
                  >
                    <TextInput
                      style={tw`flex-1 text-base text-gray-900`}
                      placeholder="Enter your email"
                      placeholderTextColor="#ACACAC "
                      keyboardType="email-address"
                      autoCapitalize="none"
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
          </View>
        </View>

        {/* Submit Section */}
        <View style={tw`gap-4 mt-7`}>
          <Button
            onPress={handleSubmit(onSubmit)}
            text="Continue"
            disabled={isSubmitting}
          />
        </View>
      </View>
    </View>
  );
};

export default EmailVerify;

const styles = StyleSheet.create({});

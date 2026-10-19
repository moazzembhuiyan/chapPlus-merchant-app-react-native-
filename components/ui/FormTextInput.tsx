import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";
import tw from "twrnc";

interface FormTextInputProps<T extends FieldValues>
  extends Omit<TextInputProps, "onChangeText" | "value"> {
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  label?: string;
  rules?: RegisterOptions<T, Path<T>>;
  containerStyle?: string;
  defaultValue?: string;
}

export const FormTextInput = <T extends FieldValues>({
  name,
  control,
  errors,
  label,
  rules,
  containerStyle = "",
  defaultValue = "",
  placeholderTextColor = "#9CA3AF",
  ...textInputProps
}: FormTextInputProps<T>) => {
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <View style={tw`${containerStyle}`}>
      {label && (
        <Text style={tw`text-sm text-[#757575] mb-1.5`}>{label}</Text>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue as any}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={tw`flex-row items-center border ${
              errorMessage ? "border-red-500" : "border-gray-200"
            } rounded-full px-4 py-3 bg-white`}
          >
            <TextInput
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor={placeholderTextColor}
              style={tw`flex-1 text-sm text-gray-800 p-0`}
              {...textInputProps}
            />
          </View>
        )}
      />

      {errorMessage && (
        <Text style={tw`text-xs text-red-500 mt-1 ml-2`}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import tw from "../../../lib/tailwind";

interface CustomInputFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  isRequired?: boolean;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
}

export const ProductName: React.FC<CustomInputFieldProps> = ({
  label,
  placeholder,
  value,
  error,
  isRequired = false,
  onBlur,
  onChangeText,
  multiline = false,
  numberOfLines,
  style,
  ...props
}) => {
  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        onBlur={onBlur}
        onChangeText={onChangeText}
        value={value}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          tw`border ${
            error ? "border-red-500" : "border-gray-200"
          } bg-white px-4 py-3 text-sm text-gray-800 ${
            multiline ? "rounded-2xl h-28" : "rounded-full"
          }`,
          style,
        ]}
        {...props}
      />

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
    </View>
  );
};

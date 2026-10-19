import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface TagOption {
  label: string;
  value: string;
}

interface TagSelectGroupProps {
  label?: string;
  options: (string | TagOption)[];
  selectedValue?: string | string[];
  multiSelect?: boolean;
  error?: string;
  onSelect: (value: any) => void;
  isRequired?: boolean;
}

export const ColorSelection: React.FC<TagSelectGroupProps> = ({
  label = "Color",
  options,
  selectedValue,
  multiSelect = false,
  error,
  onSelect,
  isRequired,
}) => {
  // Normalize string array or object array to uniform TagOption structure
  const normalizedOptions: TagOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const handlePress = (value: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      const updated = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      onSelect(updated);
    } else {
      onSelect(value);
    }
  };

  const checkIsSelected = (value: string) => {
    if (multiSelect && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tw`flex-row gap-x-2 py-1`}>
          {normalizedOptions.map((item) => {
            const isSelected = checkIsSelected(item.value);
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => handlePress(item.value)}
                activeOpacity={0.8}
                style={
                  isSelected
                    ? tw`bg-[#FFF0E6] px-5 py-2 rounded-full border border-transparent`
                    : tw`bg-white px-5 py-2 rounded-full border border-gray-200`
                }
              >
                <Text
                  style={
                    isSelected
                      ? tw`text-[#FF6B00] text-xs font-medium`
                      : tw`text-gray-600 text-xs font-medium`
                  }
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
    </View>
  );
};

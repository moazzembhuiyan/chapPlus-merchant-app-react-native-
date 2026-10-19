import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface RadioOption {
  label: string;
  value: string;
}

interface RadioSelectGroupProps {
  label?: string;
  options: RadioOption[];
  selectedValue?: string;
  activeColor?: string;
  error?: string;
  onSelect: (value: string) => void;
  isRequired?: boolean;
}

export const RadioSelectGroup: React.FC<RadioSelectGroupProps> = ({
  label,
  options,
  selectedValue,
  activeColor = "#FF6B00",
  error,
  isRequired,
  onSelect,
}) => {
  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      <View style={tw`flex-row gap-x-3`}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.8}
              style={tw`flex-1 border border-gray-200 rounded-xl p-3 flex-row items-center gap-x-2 bg-white`}
            >
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={18}
                color={isSelected ? activeColor : "#C4C4C4"}
              />
              <Text style={tw`text-gray-700 text-xs font-medium`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
    </View>
  );
};

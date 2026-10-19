import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from "./../../../lib/tailwind";

interface SizePickerGroupProps {
  label?: string;
  standardSizes?: string[];
  selectedSizes?: string[];
  customSizes?: string[];
  activeColor?: string;
  error?: string;
  onSizesChange?: (sizes: string[]) => void;
  onCustomSizesChange?: (customSizes: string[]) => void;
  isRequired?: boolean;
}

export const SizePickerGroup: React.FC<SizePickerGroupProps> = ({
  label = "Size",
  standardSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
  selectedSizes = [],
  customSizes = [],
  activeColor = "#5A7314",
  error,
  onSizesChange,
  onCustomSizesChange,
  isRequired,
}) => {
  const [customInput, setCustomInput] = useState("");

  const handleToggleStandardSize = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onSizesChange?.(updated);
  };

  const handleAddCustomSize = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customSizes.includes(trimmed)) {
      onCustomSizesChange?.([...customSizes, trimmed]);
      setCustomInput("");
    }
  };

  const handleRemoveCustomSize = (index: number) => {
    const updated = customSizes.filter((_, i) => i !== index);
    onCustomSizesChange?.(updated);
  };

  return (
    <View style={tw`border border-gray-200 rounded-2xl p-4 gap-y-4`}>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      {/* Standard Size Grid */}
      <View style={tw`flex-row flex-wrap gap-2`}>
        {standardSizes.map((size) => {
          const isChecked = selectedSizes.includes(size);
          return (
            <TouchableOpacity
              key={size}
              onPress={() => handleToggleStandardSize(size)}
              activeOpacity={0.8}
              style={tw`w-[23%] border border-gray-200 rounded-lg p-2.5 flex-row items-center justify-center gap-x-1.5 bg-white`}
            >
              <MaterialCommunityIcons
                name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
                size={16}
                color={isChecked ? activeColor : "#D1D5DB"}
              />
              <Text style={tw`text-gray-600 text-xs font-medium`}>{size}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}

      {/* Custom Size Sub-section */}
      <View style={tw`pt-2`}>
        <Text style={tw`text-gray-800 font-medium text-xs mb-2`}>
          Custom Size
        </Text>

        <View
          style={tw`border border-gray-200 rounded-xl px-3 py-2 flex-row items-center justify-between mb-3 bg-white`}
        >
          <TextInput
            placeholder="Write here"
            placeholderTextColor="#A0A0A0"
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={handleAddCustomSize}
            style={tw`text-xs text-gray-800 flex-1 py-1`}
          />
          <TouchableOpacity onPress={handleAddCustomSize} activeOpacity={0.7}>
            <Feather name="plus" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Custom Sizes Dynamic List */}
        <View style={tw`gap-y-2.5`}>
          {customSizes.map((item, index) => (
            <View
              key={`${item}-${index}`}
              style={tw`flex-row items-center justify-between py-1 px-1`}
            >
              <View style={tw`flex-row items-center gap-x-3`}>
                <Feather name="maximize-2" size={14} color="#A0A0A0" />
                <Text style={tw`text-gray-700 text-xs font-medium`}>
                  {item}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleRemoveCustomSize(index)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

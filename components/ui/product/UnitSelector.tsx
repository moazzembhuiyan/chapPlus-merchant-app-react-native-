import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface UnitSelectorProps {
  label?: string;
  selectedUnit: string;
  unitValue: string;
  units?: string[];
  onUnitChange: (unit: string) => void;
  onValueChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
}

const DEFAULT_UNITS = ["kg", "gram", "litre", "pcs", "dozen"];

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  label = "Unit & Quantity",
  selectedUnit = "kg",
  unitValue = "1",
  units = DEFAULT_UNITS,
  onUnitChange,
  onValueChange,
  error,
  isRequired = false,
}) => {
  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      {/* Unit Pills */}
      <View style={tw`flex-row flex-wrap gap-2 mb-2.5`}>
        {units.map((u) => {
          const isSelected = selectedUnit.toLowerCase() === u.toLowerCase();
          return (
            <TouchableOpacity
              key={u}
              onPress={() => onUnitChange(u)}
              activeOpacity={0.8}
              style={[
                tw`px-4 py-2 rounded-full border`,
                isSelected
                  ? tw`bg-[#5A7314] border-[#5A7314]`
                  : tw`bg-white border-gray-200`,
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-medium uppercase`,
                  isSelected ? tw`text-white font-semibold` : tw`text-gray-700`,
                ]}
              >
                {u}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Numeric Amount Input */}
      <View
        style={tw`border ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-full px-4 py-3 bg-white flex-row items-center justify-between`}
      >
        <TextInput
          placeholder="e.g. 1 or 500"
          placeholderTextColor="#A0A0A0"
          keyboardType="decimal-pad"
          value={unitValue}
          onChangeText={onValueChange}
          style={tw`text-sm text-gray-800 flex-1 py-0`}
        />
        <Text style={tw`text-xs font-bold text-gray-500 uppercase ml-2`}>
          {selectedUnit}
        </Text>
      </View>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
    </View>
  );
};

import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

export interface CategoryOption {
  id: string;
  value: string;
}

interface CategoryDropdownProps {
  label?: string;
  isRequired?: boolean;
  value?: string;
  options: CategoryOption[];
  placeholder?: string;
  error?: string;
  onSelect: (value: string) => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  label = "Category",
  isRequired = false,
  value,
  options,
  placeholder = "Select Category",
  error,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      {/* Dropdown Selector Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        style={tw`border ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-full px-4 py-3 flex-row items-center justify-between bg-white`}
      >
        <Text
          style={tw`text-sm ${
            selectedOption ? "text-gray-800" : "text-[#A0A0A0]"
          }`}
        >
          {selectedOption ? selectedOption.value : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}

      {/* Modal Options List */}
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={tw`flex-1 bg-black/40 justify-center px-6`}
        >
          <View style={tw`bg-white rounded-2xl p-4 max-h-80 shadow-lg`}>
            <Text style={tw`text-gray-800 font-bold text-base mb-3`}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={tw`py-6 items-center justify-center`}>
                  <Text style={tw`text-xs text-gray-400 font-medium`}>
                    No options available
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.value)}
                    style={tw`py-3 px-3 rounded-xl flex-row items-center justify-between ${
                      isSelected ? "bg-gray-100" : ""
                    }`}
                  >
                    <Text
                      style={tw`text-sm ${
                        isSelected
                          ? "font-semibold text-[#5A7314]"
                          : "text-gray-700"
                      }`}
                    >
                      {item.value}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color="#5A7314" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

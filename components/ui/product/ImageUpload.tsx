import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

interface ImagePickerListProps {
  label?: string;
  images: string[];
  error?: string;
  maxImages?: number;
  onPickImage: () => void;
  onRemoveImage: (index: number) => void;
  isRequired?: boolean;
}

export const ImageUpload: React.FC<ImagePickerListProps> = ({
  label = "Product Image",
  images = [],
  error,
  maxImages,
  isRequired,
  onPickImage,
  onRemoveImage,
}) => {
  const isMaxReached = maxImages ? images.length >= maxImages : false;

  return (
    <View>
      {label && (
        <Text style={tw`text-gray-800 font-medium text-sm mb-1.5`}>
          {label} {isRequired && <Text style={tw`text-red-500`}>*</Text>}
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tw`flex-row items-center gap-x-3`}>
          {/* Upload Button */}
          {!isMaxReached && (
            <TouchableOpacity
              onPress={onPickImage}
              activeOpacity={0.7}
              style={tw`w-24 h-24 border border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50`}
            >
              <Feather name="plus" size={20} color="#666" />
              <Text style={tw`text-gray-500 text-xs mt-1 font-medium`}>
                Upload
              </Text>
            </TouchableOpacity>
          )}

          {/* Picked Images Preview */}
          {images.map((uri, index) => (
            <View key={`${uri}-${index}`} style={tw`relative w-24 h-24`}>
              <Image
                source={{ uri }}
                style={tw`w-24 h-24 rounded-xl`}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => onRemoveImage(index)}
                activeOpacity={0.7}
                style={tw`absolute top-1 right-1 bg-black/60 rounded-full p-1`}
              >
                <Ionicons name="close" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
    </View>
  );
};

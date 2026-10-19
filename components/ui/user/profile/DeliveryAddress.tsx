import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../../lib/tailwind";
import BackButton from "../../BackButton";
import Button from "../../Button";

interface AddressItem {
  id: string;
  title: string;
  address: string;
}

interface AddressCardProps {
  title: string;
  address: string;
  isLast?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AddressCardItem = ({
  title,
  address,
  isLast = false,
  onEdit,
  onDelete,
}: AddressCardProps) => (
  <View
    style={[
      tw`flex-row items-center justify-between py-4 px-4`,
      !isLast && tw`border-b border-gray-100`,
    ]}
  >
    {/* Left Side: Location Icon & Text Details */}
    <View style={tw`flex-row items-center gap-x-3.5 flex-1 mr-2`}>
      <View
        style={tw`w-11 h-11 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] items-center justify-center`}
      >
        <Ionicons name="location-outline" size={20} color="#374151" />
      </View>

      <View style={tw`flex-1`}>
        <Text style={tw`text-xs font-Manrope-SemiBold.ttf text-blackText`}>
          {title}
        </Text>
        <Text
          style={tw`text-xs font-Manrope-Regular.ttf text-[#909090] mt-1`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {address}
        </Text>
      </View>
    </View>

    {/* Right Side: Edit & Delete Action Buttons */}
    <View style={tw`flex-row items-center gap-x-3`}>
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="create-outline" size={18} color="#374151" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function DeliveryAddress() {
  const [addresses, setAddresses] = useState<AddressItem[]>([
    { id: "1", title: "Home", address: "House 12, Road 5, Mohakhali, Dhaka" },
    { id: "2", title: "Office", address: "House 12, Road 5, Mohakhali, Dhaka" },
    {
      id: "3",
      title: "Friend's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "4",
      title: "Parent's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "5",
      title: "Friend's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "6",
      title: "Parent's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "7",
      title: "Friend's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "8",
      title: "Parent's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "9",
      title: "Friend's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
    {
      id: "10",
      title: "Parent's House",
      address: "House 12, Road 5, Mohakhali, Dhaka",
    },
  ]);

  const handleEdit = (id: string) => {
    // Handle edit action
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Delivery Address" showBackButton={true} />

      {/* Scrollable List Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 pt-5 pb-6`}
      >
        <View
          style={tw`bg-[#FCFCFC] rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden`}
        >
          {addresses.map((item, index) => (
            <AddressCardItem
              key={item.id}
              title={item.title}
              address={item.address}
              isLast={index === addresses.length - 1}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button Area */}
      <View style={tw`px-5 py-4 border-t border-gray-100 bg-white`}>
        <Button text="Add New" showIcon={true} />
      </View>
    </View>
  );
}

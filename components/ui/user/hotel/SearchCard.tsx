import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from "../../../../lib/tailwind";

interface SearchCardProps {
  onSearch?: (searchData: {
    location: string;
    date: string;
    guests: string;
  }) => void;
}

export const SearchCard = memo(({ onSearch }: SearchCardProps) => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    onSearch?.({ location, date, guests });
  };

  return (
    <View
      style={tw`bg-white rounded-3xl p-4 border border-gray-100 shadow-sm mb-6`}
    >
      <Text
        style={tw`text-xl text-[#000000AD] mb-3.5 font-Manrope-Regular.ttf`}
      >
        Find Your{" "}
        <Text style={tw`font-Manrope-Medium.ttf text-[#000]`}>Dream Stay</Text>
      </Text>

      {/* Location Input */}
      <View style={tw`mb-2.5`}>
        <Text style={tw`text-xs font-Manrope-Medium.ttf text-[#101010] mb-2`}>
          Location
        </Text>
        <View
          style={tw`flex-row items-center bg-[#F5F5F7] rounded-2xl px-3.5 py-2.5`}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color="#9CA3AF"
            style={tw`mr-2`}
          />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your destination"
            placeholderTextColor="#A1A1AA"
            style={tw`flex-1 text-xs text-[#222222] `}
          />
        </View>
      </View>

      {/* Date & Guest Inputs */}
      <View style={tw`flex-row gap-3 mb-4`}>
        {/* Date Input */}
        <View style={tw`flex-1`}>
          <Text style={tw`text-xs font-Manrope-Medium.ttf text-[#101010] mb-2`}>
            Date
          </Text>
          <View
            style={tw`flex-row items-center bg-[#F5F5F7] rounded-2xl px-3 py-2.5`}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#9CA3AF"
              style={tw`mr-2`}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A1A1AA"
              style={tw`flex-1 text-xs text-[#222222] `}
            />
          </View>
        </View>

        {/* Guest Input */}
        <View style={tw`flex-1`}>
          <Text style={tw`text-xs font-Manrope-Medium.ttf text-[#101010] mb-2`}>
            Guest
          </Text>
          <View
            style={tw`flex-row items-center bg-[#F5F5F7] rounded-2xl px-3 py-2.5`}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color="#9CA3AF"
              style={tw`mr-2`}
            />
            <TextInput
              value={guests}
              onChangeText={setGuests}
              placeholder="Add guest"
              placeholderTextColor="#A1A1AA"
              keyboardType="number-pad"
              style={tw`flex-1 text-xs text-[#222222] `}
            />
          </View>
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSearch}
        style={tw`w-full bg-[#FF5A1F] py-3.5 rounded-full items-center justify-center shadow-sm`}
      >
        <Text style={tw`text-white font-Manrope-Medium.ttf text-sm`}>
          Search
        </Text>
      </TouchableOpacity>
    </View>
  );
});

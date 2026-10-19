import { Armchair, Bus, Ticket, Wallet } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import tw from "../../../lib/tailwind";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <View
      style={tw`flex-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm justify-between min-h-[140px]`}
    >
      {/* Icon Wrapper */}
      <View
        style={tw`w-12 h-12 rounded-full bg-[#F2F6E9] items-center justify-center`}
      >
        {icon}
      </View>

      {/* Value & Label */}
      <View style={tw`mt-4`}>
        <Text style={tw`text-2xl font-bold text-[#4B6319]`}>{value}</Text>
        <Text style={tw`text-sm font-medium text-gray-400 mt-1`}>{label}</Text>
      </View>
    </View>
  );
};

export default function BusStateCard() {
  const statsData = [
    {
      id: "1",
      icon: <Wallet size={22} color="#4B6319" />,
      value: "$1,450.00",
      label: "Today's Revenue",
    },
    {
      id: "2",
      icon: <Ticket size={22} color="#4B6319" />,
      value: "118",
      label: "Ticket Sold",
    },
    {
      id: "3",
      icon: <Armchair size={22} color="#4B6319" />,
      value: "72",
      label: "Available Seats",
    },
    {
      id: "4",
      icon: <Bus size={22} color="#4B6319" />,
      value: "5",
      label: "Upcoming Trips",
    },
  ];

  return (
    <View style={tw` flex-1`}>
      <View style={tw`flex-row flex-wrap gap-4`}>
        {/* Row 1 */}
        <View style={tw`flex-row gap-4 w-full`}>
          <StatCard
            icon={statsData[0].icon}
            value={statsData[0].value}
            label={statsData[0].label}
          />
          <StatCard
            icon={statsData[1].icon}
            value={statsData[1].value}
            label={statsData[1].label}
          />
        </View>

        {/* Row 2 */}
        <View style={tw`flex-row gap-4 w-full`}>
          <StatCard
            icon={statsData[2].icon}
            value={statsData[2].value}
            label={statsData[2].label}
          />
          <StatCard
            icon={statsData[3].icon}
            value={statsData[3].value}
            label={statsData[3].label}
          />
        </View>
      </View>
    </View>
  );
}

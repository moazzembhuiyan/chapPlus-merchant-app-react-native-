// components/ui/hotel/HotelMonthlyChart.tsx
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tailwind";

type MonthItem = { month: string; total: number };

type Props = {
  data: MonthItem[];
  currency?: string;
  year: number;
  years?: number[];
  onYearChange?: (year: number) => void;
  loading?: boolean;
};

export default function HotelMonthlyChart({
  data = [],
  currency = "KES",
  year,
  years = [2024, 2025, 2026],
  onYearChange,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);

  const max = useMemo(() => {
    const m = Math.max(...data.map((d) => Number(d.total) || 0), 1);
    return m;
  }, [data]);

  const yearTotal = useMemo(
    () => data.reduce((s, d) => s + (Number(d.total) || 0), 0),
    [data],
  );

  if (loading) {
    return (
      <View style={tw`bg-[#FCFCFC] border border-gray-100 rounded-2xl p-4 h-52`}>
        <View style={tw`w-32 h-4 bg-gray-200 rounded mb-4`} />
        <View style={tw`flex-1 flex-row items-end gap-1.5`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                tw`flex-1 bg-gray-200 rounded-t`,
                { height: 20 + (i % 5) * 12 },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={tw`bg-[#FCFCFC] border border-gray-100 rounded-2xl p-4`}>
      <View style={tw`flex-row items-center justify-between mb-1`}>
        <Text style={tw`text-sm font-semibold text-gray-800`}>
          Monthly Earnings
        </Text>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={tw`flex-row items-center bg-white border border-gray-100 rounded-full px-3 py-1.5`}
        >
          <Text style={tw`text-xs font-semibold text-gray-700 mr-1`}>
            {year}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={tw`text-xl font-bold text-[#5A7314] mb-4`}>
        {currency} {yearTotal.toLocaleString()}
      </Text>

      <View style={tw`h-32 flex-row items-end gap-1.5`}>
        {data.map((item) => {
          const h = Math.max((Number(item.total) / max) * 100, 4);
          const isTop = Number(item.total) === max && max > 0;
          return (
            <View key={item.month} style={tw`flex-1 items-center`}>
              <View
                style={[
                  tw`w-full rounded-t-md ${
                    isTop ? "bg-[#5A7314]" : "bg-[#C5D4A0]"
                  }`,
                  { height: `${h}%` as any },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={tw`flex-row gap-1.5 mt-2`}>
        {data.map((item) => (
          <View key={item.month} style={tw`flex-1 items-center`}>
            <Text style={tw`text-[9px] text-gray-400`}>{item.month}</Text>
          </View>
        ))}
      </View>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={tw`flex-1 bg-black/30 justify-center items-center`}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={tw`bg-white rounded-2xl w-44 p-2`}>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  onYearChange?.(y);
                  setOpen(false);
                }}
                style={tw`py-2.5 px-4 rounded-xl ${
                  year === y ? "bg-[#F2F4EC]" : ""
                }`}
              >
                <Text
                  style={tw`text-sm font-semibold ${
                    year === y ? "text-[#5A7314]" : "text-gray-700"
                  }`}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
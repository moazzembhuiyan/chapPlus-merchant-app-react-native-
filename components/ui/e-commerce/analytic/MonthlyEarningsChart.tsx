import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import tw from "../../../../lib/tailwind";

interface MonthData {
  month: string;
  total: number;
}

interface Props {
  data: MonthData[];
  currency?: string;
  year: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
}

const YEARS = [2024, 2025, 2026, 2027];

export default function MonthlyEarningsChart({
  data,
  currency = "KES",
  year,
  onYearChange,
  isLoading,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [yearModal, setYearModal] = useState(false);

  const maxTotal = useMemo(() => {
    const max = Math.max(...(data?.map((d) => d.total) || [0]), 1);
    return max;
  }, [data]);

  const activeIndex =
    selectedIndex ??
    data?.reduce(
      (best, cur, i, arr) => (cur.total > (arr[best]?.total ?? -1) ? i : best),
      0,
    ) ??
    0;

  const active = data?.[activeIndex];

  const formatMoney = (n: number) =>
    `${currency === "KES" ? "KES " : "$"}${Number(n).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

  if (isLoading) {
    return (
      <View style={tw`border border-[#F0F0F0] rounded-2xl p-4 bg-white`}>
        <View style={tw`w-32 h-4 bg-gray-200 rounded mb-2`} />
        <View style={tw`w-48 h-3 bg-gray-100 rounded mb-6`} />
        <View style={tw`flex-row items-end justify-between h-36`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                tw`flex-1 mx-0.5 bg-gray-100 rounded-t-md`,
                { height: 20 + (i % 5) * 12 },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={tw`border border-[#F0F0F0] rounded-2xl p-4 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-start justify-between mb-1`}>
        <View style={tw`flex-1 pr-2`}>
          <Text style={tw`text-base font-semibold text-gray-900`}>
            Monthly Earning
          </Text>
          <Text style={tw`text-xs text-gray-400 mt-0.5`}>
            Track your earning performance overtime
          </Text>
        </View>

        {/* Year selector */}
        <TouchableOpacity
          onPress={() => setYearModal(true)}
          activeOpacity={0.8}
          style={tw`flex-row items-center border border-gray-200 rounded-full px-3 py-1.5 bg-white`}
        >
          <Text style={tw`text-xs font-semibold text-gray-700 mr-1`}>
            {year}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tooltip / selected value */}
      {active && active.total > 0 && (
        <View style={tw`items-center mb-2 mt-1`}>
          <View style={tw`bg-[#FF7A1A] px-2.5 py-1 rounded-full`}>
            <Text style={tw`text-white text-[10px] font-semibold`}>
              Earning
            </Text>
          </View>
          <Text style={tw`text-sm font-bold text-gray-900 mt-1`}>
            {formatMoney(active.total)}
          </Text>
        </View>
      )}

      {/* Bars */}
      <View style={tw`flex-row items-end justify-between h-36 mt-1`}>
        {(data || []).map((item, index) => {
          const ratio = maxTotal > 0 ? item.total / maxTotal : 0;
          const barHeight = Math.max(ratio * 120, item.total > 0 ? 8 : 4);
          const isActive = index === activeIndex && item.total > 0;

          return (
            <TouchableOpacity
              key={item.month}
              activeOpacity={0.8}
              onPress={() => setSelectedIndex(index)}
              style={tw`flex-1 items-center mx-0.5`}
            >
              <View
                style={[
                  tw`w-full rounded-t-md ${
                    isActive ? "bg-[#5A7314]" : "bg-[#E8EDD9]"
                  }`,
                  { height: barHeight, maxWidth: 22, alignSelf: "center" },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Month labels */}
      <View style={tw`flex-row justify-between mt-2`}>
        {(data || []).map((item, index) => (
          <View key={item.month} style={tw`flex-1 items-center`}>
            <Text
              style={tw`text-[9px] ${
                index === activeIndex
                  ? "text-gray-800 font-semibold"
                  : "text-gray-400"
              }`}
            >
              {item.month}
            </Text>
          </View>
        ))}
      </View>

      {/* Year modal */}
      <Modal
        visible={yearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setYearModal(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black/30 justify-center items-center`}
          activeOpacity={1}
          onPress={() => setYearModal(false)}
        >
          <View style={tw`bg-white rounded-2xl w-44 p-2 shadow-lg`}>
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  onYearChange(y);
                  setYearModal(false);
                  setSelectedIndex(null);
                }}
                style={tw`py-2.5 px-4 rounded-xl flex-row justify-between items-center ${
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
                {year === y && (
                  <Ionicons name="checkmark" size={16} color="#5A7314" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

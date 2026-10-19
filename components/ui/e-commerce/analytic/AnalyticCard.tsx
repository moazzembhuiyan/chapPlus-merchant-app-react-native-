import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import tw from "../../../lib/tailwind";

interface MonthlyData {
  month: string;
  shortLabel: string;
  value: number;
}

const YEAR_DATA: Record<string, MonthlyData[]> = {
  "2026": [
    { month: "January", shortLabel: "Jan", value: 120000 },
    { month: "February", shortLabel: "Feb", value: 250000 },
    { month: "March", shortLabel: "Mar", value: 180000 },
    { month: "April", shortLabel: "Apr", value: 140000 },
    { month: "May", shortLabel: "May", value: 310000 },
    { month: "June", shortLabel: "Jun", value: 190000 },
    { month: "July", shortLabel: "Jul", value: 485000 },
    { month: "August", shortLabel: "Aug", value: 290000 },
    { month: "September", shortLabel: "Sep", value: 160000 },
    { month: "October", shortLabel: "Oct", value: 220000 },
    { month: "November", shortLabel: "Nov", value: 175000 },
    { month: "December", shortLabel: "Dec", value: 340000 },
  ],
  "2025": [
    { month: "January", shortLabel: "Jan", value: 110000 },
    { month: "February", shortLabel: "Feb", value: 190000 },
    { month: "March", shortLabel: "Mar", value: 150000 },
    { month: "April", shortLabel: "Apr", value: 130000 },
    { month: "May", shortLabel: "May", value: 280000 },
    { month: "June", shortLabel: "Jun", value: 210000 },
    { month: "July", shortLabel: "Jul", value: 390000 },
    { month: "August", shortLabel: "Aug", value: 270000 },
    { month: "September", shortLabel: "Sep", value: 145000 },
    { month: "October", shortLabel: "Oct", value: 230000 },
    { month: "November", shortLabel: "Nov", value: 185000 },
    { month: "December", shortLabel: "Dec", value: 310000 },
  ],
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = ["2026", "2025", "2024"];

const formatCurrency = (val: number) => {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`;
  }
  return `$${(val / 1000).toFixed(0)}K`;
};

export default function AnalyticCard() {
  // Get current date dynamically
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()];
  const currentYearString = currentDate.getFullYear().toString();

  // Set initial states to current month and year
  const [selectedYear, setSelectedYear] = useState<string>(currentYearString);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName);

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const currentYearData = YEAR_DATA[selectedYear] || YEAR_DATA["2026"];

  const barData = currentYearData.map((item) => {
    const isSelected = item.month === selectedMonth;
    return {
      value: item.value,
      label: item.shortLabel,
      frontColor: isSelected ? "#5A7314" : "#C2D1A4",
      labelTextStyle: {
        color: isSelected ? "#111827" : "#9CA3AF",
        fontSize: 10,
        fontWeight: isSelected ? ("700" as const) : ("400" as const),
      },
      onPress: () => setSelectedMonth(item.month),
      topLabelContainerStyle: {
        overflow: "visible" as const,
        marginBottom: 6,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      },
      topLabelComponent: () =>
        isSelected ? (
          <View
            style={tw`bg-[#FF6200] px-2 py-1 rounded-xl items-center shadow-md min-w-[70px] z-50`}
          >
            <Text style={tw`text-[9px] text-white/90 font-medium`}>
              Earning
            </Text>
            <Text style={tw`text-[11px] text-white font-bold`}>
              {formatCurrency(item.value)}
            </Text>
            <View
              style={tw`absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 bg-[#FF6200] rotate-45`}
            />
          </View>
        ) : null,
    };
  });

  return (
    <ScrollView
      style={tw`flex-1`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={tw``}
    >
      <View
        style={tw`bg-white rounded-3xl mt-5 border border-gray-100 shadow-sm`}
      >
        {/* Header Section */}
        <View style={tw`flex-row justify-between items-start mb-4 p-5 pb-0`}>
          <View style={tw`flex-1 pr-2`}>
            <Text style={tw`text-xl font-bold text-gray-900 tracking-tight`}>
              Monthly Earning
            </Text>
            <Text style={tw`text-xs text-gray-400 mt-1 font-normal`}>
              Track your earning performance over time
            </Text>
          </View>

          {/* Filter Options */}
          <View style={tw`flex-row items-center gap-x-2`}>
            <TouchableOpacity
              onPress={() => setShowMonthDropdown(true)}
              activeOpacity={0.7}
              style={tw`bg-[#F4F5EE] px-3 py-1.5 rounded-full flex-row items-center gap-x-1`}
            >
              <Text style={tw`text-xs text-gray-600 font-medium`}>
                {selectedMonth}
              </Text>
              <Ionicons name="caret-down-sharp" size={10} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowYearDropdown(true)}
              activeOpacity={0.7}
              style={tw`bg-[#F4F5EE] px-3 py-1.5 rounded-full flex-row items-center gap-x-1`}
            >
              <Text style={tw`text-xs text-gray-600 font-medium`}>
                {selectedYear}
              </Text>
              <Ionicons name="caret-down-sharp" size={10} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal ScrollView for Chart */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`pt-14 pb-4 px-4`}
        >
          <BarChart
            data={barData}
            barWidth={20}
            initialSpacing={10}
            spacing={14}
            roundedTop
            roundedBottom
            height={160}
            hideRules
            hideYAxisText
            hideAxesAndRules
            noOfSections={1}
            overflowTop={60}
          />
        </ScrollView>
      </View>

      {/* Month Selection Modal */}
      <Modal visible={showMonthDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={tw`flex-1 bg-black/30 justify-center items-center`}
          activeOpacity={1}
          onPress={() => setShowMonthDropdown(false)}
        >
          <View style={tw`bg-white rounded-2xl p-4 w-64 shadow-lg`}>
            <Text style={tw`font-bold text-sm text-gray-800 mb-3 px-2`}>
              Select Month
            </Text>
            {MONTHS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  setSelectedMonth(m);
                  setShowMonthDropdown(false);
                }}
                style={tw`py-2.5 px-3 rounded-lg flex-row justify-between items-center ${
                  selectedMonth === m ? "bg-gray-100" : ""
                }`}
              >
                <Text
                  style={tw`text-xs ${
                    selectedMonth === m
                      ? "font-bold text-[#5A7314]"
                      : "text-gray-700"
                  }`}
                >
                  {m}
                </Text>
                {selectedMonth === m && (
                  <Ionicons name="checkmark" size={14} color="#5A7314" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Selection Modal */}
      <Modal visible={showYearDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={tw`flex-1 bg-black/30 justify-center items-center`}
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
        >
          <View style={tw`bg-white rounded-2xl p-4 w-64 shadow-lg`}>
            <Text style={tw`font-bold text-sm text-gray-800 mb-3 px-2`}>
              Select Year
            </Text>
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => {
                  setSelectedYear(y);
                  setShowYearDropdown(false);
                }}
                style={tw`py-2.5 px-3 rounded-lg flex-row justify-between items-center ${
                  selectedYear === y ? "bg-gray-100" : ""
                }`}
              >
                <Text
                  style={tw`text-xs ${
                    selectedYear === y
                      ? "font-bold text-[#5A7314]"
                      : "text-gray-700"
                  }`}
                >
                  {y}
                </Text>
                {selectedYear === y && (
                  <Ionicons name="checkmark" size={14} color="#5A7314" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

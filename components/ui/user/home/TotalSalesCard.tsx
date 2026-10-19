import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import tw from "../../../../lib/tailwind";

interface TotalSalesCardProps {
  total?: number;
  growthPercentage?: number;
  isPositive?: boolean;
}

const CHART_PATH =
  "M 0,70 C 20,40 35,50 45,70 C 55,90 70,80 85,60 C 100,40 115,20 135,25 C 155,30 170,50 185,35 L 185,120 L 0,120 Z";

const formatCurrency = (amount: number) => {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const TotalSalesCard = ({
  total = 0,
  growthPercentage = 0,
  isPositive = true,
}: TotalSalesCardProps) => {
  const growthColor = isPositive ? "#4ADE80" : "#F86B17"; // green / orange
  const arrowIcon = isPositive ? "arrow-up" : "arrow-down";
  const growthText = `${Math.abs(growthPercentage).toFixed(1)}%`;

  return (
    <View style={tw`px-5`}>
      <View
        style={tw`bg-[#5A7314] rounded-[12px] p-3 relative overflow-hidden flex-row justify-between items-center h-[139px]`}
      >
        {/* Background Chart Wave */}
        <View style={tw`absolute right-0 bottom-0 top-0 w-1/2`}>
          <Svg height="100%" width="100%" viewBox="0 0 200 120">
            <Defs>
              <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#80A31D" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#5A7314" stopOpacity="0.0" />
              </SvgGradient>
            </Defs>
            <Path d={CHART_PATH} fill="url(#chartGradient)" />
          </Svg>
        </View>

        {/* Main Content */}
        <View style={tw`flex-1 justify-between h-full z-10`}>
          {/* Top Label */}
          <View style={tw`flex-row justify-between items-center w-full`}>
            <Text style={tw`text-[#E8E8E8] text-sm font-Manrope-Medium.ttf`}>
              Total Sales
            </Text>
          </View>

          {/* Metrics */}
          <View>
            <Text
              style={tw`text-white text-3xl font-Manrope-SemiBold.ttf`}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatCurrency(total)}
            </Text>

            <View style={tw`flex-row items-center gap-1.5 mt-2`}>
              <Ionicons name={arrowIcon as any} size={18} color={growthColor} />
              <Text
                style={[
                  tw`text-sm font-Manrope-Medium.ttf`,
                  { color: growthColor },
                ]}
              >
                {growthText}
              </Text>
              <Text style={tw`text-white text-sm font-Manrope-Medium.ttf ml-1`}>
                vs last month
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TotalSalesCard;
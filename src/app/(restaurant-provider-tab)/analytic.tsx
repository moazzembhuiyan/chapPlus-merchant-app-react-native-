import { FlatList, View } from "react-native";
import { useUserProfileQuery } from "@/redux/authApi";
import { useGetRestaurantAnalyticsQuery } from "@/redux/merchantAnalyticsApi";
import BackButton from "../../../components/ui/BackButton";
import PayoutCard from "../../../components/ui/e-commerce/analytic/PayoutCard";
import {
  FoodItem,
  TopOrderCard,
} from "../../../components/ui/restaurant/TopOrderCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import tw from "../../../lib/tailwind";

// Sample Data
const FOOD_ITEMS: FoodItem[] = [
  {
    id: "1",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    id: "2",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    id: "3",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    id: "4",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    id: "5",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    id: "6",
    name: "Chess Beef Burger",
    orders: "120 order",
    price: "$1500.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
];

const handleViewAll = () => {};

// Screen Component
export default function Analytic() {
  const { data: analyticsData } = useGetRestaurantAnalyticsQuery(undefined);
  const { data: profileData } = useUserProfileQuery(undefined);

  const analytics = analyticsData?.data;
  const currency =
    analytics?.currency ||
    profileData?.data?.merchant_profile?.currency ||
    "KES";
  const balance = analytics?.balance ?? 0;

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title="Analytics" showBackButton={false} />
      <View style={tw`my-5 px-5`}>
        <PayoutCard balance={balance} currency={currency} />
      </View>
      <View style={tw`mb-5`}>
        <SectionHeader
          title="Top Order Foods"
          onViewAll={handleViewAll}
          isShowView={true}
        />
      </View>
      <FlatList
        style={tw` px-5 `}
        data={FOOD_ITEMS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TopOrderCard
            item={item}
            onPress={() => console.log("Selected:", item.id)}
          />
        )}
      />
    </View>
  );
}

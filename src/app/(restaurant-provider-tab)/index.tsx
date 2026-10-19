import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import {
  OrderCardProps,
  RestaurantOrderCard,
} from "../../../components/ui/restaurant/RestaurantOrderCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import TotalSalesCard from "../../../components/ui/user/home/TotalSalesCard";
import { notificationIcon } from "../../../lib/icon";
import tw from "../../../lib/tailwind";

interface StatItem {
  id: string;
  label: string;
  value: string | number;
}

const ORDERS_DATA: OrderCardProps[] = [
  {
    orderId: "ORD-10421",
    title: "Chess Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10421",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10421",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10422",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10423",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10424",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    orderId: "ORD-10425",
    title: "Beef Burger",
    itemCount: "01",
    time: "Today, 2:30 PM",
    price: "$42",
    status: "On the way",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
];

const STATS_DATA: StatItem[] = [
  { id: "1", label: "Orders", value: "56" },
  { id: "2", label: "Products", value: "56" },
  { id: "3", label: "Customer", value: "56" },
];

const HomeIndex = () => {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />

      {/* FIXED TOP SECTION */}
      <View>
        {/* Top Header Bar */}
        <View style={tw`px-5 flex-row items-center justify-between mt-2`}>
          <View style={tw`flex-row items-center gap-x-3`}>
            <Image
              style={tw`w-48 h-9`}
              source={require("../../../assets/logo/logo.png")}
              resizeMode="contain"
            />
          </View>

          {/* Notification Button */}
          <TouchableOpacity
            onPress={() => router.push("/user-notification")}
            activeOpacity={0.7}
            style={tw`relative w-11 h-11 bg-[#F4F4F4] rounded-full items-center justify-center`}
          >
            <SvgXml xml={notificationIcon} width={20} height={20} />
            <View
              style={tw`absolute top-2 right-2 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border-2 border-white`}
            >
              <Text style={tw`text-white text-[9px] font-bold leading-none`}>
                3
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Total Sales Banner */}
        <View style={tw`mt-5`}>
          <TotalSalesCard />
        </View>

        {/* Quick Stats Grid */}
        <View style={tw`px-5 mt-5 flex-row justify-between gap-x-2.5`}>
          {STATS_DATA.map((item) => (
            <View
              key={item.id}
              style={tw`flex-1 border border-[#F3F3F3] py-3 px-2 rounded-[12px] items-center justify-center bg-white`}
            >
              <Text
                style={tw`text-[10px] font-medium mb-1 text-center text-gray-500`}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text style={tw`text-oliveText text-lg font-bold text-center`}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Section Header */}
        <View style={tw`mt-5 mb-3`}>
          <SectionHeader title="Recent Orders" />
        </View>
      </View>

      {/* ONLY RECENT ORDERS SCROLLABLE AREA */}
      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 `}
      >
        {ORDERS_DATA.map((item, index) => (
          <RestaurantOrderCard
            key={index}
            orderId={item.orderId}
            title={item.title}
            itemCount={item.itemCount}
            time={item.time}
            price={item.price}
            status={item.status}
            image={item.image}
            onPress={() =>
              router.push({
                pathname: "/order-details/[id]",
                params: { id: item.orderId, type: "restaurant" },
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeIndex;

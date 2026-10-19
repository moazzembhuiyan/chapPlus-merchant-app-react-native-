import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import {
  activeAnalycisIcon,
  activeBookingIcon,
  activeBusIcon,
  activeHomeIcon,
  analycisIcon,
  homeIcon,
  inActiveBookingIcon,
  inActiveBusIcon,
} from "../../../lib/icon";
import tw from "../../../lib/tailwind";

interface TabItem {
  name: string;
  label: string;
  activeIcon: string;
  inactiveIcon: string;
}

const TAB_ITEMS: TabItem[] = [
  {
    name: "index",
    label: "Dashboard",
    activeIcon: activeHomeIcon,
    inactiveIcon: homeIcon,
  },
  {
    name: "booking",
    label: "Bookings",
    activeIcon: activeBookingIcon,
    inactiveIcon: inActiveBookingIcon,
  },
  {
    name: "bus",
    label: "Buses",
    activeIcon: activeBusIcon,
    inactiveIcon: inActiveBusIcon,
  },
  {
    name: "analytic", // Fixed route name to match screen name
    label: "Analytics",
    activeIcon: activeAnalycisIcon,
    inactiveIcon: analycisIcon,
  },
  {
    name: "profile",
    label: "Profile",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
];

// Routes hidden from the custom bottom tab bar
const HIDDEN_ROUTES = [
  "all-category",
  "category-products",
  "product-details",
  "shop-details",
  "hotel",
  "hotel-details",
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Determine current active route name
  const currentRouteName = state.routes[state.index]?.name;
  const isHiddenRouteActive = HIDDEN_ROUTES.includes(currentRouteName);

  // Filter out hidden screens from tab bar rendering
  const visibleRoutes = state.routes.filter(
    (route: any) => !HIDDEN_ROUTES.includes(route.name),
  );

  return (
    <View
      style={[
        tw`bg-white flex-row items-center justify-around px-3 py-2 border-t border-gray-100`,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const index = state.routes.findIndex((r: any) => r.key === route.key);
        const { options } = descriptors[route.key];

        const isActualFocused = state.index === index;
        const isFocused =
          isActualFocused || (route.name === "index" && isHiddenRouteActive);

        const tabInfo = TAB_ITEMS.find((item) => item.name === route.name) || {
          label: options.title || route.name,
          activeIcon: "square",
          inactiveIcon: "square-outline",
        };

        const currentIcon = isFocused
          ? tabInfo.activeIcon
          : tabInfo.inactiveIcon;
        const activeColor = isFocused ? "#5B7410" : "#555D67";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActualFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            activeOpacity={0.7}
            style={
              isFocused
                ? tw`flex-row items-center bg-[#F4F5F0] px-4 py-2.5 rounded-full`
                : tw`p-2.5 items-center justify-center`
            }
          >
            {/* Render SvgXml if SVG string, otherwise fallback to Ionicons icon name */}
            {currentIcon.startsWith("<svg") ||
            currentIcon.startsWith("<?xml") ? (
              <SvgXml xml={currentIcon} color={activeColor} />
            ) : (
              <Ionicons
                name={currentIcon as any}
                size={22}
                color={activeColor}
              />
            )}

            {isFocused && (
              <Text style={tw`text-[#5B7410] font-semibold text-base ml-2`}>
                {tabInfo.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BusProviderTab() {
  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="booking" options={{ title: "Bookings" }} />
        <Tabs.Screen name="bus" options={{ title: "Buses" }} />
        <Tabs.Screen name="analytic" options={{ title: "Analytics" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        {/* <Tabs.Screen
          name="all-category"
          options={{ title: "Category", href: null }}
        />
        <Tabs.Screen
          name="category-products"
          options={{ title: "CategoryProducts", href: null }}
        />
        <Tabs.Screen
          name="product-details"
          options={{ title: "Product", href: null }}
        />
        <Tabs.Screen
          name="shop-details"
          options={{ title: "Product", href: null }}
        />
        <Tabs.Screen
          name="hotel"
          options={{ title: "Popular Hotel", href: null }}
        />
        <Tabs.Screen
          name="hotel-details"
          options={{ title: "HotelDetails", href: null }}
        /> */}
      </Tabs>
    </>
  );
}

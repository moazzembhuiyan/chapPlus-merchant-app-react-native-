import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import {
  activeAnalycisIcon,
  activeHomeIcon,
  activeOrderIcon,
  analycisIcon,
  homeIcon,
  orderIcon,
  productActiveIcon,
  productIcon,
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
    name: "order",
    label: "Orders",
    activeIcon: activeOrderIcon,
    inactiveIcon: orderIcon,
  },
  {
    name: "product",
    label: "Products",
    activeIcon: productActiveIcon,
    inactiveIcon: productIcon,
  },
  {
    name: "analytic",
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

const HIDDEN_ROUTES = [
  "all-category",
  "category-products",
  "product-details",
  "shop-details",
  "hotel",
  "hotel-details",
];

function TabButton({
  isFocused,
  options,
  onPress,
  tabInfo,
}: {
  isFocused: boolean;
  options: any;
  onPress: () => void;
  tabInfo: TabItem;
}) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const activeColor = isFocused ? "#5B7410" : "#555D67";
  const currentIcon = isFocused ? tabInfo.activeIcon : tabInfo.inactiveIcon;
  const isSvg =
    typeof currentIcon === "string" &&
    (currentIcon.startsWith("<svg") || currentIcon.startsWith("<?xml"));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={tw`items-center justify-center`}
    >
      <Animated.View
        style={[
          tw`flex-row items-center px-3.5 py-2.5 rounded-full`,
          containerStyle,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[tw`absolute inset-0 bg-[#F4F5F0] rounded-full`, pillStyle]}
        />

        {isSvg ? (
          <SvgXml xml={currentIcon} color={activeColor} />
        ) : (
          <Ionicons name={currentIcon as any} size={22} color={activeColor} />
        )}

        {isFocused && (
          <Text style={tw`text-[#5B7410] font-semibold text-sm ml-2`}>
            {tabInfo.label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const currentRouteName = state.routes[state.index]?.name;
  const isHiddenRouteActive = HIDDEN_ROUTES.includes(currentRouteName);

  const visibleRoutes = state.routes.filter(
    (route: any) => !HIDDEN_ROUTES.includes(route.name),
  );

  return (
    <View
      style={[
        tw`bg-white flex-row items-center justify-around px-2 pt-2 border-t border-gray-100`,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 6,
        },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const index = state.routes.findIndex((r: any) => r.key === route.key);
        const { options } = descriptors[route.key];
        const isActualFocused = state.index === index;
        const isFocused =
          isActualFocused || (route.name === "index" && isHiddenRouteActive);

        const tabInfo = TAB_ITEMS.find((item) => item.name === route.name) || {
          name: route.name,
          label: options.title || route.name,
          activeIcon: "square",
          inactiveIcon: "square-outline",
        };

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
          <TabButton
            key={route.key}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            tabInfo={tabInfo}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="order" options={{ title: "Orders" }} />
      <Tabs.Screen name="product" options={{ title: "Products" }} />
      <Tabs.Screen name="analytic" options={{ title: "Analytics" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

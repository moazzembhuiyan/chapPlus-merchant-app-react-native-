import { store } from "@/store/store";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(splash-screen)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(e-commerce-tab)" />
          <Stack.Screen name="(hotel-tab)" />
          <Stack.Screen name="(restaurant-provider-tab)" />
        </Stack>
        <Toast />
      </Provider>
    </GestureHandlerRootView>
  );
}

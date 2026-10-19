import { useIsFocused } from "expo-router";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function FadeTabScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 820 });
    }
  }, [isFocused]);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child) => {
        if (typeof child === "string" && !child.trim()) {
          return null;
        }
        return child;
      })}
    </Animated.View>
  );
}

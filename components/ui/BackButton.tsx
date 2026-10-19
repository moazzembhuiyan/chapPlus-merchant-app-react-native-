import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { backIcon } from "../../lib/icon";
import tw from "../../lib/tailwind";

interface HeaderBarProps {
  title?: string;
  onPress?: () => void;
  onAddPress?: () => void;
  showTitle?: boolean;
  showBackButton?: boolean;
  showAddIcon?: boolean;
  icon?: string;
}

const BackButton = ({
  title = "Back",
  onPress,
  onAddPress,
  showTitle = true,
  showBackButton = true,
  showAddIcon = false,
  icon,
}: HeaderBarProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={tw`bg-bgOlive px-5 pb-4 shadow shadow-[#4A4A4A40] rounded-b-[12px]`}
    >
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]}>
        <View style={tw`mt-2 flex-row items-center justify-between `}>
          {/* Left / Title Container */}
          <View style={tw`flex-row items-center gap-x-3 flex-1`}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                style={tw`border border-white rounded-full w-8 h-8 justify-center items-center`}
              >
                <SvgXml xml={backIcon} width={12} height={12} />
              </TouchableOpacity>
            )}

            {showTitle && (
              <Text
                style={tw`text-primaryText text-lg font-Manrope-SemiBold.ttf flex-1`}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
          </View>

          {/* Right Action Container (Add Icon) */}
          {showAddIcon && (
            <TouchableOpacity
              onPress={onAddPress}
              activeOpacity={0.7}
              style={tw``}
            >
              <SvgXml xml={icon ?? null} width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default BackButton;

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "../../../lib/tailwind";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideItem {
  id: string;
  title: string;
  description: string;
  type: "grid" | "single";
  images: {
    col1?: (string | ImageSourcePropType)[];
    col2?: (string | ImageSourcePropType)[];
    col3?: (string | ImageSourcePropType)[];
  };
}

const SLIDES: SlideItem[] = [
  {
    id: "1",
    title: "Everything You Need, All In One App",
    description:
      "Shop products, order food, book hotels and buses, and track deliveries all from one place.",
    type: "grid",
    images: {
      col1: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      ],
      col2: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
        "https://images.unsplash.com/photo-1608248597260-22684948f296?w=500",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      ],
      col3: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500",
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
      ],
    },
  },
];

export default function Index() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.push("/(auth)/Login");
    }
  };

  const getImageSource = (img: string | ImageSourcePropType) => {
    return typeof img === "string" ? { uri: img } : img;
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        tw`flex-1 bg-white`,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <StatusBar style="light" />
      <View style={tw`flex-1`}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
              <View style={tw`flex-1 justify-between`}>
                <View style={tw`relative flex-1 overflow-hidden`}>
                  {item.type === "grid" ? (
                    <View style={tw`flex-row gap-2.5 justify-center`}>
                      <View style={tw`flex-1 gap-2.5`}>
                        {item.images.col1?.map((img: any, idx: number) => (
                          <Image
                            key={idx}
                            source={getImageSource(img)}
                            style={tw`w-full ${idx === 0 ? "h-28" : "h-44"}`}
                            resizeMode="cover"
                          />
                        ))}
                      </View>

                      <View style={tw`flex-1 gap-2.5`}>
                        {item.images.col2?.map((img: string, idx: number) => (
                          <Image
                            key={idx}
                            source={getImageSource(img)}
                            style={tw`w-full ${idx === 0 ? "h-36" : "h-48"}`}
                            resizeMode="cover"
                          />
                        ))}
                      </View>

                      <View style={tw`flex-1 gap-2.5`}>
                        {item.images.col3?.map((img: string, idx: number) => (
                          <Image
                            key={idx}
                            source={getImageSource(img)}
                            style={tw`w-full ${idx === 0 ? "h-28" : "h-44"}`}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View style={tw`flex-1 justify-center items-center`}>
                      {item.images.col1?.[0] && (
                        <Image
                          source={getImageSource(item.images.col1[0])}
                          style={tw`w-full h-full`}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  )}

                  <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.7)", "#FFFFFF"]}
                    style={tw`absolute bottom-0 left-0 right-0 h-28`}
                    pointerEvents="none"
                  />
                </View>

                <View style={tw`px-6 pt-2`}>
                  <Text
                    style={tw`text-[32px]  font-bold text-gray-900 leading-[38px] mb-3`}
                  >
                    {item.title}
                  </Text>
                  <Text style={tw`text-base text-gray-500 leading-6`}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />

        <View style={tw`px-6 pb-8 pt-4`}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={tw`bg-[#5A7314] py-4 rounded-full items-center justify-center`}
          >
            <Text style={tw`text-white font-semibold text-base`}>
              {activeIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

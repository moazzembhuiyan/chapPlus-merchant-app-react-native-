import {
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import tw from "../../lib/tailwind";
import BackButton from "./BackButton";

interface LegalPageProps {
  screenTitle: string;
  title?: string;
  html?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const tagsStyles = {
  body: {
    color: "#727272",
    fontSize: 14,
    lineHeight: 22,
  },
  p: {
    marginBottom: 12,
    color: "#727272",
    fontSize: 14,
    lineHeight: 22,
  },
  h1: {
    color: "#1A1A1A",
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 10,
  },
  h2: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  h3: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  strong: { color: "#1A1A1A", fontWeight: "700" as const },
  a: { color: "#5A7314" },
  li: { marginBottom: 6, color: "#727272" },
  ul: { marginBottom: 12 },
};

function ContentSkeleton() {
  return (
    <View style={tw`gap-y-3`}>
      <View style={tw`w-48 h-5 bg-gray-200 rounded`} />
      <View style={tw`w-full h-3 bg-gray-100 rounded`} />
      <View style={tw`w-full h-3 bg-gray-100 rounded`} />
      <View style={tw`w-5/6 h-3 bg-gray-100 rounded`} />
      <View style={tw`w-full h-3 bg-gray-100 rounded mt-2`} />
      <View style={tw`w-4/5 h-3 bg-gray-100 rounded`} />
      <View style={tw`w-full h-3 bg-gray-100 rounded`} />
      <View style={tw`w-3/4 h-3 bg-gray-100 rounded`} />
    </View>
  );
}

export default function LegalPage({
  screenTitle,
  title,
  html,
  isLoading,
  isError,
  onRetry,
}: LegalPageProps) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 40; // px-5 = 20*2

  return (
    <View style={tw`flex-1 bg-white`}>
      <BackButton title={screenTitle} showBackButton />

      {isLoading ? (
        <View style={tw`px-5 pt-5`}>
          <ContentSkeleton />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Text style={tw`text-gray-500 mb-3`}>Failed to load content</Text>
          <TouchableOpacity
            onPress={onRetry}
            style={tw`bg-[#5A7314] px-5 py-2.5 rounded-full`}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-5 pt-5 pb-10`}
        >
          {title ? (
            <Text
              style={tw`text-[#1A1A1A] text-lg font-bold leading-snug mb-4`}
            >
              {title}
            </Text>
          ) : null}

          {html ? (
            <RenderHTML
              contentWidth={contentWidth}
              source={{ html }}
              tagsStyles={tagsStyles}
            />
          ) : (
            <Text style={tw`text-gray-400 text-sm`}>No content available</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../../lib/tailwind";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  destructive = true,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={tw`flex-1 bg-black/45 items-center justify-center px-6`}>
        <View
          style={tw`bg-white w-full rounded-3xl p-6 shadow-lg`}
        >
          {/* Icon */}
          <View style={tw`items-center mb-4`}>
            <View
              style={tw`w-14 h-14 rounded-full items-center justify-center ${
                destructive ? "bg-rose-50" : "bg-[#EFF1E7]"
              }`}
            >
              <Ionicons
                name={destructive ? "trash-outline" : "alert-circle-outline"}
                size={26}
                color={destructive ? "#EF4444" : "#5A7314"}
              />
            </View>
          </View>

          <Text
            style={tw`text-lg font-bold text-gray-900 text-center mb-2`}
          >
            {title}
          </Text>
          <Text
            style={tw`text-sm text-gray-500 text-center leading-5 mb-6`}
          >
            {message}
          </Text>

          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onCancel}
              disabled={loading}
              style={tw`flex-1 py-3.5 rounded-full border border-gray-200 items-center bg-white`}
            >
              <Text style={tw`text-sm font-semibold text-gray-700`}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              disabled={loading}
              style={tw`flex-1 py-3.5 rounded-full items-center ${
                destructive ? "bg-rose-500" : "bg-[#5A7314]"
              } ${loading ? "opacity-70" : ""}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-sm font-semibold text-white`}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
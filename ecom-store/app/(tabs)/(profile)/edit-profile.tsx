import {
  Avatar,
  AvatarImage,
  Box,
  Divider,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker"; // Import thư viện chọn ảnh
import { useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CameraIcon,
  CheckIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TextInput } from "react-native";

import { authService } from "@/services/auth.service";
import { customerService } from "@/services/customer.service";
import { uploadService } from "@/services/upload.service"; // Import upload service
import { UpdateCustomerProfileRequest } from "@/types/customer.type";

export default function EditProfileScreen() {
  const router = useRouter();
  useHideTabBar();

  // State
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // State loading khi upload ảnh

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState(new Date());
  const [avatarUrl, setAvatarUrl] = useState(
    "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg"
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  // 1. Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await authService.getProfile();
        const data = res.data?.data || res.data;

        if (data) {
          setUserId(data.id);
          setFullName(data.fullName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          if (data.avatar) setAvatarUrl(data.avatar);
          if (data.dateOfBirth) setBirthday(new Date(data.dateOfBirth));
        }
      } catch (error) {
        console.error("Lỗi load profile:", error);
        Alert.alert("Lỗi", "Không tải được thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Logic chọn và upload ảnh
  const handlePickImage = async () => {
    // Yêu cầu quyền truy cập thư viện
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Cần quyền truy cập",
        "Bạn cần cấp quyền truy cập thư viện ảnh để thay đổi avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Cho phép cắt ảnh
      aspect: [1, 1], // Tỉ lệ vuông
      quality: 0.8, // Giảm dung lượng một chút để upload nhanh
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handleUploadAvatar(result.assets[0]);
    }
  };

  const handleUploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);

      // Gọi service upload
      const response = await uploadService.uploadImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });

      // Backend trả về List<String>, lấy phần tử đầu tiên
      // Check response structure: ResponseApi<string[]>
      const uploadedUrls = response.data;

      if (uploadedUrls && uploadedUrls.length > 0) {
        const newAvatarUrl = uploadedUrls[0];
        setAvatarUrl(newAvatarUrl); // Cập nhật UI ngay lập tức
        Alert.alert(
          "Thành công",
          "Đã tải ảnh lên, hãy bấm 'Lưu' để cập nhật hồ sơ."
        );
      } else {
        throw new Error("Không nhận được link ảnh từ server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Lỗi Upload", "Không thể tải ảnh lên server.");
    } finally {
      setUploading(false);
    }
  };

  // 3. Xử lý Save Profile (Gửi avatarUrl mới lên DB)
  const handleSave = async () => {
    if (!userId) return;
    if (!fullName) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên.");
      return;
    }

    try {
      setSaving(true);
      const payload: UpdateCustomerProfileRequest = {
        fullName: fullName,
        email: email,
        phone: phone,
        dateOfBirth: birthday.toISOString().split("T")[0],
        avatar: avatarUrl, // URL này đã được cập nhật từ hàm upload
      };

      await customerService.updateCustomer(userId, payload);
      Alert.alert("Thành công", "Cập nhật thông tin thành công", [
        { text: "OK", onPress: () => router.push("/(tabs)/(profile)/profile") },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Thất bại",
        error?.response?.data?.message || "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Thông tin cá nhân</Text>

        <Pressable onPress={handleSave} disabled={saving || uploading}>
          {saving ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <CheckIcon size={24} color="#EF4444" />
          )}
        </Pressable>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <Box className="items-center py-6 bg-red-500">
          <Box className="relative">
            <Avatar size="2xl" className="border-4 border-white">
              <AvatarImage source={{ uri: avatarUrl }} />
            </Avatar>
            {/* Loading Indicator khi đang upload */}
            {uploading && (
              <Box className="absolute inset-0 bg-black/40 rounded-full items-center justify-center">
                <ActivityIndicator color="white" />
              </Box>
            )}
          </Box>

          <Pressable
            className="mt-2 bg-white/30 px-4 py-1 rounded-full flex-row items-center"
            onPress={handlePickImage}
            disabled={uploading}
          >
            <CameraIcon size={16} color="white" style={{ marginRight: 6 }} />
            <Text className="text-white font-medium">
              {uploading ? "Đang tải..." : "Đổi ảnh"}
            </Text>
          </Pressable>
        </Box>

        <Box className="bg-white mt-3 px-4">
          <ProfileInput
            label="Họ tên"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ tên"
          />
          <Divider />

          <ProfileDate
            label="Ngày sinh"
            value={birthday}
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display="spinner"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) setBirthday(selectedDate);
              }}
            />
          )}
          <Divider />

          <ProfileInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Nhập số điện thoại"
          />
          <Divider />

          <ProfileInput
            label="Email"
            value={email}
            editable={false}
            placeholder="Email"
          />
          <Divider />

          {/* <ProfileInput
            label="Tài khoản liên kết"
            value="Google"
            editable={false}
          /> */}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... Các sub-component (ProfileInput, ProfileDate) giữ nguyên ...
function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = "default",
}: any) {
  return (
    <HStack className="justify-between items-center py-4">
      <Text className="text-base text-gray-900 w-1/3">{label}</Text>
      <TextInput
        className={`flex-1 text-base text-right ${
          editable ? "text-gray-700" : "text-gray-400"
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={editable}
        keyboardType={keyboardType}
        style={{ borderWidth: 0 }}
      />
    </HStack>
  );
}

function ProfileDate({ label, value, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row justify-between items-center py-4"
    >
      <Text className="text-base text-gray-900 w-1/3">{label}</Text>
      <HStack className="items-center">
        <Text className="text-base text-gray-700 mr-2">
          {value ? value.toLocaleDateString("vi-VN") : "Chọn ngày"}
        </Text>
        <CalendarIcon size={18} color="#666" />
      </HStack>
    </Pressable>
  );
}

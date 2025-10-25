import React, { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
  Avatar,
  AvatarImage,
  SafeAreaView,
  Divider,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  CheckIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "lucide-react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("Việt Hoàng");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("Nam");
  const [birthday, setBirthday] = useState(new Date(2004, 11, 21));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const genders = ["Nam", "Nữ", "Khác"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Thông tin cá nhân</Text>
        <Pressable onPress={() => console.log("Save profile")}>
          <CheckIcon size={24} color="#EF4444" />
        </Pressable>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <Box className="items-center py-6 bg-red-500">
          <Avatar size="2xl" className="border-4 border-white">
            <AvatarImage
              source={{
                uri: "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
              }}
            />
          </Avatar>
          <Pressable className="mt-2 bg-white/30 px-4 py-1 rounded-full">
            <Text className="text-white font-medium">Sửa</Text>
          </Pressable>
        </Box>

        {/* Thông tin */}
        <Box className="bg-white mt-3 px-4">
          {/* Họ tên */}
          <ProfileInput label="Tên" value={name} onChangeText={setName} />
          <Divider />

          {/* Bio */}
          <ProfileInput
            label="Bio"
            placeholder="Mô tả"
            value={bio}
            onChangeText={setBio}
          />
          <Divider />

          {/* Giới tính */}
          <ProfileSelect
            label="Giới tính"
            value={gender}
            options={genders}
            onChange={setGender}
          />
          <Divider />

          {/* Ngày sinh */}
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
            value="*****44"
            editable={false}
          />
          <Divider />
          <ProfileInput label="Email" placeholder="Email" />
          <Divider />
          <ProfileInput label="Tài khoản liên kết" value="-" editable={false} />
        </Box>

        <Box className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
}: any) {
  return (
    <HStack className="justify-between items-center py-4">
      <Text className="text-base text-gray-900 w-1/3">{label}</Text>
      <TextInput
        className="flex-1 text-base text-gray-700 text-right"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={editable}
        style={{ borderWidth: 0 }}
      />
    </HStack>
  );
}

function ProfileSelect({ label, value, options, onChange }: any) {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row justify-between items-center py-4"
      >
        <Text className="text-base text-gray-900 w-1/3">{label}</Text>
        <HStack className="items-center">
          <Text className="text-base text-gray-700 mr-2">{value}</Text>
          <ChevronDownIcon size={18} color="#666" />
        </HStack>
      </Pressable>

      {open && (
        <VStack className="bg-gray-50 rounded-lg mb-2">
          {options.map((opt: string) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="py-2 px-4"
            >
              <Text className="text-gray-700">{opt}</Text>
            </Pressable>
          ))}
        </VStack>
      )}
    </Box>
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
          {value ? value.toLocaleDateString("vi-VN") : "**/**/****"}
        </Text>
        <CalendarIcon size={18} color="#666" />
      </HStack>
    </Pressable>
  );
}

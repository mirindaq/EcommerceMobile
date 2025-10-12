import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)')
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Đăng nhập khách',
      'Bạn có muốn tiếp tục với tài khoản khách không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Tiếp tục', 
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 bg-gray-50 justify-center px-6 py-8">
          <View className="items-center space-y-8">
            <View className="items-center space-y-2">
              <Text className="text-4xl font-bold text-blue-600">
                EcomStore
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Chào mừng bạn quay trở lại
              </Text>
            </View>

            <View className="w-full max-w-sm space-y-6">
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">Email</Text>
                <TextInput
                  className={`border rounded-lg px-4 py-3 text-base text-black bg-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm">{errors.email}</Text>
                )}
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">Mật khẩu</Text>
                <TextInput
                  className={`border rounded-lg px-4 py-3 text-base text-black bg-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm">{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center space-x-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="text-gray-500 text-sm">hoặc</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity
                className="border border-blue-600 rounded-lg py-4"
                onPress={handleGuestLogin}
              >
                <Text className="text-blue-600 text-center font-semibold text-lg">
                  Tiếp tục với tài khoản khách
                </Text>
              </TouchableOpacity>
            </View>

            <View className="items-center space-y-4 mt-8">
              <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
                <Text className="text-blue-600 text-sm underline">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
              
              <View className="flex-row space-x-1">
                <Text className="text-gray-600 text-sm">
                  Chưa có tài khoản?
                </Text>
                <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng đăng ký đang phát triển')}>
                  <Text className="text-blue-600 text-sm font-semibold">
                    Đăng ký ngay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

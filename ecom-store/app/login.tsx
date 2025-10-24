import { Image } from '@/components/ui';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import React, { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6 py-8">
        <VStack space="xl" className="flex-1">
          {/* Logo and Header */}
          <VStack space="lg" className="items-center mt-8">
            <Box className="w-30 h-30 bg-red-500 rounded-full items-center justify-center">
              <Image
                source={require('../assets/images/logo.png')}
                resizeMode="contain"
                alt="logo"
              />
            </Box>
            <VStack space="sm" className="items-center">
              <Heading size="2xl" className="text-gray-900">
                Chào mừng trở lại
              </Heading>
              <Text className="text-gray-600 text-center">
                Đăng nhập để tiếp tục mua sắm
              </Text>
            </VStack>
          </VStack>

          {/* Login Form */}
          <VStack space="lg" className="flex-1 justify-center">
            <VStack space="md">
              <VStack space="sm">
                <Text className="text-gray-700 font-medium">
                  Email
                </Text>
                <Input className="border-gray-300">
                  <InputField
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>

              <VStack space="sm">
                <Text className="text-gray-700 font-medium">
                  Mật khẩu
                </Text>
                <Input className="border-gray-300">
                  <InputField
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="px-3"
                  >
                    <Icon
                      as={showPassword ? EyeOffIcon : EyeIcon}
                      size="sm"
                      className="text-gray-500"
                    />
                  </Pressable>
                </Input>
              </VStack>
            </VStack>

            {/* Forgot Password */}
            <HStack className="justify-end">
              <Pressable>
                <Text className="text-red-500 font-medium">
                  Quên mật khẩu?
                </Text>
              </Pressable>
            </HStack>

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              className="bg-red-500 rounded-lg"
              isDisabled={isLoading}
            >
              <ButtonText className="text-white font-semibold">
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </ButtonText>
            </Button>

            {/* Divider */}
            <HStack className="items-center my-4">
              <Box className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-gray-500">hoặc</Text>
              <Box className="flex-1 h-px bg-gray-200" />
            </HStack>

            {/* Social Login */}
            <VStack space="sm">
              <Button
                variant="outline"
                className="border-gray-300 rounded-lg"
              >
                <ButtonText className="text-gray-700">
                  Tiếp tục với Google
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                className="border-gray-300 rounded-lg"
              >
                <ButtonText className="text-gray-700">
                  Tiếp tục với Facebook
                </ButtonText>
              </Button>
            </VStack>
          </VStack>

          {/* Sign Up Link */}
          <HStack className="justify-center pb-4">
            <Text className="text-gray-600">
              Chưa có tài khoản?{' '}
            </Text>
            <Pressable>
              <Text className="text-red-500 font-semibold">
                Đăng ký ngay
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
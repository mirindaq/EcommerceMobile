import { Image } from '@/components/ui';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input'; // Đảm bảo import InputSlot
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { authService } from '@/services/auth.service';
import AuthStorageUtil from '@/utils/authStorage.util';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react-native'; // Thêm Icon
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

// Complete auth session for better UX
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        if (isAuthenticated) {
          // User is already logged in, redirect to tabs
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    console.log(email, password);
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log(response.data.data);
      const { accessToken, refreshToken, fullName, email: userEmail } = response.data.data;

      await AuthStorageUtil.setTokens({ accessToken, refreshToken });
      await AuthStorageUtil.setUserData({
        id: userEmail || '',
        email: userEmail,
        name: fullName,
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Vui lòng kiểm tra lại thông tin';
      
      Alert.alert('Đăng nhập thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Mobile redirect URI
      const redirectUri = 'ecom-store://';
      
      // Get Google OAuth URL from backend with mobile redirect_uri
      const response = await authService.socialLogin('google', redirectUri);
      const authUrl = response.data.data;

      if (!authUrl) {
        Alert.alert('Lỗi', 'Không thể kết nối tới Google');
        return;
      }

      // Open browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Extract code from callback URL
        try {
          const urlString = result.url;
          let code: string | null = null;

          // Try to parse as URL
          if (urlString.includes('?')) {
            const params = urlString.split('?')[1];
            const searchParams = new URLSearchParams(params);
            code = searchParams.get('code');
          }

          // Alternative: extract from URL string directly
          if (!code) {
            const match = urlString.match(/[?&]code=([^&]+)/);
            code = match ? match[1] : null;
          }

          if (code) {
            // Call backend with the code and redirect_uri
            const authResponse = await authService.socialLoginCallback('google', code, redirectUri);
            const { accessToken, refreshToken, fullName, email: userEmail } = authResponse.data.data;

            // Save tokens and user data
            await AuthStorageUtil.setTokens({ accessToken, refreshToken });
            await AuthStorageUtil.setUserData({
              id: userEmail || '',
              email: userEmail,
              name: fullName,
            });

            router.replace('/(tabs)');
          } else {
            Alert.alert('Lỗi', 'Không thể lấy mã xác thực từ Google');
          }
        } catch (parseError) {
          console.error('Error parsing callback URL:', parseError);
          Alert.alert('Lỗi', 'Không thể xử lý phản hồi từ Google');
        }
      } else if (result.type === 'cancel') {
        // User cancelled, do nothing
      } else {
        Alert.alert('Lỗi', 'Đăng nhập Google thất bại');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể đăng nhập với Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* KeyboardAvoidingView giúp đẩy giao diện lên khi bàn phím hiện ra */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack className="flex-1 px-6 justify-center py-8" space="3xl">
            
            {/* --- HEADER: LOGO & WELCOME --- */}
            <VStack className="items-center space-y-6">
              <Box className="w-32 h-32">
                 {/* Logo nằm trên nền trắng sẽ nổi bật hơn */}
                 <Image
                  source={require('../assets/images/logo.png')}
                  resizeMode="contain"
                  alt="CellphoneZ Logo"
                  className="w-full h-full"
                />
              </Box>
              
              <VStack className="items-center space-y-2">
                <Heading size="2xl" className="text-gray-900 font-bold">
                  Chào mừng trở lại!
                </Heading>
                <Text className="text-gray-500 text-center text-sm">
                  Đăng nhập để tích điểm và nhận ưu đãi từ CellphoneZ
                </Text>
              </VStack>
            </VStack>

            {/* --- FORM INPUT --- */}
            <VStack space="xl" className="mt-4">
              {/* Email Input */}
              <VStack space="xs">
                <Input 
                  size="xl" 
                  variant="outline" 
                  className="rounded-2xl border-gray-200 bg-gray-50 h-14 focus:border-red-500 focus:bg-white"
                >
                  <InputSlot className="pl-4">
                    <Icon as={MailIcon} className="text-gray-400" size="md"/>
                  </InputSlot>
                  <InputField
                    placeholder="Email hoặc số điện thoại"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-gray-900 text-base font-medium pl-3"
                    placeholderTextColor="#9CA3AF"
                  />
                </Input>
              </VStack>

              {/* Password Input */}
              <VStack space="xs">
                <Input 
                  size="xl" 
                  variant="outline" 
                  className="rounded-2xl border-gray-200 bg-gray-50 h-14 focus:border-red-500 focus:bg-white"
                >
                  <InputSlot className="pl-4">
                    <Icon as={LockIcon} className="text-gray-400" size="md"/>
                  </InputSlot>
                  <InputField
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="text-gray-900 text-base font-medium pl-3"
                    placeholderTextColor="#9CA3AF"
                  />
                  <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                    <Icon as={showPassword ? EyeIcon : EyeOffIcon} className="text-gray-400" />
                  </InputSlot>
                </Input>
                
                <HStack className="justify-end mt-2">
                  <Pressable>
                    <Text className="text-red-600 font-semibold text-sm">
                      Quên mật khẩu?
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>

              {/* Login Button */}
              <Button
                onPress={handleLogin}
                className="bg-red-600 rounded-2xl h-14 active:bg-red-700 mt-2"
                isDisabled={isLoading}
                style={{
                  shadowColor: '#DC2626',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5, // Android shadow
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ButtonText className="text-white font-bold text-lg">
                    Đăng nhập
                  </ButtonText>
                )}
              </Button>
            </VStack>

            {/* --- SOCIAL LOGIN & FOOTER --- */}
            <VStack space="lg" className="mt-2">
              <HStack className="items-center">
                <Box className="flex-1 h-px bg-gray-200" />
                <Text className="px-4 text-gray-400 text-xs font-medium uppercase">Hoặc tiếp tục với</Text>
                <Box className="flex-1 h-px bg-gray-200" />
              </HStack>

              <Button
                variant="outline"
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="rounded-2xl h-14 border-gray-200 bg-white active:bg-gray-50"
              >
                {isGoogleLoading ? (
                   <ActivityIndicator color="#4B5563" />
                ) : (
                  <HStack space="md" className="items-center">
                    {/* Nếu bạn có SVG Google thì thay vào đây, tôi dùng Text giả lập */}
                    <Box className="w-5 h-5 rounded-full items-center justify-center bg-red-500">
                        <Text className="text-white font-bold text-xs">G</Text>
                    </Box>
                    <ButtonText className="text-gray-700 font-semibold text-base">
                      Đăng nhập bằng Google
                    </ButtonText>
                  </HStack>
                )}
              </Button>

              <HStack className="justify-center mt-6 mb-4">
                <Text className="text-gray-500">Bạn chưa có tài khoản? </Text>
                <Pressable onPress={() => router.push('/register')}>
                  <Text className="text-red-600 font-bold">Đăng ký ngay</Text>
                </Pressable>
              </HStack>
            </VStack>

          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
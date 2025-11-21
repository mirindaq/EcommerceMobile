import { Image } from '@/components/ui';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { authService } from '@/services/auth.service';
import AuthStorageUtil from '@/utils/authStorage.util';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { 
  EyeIcon, 
  EyeOffIcon, 
  LockIcon, 
  MailIcon, 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon,
  ArrowLeftIcon,
  CheckIcon
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  View
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RegisterRequest } from '@/types/auth.type';

// Complete auth session for better UX
WebBrowser.maybeCompleteAuthSession();

// Schema validation cho form đăng ký
const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
  phone: z.string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số'),
  email: z.string().email('Định dạng email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        if (isAuthenticated) {
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

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      setValue('dateOfBirth', formatDateForAPI(date), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const registerRequest: RegisterRequest = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      await authService.register(registerRequest);
      
      Alert.alert(
        'Đăng ký thành công',
        'Bạn đã đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Register error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Vui lòng kiểm tra lại thông tin';
      
      Alert.alert('Đăng ký thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsGoogleLoading(true);
      
      const redirectUri = 'ecom-store://';
      const response = await authService.socialLogin('google', redirectUri);
      const authUrl = response.data.data;

      if (!authUrl) {
        Alert.alert('Lỗi', 'Không thể kết nối tới Google');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        try {
          const urlString = result.url;
          let code: string | null = null;

          if (urlString.includes('?')) {
            const params = urlString.split('?')[1];
            const searchParams = new URLSearchParams(params);
            code = searchParams.get('code');
          }

          if (!code) {
            const match = urlString.match(/[?&]code=([^&]+)/);
            code = match ? match[1] : null;
          }

          if (code) {
            const authResponse = await authService.socialLoginCallback('google', code, redirectUri);
            const { accessToken, refreshToken, fullName, email: userEmail } = authResponse.data.data;

            await AuthStorageUtil.setTokens({ accessToken, refreshToken });
            await AuthStorageUtil.setUserData({
              id: userEmail || '',
              email: userEmail,
              name: fullName,
            });

            Alert.alert('Đăng ký thành công', 'Chào mừng bạn đến với Ecommerce Store!');
            router.replace('/(tabs)');
          } else {
            Alert.alert('Lỗi', 'Không thể lấy mã xác thực từ Google');
          }
        } catch (parseError) {
          console.error('Error parsing callback URL:', parseError);
          Alert.alert('Lỗi', 'Không thể xử lý phản hồi từ Google');
        }
      } else if (result.type === 'cancel') {
        // User cancelled
      } else {
        Alert.alert('Lỗi', 'Đăng ký Google thất bại');
      }
    } catch (error: any) {
      console.error('Google register error:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể đăng ký với Google');
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <VStack className="items-center px-6 pt-8 pb-6">
            <Pressable
              onPress={() => router.back()}
              className="absolute left-6 top-8 z-10"
            >
              <ArrowLeftIcon size={24} color="#374151" />
            </Pressable>

            <Box className="w-24 h-24 mb-4">
              <Image
                source={require('../assets/images/logo.png')}
                resizeMode="contain"
                alt="Logo"
                className="w-full h-full"
              />
            </Box>

            <VStack className="items-center space-y-2">
              <Heading size="2xl" className="text-gray-900 font-bold text-center">
                Đăng ký trở thành{' '}
                <Text className="text-red-600">SMEMBER</Text>
              </Heading>
              <Text className="text-gray-500 text-center text-sm">
                Để không bỏ lỡ các ưu đãi hấp dẫn từ Ecommerce Store
              </Text>
            </VStack>
          </VStack>

          {/* Form */}
          <VStack className="flex-1 px-6" space="lg">
            {/* Social Media Registration */}
            <VStack space="sm">
              <Text className="text-center text-gray-700 font-medium text-sm">
                Đăng ký bằng tài khoản mạng xã hội
              </Text>
              <Button
                variant="outline"
                onPress={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="rounded-2xl h-14 border-gray-200 bg-white"
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#4B5563" />
                ) : (
                  <HStack space="md" className="items-center">
                    <Box className="w-5 h-5 rounded-full items-center justify-center bg-red-500">
                      <Text className="text-white font-bold text-xs">G</Text>
                    </Box>
                    <ButtonText className="text-gray-700 font-semibold text-base">
                      Đăng ký bằng Google
                    </ButtonText>
                  </HStack>
                )}
              </Button>
            </VStack>

            {/* Divider */}
            <HStack className="items-center my-2">
              <Box className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500 font-medium text-xs uppercase">
                Hoặc điền thông tin sau
              </Text>
              <Box className="flex-1 h-px bg-gray-300" />
            </HStack>

            {/* Personal Information */}
            <VStack space="md">
              <Text className="text-lg font-semibold text-gray-900">
                Thông tin cá nhân
              </Text>

              {/* Full Name */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Họ và tên</Text>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="xl"
                      variant="outline"
                      className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                    >
                      <InputSlot className="pl-4">
                        <Icon as={UserIcon} className="text-gray-400" size="md" />
                      </InputSlot>
                      <InputField
                        placeholder="Nhập họ và tên"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className="text-gray-900 text-base font-medium pl-3"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                  )}
                />
                {errors.fullName && (
                  <Text className="text-sm text-red-600">{errors.fullName.message}</Text>
                )}
              </VStack>

              {/* Phone Number */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Số điện thoại</Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="xl"
                      variant="outline"
                      className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                    >
                      <InputSlot className="pl-4">
                        <Icon as={PhoneIcon} className="text-gray-400" size="md" />
                      </InputSlot>
                      <InputField
                        placeholder="Nhập số điện thoại"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="phone-pad"
                        className="text-gray-900 text-base font-medium pl-3"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                  )}
                />
                {errors.phone && (
                  <Text className="text-sm text-red-600">{errors.phone.message}</Text>
                )}
              </VStack>

              {/* Date of Birth */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Ngày sinh</Text>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field: { value } }) => (
                    <>
                      <Pressable onPress={() => setShowDatePicker(true)}>
                        <Input
                          size="xl"
                          variant="outline"
                          className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                          pointerEvents="none"
                        >
                          <InputSlot className="pl-4">
                            <Icon as={CalendarIcon} className="text-gray-400" size="md" />
                          </InputSlot>
                          <InputField
                            placeholder="dd/MM/yyyy"
                            value={value ? formatDate(selectedDate) : ''}
                            editable={false}
                            className="text-gray-900 text-base font-medium pl-3"
                            placeholderTextColor="#9CA3AF"
                          />
                        </Input>
                      </Pressable>
                      {showDatePicker && (
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                        />
                      )}
                    </>
                  )}
                />
                {errors.dateOfBirth && (
                  <Text className="text-sm text-red-600">{errors.dateOfBirth.message}</Text>
                )}
              </VStack>

              {/* Email */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="xl"
                      variant="outline"
                      className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                    >
                      <InputSlot className="pl-4">
                        <Icon as={MailIcon} className="text-gray-400" size="md" />
                      </InputSlot>
                      <InputField
                        placeholder="Nhập email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="text-gray-900 text-base font-medium pl-3"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                  )}
                />
                <HStack className="items-center space-x-2 mt-1">
                  <Icon as={CheckIcon} size="sm" className="text-green-600" />
                  <Text className="text-xs text-green-600">
                    Hóa đơn VAT sẽ được gửi qua email này
                  </Text>
                </HStack>
                {errors.email && (
                  <Text className="text-sm text-red-600">{errors.email.message}</Text>
                )}
              </VStack>
            </VStack>

            {/* Password Section */}
            <VStack space="md" className="mt-2">
              <Text className="text-lg font-semibold text-gray-900">Tạo mật khẩu</Text>

              {/* Password */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Mật khẩu</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="xl"
                      variant="outline"
                      className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                    >
                      <InputSlot className="pl-4">
                        <Icon as={LockIcon} className="text-gray-400" size="md" />
                      </InputSlot>
                      <InputField
                        placeholder="Nhập mật khẩu"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        className="text-gray-900 text-base font-medium pl-3"
                        placeholderTextColor="#9CA3AF"
                      />
                      <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                        <Icon as={showPassword ? EyeIcon : EyeOffIcon} className="text-gray-400" />
                      </InputSlot>
                    </Input>
                  )}
                />
                <HStack className="items-center space-x-2 mt-1">
                  <Box className="w-4 h-4 bg-gray-300 rounded-full items-center justify-center">
                    <Text className="text-xs text-gray-600">i</Text>
                  </Box>
                  <Text className="text-xs text-gray-500">Mật khẩu tối thiểu 6 ký tự</Text>
                </HStack>
                {errors.password && (
                  <Text className="text-sm text-red-600">{errors.password.message}</Text>
                )}
              </VStack>

              {/* Confirm Password */}
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">Nhập lại mật khẩu</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      size="xl"
                      variant="outline"
                      className="rounded-2xl border-gray-200 bg-gray-50 h-14"
                    >
                      <InputSlot className="pl-4">
                        <Icon as={LockIcon} className="text-gray-400" size="md" />
                      </InputSlot>
                      <InputField
                        placeholder="Nhập lại mật khẩu"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showConfirmPassword}
                        className="text-gray-900 text-base font-medium pl-3"
                        placeholderTextColor="#9CA3AF"
                      />
                      <InputSlot className="pr-4" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon as={showConfirmPassword ? EyeIcon : EyeOffIcon} className="text-gray-400" />
                      </InputSlot>
                    </Input>
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-sm text-red-600">{errors.confirmPassword.message}</Text>
                )}
              </VStack>
            </VStack>

            {/* Spacer */}
            <Box className="h-20" />
          </VStack>
        </ScrollView>

        {/* Sticky Bottom Buttons */}
        <Box className="bg-white border-t border-gray-200 px-6 py-4">
          <HStack space="md">
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="flex-1 rounded-2xl h-14 border-gray-300"
            >
              <HStack className="items-center space-x-2">
                <Icon as={ArrowLeftIcon} size="sm" className="text-gray-700" />
                <ButtonText className="text-gray-700 font-medium">
                  Quay lại
                </ButtonText>
              </HStack>
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              className="flex-1 bg-red-600 rounded-2xl h-14"
              isDisabled={isLoading}
              style={{
                shadowColor: '#DC2626',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="text-white font-bold text-base">
                  Hoàn tất đăng ký
                </ButtonText>
              )}
            </Button>
          </HStack>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


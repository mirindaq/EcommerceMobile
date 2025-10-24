import React, { useState } from 'react';
import {
  ScrollView,
  Image,
} from 'react-native';
import {
  Box, HStack, VStack, Text, Pressable,
  Heading, Badge, BadgeText, Icon, Avatar, AvatarImage, AvatarFallbackText,
  SafeAreaView,
} from '@/components/ui';
import {
  BellIcon, ShoppingCartIcon, MessageCircleIcon, MenuIcon,
  SearchIcon, CameraIcon, WalletIcon, CoinsIcon, ArrowRightIcon,
  ChevronRightIcon, GiftIcon, CreditCardIcon, ShoppingBagIcon,
  HeartIcon, Gamepad2Icon, Grid3X3Icon, BuildingIcon, ClockIcon
} from 'lucide-react-native';

const shopeeColor = '#FF5722';

// --- Mock data ---
const banners = [
  {
    id: 1,
    title: 'Siêu Sale 10.10',
    subtitle: 'Giảm đến 50% toàn sàn!',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Flash Sale 12h mỗi ngày',
    subtitle: 'Nhanh tay kẻo hết!',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
  },
];

const services = [
  { id: 1, name: 'Voucher & Freeship', icon: GiftIcon, color: '#FF6B6B' },
  { id: 2, name: 'Nạp thẻ, Thanh toán', icon: CreditCardIcon, color: '#4ECDC4' },
  { id: 3, name: 'Shopee Mall', icon: ShoppingBagIcon, color: '#45B7D1' },
  { id: 4, name: 'Ví ShopeePay', icon: WalletIcon, color: '#96CEB4' },
  { id: 5, name: 'Yêu thích', icon: HeartIcon, color: '#FFEAA7' },
  { id: 6, name: 'Shopee Games', icon: Gamepad2Icon, color: '#DDA0DD' },
  { id: 7, name: 'Tài chính', icon: CoinsIcon, color: '#98D8C8' },
  { id: 8, name: 'Shopee Pinjam', icon: BuildingIcon, color: '#F7DC6F' },
  { id: 9, name: 'SPayLater', icon: ClockIcon, color: '#FF6B6B' },
  { id: 10, name: 'Xem thêm', icon: Grid3X3Icon, color: '#4ECDC4' },
];

const liveStreams = [
  {
    id: 1,
    title: 'Shopee LIVE',
    subtitle: 'Giảm cực sốc',
    viewers: '1.2K',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=120&fit=crop',
  },
  {
    id: 2,
    title: 'kedaimart',
    subtitle: 'Sale đến 70%',
    viewers: '382',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=120&fit=crop',
  },
];

export default function HomeScreen() {
  const [cartCount] = useState(3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box className="px-4 py-3 bg-white shadow-sm">
          <HStack className="items-center justify-between">
            <HStack className="items-center space-x-3">
              <Pressable><Icon as={MenuIcon} size="lg" className="text-gray-700" /></Pressable>
              <VStack>
                <Text className="text-gray-500 text-xs">Xin chào 👋</Text>
                <Text className="text-gray-900 font-semibold text-sm">Nguyễn Văn A</Text>
              </VStack>
            </HStack>

            <HStack className="items-center space-x-3">
              <Pressable className="relative">
                <Icon as={BellIcon} size="lg" className="text-gray-700" />
                <Badge className="absolute -top-1 -right-1 bg-red-500">
                  <BadgeText className="text-white text-xs">3</BadgeText>
                </Badge>
              </Pressable>

              <Pressable className="relative">
                <Icon as={ShoppingCartIcon} size="lg" className="text-gray-700" />
                <Badge className="absolute -top-1 -right-1 bg-red-500">
                  <BadgeText className="text-white text-xs">{cartCount}</BadgeText>
                </Badge>
              </Pressable>

              <Pressable><Icon as={MessageCircleIcon} size="lg" className="text-gray-700" /></Pressable>
              <Avatar size="sm">
                <AvatarImage source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }} />
                <AvatarFallbackText>NV</AvatarFallbackText>
              </Avatar>
            </HStack>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box className="px-4 py-3">
          <HStack className="bg-gray-100 rounded-full px-4 py-2 items-center">
            <Icon as={SearchIcon} size="sm" className="text-gray-500 mr-2" />
            <Text className="text-gray-500 flex-1">Tìm kiếm sản phẩm, thương hiệu...</Text>
            <Icon as={CameraIcon} size="sm" className="text-gray-500" />
          </HStack>
        </Box>

        {/* Banner */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="mb-4">
          <HStack>
            {banners.map((b) => (
              <Box key={b.id} className="mx-2 w-80">
                <Pressable className="rounded-2xl overflow-hidden shadow-sm">
                  <Image source={{ uri: b.image }} className="w-full h-40 rounded-2xl" />
                  <Box className="absolute bottom-3 left-3">
                    <Text className="text-white font-bold text-lg">{b.title}</Text>
                    <Text className="text-white text-xs">{b.subtitle}</Text>
                  </Box>
                </Pressable>
              </Box>
            ))}
          </HStack>
        </ScrollView>

        {/* Wallet Section */}
        <Box className="px-4 mb-4">
          <HStack className="justify-between space-x-2">
            <Pressable className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <HStack className="items-center space-x-3">
                <Icon as={WalletIcon} size="lg" style={{ color: shopeeColor }} />
                <VStack>
                  <Text className="text-gray-600 text-xs">₫320.000</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Nạp tiền</Text>
                </VStack>
              </HStack>
            </Pressable>
            <Pressable className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <HStack className="items-center space-x-3">
                <Icon as={CoinsIcon} size="lg" className="text-yellow-500" />
                <VStack>
                  <Text className="text-gray-600 text-xs">0</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Nhận xu</Text>
                </VStack>
              </HStack>
            </Pressable>
            <Pressable className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <HStack className="items-center space-x-3">
                <Icon as={ArrowRightIcon} size="lg" className="text-green-500" />
                <VStack>
                  <Text className="text-gray-600 text-xs">Chuyển</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Miễn phí</Text>
                </VStack>
              </HStack>
            </Pressable>
          </HStack>
        </Box>

        {/* Service Grid */}
        <Box className="px-4 mb-6">
          <HStack className="flex-wrap justify-between">
            {services.map((s) => (
              <Pressable key={s.id} className="w-[18%] items-center mb-4">
                <Box className="w-12 h-12 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: s.color + '22' }}>
                  <Icon as={s.icon} size="md" style={{ color: s.color }} />
                </Box>
                <Text className="text-gray-600 text-xs text-center" numberOfLines={2}>{s.name}</Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Shopee LIVE Section */}
        <Box className="px-4 mb-6">
          <HStack className="items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-lg">Shopee LIVE</Text>
            <Pressable className="flex-row items-center">
              <Text className="text-shopee text-sm text-orange-500">Xem tất cả</Text>
              <Icon as={ChevronRightIcon} size="sm" className="text-orange-500" />
            </Pressable>
          </HStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="md">
              {liveStreams.map((l) => (
                <Pressable key={l.id} className="w-44">
                  <Box className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <Image source={{ uri: l.image }} className="w-full h-28" />
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      <BadgeText className="text-white text-xs">LIVE</BadgeText>
                    </Badge>
                    <VStack className="p-2">
                      <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>{l.title}</Text>
                      <Text className="text-gray-600 text-xs" numberOfLines={2}>{l.subtitle}</Text>
                      <Text className="text-orange-500 text-xs mt-1">{l.viewers} đang xem</Text>
                    </VStack>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

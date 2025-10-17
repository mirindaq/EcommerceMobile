import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ArrowRightIcon, BellIcon, BuildingIcon, CameraIcon, ChevronRightIcon, ClockIcon, CoinsIcon, CreditCardIcon, Gamepad2Icon, GiftIcon, Grid3X3Icon, HeartIcon, MenuIcon, MessageCircleIcon, SearchIcon, ShoppingCartIcon, WalletIcon } from 'lucide-react-native';
import React, { useState } from 'react';

// Mock data for products
const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: '29.990.000',
    originalPrice: '32.990.000',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    price: '24.990.000',
    originalPrice: '27.990.000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
    discount: '11%',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    price: '32.990.000',
    originalPrice: '35.990.000',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    discount: '8%',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'iPad Pro 12.9"',
    price: '28.990.000',
    originalPrice: '31.990.000',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
  },
];

const categories = [
  { id: 1, name: 'Điện thoại', icon: '📱', color: '#FF6B6B' },
  { id: 2, name: 'Laptop', icon: '💻', color: '#4ECDC4' },
  { id: 3, name: 'Tablet', icon: '📱', color: '#45B7D1' },
  { id: 4, name: 'Phụ kiện', icon: '🎧', color: '#96CEB4' },
  { id: 5, name: 'Thời trang', icon: '👕', color: '#FFEAA7' },
  { id: 6, name: 'Gia dụng', icon: '🏠', color: '#DDA0DD' },
  { id: 7, name: 'Thể thao', icon: '⚽', color: '#98D8C8' },
  { id: 8, name: 'Sách', icon: '📚', color: '#F7DC6F' },
];

const banners = [
  {
    id: 1,
    title: 'SEMUA DI SHOPEE DISKON 50%',
    subtitle: 'MULAI 8 MALAM',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop',
    color: '#FF6B6B',
    isLive: true
  },
  {
    id: 2,
    title: 'Flash Sale',
    subtitle: 'Mỗi ngày 12h',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
    color: '#4ECDC4'
  },
  {
    id: 3,
    title: 'Freeship',
    subtitle: 'Đơn từ 0đ',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=200&fit=crop',
    color: '#45B7D1'
  }
];

const services = [
  { id: 1, name: 'Gratis Ongkir dan Voucher', icon: GiftIcon, color: '#FF6B6B' },
  { id: 2, name: 'Pulsa, Tagihan, dan Tiket', icon: CreditCardIcon, color: '#4ECDC4' },
  { id: 3, name: 'Shopee Mall', icon: ShoppingCartIcon, color: '#45B7D1' },
  { id: 4, name: 'ShopeePay Sekitarmu', icon: WalletIcon, color: '#96CEB4' },
  { id: 5, name: 'Shopee Barokah', icon: HeartIcon, color: '#FFEAA7' },
  { id: 6, name: 'Shopee Games', icon: Gamepad2Icon, color: '#DDA0DD' },
  { id: 7, name: 'Keuangan', icon: CoinsIcon, color: '#98D8C8' },
  { id: 8, name: 'Shopee Pinjam Lokal', icon: BuildingIcon, color: '#F7DC6F' },
  { id: 9, name: 'SPayLater', icon: ClockIcon, color: '#FF6B6B' },
  { id: 10, name: 'Lihat Semua', icon: Grid3X3Icon, color: '#4ECDC4' },
];

const liveStreams = [
  {
    id: 1,
    title: 'SRO',
    subtitle: 'EPS 11',
    viewers: '1.2K',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=120&fit=crop',
    isLive: true
  },
  {
    id: 2,
    title: 'kedaimart',
    subtitle: 'Dapatkan Diskon Produk Termurah disini!',
    viewers: '382',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=120&fit=crop',
    isLive: true
  },
  {
    id: 3,
    title: 'PROI DISK',
    subtitle: 'Flash Sale',
    viewers: '156',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=120&fit=crop',
    isLive: true
  }
];

const hotProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: '34.990.000',
    originalPrice: '37.990.000',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
    discount: '8%',
    rating: 4.9,
    sold: 1234,
    isHot: true,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: '29.990.000',
    originalPrice: '32.990.000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
    sold: 856,
    isHot: true,
  },
  {
    id: 3,
    name: 'MacBook Pro M3 14"',
    price: '45.990.000',
    originalPrice: '48.990.000',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    discount: '6%',
    rating: 4.9,
    sold: 234,
    isHot: true,
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" M2',
    price: '28.990.000',
    originalPrice: '31.990.000',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
    sold: 567,
    isHot: true,
  },
];

export default function HomeScreen() {
  const [cartCount, setCartCount] = useState(3);
  const [currentBanner, setCurrentBanner] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box className="px-4 py-3 bg-white">
          <HStack className="items-center justify-between">
            <HStack className="items-center space-x-3">
              <Pressable>
                <Icon as={MenuIcon} size="lg" className="text-gray-700" />
              </Pressable>
              <VStack>
                <Text className="text-gray-500 text-sm">Xin chào!</Text>
                <Text className="text-gray-900 font-semibold">Nguyễn Văn A</Text>
              </VStack>
            </HStack>
            
            <HStack className="items-center space-x-4">
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
              
              <Pressable className="relative">
                <Icon as={MessageCircleIcon} size="lg" className="text-gray-700" />
              </Pressable>
              
              <Avatar size="sm">
                <AvatarImage source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }} />
                <AvatarFallbackText>NV</AvatarFallbackText>
              </Avatar>
            </HStack>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box className="px-4 py-3 bg-white">
          <HStack className="bg-gray-100 rounded-lg px-4 py-3 items-center">
            <Icon as={SearchIcon} size="sm" className="text-gray-500 mr-3" />
            <Text className="text-gray-500 flex-1">Q</Text>
            <Icon as={CameraIcon} size="sm" className="text-gray-500" />
          </HStack>
        </Box>

        {/* Main Banner */}
        <Box className="px-4 mb-4">
          <Pressable className="bg-white border border-gray-200 rounded-xl p-6 h-32">
            <VStack space="sm" className="flex-1 justify-center">
              <HStack className="items-center space-x-2">
                <Text className="text-gray-900 font-bold text-lg">SHOPEE LIVE</Text>
                <Badge className="bg-red-500">
                  <BadgeText className="text-white text-xs">LIVE</BadgeText>
                </Badge>
              </HStack>
              <Heading size="lg" className="text-gray-900">
                {banners[0].title}
              </Heading>
              <Text className="text-gray-600 text-sm">
                {banners[0].subtitle}
              </Text>
            </VStack>
          </Pressable>
        </Box>

        {/* Wallet Section */}
        <Box className="px-4 mb-4">
          <HStack className="justify-between">
            <Pressable className="flex-1 bg-white rounded-lg p-4 mx-1 border border-gray-200">
              <HStack className="items-center space-x-3">
                <Icon as={WalletIcon} size="lg" className="text-orange-500" />
                <VStack>
                  <Text className="text-gray-600 text-xs">Rp320.000</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Isi Saldo</Text>
                </VStack>
              </HStack>
            </Pressable>
            
            <Pressable className="flex-1 bg-white rounded-lg p-4 mx-1 border border-gray-200">
              <HStack className="items-center space-x-3">
                <Icon as={CoinsIcon} size="lg" className="text-yellow-500" />
                <VStack>
                  <Text className="text-gray-600 text-xs">0</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Gratis Koin 25RB!</Text>
                </VStack>
              </HStack>
            </Pressable>
            
            <Pressable className="flex-1 bg-white rounded-lg p-4 mx-1 border border-gray-200">
              <HStack className="items-center space-x-3">
                <Icon as={ArrowRightIcon} size="lg" className="text-green-500" />
                <VStack>
                  <Text className="text-gray-600 text-xs">Transfer</Text>
                  <Text className="text-gray-800 font-semibold text-sm">Gratis</Text>
                </VStack>
              </HStack>
            </Pressable>
          </HStack>
        </Box>

        {/* Service Grid */}
        <Box className="px-4 mb-6">
          <Box className="flex-row flex-wrap justify-between">
            {services.map((service) => (
              <Pressable key={service.id} className="w-[18%] items-center mb-4">
                <Box 
                  className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                  style={{ backgroundColor: service.color + '20' }}
                >
                  <Icon as={service.icon} size="lg" style={{ color: service.color }} />
                </Box>
                <Text className="text-gray-600 text-xs text-center" numberOfLines={2}>
                  {service.name}
                </Text>
              </Pressable>
            ))}
          </Box>
        </Box>

        {/* Promotional Cards */}
        <Box className="px-4 mb-6">
          <HStack className="space-x-4">
            <Pressable className="flex-1 bg-white border border-orange-200 rounded-xl p-4">
              <VStack space="sm">
                <Text className="text-orange-600 font-bold text-sm">Super Brand Day</Text>
                <Text className="text-orange-500 text-xs">DISKON SD 70%</Text>
                <Text className="text-orange-500 text-xs">BELI 3 EKSTRA 15%</Text>
              </VStack>
            </Pressable>
            
            <Pressable className="flex-1 bg-white border border-red-200 rounded-xl p-4">
              <VStack space="sm">
                <Text className="text-red-600 font-bold text-sm">2 HARI LAGI VOUCHER BADAI</Text>
                <Text className="text-red-500 text-xs">100% + 100RB</Text>
                <HStack className="items-center space-x-1">
                  <Text className="text-red-500 text-xs">CEK DI SINI</Text>
                  <Icon as={ChevronRightIcon} size="xs" className="text-red-500" />
                </HStack>
              </VStack>
            </Pressable>
          </HStack>
        </Box>

        {/* Shopee LIVE Section */}
        <Box className="px-4 mb-6">
          <HStack className="items-center justify-between mb-4">
            <Text className="text-gray-900 font-bold text-lg">SHOPEE LIVE</Text>
            <Pressable className="flex-row items-center space-x-1">
              <Text className="text-gray-600 text-sm">Lihat Semua</Text>
              <Icon as={ChevronRightIcon} size="sm" className="text-gray-600" />
            </Pressable>
          </HStack>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="md">
              {liveStreams.map((stream) => (
                <Pressable key={stream.id} className="w-48">
                  <Box className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <Box className="relative">
        <Image
                        source={{ uri: stream.image }}
                        className="w-full h-32"
                        alt={stream.title}
                      />
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        <BadgeText className="text-white text-xs">LIVE</BadgeText>
                      </Badge>
                      <HStack className="absolute bottom-2 left-2 right-2">
                        <Text className="text-white text-xs bg-black/50 rounded px-1">
                          {stream.viewers} viewers
                        </Text>
                      </HStack>
                    </Box>
                    
                    <VStack space="sm" className="p-3">
                      <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {stream.title}
                      </Text>
                      <Text className="text-gray-600 text-xs" numberOfLines={2}>
                        {stream.subtitle}
                      </Text>
                    </VStack>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>


        {/* Bottom Spacing */}
        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
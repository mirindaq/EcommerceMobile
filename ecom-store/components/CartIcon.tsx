import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box, Badge, BadgeText } from '@/components/ui';
import { ShoppingCartIcon } from 'lucide-react-native';

interface CartIconProps {
  size?: number;
  color?: string;
  badgeCount?: number;
  showBadge?: boolean;
  onPress?: () => void;
  className?: string;
}

export default function CartIcon({ 
  size = 24, 
  color = "white", 
  badgeCount = 0,
  showBadge = true,
  onPress,
  className = ""
}: CartIconProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/cart");
    }
  };

  return (
    <Pressable
      className={`relative ${className}`}
      onPress={handlePress}
    >
      <ShoppingCartIcon size={size} color={color} />
      {showBadge && badgeCount > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-red-500 min-w-5 h-5 rounded-full items-center justify-center">
          <BadgeText className="text-white text-xs font-bold">
            {badgeCount > 99 ? '99+' : badgeCount}
          </BadgeText>
        </Badge>
      )}
    </Pressable>
  );
}

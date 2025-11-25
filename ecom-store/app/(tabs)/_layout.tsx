import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AuthStorageUtil from "@/utils/authStorage.util";

export default function TabLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        if (!isAuthenticated) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="featured-posts"
        options={{
          title: "Bài viết",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)/profile"
        options={{
          title: "Tôi",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)/ranking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/add-address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/edit-address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/my-address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/my-voucher"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/my-wishlist"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/order-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/pending-confirm"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/pending-delivery"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/pending-pickup"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/post-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/term-of-use"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/view-promotion"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(profile)/guarantee-policy"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

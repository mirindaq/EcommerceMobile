import { Box, Pressable, Text } from '@/components/ui';
import type { Brand } from '@/types/brand.type';
import React from 'react';
import { FlatList } from 'react-native';

interface BrandSelectionProps {
  brands: Brand[];
  selectedBrandIds: number[];
  onBrandToggle: (brandId: number) => void;
}

export default function BrandSelection({
  brands,
  selectedBrandIds,
  onBrandToggle,
}: BrandSelectionProps) {
  if (brands.length === 0) return null;

  return (
    <Box className="py-3 pl-4 bg-white mb-2">
      <FlatList
        horizontal
        data={brands}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedBrandIds.includes(item.id);
          return (
            <Pressable
              onPress={() => onBrandToggle(item.id)}
              className={`px-4 py-1.5 rounded-full mr-2 border ${
                isSelected ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </Box>
  );
}


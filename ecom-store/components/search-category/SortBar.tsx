import { Box, Pressable, Text } from '@/components/ui';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FilterIcon } from 'lucide-react-native';
import React from 'react';

type SortType = 'popular' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';

interface SortBarProps {
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export default function SortBar({
  sortBy,
  onSortChange,
  onFilterPress,
  activeFilterCount,
}: SortBarProps) {
  const handlePriceSort = () => {
    if (sortBy === 'price_asc') {
      onSortChange('price_desc');
    } else {
      onSortChange('price_asc');
    }
  };

  return (
    <Box className="flex-row bg-white border-b border-gray-100 px-2 py-2 items-center justify-between">
      <Pressable
        onPress={() => onSortChange('popular')}
        className="flex-1 items-center py-2"
      >
        <Text
          className={`text-sm font-medium ${
            sortBy === 'popular' ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          Phổ biến
        </Text>
      </Pressable>
      <Box className="w-[1px] h-4 bg-gray-200" />
      <Pressable
        onPress={() => onSortChange('newest')}
        className="flex-1 items-center py-2"
      >
        <Text
          className={`text-sm font-medium ${
            sortBy === 'newest' ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          Mới nhất
        </Text>
      </Pressable>
      <Box className="w-[1px] h-4 bg-gray-200" />
      <Pressable
        onPress={handlePriceSort}
        className="flex-1 flex-row items-center justify-center py-2 space-x-1"
      >
        <Text
          className={`text-sm font-medium ${
            sortBy.includes('price') ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          Giá
        </Text>
        {sortBy === 'price_asc' ? (
          <ArrowUpIcon
            size={14}
            color="#EF4444"
          />
        ) : sortBy === 'price_desc' ? (
          <ArrowDownIcon
            size={14}
            color="#EF4444"
          />
        ) : (
          <ArrowUpDownIcon
            size={14}
            color="#6B7280"
          />
        )}
      </Pressable>
      <Box className="w-[1px] h-4 bg-gray-200" />
      <Pressable
        onPress={onFilterPress}
        className="flex-row items-center px-3 py-1 ml-1"
      >
        <Text className="text-sm font-medium text-gray-800 mr-1">Bộ lọc</Text>
        <FilterIcon size={14} color="#374151" />
        {activeFilterCount > 0 && (
          <Box className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full" />
        )}
      </Pressable>
    </Box>
  );
}


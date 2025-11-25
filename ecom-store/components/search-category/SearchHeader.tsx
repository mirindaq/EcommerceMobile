import {
  Box,
  HStack,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Pressable,
} from '@/components/ui';
import { ArrowLeftIcon, SearchIcon, XIcon } from 'lucide-react-native';
import React from 'react';

interface SearchHeaderProps {
  searchText: string;
  placeholder?: string;
  onSearchChange: (text: string) => void;
  onBack: () => void;
}

export default function SearchHeader({
  searchText,
  placeholder = 'Tìm kiếm...',
  onSearchChange,
  onBack,
}: SearchHeaderProps) {
  return (
    <Box className="bg-white pt-2 pb-2 px-4 flex-row items-center border-b border-gray-100">
      <Pressable onPress={onBack} className="p-1 mr-2">
        <ArrowLeftIcon size={24} color="#1F2937" />
      </Pressable>
      <Input className="flex-1 h-10 bg-gray-100 border-0 rounded-lg" variant="rounded">
        <InputSlot className="pl-3">
          <InputIcon as={SearchIcon} size="sm" className="text-gray-400" />
        </InputSlot>
        <InputField
          placeholder={placeholder}
          value={searchText}
          onChangeText={onSearchChange}
          className="text-sm text-gray-800"
          placeholderTextColor="#9CA3AF"
        />
        {searchText.length > 0 && (
          <InputSlot className="pr-3" onPress={() => onSearchChange('')}>
            <InputIcon as={XIcon} size="xs" className="text-gray-400" />
          </InputSlot>
        )}
      </Input>
    </Box>
  );
}


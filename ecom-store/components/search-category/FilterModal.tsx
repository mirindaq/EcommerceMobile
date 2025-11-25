import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";
import type { FilterCriteria } from "@/types/filterCriteria.type";
import { CheckIcon, XIcon } from "lucide-react-native";
import React from "react";
import { FlatList, Modal, TouchableOpacity, View } from "react-native";

interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  filterValues?: number[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  filterCriterias: FilterCriteria[];
  onFilterChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  activeFilterCount: number;
}

export default function FilterModal({
  visible,
  onClose,
  filters,
  filterCriterias,
  onFilterChange,
  onApply,
  onReset,
  activeFilterCount,
}: FilterModalProps) {
  const toggleFilterValue = (filterValueId: number) => {
    const currentValues = filters.filterValues || [];
    const newValues = currentValues.includes(filterValueId)
      ? currentValues.filter((id) => id !== filterValueId)
      : [...currentValues, filterValueId];

    onFilterChange({
      ...filters,
      filterValues: newValues.length > 0 ? newValues : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity className="flex-1" onPress={onClose} />

        <Box className="bg-white rounded-t-3xl h-[85%] w-full overflow-hidden">
          {/* Modal Header */}
          <HStack className="p-4 border-b border-gray-100 justify-between items-center bg-white">
            <Text className="text-lg font-bold text-gray-900">
              Bộ lọc tìm kiếm
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1 bg-gray-100 rounded-full"
            >
              <XIcon size={20} color="#6B7280" />
            </TouchableOpacity>
          </HStack>

          {/* Modal Content */}
          <FlatList
            className="flex-1 px-4"
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <VStack className="pb-24 pt-4">
                {/* Dynamic Filter Criteria */}
                {filterCriterias.map((criteria) => {
                  return (
                    <VStack key={criteria.id} className="mb-4">
                      <Text className="font-bold text-gray-900 text-base mb-3">
                        {criteria.name}
                      </Text>

                      {criteria.filterValues &&
                        criteria.filterValues.length > 0 && (
                          <Box className="flex-row flex-wrap">
                            {criteria.filterValues.map((val) => {
                              const active =
                                filters.filterValues?.includes(val.id) || false;
                              return (
                                <Pressable
                                  key={val.id}
                                  onPress={() => toggleFilterValue(val.id)}
                                  className={`px-4 py-2.5 rounded-lg border mr-2 mb-2 ${
                                    active
                                      ? "bg-red-50 border-red-500"
                                      : "bg-white border-gray-200"
                                  }`}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      active ? "text-red-600" : "text-gray-700"
                                    }`}
                                  >
                                    {val.value}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </Box>
                        )}
                    </VStack>
                  );
                })}

                {/* In Stock Toggle */}
                <Pressable
                  onPress={() =>
                    onFilterChange({
                      ...filters,
                      inStock: !filters.inStock,
                    })
                  }
                  className="flex-row justify-between items-center py-4 border-t border-gray-100"
                >
                  <VStack className="flex-1">
                    <Text className="font-bold text-gray-900 text-base">
                      Chỉ hiện còn hàng
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Ẩn các sản phẩm đã hết hàng
                    </Text>
                  </VStack>
                  <Box
                    className={`w-7 h-7 rounded-lg border-2 items-center justify-center ${
                      filters.inStock
                        ? "bg-red-500 border-red-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {filters.inStock && <CheckIcon size={18} color="white" />}
                  </Box>
                </Pressable>
              </VStack>
            }
          />

          {/* Sticky Footer Buttons */}
          <Box className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex-row space-x-3 shadow-lg gap-3">
            <Pressable
              onPress={onReset}
              className="flex-1 py-3 rounded-xl border border-gray-300 items-center justify-center bg-white"
            >
              <Text className="font-semibold text-gray-700">Thiết lập lại</Text>
            </Pressable>
            <Pressable
              onPress={onApply}
              className="flex-1 py-3 rounded-xl bg-red-600 items-center justify-center shadow-sm"
            >
              <Text className="font-bold text-white">
                Áp dụng ({activeFilterCount})
              </Text>
            </Pressable>
          </Box>
        </Box>
      </View>
    </Modal>
  );
}

import React from 'react';
import { Dimensions, Image, ScrollView } from 'react-native';
import { Box, Text } from '@/components/ui';

const { width } = Dimensions.get('window');

interface ProductImagesProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function ProductImages({ images, currentIndex, onIndexChange }: ProductImagesProps) {
  return (
    <Box className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          onIndexChange(index);
        }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={{ width: width, height: width }}
            className="rounded"
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Image pagination */}
      {images.length > 1 && (
        <Box className="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-1">
          <Text className="text-white text-sm">
            {currentIndex + 1}/{images.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}


import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';
import { Platform } from 'react-native';

export const uploadService = {
  /**
   * Upload ảnh lên server
   * @param imageAsset Object ảnh lấy từ expo-image-picker
   */
  uploadImage: async (imageAsset: { uri: string; fileName?: string | null; mimeType?: string | null }) => {
    const formData = new FormData();

    // Chuẩn bị file object cho React Native
    const fileToUpload = {
      uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
      name: imageAsset.fileName || `avatar_${Date.now()}.jpg`,
      type: imageAsset.mimeType || 'image/jpeg',
    };

    // Key phải là 'files' vì Backend dùng: private List<MultipartFile> files;
    // @ts-ignore: React Native FormData append signature is different from Web
    formData.append('files', fileToUpload);

    const response = await axiosClient.post<ResponseApi<string[]>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: () => {
        // Return FormData as is, don't let axios stringify it
        return formData;
      },
    });

    return response.data;
  },
};
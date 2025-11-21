import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Hook để ẩn tab bar khi vào các trang không phải tab
 */
export function useHideTabBar() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      });
    };
  }, [navigation]);
}


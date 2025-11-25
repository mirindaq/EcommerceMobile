import AuthStorageUtil from '@/utils/authStorage.util';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Hook để bảo vệ các route cần authentication
 * Tự động redirect về login nếu chưa đăng nhập
 */
export function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await AuthStorageUtil.isAuthenticated();
        setIsAuthenticated(authenticated);

        // Nếu chưa đăng nhập và không phải đang ở trang login/index
        if (!authenticated) {
          const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'search' || segments[0] === 'product-detail' || segments[0] === 'cart';
          
          if (inAuthGroup) {
            // Redirect về login
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [segments, router]);

  return { isChecking, isAuthenticated };
}


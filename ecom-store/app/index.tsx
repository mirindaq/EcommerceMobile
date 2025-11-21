import AuthStorageUtil from '@/utils/authStorage.util';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/loading-screen';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show splash screen for 2 seconds
    const splashTimer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isReady) return;

      try {
        // Check if user is authenticated
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        
        if (isAuthenticated) {
          // User is logged in, redirect to tabs
          router.replace('/(tabs)');
        } else {
          // User is not logged in, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to login
        router.replace('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isReady, router]);

  // Show loading screen while checking auth
  if (!isReady || isCheckingAuth) {
    return <LoadingScreen />;
  }

  // This should not be reached, but return null as fallback
  return null;
}

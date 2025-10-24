import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import LoadingScreen from '../components/loading-screen';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      router.replace('/login');
    }
  }, [isReady]);

  return isReady ? null : <LoadingScreen />;
}

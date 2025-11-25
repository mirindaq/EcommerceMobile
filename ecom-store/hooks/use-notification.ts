
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

import Constants from 'expo-constants'

import { Platform } from 'react-native'
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { customerService } from '@/services/customer.service';
import AuthStorageUtil from '@/utils/authStorage.util';

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
  updatePushTokenOnServer?: () => Promise<void>;
}

export const useNotification = (): PushNotificationState => {
  const router = useRouter();
  
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Hiển thị notification đẹp hơn khi có chat mới
      const data = notification.request.content.data;
      const isChatMessage = data && typeof data === 'object' && 'type' in data && data.type === 'chat_message';
      
      return {
        shouldPlaySound: true,
        shouldSetBadge: isChatMessage, // Hiển thị badge khi có chat mới
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });

  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>(undefined);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  // Hàm để update push token lên server (có thể gọi từ bên ngoài sau khi user đăng nhập)
  const updatePushTokenOnServer = async () => {
    if (!expoPushToken) {
      console.log('No push token available');
      return;
    }

    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot update push token');
      return;
    }

    // Kiểm tra token có tồn tại không
    const accessToken = await AuthStorageUtil.getAccessToken();
    if (!accessToken) {
      console.log('Access token not found, cannot update push token');
      return;
    }

    console.log('Updating push token, access token exists:', !!accessToken);

    let tokenString: string;
    if (typeof expoPushToken === 'string') {
      tokenString = expoPushToken;
    } else if (expoPushToken && typeof expoPushToken === 'object' && 'data' in expoPushToken) {
      tokenString = expoPushToken.data as string;
    } else {
      tokenString = String(expoPushToken);
    }

    if (tokenString) {
      try {
        await customerService.updatePushToken(tokenString);
        console.log('Push token updated successfully');
      } catch (error) {
        console.log('Failed to update push token:', error);
      }
    }
  };


  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId as string,
      });

      if ( Platform.OS === 'android' ) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Thông báo',
          description: 'Thông báo từ ứng dụng',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E6F4FE',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      return expoPushToken;
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }

  useEffect(() => {
    // Xử lý notification khi app mở từ killed state (khi user tap vào notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    registerForPushNotificationsAsync().then(async (expoPushToken) => {
      if (expoPushToken) {
        setExpoPushToken(expoPushToken);
        
        // Chỉ gửi push token lên server khi user đã đăng nhập
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        if (!isAuthenticated) {
          console.log('User not authenticated, skipping push token update');
          return;
        }
        
        // Gửi push token lên server
        // ExpoPushToken có thể là object với property 'data' hoặc string
        let tokenString: string;
        if (typeof expoPushToken === 'string') {
          tokenString = expoPushToken;
        } else if (expoPushToken && typeof expoPushToken === 'object' && 'data' in expoPushToken) {
          tokenString = expoPushToken.data as string;
        } else {
          tokenString = String(expoPushToken);
        }
        
        if (tokenString) {
          customerService.updatePushToken(tokenString).catch((error) => {
            console.log('Failed to update push token:', error);
            // Không throw error để không ảnh hưởng đến app
          });
        }
      }
    });

    // Listener cho notification khi app đang chạy (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
      
      // Hiển thị notification đẹp hơn khi có chat mới
      const data = notification.request.content.data;
      const isChatMessage = data && typeof data === 'object' && 'type' in data && data.type === 'chat_message';
      
      if (isChatMessage) {
        // Có thể thêm logic để update UI, ví dụ: hiển thị badge số tin nhắn chưa đọc
        console.log('New chat message received:', notification.request.content.title);
      }
    });

    // Listener cho khi user tap vào notification (app đang chạy hoặc mở từ killed state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      setNotification(response.notification);
      handleNotificationResponse(response);
    });
  }, []);

  // Hàm xử lý khi user tap vào notification
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Nếu là notification từ chat, navigate đến chat screen
    if (data && typeof data === 'object' && 'type' in data && data.type === 'chat_message' && 'chatId' in data) {
      const chatId = data.chatId;
      // Navigate đến chat screen với chatId
      if (typeof chatId === 'number' || typeof chatId === 'string') {
        router.push({
          pathname: '/chat-support',
          params: { chatId: String(chatId) }
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      const notificationListenerSubscription = notificationListener.current;
      const responseListenerSubscription = responseListener.current;
      if (notificationListenerSubscription) {
        notificationListenerSubscription.remove();
      }
      if (responseListenerSubscription) {
        responseListenerSubscription.remove();
      }
    };
  }, []);

  return { notification, expoPushToken, updatePushTokenOnServer };
};


import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

import Constants from 'expo-constants'

import { Platform } from 'react-native'
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { customerService } from '@/services/customer.service';

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const useNotification = (): PushNotificationState => {
  const router = useRouter();
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>(undefined);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);


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
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
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

    registerForPushNotificationsAsync().then((expoPushToken) => {
      if (expoPushToken) {
        setExpoPushToken(expoPushToken);
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
      // Có thể hiển thị local notification hoặc update UI
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

  return { notification, expoPushToken };
};

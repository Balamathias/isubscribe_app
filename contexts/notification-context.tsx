import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationAsync";
import { EventSubscription as Subscription } from "expo-modules-core";
import { router } from "expo-router";
import { Linking } from "react-native";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const mapReaderFriendlyNameToScreen = (name: string): string => {
  switch (name.toLocaleLowerCase()) {
    case "home":
      return "/";
    case "data":
      return '/services/data'
    case "airtime":
      return "/services/airtime";
    case "tv":
      return "/services/tv-cable";
    case "electricity":
      return "/services/electricity";
    case "history":
      return "/history";
    case "account":
      return "/accounts";
    case "profile":
      return "/profile";
    case "settings":
      return "/settings";
    default:
      return name;
  }
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log(
        //   "🔔 Notification Response: ",
        //   JSON.stringify(response, null, 2),
        //   JSON.stringify(response.notification.request.content.data, null, 2)
        // );
        const payload = response.notification.request.content.data;
        if (payload && payload.action) {
          switch (payload.action) {
            case 'navigate':
              try {
                const screen = mapReaderFriendlyNameToScreen(payload?.screen as any);
                const decodedScreen = decodeURIComponent(screen);
                router.navigate(decodedScreen as any);
              } catch (error) {
                console.warn('Failed to decode screen path:', error);
                router.navigate('/');
              }
              break;

            case 'open_url':
              if (payload?.url) {
                try {
                  const url = payload.url.toString();
                  const decodedUrl = decodeURIComponent(url);
                  Linking.openURL(decodedUrl);
                } catch (error) {
                  console.warn('Failed to decode or open URL:', error);
                }
              }
              break;
          }
        }
      });

    return () => {
      notificationListener?.current?.remove();
      responseListener?.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
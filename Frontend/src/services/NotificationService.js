import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannel();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
     
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

     
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

    
      popInitialNotification: true,

   
      requestPermissions: Platform.OS === 'ios',
    });
  }

  requestPermissions() {
    if (Platform.OS === 'ios') {
      PushNotification.requestPermissions();
    } else if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        .then(result => console.log('Notification permission status:', result))
        .catch(err => console.error('Permission request error:', err));
    }
  }

  createDefaultChannel() {
    PushNotification.createChannel(
      {
        channelId: "local-channel", // (required)
        channelName: "Local Notifications", 
        channelDescription: "A channel to categorise your notifications", 
        playSound: true, 
        soundName: "default", 
        importance: 4, 
        vibrate: true,  
      },
      (created) => console.log(`createChannel returned '${created}'`) 
    );
  }

  showLocalNotification(title, message) {
    PushNotification.localNotification({
      channelId: "local-channel",
      title: title || "Local Notification",
      message: message || "My Notification Message",
      playSound: true,
      soundName: "default",
    });
  }

  scheduleNotification(title, message, date, id) {
      PushNotification.localNotificationSchedule({
        channelId: "local-channel",
        title: title || "Scheduled Notification",
        message: message || "My Notification Message",
        date: date, 
        allowWhileIdle: true, 
        id: id ? String(id) : undefined,
        userInfo: { id: id ? String(id) : undefined }
      });
  }

  getScheduledNotifications(callback) {
    PushNotification.getScheduledLocalNotifications(callback);
  }
  
  cancelNotification(id) {
    PushNotification.cancelLocalNotification(String(id));
  }
  
  cancelAll() {
      PushNotification.cancelAllLocalNotifications();
  }
}

export default new NotificationService();

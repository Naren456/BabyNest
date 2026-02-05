import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.CHANNEL_ID = 'baby-nest-v2';
    // Async init moved to init() method
  }

  async init() {
    await this.createDefaultChannel();
    await this.configure();
  }

  async configure() {
    // Request permissions
    try {
      await notifee.requestPermission();
    } catch (e) {
      console.warn('[NotificationService] Failed to request permissions:', e);
    }
  }

  async createDefaultChannel() {
    await notifee.createChannel({
      id: this.CHANNEL_ID,
      name: 'BabyNest Notifications',
      description: "Reminders for your baby's journey",
      sound: 'default',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  }

  async showLocalNotification(title, message) {
    await notifee.displayNotification({
      title: title || "Local Notification",
      body: message || "My Notification Message",
      android: {
        channelId: this.CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  async scheduleAppointmentReminder(title, content, dateStr, timeStr, id) {
       const [year, month, day] = dateStr.split('-').map(Number);
       // Handle time effectively (e.g. "14:30")
       const [hours, minutes] = timeStr.split(':').map(Number);
       const date = new Date(year, month - 1, day, hours, minutes, 0);
       
       const REMINDER_OFFSET_MINUTES = 5;
       const reminderDate = new Date(date.getTime() - REMINDER_OFFSET_MINUTES * 60000); 
       
       const now = new Date();
       let scheduleDate = reminderDate;
       let message = `in ${REMINDER_OFFSET_MINUTES} minutes`;

       if (reminderDate <= now) {
           // If we are already within the reminder window (or past it), warn immediately
           scheduleDate = new Date(Date.now() + 1000); // 1 second delay
           const diffMins = Math.ceil((date - now) / 60000);
           if (diffMins > 0) {
              message = `in ${diffMins} minutes`;
           } else {
              message = "now";
           }
       }

       await this.scheduleNotification(
           `Upcoming Appointment: ${title}`,
           `Your appointment is ${message}! ${content || ""}`,
           scheduleDate,
           id
       );
  }

  async scheduleNotification(title, message, date, id) {
    console.log('[NotificationService] Scheduling:', {title, date, dateISO: date.toISOString(), id});
    
    // Ensure date is in the future for the trigger
    const now = Date.now();
    let triggerTimestamp = date.getTime();
    
    if (triggerTimestamp <= now) {
         console.warn('[NotificationService] Scheduled time is in the past. Adjusting to now + 500ms.');
         triggerTimestamp = now + 500;
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTimestamp, 
    };

    try {
      await notifee.createTriggerNotification(
        {
          id: id ? String(id) : undefined,
          title: title || "Scheduled Notification",
          body: message || "My Notification Message",
          android: {
            channelId: this.CHANNEL_ID,
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );
    } catch (e) {
      console.error('[NotificationService] Error scheduling notification:', e);
    }
  }

  async getScheduledNotifications(callback) {
    const notifications = await notifee.getTriggerNotifications();
    console.log('[NotificationService] Retrieved scheduled:', notifications);
    if (callback) {
      callback(notifications);
    }
    return notifications;
  }
  
  async cancelNotification(id) {
    await notifee.cancelNotification(String(id));
  }
  
  async cancelAll() {
      await notifee.cancelAllNotifications();
  }
}

export default new NotificationService();

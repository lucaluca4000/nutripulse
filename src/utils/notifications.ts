export interface ReminderItem {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'water' | 'daily_summary';
  label: string;
  time: string; // HH:MM
  enabled: boolean;
  message: string;
}

export interface NotificationSettings {
  enabled: boolean;
  promptAnswered: boolean;
  permissionStatus: 'granted' | 'denied' | 'default' | 'unsupported';
  reminders: ReminderItem[];
  lastTriggered: Record<string, string>; // { reminderId: '2026-07-31' }
  soundEnabled: boolean;
}

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'breakfast',
    type: 'breakfast',
    label: 'Petit-déjeuner',
    time: '08:00',
    enabled: true,
    message: '🌅 C\'est l\'heure du petit-déjeuner ! Pensez à enregistrer vos calories sur NutriPulse.AI',
  },
  {
    id: 'lunch',
    type: 'lunch',
    label: 'Déjeuner',
    time: '12:30',
    enabled: true,
    message: '☀️ Bon appétit ! Scannez ou notez votre repas de midi.',
  },
  {
    id: 'snack',
    type: 'snack',
    label: 'Collation / Goûter',
    time: '16:30',
    enabled: true,
    message: '🍎 Pause collation ! N\'oubliez pas de garder un œil sur vos protéines.',
  },
  {
    id: 'dinner',
    type: 'dinner',
    label: 'Dîner',
    time: '19:30',
    enabled: true,
    message: '🌙 C\'est l\'heure du dîner ! Complétez vos journaux pour aujourd\'hui.',
  },
  {
    id: 'water_morning',
    type: 'water',
    label: 'Hydratation (Matin)',
    time: '10:30',
    enabled: true,
    message: '💧 Pause hydratation ! N\'oubliez pas de boire un verre d\'eau.',
  },
  {
    id: 'water_afternoon',
    type: 'water',
    label: 'Hydratation (Après-midi)',
    time: '15:00',
    enabled: true,
    message: '💧 Restez hydraté ! Validez vos verres d\'eau du jour.',
  },
  {
    id: 'daily_summary',
    type: 'daily_summary',
    label: 'Bilan de la journée',
    time: '21:00',
    enabled: true,
    message: '📊 Bilan NutriPulse : Vérifiez si vous avez atteint vos objectifs de macros !',
  },
];

const STORAGE_KEY = 'nutripulse_notification_settings';

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure browser permission status is synced
      const currentPermission = isNotificationSupported() ? Notification.permission : 'unsupported';
      return {
        ...parsed,
        permissionStatus: currentPermission,
      };
    }
  } catch (e) {
    console.error('Error loading notification settings:', e);
  }

  const currentPermission = isNotificationSupported() ? Notification.permission : 'unsupported';
  return {
    enabled: false,
    promptAnswered: false,
    permissionStatus: currentPermission,
    reminders: DEFAULT_REMINDERS,
    lastTriggered: {},
    soundEnabled: true,
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving notification settings:', e);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    const settings = getNotificationSettings();
    settings.permissionStatus = permission;
    settings.promptAnswered = true;
    if (permission === 'granted') {
      settings.enabled = true;
    }
    saveNotificationSettings(settings);
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export async function triggerLiveNotification(
  title: string,
  body: string,
  icon = '/icon-192.png'
): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    // Play subtle audio if enabled
    playNotificationSound();

    // Prefer Service Worker notification if available
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          tag: 'nutripulse-reminder-' + Date.now(),
          vibrate: [200, 100, 200],
        } as NotificationOptions);
        return true;
      }
    }

    // Fallback to standard Notification API
    new Notification(title, {
      body,
      icon,
      vibrate: [200, 100, 200],
    } as NotificationOptions);
    return true;
  } catch (e) {
    console.error('Failed to dispatch notification:', e);
    return false;
  }
}

export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function checkAndTriggerReminders(): { triggered: ReminderItem[]; inAppMessage?: string } {
  const settings = getNotificationSettings();
  if (!settings.enabled) return { triggered: [] };

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;
  const todayStr = now.toISOString().split('T')[0];

  const triggered: ReminderItem[] = [];
  let lastMessage: string | undefined = undefined;

  let settingsChanged = false;

  for (const reminder of settings.reminders) {
    if (!reminder.enabled) continue;

    if (reminder.time === currentTimeStr) {
      const lastDate = settings.lastTriggered[reminder.id];
      if (lastDate !== todayStr) {
        // Trigger notification!
        triggerLiveNotification('NutriPulse.AI 🔔', reminder.message);
        settings.lastTriggered[reminder.id] = todayStr;
        triggered.push(reminder);
        lastMessage = reminder.message;
        settingsChanged = true;
      }
    }
  }

  if (settingsChanged) {
    saveNotificationSettings(settings);
  }

  return { triggered, inAppMessage: lastMessage };
}

import { File, Paths } from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { ExpirationReminderDetails, ReminderDetails, Session } from '../types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  void Notifications.setNotificationCategoryAsync('tafasili-reminder', [
    { identifier: 'SNOOZE', buttonTitle: 'Remind me tomorrow' },
    { identifier: 'DONE', buttonTitle: 'Mark completed' },
  ]);

  Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.actionIdentifier !== 'SNOOZE') return;
    const original = response.notification.request.content;
    void Notifications.scheduleNotificationAsync({
      content: {
        title: original.title ?? 'Tafasili reminder',
        body: original.body ?? '',
        data: original.data,
        categoryIdentifier: 'tafasili-reminder',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        channelId: 'tafasili-reminders',
      },
    });
  });
}

const notificationDate = (date: string, time = '09:00') => {
  const parsed = new Date(`${date}T${time || '09:00'}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const requestNotificationAccess = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tafasili-reminders', {
      name: 'Tafasili reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
};

const scheduleAt = async (title: string, body: string, date: Date) => {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { url: '/history' }, categoryIdentifier: 'tafasili-reminder' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: 'tafasili-reminders',
    },
  });
};

export const scheduleSessionNotifications = async (
  activity: string,
  reminder?: ReminderDetails,
  expirations: ExpirationReminderDetails[] = []
) => {
  const allowed = await requestNotificationAccess();
  if (!allowed) return false;
  if (reminder?.date) {
    const date = notificationDate(reminder.date, reminder.time);
    if (date) await scheduleAt(`Tafasili: ${activity}`, reminder.note || `Reminder for ${activity}`, date);
  }
  await Promise.all(expirations.map(async (expiration) => {
    const date = notificationDate(expiration.remindOn);
    if (date) await scheduleAt('Expiration reminder', `${expiration.label}: ${expiration.expirationDate}`, date);
  }));
  return true;
};

export const authenticateForAppLock = async () => {
  const available = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!available || !enrolled) return { success: false, unavailable: true };
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Tafasili',
    fallbackLabel: 'Use device passcode',
    biometricsSecurityLevel: 'strong',
  });
  return { success: result.success, unavailable: false };
};

export const setSecureAppLock = async (enabled: boolean) => {
  await SecureStore.setItemAsync('tafasili-app-lock', enabled ? 'enabled' : 'disabled');
};

export const getSecureAppLock = async () =>
  (await SecureStore.getItemAsync('tafasili-app-lock')) === 'enabled';

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const shareSessionsCsv = async (sessions: Session[]) => {
  const rows = [
    ['Activity', 'Date', 'Start', 'End', 'Duration', 'Details'],
    ...sessions.map((session) => [
      session.activity,
      session.date,
      session.start,
      session.end,
      session.duration,
      JSON.stringify(session.details ?? {}),
    ]),
  ];
  const file = new File(Paths.cache, `tafasili-history-${Date.now()}.csv`);
  file.create({ overwrite: true });
  file.write(rows.map((row) => row.map(csvCell).join(',')).join('\n'));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export Tafasili history' });
  }
};

const htmlCell = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const shareSessionsPdf = async (sessions: Session[]) => {
  const rows = sessions.map((session) => `
    <tr>
      <td>${htmlCell(session.activity)}</td>
      <td>${htmlCell(session.date)}</td>
      <td>${htmlCell(session.start)}</td>
      <td>${htmlCell(session.end)}</td>
      <td>${htmlCell(session.duration)}</td>
      <td><pre>${htmlCell(JSON.stringify(session.details ?? {}, null, 2))}</pre></td>
    </tr>
  `).join('');
  const html = `<!doctype html>
    <html><head><meta charset="utf-8"><style>
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #20242a; padding: 24px; }
      h1 { font-size: 24px; margin: 0 0 6px; }
      p { color: #667085; margin: 0 0 18px; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th, td { border: 1px solid #e7e9ee; padding: 7px; text-align: left; vertical-align: top; }
      th { background: #f6f7f9; }
      pre { margin: 0; white-space: pre-wrap; font: inherit; }
    </style></head><body>
      <h1>Tafasili History</h1>
      <p>${sessions.length} saved record${sessions.length === 1 ? '' : 's'}</p>
      <table><thead><tr><th>Activity</th><th>Date</th><th>Start</th><th>End</th><th>Duration</th><th>Details</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Export Tafasili history PDF' });
  }
};

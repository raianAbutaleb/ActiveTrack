import AsyncStorage from '@react-native-async-storage/async-storage';
import { TafasiliSettings } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

export const defaultTafasiliSettings: TafasiliSettings = {
  favoriteActivities: [],
  recentActivities: [],
  dateFormat: 'day-first',
  measurementSystem: 'metric',
  defaultReminderDays: 30,
  notificationsEnabled: true,
  appLockEnabled: false,
  onboardingComplete: false,
};

const settingsKey = (userId: string | null) => `tafasili-settings:${userId ?? 'local'}`;

const normalizeSettings = (value?: Partial<TafasiliSettings> | null): TafasiliSettings => ({
  ...defaultTafasiliSettings,
  ...(value ?? {}),
  favoriteActivities: Array.isArray(value?.favoriteActivities) ? value.favoriteActivities : [],
  recentActivities: Array.isArray(value?.recentActivities) ? value.recentActivities.slice(0, 6) : [],
});

export const loadLocalSettings = async (userId: string | null) => {
  const saved = await AsyncStorage.getItem(settingsKey(userId));
  return normalizeSettings(saved ? JSON.parse(saved) : null);
};

export const saveLocalSettings = async (userId: string | null, settings: TafasiliSettings) => {
  await AsyncStorage.setItem(settingsKey(userId), JSON.stringify(settings));
};

export const loadCloudSettings = async (): Promise<TafasiliSettings | null> => {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeSettings(data.preferences as Partial<TafasiliSettings>) : null;
};

export const saveCloudSettings = async (settings: TafasiliSettings) => {
  if (!isSupabaseConfigured || !supabase) return;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error('Sign in to sync settings.');
  const { error } = await supabase.from('user_preferences').upsert({
    user_id: userData.user.id,
    preferences: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

export const mergeSettings = (local: TafasiliSettings, cloud: TafasiliSettings | null) =>
  normalizeSettings({
    ...local,
    ...(cloud ?? {}),
    favoriteActivities: [...new Set([...(cloud?.favoriteActivities ?? []), ...local.favoriteActivities])],
    recentActivities: [...new Set([...(local.recentActivities ?? []), ...(cloud?.recentActivities ?? [])])].slice(0, 6),
  });

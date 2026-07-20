import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserDevice } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

const deviceIdKey = 'tafasili-device-id';

const getDeviceId = async () => {
  const existing = await AsyncStorage.getItem(deviceIdKey);
  if (existing) return existing;
  const created = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(deviceIdKey, created);
  return created;
};

export const registerAndLoadDevices = async (): Promise<UserDevice[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  const deviceId = await getDeviceId();
  const platform = Platform.OS;
  const label = Platform.OS === 'ios' ? 'Apple device' : Platform.OS === 'android' ? 'Android device' : 'Web device';
  const { error: upsertError } = await supabase.from('user_devices').upsert({
    user_id: userData.user.id,
    device_id: deviceId,
    label,
    platform,
    last_seen: new Date().toISOString(),
  });
  if (upsertError) throw upsertError;
  const { data, error } = await supabase.from('user_devices').select('*').order('last_seen', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((device) => ({
    deviceId: device.device_id,
    label: device.label,
    platform: device.platform,
    lastSeen: device.last_seen,
    current: device.device_id === deviceId,
  }));
};

export const removeOtherDeviceRecords = async () => {
  if (!isSupabaseConfigured || !supabase) return;
  const deviceId = await getDeviceId();
  const { error } = await supabase.from('user_devices').delete().neq('device_id', deviceId);
  if (error) throw error;
};

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const server = Platform.OS === 'web' && typeof window === 'undefined';
const storage = server ? { getItem: async()=>null, setItem: async()=>{}, removeItem: async()=>{} } : Platform.OS === 'web' ? AsyncStorage : { getItem: k => SecureStore.getItemAsync(k), setItem: (k,v) => SecureStore.setItemAsync(k,v), removeItem: k => SecureStore.deleteItemAsync(k) };
export const supabase = url && key ? createClient(url,key,{ auth: { storage, persistSession: !server, autoRefreshToken: !server, detectSessionInUrl: false, flowType: 'pkce' } }) : null;
export function unwrap(result) { if (result.error) throw result.error; return result.data; }

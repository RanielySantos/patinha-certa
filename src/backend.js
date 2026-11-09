import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAuthCallbackHandler} from './auth.mjs';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const server = Platform.OS === 'web' && typeof window === 'undefined';
const storage = server ? { getItem: async()=>null, setItem: async()=>{}, removeItem: async()=>{} } : Platform.OS === 'web' ? AsyncStorage : { getItem: k => SecureStore.getItemAsync(k), setItem: (k,v) => SecureStore.setItemAsync(k,v), removeItem: k => SecureStore.deleteItemAsync(k) };
async function fetchWithTimeout(input,options={}){
  const controller=new AbortController();const abort=()=>controller.abort();
  if(options.signal?.aborted)controller.abort();else options.signal?.addEventListener('abort',abort);
  const timer=setTimeout(abort,20000);
  try{return await fetch(input,{...options,signal:controller.signal});}finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
}
export const supabase = url && key ? createClient(url,key,{ global:{fetch:fetchWithTimeout}, auth: { storage, persistSession: !server, autoRefreshToken: !server, detectSessionInUrl: false, flowType: 'pkce' } }) : null;
export const completeAuthCallback=supabase?createAuthCallbackHandler(supabase):null;
export async function googleProviderEnabled(){
  if(!supabase)return false;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key},signal:controller.signal});if(!response.ok)throw new Error('Não foi possível verificar o acesso com Google. Tente novamente.');const settings=await response.json();return settings.external?.google===true;}finally{clearTimeout(timer);}
}
export function unwrap(result) { if (result.error) throw result.error; return result.data; }

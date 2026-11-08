import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase, unwrap } from './backend';
import { animals as demoAnimals } from './data.mjs';
import { canTransition, activeStatuses } from './domain.mjs';
const Context = createContext();
const demoKey = 'patinha-demo-v1';
export const useApp = () => useContext(Context);
export function AppProvider({ children }) {
  const [animals,setAnimals] = useState(supabase ? [] : demoAnimals);
  const [user,setUser] = useState(null), [profile,setProfile] = useState(null);
  const [favorites,setFavorites] = useState([]), [requests,setRequests] = useState([]), [notifications,setNotifications] = useState([]);
  const [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [demoReady,setDemoReady] = useState(false);
  const mounted = useRef(true);
  async function refresh() {
    if (!supabase) return;
    try {
      setError('');
      const data = unwrap(await supabase.from('animals').select('*, species:species(name), breed:breeds(name), animal_photos(url,position)').order('created_at'));
      if (!mounted.current) return;
      setAnimals(data.map(a => ({ ...a, species:a.species.name, breed:a.breed?.name || 'Sem raça definida', photos:a.animal_photos.sort((a,b)=>a.position-b.position).map(p=>p.url) })));
      if (user) {
        const results = await Promise.all([
          supabase.from('profiles').select('*').eq('id',user.id).single(),
          supabase.from('favorites').select('animal_id').eq('user_id',user.id),
          supabase.from('adoption_requests').select('*, animal:animals(name,city)').order('created_at',{ascending:false}),
          supabase.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false})
        ]);
        const [p,f,r,n] = results.map(unwrap);
        setProfile(p); setFavorites(f.map(x=>x.animal_id)); setRequests(r); setNotifications(n);
      }
    } catch (e) { setError('Não foi possível atualizar os dados. '+e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{
    mounted.current = true;
    if (!supabase) {
      AsyncStorage.getItem(demoKey).then(raw=>{ if(raw) { const d=JSON.parse(raw); setFavorites(d.favorites||[]); setRequests(d.requests||[]); setNotifications(d.notifications||[]); } }).catch(()=>setError('Não foi possível restaurar a demonstração.')).finally(()=>{setDemoReady(true);setLoading(false);});
      return;
    }
    supabase.auth.getSession().then(({data,error})=>{if(error)setError(error.message);setUser(data.session?.user||null);}).catch(e=>setError(e.message));
    const { data:{subscription} } = supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user||null);if(!session){setProfile(null);setFavorites([]);setRequests([]);setNotifications([]);}});
    const appSub = AppState.addEventListener('change', state=>state==='active'?supabase.auth.startAutoRefresh():supabase.auth.stopAutoRefresh());
    return ()=>{mounted.current=false;subscription.unsubscribe();appSub.remove();};
  },[]);
  useEffect(()=>{
    if(!supabase)return;
    refresh();
    const channel=supabase.channel('app-updates').on('postgres_changes',{event:'*',schema:'public',table:'animals'},refresh);
    if(user) {
      channel.on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${user.id}`},refresh)
        .on('postgres_changes',{event:'*',schema:'public',table:'adoption_requests'},refresh);
    }
    channel.subscribe();
    return ()=>{supabase.removeChannel(channel);};
  },[user?.id]);
  useEffect(()=>{ if(!supabase&&demoReady) AsyncStorage.setItem(demoKey,JSON.stringify({favorites,requests,notifications})).catch(()=>setError('Falha ao salvar a demonstração neste dispositivo.')); },[favorites,requests,notifications,demoReady]);
  function requireUser() { if(!user) throw new Error('Entre na sua conta para continuar.'); }
  async function favorite(id) {
    requireUser(); const exists=favorites.includes(id);
    if(supabase) unwrap(exists ? await supabase.from('favorites').delete().eq('animal_id',id).eq('user_id',user.id) : await supabase.from('favorites').insert({animal_id:id,user_id:user.id}));
    setFavorites(old=>exists?old.filter(x=>x!==id):[...old,id]);
  }
  async function request(animal,contact,reason) {
    requireUser(); if(contact.trim().length<5||reason.trim().length<15)throw new Error('Informe um contato válido e uma justificativa de pelo menos 15 caracteres.');
    if(supabase) { unwrap(await supabase.rpc('submit_adoption',{p_animal:animal.id,p_contact:contact.trim(),p_reason:reason.trim()})); await refresh(); }
    else {
      if(requests.some(r=>r.animal_id===animal.id&&activeStatuses.includes(r.status)))throw new Error('Você já tem um pedido ativo para este animal.');
      const id=String(Date.now());setRequests(old=>[{id,animal_id:animal.id,animal:{name:animal.name,city:animal.city},status:'pending',contact,reason,created_at:new Date().toISOString()},...old]);
      setNotifications(old=>[{id, message:`Pedido por ${animal.name} recebido na demonstração.`,read:false,created_at:new Date().toISOString()},...old]);
    }
  }
  async function transition(id,status) {
    if(supabase){unwrap(await supabase.rpc('transition_adoption',{p_request:id,p_status:status}));await refresh();}
    else { const r=requests.find(r=>r.id===id); if(!r||!canTransition(r.status,status,false))throw new Error('Alteração não permitida.'); setRequests(old=>old.map(r=>r.id===id?{...r,status}:r)); }
  }
  async function markRead(id) { if(supabase)unwrap(await supabase.from('notifications').update({read:true}).eq('id',id));setNotifications(old=>old.map(n=>n.id===id?{...n,read:true}:n)); }
  async function saveProfile(values) {
    requireUser();if(!values.name.trim())throw new Error('Informe seu nome.');
    if(supabase)unwrap(await supabase.from('profiles').update(values).eq('id',user.id));setProfile(old=>({...old,...values}));
  }
  async function signOut() { if(supabase)unwrap(await supabase.auth.signOut());setUser(null);setProfile(null); }
  function enterDemo() {setUser({id:'demo',email:'visitante@example.invalid'});setProfile({name:'Visitante',role:'adopter',city:'Aracaju',contact:''});}
  const callback = () => Platform.OS==='web' ? `${window.location.origin}${process.env.EXPO_BASE_URL||''}/auth/callback` : Linking.createURL('auth/callback');
  async function signIn(email,password,signup,name) {
    if(!supabase)throw new Error('Use “Experimentar demonstração”. O login real depende da conexão ao Supabase.');
    if(signup) {const d=unwrap(await supabase.auth.signUp({email,password,options:{data:{name},emailRedirectTo:callback()}}));return d.session?'Conta criada.':'Confira seu email para confirmar a conta.';}
    unwrap(await supabase.auth.signInWithPassword({email,password}));return 'Você entrou!';
  }
  async function google() {
    if(!supabase)throw new Error('O login Google precisa do backend e do provedor OAuth configurados.');
    const redirectTo=callback();const data=unwrap(await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo,skipBrowserRedirect:Platform.OS!=='web'}}));
    if(Platform.OS!=='web') {const r=await WebBrowser.openAuthSessionAsync(data.url,redirectTo);if(r.type==='success'){const code=new URL(r.url).searchParams.get('code');if(code)unwrap(await supabase.auth.exchangeCodeForSession(code));}}
  }
  async function reset(email) {if(!supabase)throw new Error('Conecte o Supabase para recuperar senhas.');unwrap(await supabase.auth.resetPasswordForEmail(email,{redirectTo:callback()+'?recovery=1'}));}
  async function saveAnimal(values,photos,id) {
    if(profile?.role!=='admin'||!supabase)throw new Error('Acesso administrativo necessário.');
    const species=unwrap(await supabase.from('species').select('id').eq('name',values.species).single());
    const breed=unwrap(await supabase.from('breeds').select('id').eq('name',values.breed).eq('species_id',species.id).maybeSingle());
    if(!breed)throw new Error('Selecione uma raça cadastrada para a espécie.');
    const payload={...values,species_id:species.id,breed_id:breed.id};delete payload.species;delete payload.breed;
    unwrap(await supabase.rpc('save_animal',{p_id:id||null,p_data:payload,p_photos:photos}));await refresh();
  }
  return <Context.Provider value={{animals,user,profile,favorites,requests,notifications,loading,error,demo:!supabase,refresh,favorite,request,transition,markRead,saveProfile,signOut,enterDemo,signIn,google,reset,saveAnimal}}>{children}</Context.Provider>;
}

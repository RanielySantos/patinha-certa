import React,{useEffect,useState} from 'react';
import { View,Text,TextInput,Pressable,StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {supabase,unwrap} from './backend';
export default function Callback(){
  const router=useRouter(),url=Linking.useURL();const [message,setMessage]=useState('Confirmando seu acesso…'),[recovery,setRecovery]=useState(false),[password,setPassword]=useState('');
  useEffect(()=>{if(!url||!supabase)return;let alive=true;(async()=>{try{const parsed=new URL(url);const code=parsed.searchParams.get('code');const isRecovery=parsed.searchParams.get('recovery')==='1';if(code)unwrap(await supabase.auth.exchangeCodeForSession(code));if(alive){if(isRecovery){setRecovery(true);setMessage('Escolha sua nova senha.');}else router.replace('/');}}catch(e){if(alive)setMessage('Não foi possível confirmar o acesso: '+e.message);}})();return()=>{alive=false;};},[url]);
  return <View style={s.page}><Text style={s.title}>Patinha Certa</Text><Text>{message}</Text>{recovery&&<><TextInput accessibilityLabel="Nova senha" placeholder="Nova senha (mínimo 8 caracteres)" secureTextEntry value={password} onChangeText={setPassword} style={s.input}/><Pressable style={s.button} onPress={async()=>{try{if(password.length<8)throw new Error('Use pelo menos 8 caracteres.');unwrap(await supabase.auth.updateUser({password}));router.replace('/');}catch(e){setMessage(e.message);}}}><Text style={{color:'white'}}>Salvar nova senha</Text></Pressable></>}<Pressable onPress={()=>router.replace('/')}><Text>Voltar ao aplicativo</Text></Pressable></View>;
}
const s=StyleSheet.create({page:{flex:1,justifyContent:'center',padding:32,gap:22,backgroundColor:'#F8F7F2'},title:{fontSize:28,fontWeight:'800',color:'#174F43'},input:{padding:16,borderWidth:1,borderColor:'#CCD7D0',borderRadius:12},button:{backgroundColor:'#174F43',padding:16,borderRadius:12}});

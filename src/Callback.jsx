import React,{useEffect,useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Platform} from 'react-native';
import {useRouter} from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {supabase,unwrap,completeAuthCallback} from './backend';
import {authErrorMessage} from './auth.mjs';
import {Processing} from './LoadingState';
import {useApp} from './store';
WebBrowser.maybeCompleteAuthSession();
export default function Callback(){
  const router=useRouter(),url=Linking.useURL(),{notifyAuth}=useApp();
  const [phase,setPhase]=useState('loading'),[message,setMessage]=useState('Confirmando seu acesso…'),[password,setPassword]=useState(''),[saving,setSaving]=useState(false);
  useEffect(()=>{
    const callbackUrl=url||(Platform.OS==='web'&&typeof window!=='undefined'?window.location.href:null);
    if(!callbackUrl)return;
    let alive=true;
    (async()=>{try{
      if(!completeAuthCallback)throw new Error('O serviço de autenticação não está configurado.');
      const result=await completeAuthCallback(callbackUrl);
      if(!alive)return;
      if(Platform.OS==='web'&&typeof window!=='undefined')window.history.replaceState({},'',window.location.pathname);
      if(result.recovery){setPhase('recovery');setMessage('Email confirmado. Escolha sua nova senha.');}
      else {notifyAuth('Email confirmado! Seu acesso foi concluído.');router.replace('/');}
    }catch(error){if(alive){setPhase('error');setMessage(authErrorMessage(error));}}})();
    return()=>{alive=false;};
  },[url]);
  return <View style={s.page}><View style={s.card}><Text style={s.title}>Patinha Certa</Text>{phase==='loading'?<Processing label={message}/>:<Text accessibilityRole={phase==='error'?'alert':'text'} accessibilityLiveRegion="polite" style={s.message}>{message}</Text>}{phase==='recovery'&&<><Text style={s.label}>Nova senha</Text><TextInput accessibilityLabel="Nova senha" placeholder="Pelo menos 8 caracteres" secureTextEntry value={password} editable={!saving} onChangeText={setPassword} style={s.input}/>{saving&&<Processing label="Salvando sua nova senha…"/>}<Pressable accessibilityRole="button" disabled={saving} style={s.button} onPress={async()=>{setSaving(true);try{if(password.length<8)throw new Error('Use pelo menos 8 caracteres.');unwrap(await supabase.auth.updateUser({password}));setPassword('');notifyAuth('Senha atualizada com sucesso.');router.replace('/');}catch(error){setMessage(authErrorMessage(error));}finally{setSaving(false);}}}><Text style={s.buttonText}>Salvar nova senha</Text></Pressable></>}<Pressable accessibilityRole="button" disabled={saving} onPress={()=>router.replace('/')}><Text style={s.link}>{phase==='error'?'Voltar para entrar ou solicitar novo email':'Voltar ao aplicativo'}</Text></Pressable></View></View>;
}
const s=StyleSheet.create({page:{flex:1,justifyContent:'center',alignItems:'center',padding:24,backgroundColor:'#F8F7F2'},card:{width:'100%',maxWidth:480,padding:26,gap:22,borderRadius:20,backgroundColor:'white'},title:{fontSize:28,fontWeight:'800',color:'#174F43'},message:{fontSize:14,color:'#223A33',lineHeight:23},label:{fontWeight:'700',color:'#223A33'},input:{padding:16,borderWidth:1,borderColor:'#CCD7D0',borderRadius:12},button:{backgroundColor:'#174F43',padding:16,borderRadius:12,alignItems:'center'},buttonText:{color:'white',fontWeight:'700'},link:{color:'#20594B',lineHeight:22,fontWeight:'600'}});

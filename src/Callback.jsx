import React,{useEffect,useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Platform} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {supabase,unwrap,completeAuthCallback} from './backend';
import {authErrorMessage,parseAuthCallback} from './auth.mjs';
import {Processing} from './LoadingState';
import {useApp} from './store';
WebBrowser.maybeCompleteAuthSession();
const keys=['code','token_hash','type','access_token','refresh_token','recovery','error','error_code','error_description'];
function payloadUrl(value){
 if(!value)return null;
 try{const parsed=parseAuthCallback(value);return parsed.code||parsed.tokenHash||parsed.accessToken||parsed.recovery?value:null;}catch{return value;}
}
export default function Callback(){
  const router=useRouter(),url=Linking.useURL(),params=useLocalSearchParams(),{notifyAuth,user}=useApp();
  const query=keys.filter(key=>params[key]!=null).map(key=>[key,Array.isArray(params[key])?params[key][0]:params[key]]);
  const paramsKey=new URLSearchParams(query).toString();
  const [phase,setPhase]=useState('loading'),[message,setMessage]=useState('Confirmando seu acesso…'),[password,setPassword]=useState(''),[saving,setSaving]=useState(false),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let alive=true;
    setPhase('loading');setMessage('Confirmando seu acesso…');
    const timer=setTimeout(()=>{if(alive){setPhase('error');setMessage('A confirmação está demorando mais que o esperado. Confira sua conexão e toque em Tentar concluir novamente.');}},15000);
    (async()=>{try{
      if(!supabase||!completeAuthCallback)throw new Error('O serviço de autenticação não está configurado.');
      const initial=url||paramsKey||user?null:await Linking.getInitialURL().catch(()=>null);
      const windowUrl=Platform.OS==='web'&&typeof window!=='undefined'?window.location.href:null;
      const routeUrl=paramsKey?`patinhacerta://auth/callback?${paramsKey}`:null;
      const callbackUrl=payloadUrl(url)||payloadUrl(windowUrl)||payloadUrl(routeUrl)||payloadUrl(initial);
      let result;
      if(callbackUrl){
        const payload=parseAuthCallback(callbackUrl);
        if(payload.code||payload.tokenHash||payload.accessToken)result=await completeAuthCallback(callbackUrl);
        else {const data=unwrap(await supabase.auth.getSession());result={session:data.session,recovery:payload.recovery};}
      }else{
        // O navegador OAuth pode concluir a sessão antes de o Router montar esta tela.
        // Nesse caso não há mais URL a consumir: a sessão confirmada é a fonte da verdade.
        const data=unwrap(await supabase.auth.getSession());result={session:data.session,recovery:false};
      }
      if(!result.session)throw new Error('Não recebemos uma confirmação de acesso. Volte para entrar ou solicite um novo email.');
      if(!alive)return;
      clearTimeout(timer);
      if(Platform.OS==='web'&&typeof window!=='undefined')window.history.replaceState({},'',window.location.pathname);
      if(result.recovery){setPhase('recovery');setMessage('Email confirmado. Escolha sua nova senha.');}
      else {notifyAuth('Acesso confirmado! Você já está conectado.');router.replace('/');}
    }catch(error){if(alive){clearTimeout(timer);setPhase('error');setMessage(authErrorMessage(error));}}})();
    return()=>{alive=false;clearTimeout(timer);};
  },[url,paramsKey,user?.id,attempt]);
  return <View style={s.page}><View style={s.card}><Text style={s.title}>Patinha Certa</Text>{phase==='loading'?<Processing label={message}/>:<Text accessibilityRole={phase==='error'?'alert':'text'} accessibilityLiveRegion="polite" style={s.message}>{message}</Text>}{phase==='error'&&<Pressable accessibilityRole="button" style={s.button} onPress={()=>setAttempt(value=>value+1)}><Text style={s.buttonText}>Tentar concluir novamente</Text></Pressable>}{phase==='recovery'&&<><Text style={s.label}>Nova senha</Text><TextInput accessibilityLabel="Nova senha" placeholder="Pelo menos 8 caracteres" secureTextEntry value={password} editable={!saving} onChangeText={setPassword} style={s.input}/>{saving&&<Processing label="Salvando sua nova senha…"/>}<Pressable accessibilityRole="button" disabled={saving} style={s.button} onPress={async()=>{setSaving(true);try{if(password.length<8)throw new Error('Use pelo menos 8 caracteres.');unwrap(await supabase.auth.updateUser({password}));setPassword('');notifyAuth('Senha atualizada com sucesso.');router.replace('/');}catch(error){setMessage(authErrorMessage(error));}finally{setSaving(false);}}}><Text style={s.buttonText}>Salvar nova senha</Text></Pressable></>}<Pressable accessibilityRole="button" disabled={saving} onPress={()=>router.replace('/')}><Text style={s.link}>{phase==='error'?'Voltar para entrar ou solicitar novo email':'Voltar ao aplicativo'}</Text></Pressable></View></View>;
}
const s=StyleSheet.create({page:{flex:1,justifyContent:'center',alignItems:'center',padding:24,backgroundColor:'#F8F7F2'},card:{width:'100%',maxWidth:480,padding:26,gap:22,borderRadius:20,backgroundColor:'white'},title:{fontSize:28,fontWeight:'800',color:'#174F43'},message:{fontSize:14,color:'#223A33',lineHeight:23},label:{fontWeight:'700',color:'#223A33'},input:{padding:16,borderWidth:1,borderColor:'#CCD7D0',borderRadius:12},button:{backgroundColor:'#174F43',padding:16,borderRadius:12,alignItems:'center'},buttonText:{color:'white',fontWeight:'700'},link:{color:'#20594B',lineHeight:22,fontWeight:'600'}});

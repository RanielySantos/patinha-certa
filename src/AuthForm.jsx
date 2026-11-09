import React,{useEffect,useRef,useState} from 'react';
import {AppState,Pressable,StyleSheet,Text,TextInput,View,ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useApp} from './store';
import {authErrorMessage,validateCredentials} from './auth.mjs';
import {Processing} from './LoadingState';
const pendingKey='patinha-pending-email-v1';
function Field({label,value,onChangeText,password=false,disabled=false,...props}){return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} placeholderTextColor="#86938B" value={value} onChangeText={onChangeText} secureTextEntry={password} editable={!disabled} autoCapitalize="none" {...props}/></View>;}
function Button({children,onPress,disabled,busy,secondary=false}){return <Pressable accessibilityRole="button" accessibilityState={{disabled:!!disabled,busy:!!busy}} disabled={disabled} onPress={onPress} style={[s.button,secondary&&s.secondary,disabled&&{opacity:.55}]}>{busy&&<ActivityIndicator color={secondary?'#20594B':'white'}/>}<Text style={[s.buttonText,secondary&&{color:'#20594B'}]}>{children}</Text></Pressable>;}
export default function AuthForm({onDone}){
 const app=useApp();
 const [mode,setMode]=useState('login'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState('');
 const [pending,setPending]=useState(false),[cooldown,setCooldown]=useState(0),[action,setAction]=useState(''),[notice,setNotice]=useState(null);
 const locked=useRef(false),mounted=useRef(true),finished=useRef(false),latest=useRef({});
 const busy=!!action;
 const labels={signup:'Criando sua conta…',login:'Entrando na sua conta…',verify:'Confirmando seu email…',resend:'Enviando novo email…',check:'Verificando a confirmação do email…',google:'Preparando acesso com Google…',reset:'Enviando recuperação de senha…'};
 function info(message){setNotice({type:'info',message});}
 function finish(message='Acesso concluído. Bem-vindo!'){
  if(finished.current)return;finished.current=true;setPassword('');AsyncStorage.removeItem(pendingKey).catch(()=>{});onDone(message);
 }
 async function perform(kind,fn){
  if(locked.current)return;locked.current=true;setAction(kind);setNotice(null);
  try{await fn();}catch(error){if(mounted.current)setNotice({type:'error',message:authErrorMessage(error)});}
  finally{locked.current=false;if(mounted.current)setAction('');}
 }
 async function savePending(address,sentAt=Date.now()){
  if(mounted.current){setEmail(address);setPending(true);setCooldown(Math.max(0,60-Math.floor((Date.now()-sentAt)/1000)));}
  await AsyncStorage.setItem(pendingKey,JSON.stringify({email:address,sentAt})).catch(()=>{});
 }
 async function checkConfirmation(silent=false){
  const current=latest.current;
  if(!current.password){info('Informe sua senha para concluir o acesso após confirmar o email.');return;}
  await perform('check',async()=>{
   try{await app.signIn(current.email,current.password,false);finish('Email confirmado! Sua conta está pronta.');}
   catch(error){if(error.code==='email_not_confirmed'||/email not confirmed/i.test(error.message)){info(silent?'Seu email ainda aguarda confirmação. Use o código ou abra o link recebido.':'Ainda não recebemos a confirmação. Confira sua caixa de entrada e a pasta de spam.');return;}throw error;}
  });
 }
 latest.current={email,password,pending,checkConfirmation};
 useEffect(()=>{
  mounted.current=true;
  AsyncStorage.getItem(pendingKey).then(raw=>{if(!raw||!mounted.current)return;const data=JSON.parse(raw);if(Date.now()-data.sentAt<24*60*60*1000){setEmail(data.email);setPending(true);setCooldown(Math.max(0,60-Math.floor((Date.now()-data.sentAt)/1000)));}}).catch(()=>{});
  const listener=AppState.addEventListener('change',state=>{const current=latest.current;if(state==='active'&&current.pending&&current.password&&!locked.current)current.checkConfirmation(true);});
  return()=>{mounted.current=false;listener.remove();};
 },[]);
 useEffect(()=>{if(app.user)finish(app.demo?'Você entrou na demonstração.':'Você entrou! Sua conta está pronta.');},[app.user?.id]);
 useEffect(()=>{if(cooldown<=0)return;const timer=setInterval(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearInterval(timer);},[cooldown>0]);
 async function submit(){
  await perform(mode==='signup'?'signup':'login',async()=>{
   validateCredentials(email,password,name,mode==='signup');
   const result=await app.signIn(email,password,mode==='signup',name);
   if(result.status==='confirmation_required'){await savePending(result.email);info('Enviamos um email de confirmação. Digite o código recebido ou abra o link da mensagem e volte ao aplicativo.');}
   else if(result.status==='existing_account'){setMode('login');info('Esse email já pode ter uma conta. Tente entrar ou recuperar sua senha.');}
   else finish(mode==='signup'?'Conta criada! Bem-vindo à Patinha Certa.':'Você entrou! Bem-vindo de volta.');
  });
 }
 const message=notice&&<View accessibilityRole={notice.type==='error'?'alert':'text'} accessibilityLiveRegion="polite" style={[s.notice,notice.type==='error'&&s.error]}><Ionicons name={notice.type==='error'?'alert-circle-outline':'information-circle-outline'} color={notice.type==='error'?'#9B3C30':'#20594B'} size={22}/><Text style={[s.noticeText,notice.type==='error'&&{color:'#9B3C30'}]}>{notice.message}</Text></View>;
 if(pending)return <View style={s.form}>
  <Text style={s.step}>ETAPA 2 DE 2 · CONFIRMAR EMAIL</Text>
  <View accessibilityRole="progressbar" accessibilityLabel="Etapa 2 de 2: confirmar email" accessibilityValue={{min:0,max:2,now:2}} style={s.steps}><View style={s.completed}/><View style={s.completed}/></View>
  <Ionicons name="mail-unread-outline" size={42} color="#20594B"/>
  <Text style={s.title}>Falta só confirmar seu email</Text><Text style={s.body}>Confira a mensagem enviada para <Text style={{fontWeight:'700'}}>{email}</Text>. Use o código da mensagem ou toque no link de confirmação.</Text>
  {message}
  <Field label="Código de confirmação" placeholder="Código recebido por email" value={code} onChangeText={value=>setCode(value.replace(/\D/g,''))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} disabled={busy}/>
  {busy&&<Processing label={labels[action]}/>}
  <Button disabled={busy||code.length<6} busy={action==='verify'} onPress={()=>perform('verify',async()=>{await app.verifyEmail(email,code);finish('Email confirmado! Sua conta está pronta.');})}>Confirmar email e entrar</Button>
  {!password&&<Field label="Sua senha" password value={password} onChangeText={setPassword} placeholder="Para entrar após confirmar pelo link" disabled={busy}/>}
  <Button secondary disabled={busy} busy={action==='check'} onPress={()=>checkConfirmation()}>Já confirmei pelo link</Button>
  <Button secondary disabled={busy||cooldown>0} busy={action==='resend'} onPress={()=>perform('resend',async()=>{await app.resendConfirmation(email);await savePending(email);info('Novo email enviado. Use o código ou link da mensagem mais recente.');})}>{cooldown>0?`Reenviar email em ${cooldown}s`:'Reenviar email de confirmação'}</Button>
  <Text style={s.help}>Se não encontrar a mensagem, verifique o spam. O código é temporário; após confirmar, você será conectado automaticamente.</Text>
  <Pressable accessibilityRole="button" disabled={busy} onPress={()=>{AsyncStorage.removeItem(pendingKey).catch(()=>{});setPending(false);setCode('');setMode('login');setNotice(null);}}><Text style={s.link}>Usar outro email ou voltar para entrar</Text></Pressable>
 </View>;
 return <View style={s.form}>
  <Text style={s.step}>{mode==='signup'?'ETAPA 1 DE 2 · CRIAR CONTA':mode==='recovery'?'RECUPERAR ACESSO':'SEU ENCONTRO COMEÇA AQUI'}</Text>
  <Text style={s.title}>{mode==='signup'?'Vamos criar sua conta?':mode==='recovery'?'Vamos recuperar seu acesso':'Bom ter você por aqui'}</Text>
  <Text style={s.body}>{mode==='signup'?'Preencha seus dados. Depois, confirme o email para começar.':mode==='recovery'?'Enviaremos as instruções para você escolher uma nova senha.':'Entre para guardar favoritos e acompanhar suas novas histórias.'}</Text>
  {mode==='signup'&&<Field label="Nome" autoCapitalize="words" autoComplete="name" value={name} onChangeText={setName} disabled={busy}/>}
  <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" disabled={busy}/>
  {mode!=='recovery'&&<Field label="Senha" password value={password} onChangeText={setPassword} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder={mode==='signup'?'Pelo menos 8 caracteres':undefined} disabled={busy}/>}
  {message}{busy&&<Processing label={labels[action]}/>}
  <Button disabled={busy} busy={['login','signup','reset'].includes(action)} onPress={mode==='recovery'?()=>perform('reset',async()=>{validateCredentials(email,'x','',false);await app.reset(email.trim().toLowerCase());info('Se houver uma conta para esse email, você receberá as instruções. Confira também a pasta de spam.');}):submit}>{mode==='signup'?'Criar minha conta':mode==='recovery'?'Enviar recuperação de senha':'Entrar'}</Button>
  {mode!=='recovery'&&<Button secondary disabled={busy} busy={action==='google'} onPress={()=>perform('google',async()=>{const result=await app.google();if(result?.status==='cancelled')info('Você cancelou o acesso com Google. Pode tentar novamente quando quiser.');else if(result?.status==='signed_in')finish('Você entrou com Google!');})}>Continuar com Google</Button>}
  <Pressable accessibilityRole="button" disabled={busy} onPress={()=>{setMode(mode==='login'?'signup':'login');setNotice(null);}}><Text style={s.link}>{mode==='login'?'Quero criar minha conta':'Já tenho uma conta'}</Text></Pressable>
  {mode!=='recovery'&&<Pressable accessibilityRole="button" disabled={busy} onPress={()=>{setMode('recovery');setNotice(null);}}><Text style={s.link}>Esqueci minha senha</Text></Pressable>}
  {app.demo&&<Button secondary disabled={busy} onPress={app.enterDemo}>Experimentar demonstração</Button>}
 </View>;
}
const s=StyleSheet.create({form:{gap:17},field:{gap:8},label:{color:'#223A33',fontSize:13,fontWeight:'700'},input:{borderWidth:1,borderColor:'#DCE4DC',borderRadius:12,padding:14,fontSize:15,color:'#223A33',backgroundColor:'#FAFBF8'},title:{fontSize:28,lineHeight:35,fontWeight:'800',color:'#223A33'},body:{color:'#687B70',fontSize:14,lineHeight:23},step:{fontSize:10,fontWeight:'800',letterSpacing:1.5,color:'#20594B'},steps:{flexDirection:'row',gap:8},completed:{flex:1,height:5,borderRadius:3,backgroundColor:'#20594B'},button:{backgroundColor:'#20594B',padding:15,borderRadius:12,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:10},secondary:{backgroundColor:'white',borderWidth:1,borderColor:'#CCD8CF'},buttonText:{color:'white',fontWeight:'700',fontSize:14},notice:{padding:15,borderRadius:12,backgroundColor:'#EAF1E9',flexDirection:'row',gap:10,alignItems:'flex-start'},error:{backgroundColor:'#FFF0EB'},noticeText:{color:'#20594B',fontSize:13,lineHeight:21,flex:1},help:{fontSize:12,lineHeight:20,color:'#78847C'},link:{color:'#20594B',fontSize:13,fontWeight:'600',paddingVertical:4}});

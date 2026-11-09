export function authErrorMessage(error) {
  const code=error?.code||error?.error_code||'';
  const message=String(error?.message||error||'');
  if(code==='email_not_confirmed'||/email not confirmed/i.test(message))return 'Confirme seu email antes de entrar. Abra a mensagem recebida ou solicite um novo código.';
  if(code==='invalid_credentials'||/invalid login credentials/i.test(message))return 'Email ou senha incorretos. Confira os dados ou recupere sua senha.';
  if(code==='provider_disabled'||/provider is not enabled|unsupported provider/i.test(message))return 'O acesso com Google ainda não foi ativado. Você pode entrar com email e senha enquanto a configuração é concluída.';
  if(/expired|otp_expired|invalid.*otp|token.*invalid|otp.*invalid/i.test(code+' '+message))return 'Esse link ou código expirou ou já foi utilizado. Solicite um novo e tente novamente.';
  if(/flow_state|code.verifier|pkce/i.test(code+' '+message))return 'Abra o link no mesmo dispositivo em que iniciou o acesso ou entre com seu email e senha após confirmar o email.';
  if(/rate.limit|too many|over_.*rate|after \d+ seconds/i.test(code+' '+message))return 'Muitas tentativas em pouco tempo. Aguarde um minuto antes de tentar novamente.';
  if(/email_address_not_authorized|email.*not.*authorized|sending.*email|smtp|unexpected_failure/i.test(code+' '+message))return 'Não foi possível enviar o email agora. Tente mais tarde; se persistir, o serviço de envio precisa ser verificado.';
  if(/network|fetch|timeout|abort|conexão/i.test(code+' '+message))return 'Não conseguimos conectar ao serviço. Confira sua internet e tente novamente.';
  if(/user_already_exists|already registered/i.test(code+' '+message))return 'Esse email já pode ter uma conta. Tente entrar ou recuperar sua senha.';
  return message||'Não foi possível concluir. Tente novamente.';
}

export function parseAuthCallback(input) {
  let url;
  try{url=new URL(input);}catch{throw new Error('O link de acesso é inválido. Solicite um novo email.');}
  const params=new URLSearchParams(url.search);
  for(const [key,value] of new URLSearchParams(url.hash.replace(/^#/,'')))if(!params.has(key))params.set(key,value);
  if(params.get('error')||params.get('error_code')) {
    const error=new Error(params.get('error_description')||'Não foi possível confirmar o acesso.');error.code=params.get('error_code')||params.get('error');throw error;
  }
  const type=params.get('type');
  return {code:params.get('code'),tokenHash:params.get('token_hash'),accessToken:params.get('access_token'),refreshToken:params.get('refresh_token'),type,recovery:type==='recovery'||params.get('recovery')==='1'};
}

// Uma chamada por link, inclusive quando o navegador OAuth e o Router recebem o mesmo retorno.
export function createAuthCallbackHandler(client) {
  const inFlight=new Map();
  return function handle(input){
    if(inFlight.has(input))return inFlight.get(input);
    const promise=(async()=>{
      const payload=parseAuthCallback(input);let result;
      if(payload.code)result=await client.auth.exchangeCodeForSession(payload.code);
      else if(payload.tokenHash) {
        if(!['signup','email','magiclink','recovery','invite','email_change'].includes(payload.type))throw new Error('Tipo de confirmação inválido. Solicite um novo email.');
        result=await client.auth.verifyOtp({token_hash:payload.tokenHash,type:payload.type});
      }else if(payload.accessToken&&payload.refreshToken)result=await client.auth.setSession({access_token:payload.accessToken,refresh_token:payload.refreshToken});
      else throw new Error('Este link não contém uma confirmação de acesso. Volte para entrar ou solicite um novo email.');
      if(result.error)throw result.error;
      if(!result.data?.session)throw new Error('O acesso ainda não foi concluído. Entre com seu email e senha.');
      return {session:result.data.session,recovery:payload.recovery};
    })();
    inFlight.set(input,promise);
    promise.catch(()=>inFlight.delete(input));
    // Não manter tokens de links antigos na memória indefinidamente.
    if(inFlight.size>10)inFlight.delete(inFlight.keys().next().value);
    return promise;
  };
}

export function validateCredentials(email,password,name,signup=false){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))throw new Error('Informe um email válido.');
  if(signup&&!name.trim())throw new Error('Informe seu nome.');
  if(password.length<(signup?8:1))throw new Error(signup?'Use uma senha com pelo menos 8 caracteres.':'Informe sua senha.');
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authErrorMessage,parseAuthCallback,createAuthCallbackHandler,validateCredentials} from '../src/auth.mjs';
test('retorno aceita PKCE, sessão no fragmento e recuperação, rejeitando erros de confirmação',()=>{
 assert.equal(parseAuthCallback('patinhacerta://auth/callback?code=abc').code,'abc');
 const payload=parseAuthCallback('patinhacerta://auth/callback#access_token=access&refresh_token=refresh&type=recovery');
 assert.equal(payload.accessToken,'access');assert.equal(payload.refreshToken,'refresh');assert.equal(payload.recovery,true);
 assert.throws(()=>parseAuthCallback('patinhacerta://auth/callback#error=access_denied&error_code=otp_expired&error_description=Expired'),/Expired/);
 assert.throws(()=>parseAuthCallback('invalid'),/inválido/);
});
test('callback consome uma única vez o mesmo código e exige uma sessão válida',async()=>{
 let calls=0;const client={auth:{exchangeCodeForSession:async code=>{calls++;assert.equal(code,'abc');return {data:{session:{user:{id:'u'}}},error:null};}}};
 const handler=createAuthCallbackHandler(client);
 const results=await Promise.all([handler('patinhacerta://auth/callback?code=abc'),handler('patinhacerta://auth/callback?code=abc')]);
 assert.equal(calls,1);assert.equal(results[0].session.user.id,'u');
 await assert.rejects(handler('patinhacerta://auth/callback'),/não contém/);
 const noSession=createAuthCallbackHandler({auth:{exchangeCodeForSession:async()=>({data:{session:null},error:null})}});
 await assert.rejects(noSession('patinhacerta://auth/callback?code=other'),/não foi concluído/);
});
test('token_hash e sessão legada estabelecem a sessão correta; erro não vira sucesso',async()=>{
 const calls=[];const client={auth:{verifyOtp:async value=>{calls.push(value);return {data:{session:{user:{id:'verified'}}}};},setSession:async value=>{calls.push(value);return {data:{session:{user:{id:'legacy'}}}};}}};
 const handler=createAuthCallbackHandler(client);
 assert.equal((await handler('https://example.org/auth/callback?token_hash=hash&type=signup')).session.user.id,'verified');
 assert.deepEqual(calls[0],{token_hash:'hash',type:'signup'});
 assert.equal((await handler('patinhacerta://auth/callback#access_token=a&refresh_token=r')).session.user.id,'legacy');
 await assert.rejects(handler('https://example.org/auth/callback?token_hash=hash&type=untrusted'),/Tipo de confirmação/);
 const denied=createAuthCallbackHandler({auth:{exchangeCodeForSession:async()=>({error:{message:'Expired',code:'otp_expired'}})}});
 await assert.rejects(denied('patinhacerta://auth/callback?code=expired'),error=>authErrorMessage(error).includes('expirou'));
});
test('mensagens de autenticação são acionáveis e credenciais são validadas antes do envio',()=>{
 assert.match(authErrorMessage({code:'email_not_confirmed'}),/Confirme seu email/);
 assert.match(authErrorMessage({code:'invalid_credentials'}),/Email ou senha incorretos/);
 assert.match(authErrorMessage({code:'provider_disabled'}),/Google ainda não foi ativado/);
 assert.match(authErrorMessage({message:'Failed to fetch'}),/internet/);
 assert.throws(()=>validateCredentials('invalido','12345678','Nome',true),/email válido/);
 assert.throws(()=>validateCredentials('a@example.org','123','Nome',true),/8 caracteres/);
 assert.throws(()=>validateCredentials('a@example.org','12345678','',true),/nome/);
 assert.doesNotThrow(()=>validateCredentials(' a@example.org ','12345678','Nome',true));
});

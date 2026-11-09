import {test,expect} from '@playwright/test';
import {animals} from '../../src/data.mjs';
const user={id:'10000000-0000-4000-8000-000000000099',email:'adotante@example.invalid',aud:'authenticated',role:'authenticated',user_metadata:{name:'Adotante'},identities:[{provider:'email'}]};
const base64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
function session(){return {access_token:`${base64({alg:'HS256',typ:'JWT'})}.${base64({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.test`,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user};}
async function mockBackend(page,{signup,token}={}){
 await page.route('**/rest/v1/**',async route=>{
  const table=new URL(route.request().url()).pathname.split('/').pop();
  const data=table==='animals'?animals.map(a=>({...a,species:{name:a.species},breed:{name:a.breed},animal_photos:a.photos.map((url,position)=>({url,position}))})):table==='profiles'?{id:user.id,name:'Adotante',role:'adopter',city:'Aracaju',contact:''}:[];
  await route.fulfill({json:data});
 });
 await page.route('**/auth/v1/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/settings'))return route.fulfill({json:{external:{google:false}}});
  if(url.pathname.endsWith('/signup'))return signup?signup(route):route.fulfill({json:user});
  if(url.pathname.endsWith('/verify')){
   const body=route.request().postDataJSON();
   return body.token==='12345678'?route.fulfill({json:session()}):route.fulfill({status:403,json:{code:'otp_expired',msg:'Token has expired or is invalid'}});
  }
  if(url.pathname.endsWith('/token'))return token?token(route):route.fulfill({status:400,json:{code:'invalid_credentials',msg:'Invalid login credentials'}});
  if(url.pathname.endsWith('/resend')||url.pathname.endsWith('/recover'))return route.fulfill({json:{}});
  if(url.pathname.endsWith('/user'))return route.fulfill({json:user});
  return route.fulfill({json:{}});
 });
}
async function openAuth(page){await page.goto('/');await page.getByLabel('Abrir perfil').click();await page.getByRole('button',{name:'Entrar ou criar conta'}).click();}
test('cadastro tem processamento, confirmação explícita, código inválido e sessão concluída',async({page})=>{
 let release;
 await mockBackend(page,{signup:async route=>{await new Promise(resolve=>release=resolve);await route.fulfill({json:user});}});
 await openAuth(page);await page.getByRole('button',{name:'Quero criar minha conta'}).click();
 await page.getByRole('textbox',{name:'Nome',exact:true}).fill('Adotante');await page.getByRole('textbox',{name:'Email',exact:true}).fill(user.email);await page.getByRole('textbox',{name:'Senha',exact:true}).fill('uma-senha-segura');
 await page.getByRole('button',{name:'Criar minha conta',exact:true}).click();
 await expect(page.getByRole('progressbar',{name:'Criando sua conta…'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Criar minha conta',exact:true})).toBeDisabled();
 release();
 await expect(page.getByText('Falta só confirmar seu email')).toBeVisible();
 await expect(page.getByRole('button',{name:/Reenviar email em/})).toBeDisabled();
 await page.getByRole('textbox',{name:'Código de confirmação'}).fill('00000000');await page.getByRole('button',{name:'Confirmar email e entrar'}).click();
 await expect(page.getByRole('alert')).toContainText('expirou ou já foi utilizado');
 await page.getByRole('textbox',{name:'Código de confirmação'}).fill('12345678');await page.getByRole('button',{name:'Confirmar email e entrar'}).click();
 await expect(page.getByRole('textbox',{name:'Código de confirmação'})).toHaveCount(0);
 await expect(page.getByText('Olá, Adotante!')).toBeVisible();
});
test('email confirmado pelo link permite entrar sem repetir cadastro',async({page})=>{
 await mockBackend(page,{token:route=>route.fulfill({json:session()})});await openAuth(page);await page.getByRole('button',{name:'Quero criar minha conta'}).click();
 await page.getByRole('textbox',{name:'Nome',exact:true}).fill('Adotante');await page.getByRole('textbox',{name:'Email',exact:true}).fill(user.email);await page.getByRole('textbox',{name:'Senha',exact:true}).fill('uma-senha-segura');await page.getByRole('button',{name:'Criar minha conta',exact:true}).click();
 await page.getByRole('button',{name:'Já confirmei pelo link'}).click();await expect(page.getByText('Olá, Adotante!')).toBeVisible();
});
test('erros de login e Google desabilitado aparecem dentro do formulário',async({page})=>{
 await mockBackend(page);await openAuth(page);await page.getByRole('textbox',{name:'Email',exact:true}).fill(user.email);await page.getByRole('textbox',{name:'Senha',exact:true}).fill('senha-incorreta');await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Email ou senha incorretos');
 await page.getByRole('button',{name:'Continuar com Google'}).click();await expect(page.getByRole('alert')).toContainText('Google ainda não foi ativado');expect(new URL(page.url()).pathname).toBe('/');
});
test('callback expirado não fecha como se o cadastro tivesse funcionado',async({page})=>{
 await mockBackend(page);await page.goto('/auth/callback#error=access_denied&error_code=otp_expired&error_description=Expired');await expect(page.getByRole('alert')).toContainText('expirou ou já foi utilizado');await expect(page.getByRole('button',{name:'Voltar para entrar ou solicitar novo email'})).toBeVisible();
});

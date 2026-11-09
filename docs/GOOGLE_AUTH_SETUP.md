# Configurar o acesso com Google

O botão utiliza OAuth pelo navegador e o Supabase Auth. A mensagem `Unsupported provider: provider is not enabled` significa que o provedor Google ainda não foi ativado no projeto Supabase.

## Criar ou localizar o cliente OAuth

1. Abra [Google Auth Platform](https://console.cloud.google.com/auth/overview) na sua própria conta Google. Se já houver um projeto do Patinha Certa, selecione-o; caso contrário, crie um projeto com esse nome. O login OAuth básico não exige ativar serviços pagos.
2. Configure a identificação do aplicativo como **Patinha Certa**, com seu email de suporte e contato. Em público-alvo, use **Externo** para permitir contas Google pessoais. Enquanto o aplicativo estiver em teste, adicione os emails que participarão da validação como usuários de teste.
3. Em **Clientes**, crie um cliente OAuth do tipo **Aplicativo da Web**. O fluxo usado pelo app Android passa pelo Supabase e também utiliza esse cliente Web.
4. Adicione a origem JavaScript autorizada `https://ranielysantos.github.io`, sem o caminho `/patinha-certa`.
5. Adicione esta URI de redirecionamento autorizada, exatamente:

```text
https://jcrafbthmwylzryujkyv.supabase.co/auth/v1/callback
```

6. Guarde o Client ID e o Client Secret. Não coloque o segredo no código-fonte, nas variáveis públicas do Expo ou em mensagens do chat.

## Ativar no Supabase

1. Abra [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/jcrafbthmwylzryujkyv/auth/providers).
2. Selecione Google e habilite o provedor.
3. Preencha Client ID e Client Secret diretamente no painel e salve.
4. Preserve a confirmação de email e as políticas de segurança existentes. Não é necessário desligar verificações para corrigir este erro.

O Supabase já possui os retornos do aplicativo web e de `patinhacerta://auth/callback` na lista de URLs permitidas. A URI configurada no Google deve ser o callback HTTPS do Supabase, não o esquema do aplicativo.

## Validar

- Teste uma conta Google autorizada no app e no navegador.
- Confirme que o retorno cria a sessão e mostra o perfil conectado.
- Cancele uma tentativa e confira que o app volta ao formulário com uma mensagem clara.
- Antes de abrir o acesso para todos, revise o público-alvo e publique a configuração OAuth no Google. A configuração de teste limita o acesso aos usuários cadastrados como teste.

Referência oficial: [Google com Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google).

# Patinha Certa

Aplicativo acadêmico de adoção responsável em JavaScript, React Native e Expo, compartilhado entre Android e web. Descoberta por cartões, favoritos, pedidos, notificações e administração com Supabase.

## Executar

Requer Node.js 22 LTS e npm.

```sh
npm ci
npm run web
# Android com dispositivo/emulador compatível:
npm run android
```

Sem variáveis de ambiente, abre uma demonstração local. Em Perfil → Experimentar demonstração, é possível favoritar e enviar pedidos; os dados ficam no armazenamento do dispositivo. Essa demonstração não oferece acesso administrativo nem autenticação real.

Os 18 anúncios são fictícios: seis de Aracaju, seis de Areia Branca e seis de Itabaiana, todos em Sergipe. Fotografias ilustrativas não representam disponibilidade real. Veja [fontes das imagens](docs/IMAGES.md).

## Backend Supabase

1. Crie um projeto **Free** na sua conta em https://supabase.com/dashboard. Guarde a senha do banco no seu gerenciador de senhas.
2. No SQL Editor, execute `supabase/migrations/202611080001_initial.sql` e depois `supabase/seed.sql`. Não reexecute a migração inicial em banco já provisionado.
3. Copie `.env.example` para `.env`. Preencha a URL do projeto e sua chave pública `anon`/publishable. Nunca use uma chave `service_role` ou secret no aplicativo.
4. Reinicie o Expo após mudar variáveis. A ausência de configuração ativa a demonstração; uma configuração inválida produz um erro de conexão, sem substituição silenciosa por dados demonstrativos.
5. Cadastre um usuário pelo aplicativo e confirme seu email. Para torná-lo administrador, execute no SQL Editor, substituindo o email:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'SEU_EMAIL');
```

Apenas o operador do banco promove administradores. Metadados de cadastro nunca concedem esse papel. Faça login novamente ou atualize o app para recarregar o perfil.

### Email, OAuth e recuperação

Em Authentication → URL Configuration, configure Site URL e as Redirect URLs:

- Desenvolvimento web: `http://localhost:8081/auth/callback`
- Web publicada: `https://SEU_USUARIO.github.io/patinha-certa/auth/callback`
- Android instalado: `patinhacerta://auth/callback`
- Recuperação: permita também o callback com `?recovery=1` quando a configuração exigir correspondência exata.

Em Authentication → Providers → Google, habilite o provedor e configure o Client ID/secret de um cliente OAuth Web criado no Google Cloud. O redirect autorizado no Google é o callback do próprio Supabase, exibido no painel (`https://SEU_PROJETO.supabase.co/auth/v1/callback`). O segredo fica apenas no Supabase. Use o navegador do sistema para OAuth nativo; teste no APK, pois o esquema de um app instalado difere do Expo Go.

Habilite a confirmação de email para uso real. O serviço padrão de email do Supabase possui restrições de destinatários e envio; configure SMTP próprio se necessário. O login Google e o envio de email precisam ser verificados no projeto efetivamente hospedado.

### Regras de adoção

Curtir salva um favorito. O pedido exige contato e justificativa e começa pendente. Administradores podem analisar, aprovar ou recusar; adotantes podem cancelar seus próprios pedidos ativos. A aprovação bloqueia o registro do animal, aprova um pedido, recusa os demais ativos e gera notificações na mesma transação. Um índice adicional impede duas aprovações para o mesmo animal. Arquivar um anúncio preserva o histórico e encerra os pedidos ativos com aviso.

O bucket público `animal-photos` é exclusivo para fotos de anúncios. Apenas administradores podem enviar arquivos (até 5 MB). Não envie documentos pessoais. As políticas de banco protegem perfis, favoritos, pedidos e notificações; o cliente não possui permissão de escrever diretamente estados de adoção ou papéis de usuário.

## Publicar no GitHub Pages

Crie o repositório público `patinha-certa` na sua conta. Envie os arquivos para a branch `main`. Em Settings → Pages selecione **GitHub Actions** como origem. O workflow `.github/workflows/pages.yml` testa, exporta e publica a aplicação.

Em Settings → Secrets and variables → Actions → Variables, defina `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. São configurações públicas do cliente; dados privados dependem das políticas RLS, não de esconder essa chave. Sem as variáveis, a publicação apresenta a demonstração local.

O workflow utiliza `/patinha-certa` como base. Se o repositório ou domínio mudar, ajuste `EXPO_BASE_URL`, callbacks OAuth e URL do site. As rotas estáticas incluem `/auth/callback.html`; o GitHub Pages resolve o endereço de callback sem extensão.

## APK Android

```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

Escolha o projeto da sua conta Expo. Cadastre as duas variáveis públicas do Supabase no ambiente usado pelo build antes de gerar um APK conectado ao backend. O perfil `preview` em `eas.json` gera APK instalável, sem publicação em lojas. O EAS pode gerar e gerenciar a assinatura Android; preserve o acesso à conta. A disponibilidade e fila de builds seguem o plano gratuito vigente. Sem configuração do Supabase, o APK funciona em modo demonstrativo.

## Verificação

```sh
npm test
npx expo install --check
npm run export:web
npx expo export --platform android --output-dir dist-android
# Testes de interface após exportar web:
npm run test:ui
```

Os testes SQL usam PostgreSQL embarcado (PGlite), com schemas mínimos para simular Auth e Storage. Validam migração, permissões, isolamento entre usuários, pedidos duplicados, estados e uma corrida simulada de aprovações. Não substituem testes de duas conexões independentes no Supabase hospedado. Para a validação operacional, siga [o roteiro](docs/VALIDATION.md).

## Cobertura dos requisitos

| Requisito | Implementação |
|---|---|
| RF01 | Painel administrativo, cadastro/edição, fotos e arquivamento |
| RF02 | Descoberta de animais disponíveis por cartões |
| RF03 | Detalhes, galeria e características |
| RF04 | Filtros combinados por espécie, raça, porte e idade; município adicional |
| RF05 | Supabase Auth com email/senha |
| RF06 | Google OAuth; requer provedor configurado |
| RF07 | Notificações persistentes dentro do app e atualizações Realtime |
| RF08 | Histórico de pedidos por adotante |
| RF09 | Favoritos persistentes |
| RNF01 | React Native/Expo para Android; base compatível com iOS, sem certificação iOS |
| RNF02 | Código preparado para Git/GitHub e CI |
| RNF03 | PostgreSQL, RLS e funções transacionais |
| RNF04 | Componentes e identidade visual compartilhados |
| RNF05 | Autenticação gerenciada, HTTPS e sessão nativa em SecureStore |

## Limites e status da entrega

As contas Supabase e Expo ainda precisam ser criadas pelo proprietário. Até a vinculação e verificação, não considere concluídos o provisionamento remoto, OAuth real, publicação web ou geração/instalação de APK. A implementação local e a configuração de implantação não comprovam esses resultados externos.

Na consulta de preços realizada nesta implementação, o Supabase Free oferece 500 MB de banco, 1 GB de arquivos e pausa após uma semana de inatividade, com limite de dois projetos ativos. Consulte sempre https://supabase.com/pricing antes de publicar. Não há contratação automática de planos pagos neste projeto.

Sem chat, pagamentos, push, geolocalização ou publicação em lojas nesta versão. Adoções e dados de demonstração têm finalidade acadêmica.

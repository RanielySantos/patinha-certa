# Implantação e verificação

## Atualização 1.0.3

Preparada em 11 de novembro de 2026 para web e Android (versionCode 4).

- Raça digitável com sugestões dos animais cadastrados, restritas à espécie selecionada.
- Migração 202611120001_free_text_breeds.sql aplicada ao projeto de produção jcrafbthmwylzryujkyv e função conferida remotamente.
- As migrações antigas já estavam refletidas no banco, mas não estavam registradas no histórico da CLI; foi executado somente o arquivo da nova migração.
- Nove testes automatizados passaram; exportação web concluída antes do preparo da versão.
- A publicação web é acionada pelo envio à branch main; o APK é gerado no perfil preview do Expo. Consulte os resultados no GitHub Actions e na release v1.0.3.

## Serviços publicados

- Código: https://github.com/RanielySantos/patinha-certa
- Aplicação web: https://ranielysantos.github.io/patinha-certa/
- Supabase: https://supabase.com/dashboard/project/jcrafbthmwylzryujkyv
- Expo: https://expo.dev/accounts/ranielys/projects/patinha-certa
- Downloads e versões: https://github.com/RanielySantos/patinha-certa/releases/tag/v1.0.3
- APK Android: https://github.com/RanielySantos/patinha-certa/releases/download/v1.0.3/patinha-certa-v1.0.3.apk

A versão 1.0.2 corrige o processamento dos retornos de autenticação, adiciona a etapa de confirmação de email por código ou link e melhora mensagens e carregamento. O Android utiliza `versionCode` 3. O proprietário confirmou que a autenticação Google entra na conta; a navegação automática após o retorno foi corrigida nesta versão e precisa de reteste no aparelho. Consulte [a validação de autenticação](AUTH_VALIDATION.md).

### Histórico da versão 1.0.1

A versão 1.0.1 remove a identificação visual de demonstração dos cartões e da descoberta. Os registros de exemplo continuam identificados internamente e documentados. O Android utiliza `versionCode` 2 e a assinatura existente para permitir atualização da instalação 1.0.0.

### Histórico do build 1.0.0

O build Android `024bb849-2e90-495b-9c3a-369a14fa1425` foi concluído no Expo, com versão `1.0.0` e pacote `br.com.patinhacerta.app`. O código nativo desse build corresponde ao commit `f311634`; os commits seguintes registram a correção específica da exportação web, configuração de callbacks e documentação. O APK utiliza as variáveis públicas do ambiente `preview` conectadas ao Supabase.

O backend está na região `sa-east-1` (São Paulo). O banco contém 18 anúncios fictícios, seis em cada município: Aracaju, Areia Branca e Itabaiana. A web e o ambiente `preview` do Expo utilizam a URL e a chave pública desse projeto. As credenciais de administração ficam fora do repositório.

## Verificações executadas

- Quatro testes automatizados de domínio e PostgreSQL embarcado passaram.
- Dois testes de interface passaram: desktop e celular, com favoritos, pedido, cancelamento e persistência da demonstração.
- O backend hospedado foi validado por requisições reais: autenticação, perfis, isolamento entre usuários, favoritos, duplicidade de pedidos, notificações e uploads administrativos.
- Duas aprovações HTTP simultâneas para o mesmo animal resultaram em uma aprovação e uma recusa, preservando a exclusividade da adoção.
- A página pública foi validada em desktop e celular com os 18 animais carregados do Supabase, filtros por município, ausência de transbordamento horizontal e ausência de erros JavaScript.
- O callback público de autenticação retorna HTTP 200.
- Contas, arquivos e anúncio criados para validar o backend foram removidos depois dos testes.

## Acesso administrativo e autenticação

Cadastre sua conta no aplicativo e confirme o email. Para conceder administração, o proprietário do banco deve seguir a instrução SQL no README. Não existe senha de administrador padrão ou publicada.

O proprietário configurou o Client ID e o secret do Google Cloud no provedor Supabase, que já aparece como ativo, e confirmou a autenticação da conta Google. A saída automática da tela de confirmação deve ser revalidada no aparelho com esta atualização. O envio de confirmação e recuperação de senha para usuários externos à organização pode exigir SMTP próprio devido às restrições do serviço de email padrão do Supabase. Não foram desativadas as confirmações de email.

O aplicativo não foi instalado em um aparelho Android físico nesta sessão. A validação visual em celular foi feita em navegador com viewport móvel; a compilação Android não substitui o teste de instalação e dos callbacks em um aparelho real.

## Manutenção

Os commits seguem Conventional Commits com mensagens em português. A branch `main` dispara testes, validação de versões Expo e publicação GitHub Pages. Os arquivos `.env`, ferramentas locais, chaves, senhas e artefatos de build não entram no controle de versão.

O plano gratuito do Supabase pode pausar projetos inativos. Builds e armazenamento do Expo seguem a cota da conta. Não foram ativados serviços pagos.

A auditoria npm identificou alertas em dependências transitivas, inclusive ferramentas Expo/EAS. A atualização de SDK deve ser planejada e testada antes de ampliar este projeto acadêmico para uma operação pública. Esses alertas não são apresentados como resolvidos.

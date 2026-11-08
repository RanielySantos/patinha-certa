# Implantação e verificação

## Serviços publicados

- Código: https://github.com/RanielySantos/patinha-certa
- Aplicação web: https://ranielysantos.github.io/patinha-certa/
- Supabase: https://supabase.com/dashboard/project/jcrafbthmwylzryujkyv
- Expo: https://expo.dev/accounts/ranielys/projects/patinha-certa
- Downloads e versões: https://github.com/RanielySantos/patinha-certa/releases/tag/v1.0.0
- APK Android: https://github.com/RanielySantos/patinha-certa/releases/download/v1.0.0/patinha-certa-v1.0.0.apk

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

O login Google ainda exige Client ID e secret do Google Cloud no provedor Supabase. Não foi declarado como validado. O envio de confirmação e recuperação de senha para usuários externos à organização pode exigir SMTP próprio devido às restrições do serviço de email padrão do Supabase. Não foram desativadas as confirmações de email.

O aplicativo não foi instalado em um aparelho Android físico nesta sessão. A validação visual em celular foi feita em navegador com viewport móvel; a compilação Android não substitui o teste de instalação e dos callbacks em um aparelho real.

## Manutenção

Os commits seguem Conventional Commits com mensagens em português. A branch `main` dispara testes, validação de versões Expo e publicação GitHub Pages. Os arquivos `.env`, ferramentas locais, chaves, senhas e artefatos de build não entram no controle de versão.

O plano gratuito do Supabase pode pausar projetos inativos. Builds e armazenamento do Expo seguem a cota da conta. Não foram ativados serviços pagos.

A auditoria npm identificou alertas em dependências transitivas, inclusive ferramentas Expo/EAS. A atualização de SDK deve ser planejada e testada antes de ampliar este projeto acadêmico para uma operação pública. Esses alertas não são apresentados como resolvidos.

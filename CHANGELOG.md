# Histórico de versões

## 1.0.2 — 8 de novembro de 2026

- Cadastro em duas etapas, com confirmação de email por código ou link e opção de reenviar a mensagem.
- Tratamento de retornos PKCE, sessões no fragmento do link e confirmações por token hash, com erros explícitos para links expirados ou sem sessão.
- Saída automática da confirmação quando o navegador Google já concluiu a sessão, sem exigir tocar em Voltar. Retornos equivalentes compartilham o processamento do código, e a espera possui limite e opção de nova tentativa.
- Verificação de confirmação ao voltar ao aplicativo e opção de concluir o acesso após abrir o email.
- Mensagens de erro dentro do formulário, botões com processamento e bloqueio de envios repetidos.
- Skeleton na carga inicial de animais e feedback acessível de processamento.
- Emails de confirmação e recuperação em português.
- Verificação prévia do provedor Google para evitar abrir uma página de erro quando a configuração estiver pendente. O proprietário ativou o provedor no Supabase; a validação com uma conta Google real continua necessária.
- Android `versionCode` 3.

## 1.0.1 — 8 de novembro de 2026

- Removido o badge “Demonstração” dos cartões de animais.
- Removida a faixa de ambiente demonstrativo da tela de descoberta.
- Revisados os textos dos perfis de exemplo e dos detalhes para uma apresentação mais natural.
- Preservada a identificação interna dos dados de exemplo e a documentação de suas imagens ilustrativas.
- Atualizada a versão Android para `1.0.1`, com `versionCode` 2, permitindo atualizar a instalação anterior.

## 1.0.0

- Primeira versão para Android e web, com descoberta, filtros, favoritos, pedidos de adoção e administração.
- Backend Supabase e dados de exemplo de Aracaju, Areia Branca e Itabaiana.

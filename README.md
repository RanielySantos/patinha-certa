# Patinha Certa · versão 1.0.2

Aplicativo de adoção em JavaScript, React Native e Expo, compartilhado entre Android e web. Descoberta por cartões, favoritos, pedidos, notificações e administração com Supabase.

**[Abrir aplicativo](https://ranielysantos.github.io/patinha-certa/)** · **[Baixar APK Android](https://github.com/RanielySantos/patinha-certa/releases/download/v1.0.2/patinha-certa-v1.0.2.apk)** · **[Código-fonte e versões](https://github.com/RanielySantos/patinha-certa/releases/tag/v1.0.2)** · **[Projeto Expo](https://expo.dev/accounts/ranielys/projects/patinha-certa)**

A implantação e os resultados efetivamente verificados estão em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Executar

Requer Node.js 22 LTS e npm.

```sh
npm ci
npm run web
# Android com dispositivo/emulador compatível:
npm run android
```
### Regras de adoção

Curtir salva um favorito. O pedido exige contato e justificativa e começa pendente. Administradores podem analisar, aprovar ou recusar; adotantes podem cancelar seus próprios pedidos ativos. A aprovação bloqueia o registro do animal, aprova um pedido, recusa os demais ativos e gera notificações na mesma transação. Um índice adicional impede duas aprovações para o mesmo animal. Arquivar um anúncio preserva o histórico e encerra os pedidos ativos com aviso.

Apenas administradores podem enviar arquivos (até 5 MB). Não envie documentos pessoais. As políticas de banco protegem perfis, favoritos, pedidos e notificações; o cliente não possui permissão de escrever diretamente estados de adoção ou papéis de usuário.

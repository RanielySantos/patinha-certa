# Roteiro de apresentação e validação

## Demonstração local

1. Abra Explorar e apresente a identificação de ambiente demonstrativo.
2. Filtre Aracaju, Areia Branca e Itabaiana; cada município começa com seis animais.
3. Combine espécie, porte, faixa etária e raça. Limpe os filtros.
4. Abra um cartão e confira características, imagem e aviso de anúncio fictício.
5. Entre por Perfil → Experimentar demonstração. Favorite um animal e confira Favoritos.
6. Envie um pedido com contato fictício e justificativa. Confira Pedidos e Notificações.
7. Recarregue a página; entre novamente na demonstração e confirme a persistência local.
8. Cancele o pedido ativo e confira o status.

## Validação conectada ao Supabase

Use dois adotantes de teste e um administrador. Não utilize dados pessoais de terceiros.

- Cadastro com confirmação de email, login, logout, Google e recuperação de senha.
- Persistência da sessão após reiniciar o aplicativo; sessão inválida deve exigir novo login para mutações.
- Administrador cadastra animal com foto, troca a capa, remove foto e edita características.
- Adotantes enviam pedidos para o mesmo animal; um pedido ativo duplicado é recusado.
- Administrador muda para Em análise; o adotante recebe notificação interna.
- Administrador aprova um pedido; o animal sai da descoberta, o outro pedido é recusado e ambos recebem aviso.
- Em duas sessões administrativas, tente aprovar pedidos diferentes simultaneamente. Apenas um pode ser aprovado. Confirme banco e notificações após ambas as respostas.
- Arquive um anúncio com pedido ativo; confirme histórico preservado e pedido encerrado.
- Como adotante, tente ler o pedido de outro usuário e alterar o papel do perfil por requisição direta: o banco deve negar.
- Valide fotos com tipo/tamanho inválidos e upload de usuário comum: devem ser negados.
- Teste conexão interrompida e foto indisponível; confira erro, nova tentativa e placeholder.

## Dispositivos e publicação

- Desktop: navegação superior, três colunas na descoberta e modal legível.
- Celular: navegação inferior, conteúdo sem transbordamento, botões e gestos, teclado nos formulários.
- GitHub Pages: abra a página inicial e callback diretamente, incluindo recarregamento e retorno OAuth.
- Android: instale o APK, valide callback `patinhacerta://`, persistência da sessão, gestos e seleção de foto.
- Registre URL publicada, versão/commit, link do APK, aparelho e resultados. Enquanto não houver execução real, marque como pendente.

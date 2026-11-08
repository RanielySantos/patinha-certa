# Fotografias ilustrativas

Fonte: Unsplash, https://unsplash.com/license. A licença permite uso gratuito comercial e não comercial, sem exigir atribuição. Não revender imagens isoladas nem compilar serviço concorrente de imagens. URLs usadas são arquivos públicos do serviço de imagens do Unsplash; não é utilizada sua API de busca.

As fotografias não retratam animais comprovadamente disponíveis em Sergipe. Os nomes, descrições e responsáveis são fictícios. A imagem pode ser reutilizada entre anúncios de demonstração.

| Tipo | Identificador do arquivo na origem |
|---|---|
| Cão | photo-1552053831-71594a27632d |
| Cão | photo-1587300003388-59208cc962cb |
| Cão | photo-1543466835-00a7907e9de1 |
| Cão | photo-1517849845537-4d257902454a |
| Cão | photo-1537151625747-768eb6cf92b2 |
| Cão | photo-1518717758536-85ae29035b6d |
| Gato | photo-1514888286974-6c03e2ca1dba |
| Gato | photo-1573865526739-10659fec78a5 |
| Gato | photo-1518791841217-8f162f1e1131 |
| Gato | photo-1533738363-b7f9aef128ce |
| Gato | photo-1495360010541-f48722b34f7d |
| Gato | photo-1511044568932-338cba0ad803 |

URL de cada arquivo: `https://images.unsplash.com/IDENTIFICADOR?auto=format&fit=crop&w=1000&q=85`. A associação exata entre anúncio e fotografia está versionada em `src/data.mjs` e `supabase/seed.sql`. Cópias licenciadas ficam em `assets/pets`, resolvidas por `src/photos.js`, para que os anúncios demonstrativos não dependam do serviço externo durante o uso. Fotos de anúncios reais são enviadas ao Supabase Storage; a interface apresenta um placeholder quando uma foto fica indisponível.

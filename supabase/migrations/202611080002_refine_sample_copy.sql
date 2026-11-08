-- Ajusta somente os textos originais dos perfis de exemplo.
-- Preserva a marcação interna demo e qualquer conteúdo alterado pelo administrador.
begin;
update public.animals
set description = regexp_replace(description, ' Anúncio fictício ambientado em (Aracaju|Areia Branca|Itabaiana), Sergipe, para demonstrar a adoção responsável\.$', '')
where demo = true
  and id between '00000000-0000-4000-8000-000000000001'::uuid and '00000000-0000-4000-8000-000000000018'::uuid
  and description like '%Anúncio fictício ambientado em%';

update public.animals
set responsible = 'Equipe de adoção de ' || city
where demo = true
  and id between '00000000-0000-4000-8000-000000000001'::uuid and '00000000-0000-4000-8000-000000000018'::uuid
  and responsible = 'Núcleo demonstrativo de ' || city;
commit;

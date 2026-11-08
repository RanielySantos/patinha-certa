import {writeFileSync} from 'node:fs';
import {animals} from '../src/data.mjs';
const q=value=>`'${String(value).replaceAll("'","''")}'`;
let sql='-- Gerado por npm run seed:sql. Somente anúncios fictícios.\nbegin;\n';
for(const a of animals){
  sql+=`insert into public.animals(id,name,species_id,breed_id,age_months,size,sex,description,city,state,responsible,vaccinated,neutered,demo) values(${q(a.id)},${q(a.name)},${a.species==='Cão'?1:2},(select id from public.breeds where species_id=${a.species==='Cão'?1:2} and name='Sem raça definida'),${a.age_months},${q(a.size)},${q(a.sex)},${q(a.description)},${q(a.city)},'SE',${q(a.responsible)},${a.vaccinated},${a.neutered},true) on conflict(id) do nothing;\n`;
  sql+=`insert into public.animal_photos(animal_id,url,position) select ${q(a.id)},${q(a.photos[0])},0 where not exists(select 1 from public.animal_photos where animal_id=${q(a.id)});\n`;
}
sql+='commit;\n';writeFileSync(new URL('../supabase/seed.sql',import.meta.url),sql);console.log('18 animais demonstrativos gerados em supabase/seed.sql.');

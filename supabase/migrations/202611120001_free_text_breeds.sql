create or replace function public.save_animal(p_id uuid,p_data jsonb,p_photos jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare result uuid; prior text; photo jsonb; pos integer:=0; other adoption_requests; breed_name text; resolved_breed smallint;
begin
 if not is_admin() then raise exception 'Acesso administrativo necessário.'; end if;
 if jsonb_typeof(p_photos)<>'array' or jsonb_array_length(p_photos) not between 1 and 10 then raise exception 'Informe entre uma e dez fotos.'; end if;
 if p_id is not null then
   select status into prior from animals where id=p_id for update;
   if not found then raise exception 'Animal não encontrado.'; end if;
   if (p_data->>'status')='adopted' and prior<>'adopted' then raise exception 'A adoção deve ser concluída por um pedido.'; end if;
   if prior='adopted' and (p_data->>'status')<>'adopted' then raise exception 'Adoção concluída não pode ser reaberta.'; end if;
 else
   if (p_data->>'status') not in ('available','archived') then raise exception 'Status inválido.'; end if;
 end if;
 if p_data ? 'breed_name' then
   breed_name:=btrim(p_data->>'breed_name');
   if breed_name is null or breed_name='' then raise exception 'Informe a raça ou use Sem raça definida.'; end if;
   -- Lock the species to reuse breeds during concurrent saves.
   perform 1 from species where id=(p_data->>'species_id')::smallint for update;
   select id into resolved_breed from breeds
     where species_id=(p_data->>'species_id')::smallint and lower(btrim(name))=lower(breed_name)
     order by id limit 1;
   if resolved_breed is null then
     insert into breeds(species_id,name) values((p_data->>'species_id')::smallint,breed_name) returning id into resolved_breed;
   end if;
   p_data:=jsonb_set(p_data,'{breed_id}',to_jsonb(resolved_breed));
 end if;
 result:=coalesce(p_id,gen_random_uuid());
 insert into animals(id,name,species_id,breed_id,age_months,size,sex,description,city,state,status,responsible,vaccinated,neutered,demo)
 values(result,p_data->>'name',(p_data->>'species_id')::smallint,(p_data->>'breed_id')::smallint,(p_data->>'age_months')::integer,p_data->>'size',p_data->>'sex',p_data->>'description',p_data->>'city','SE',p_data->>'status',p_data->>'responsible',(p_data->>'vaccinated')::boolean,(p_data->>'neutered')::boolean,(p_data->>'demo')::boolean)
 on conflict(id) do update set name=excluded.name,species_id=excluded.species_id,breed_id=excluded.breed_id,age_months=excluded.age_months,size=excluded.size,sex=excluded.sex,description=excluded.description,city=excluded.city,status=excluded.status,responsible=excluded.responsible,vaccinated=excluded.vaccinated,neutered=excluded.neutered,demo=excluded.demo;
 delete from animal_photos where animal_id=result;
 for photo in select * from jsonb_array_elements(p_photos) loop
   insert into animal_photos(animal_id,url,position) values(result,photo#>>'{}',pos);pos:=pos+1;
 end loop;
 if (p_data->>'status')='archived' then
   for other in update adoption_requests set status='rejected',updated_at=now() where animal_id=result and status in ('pending','reviewing') returning * loop
     insert into notifications(user_id,request_id,message) values(other.user_id,other.id,'O anúncio de '||(p_data->>'name')||' foi retirado. Seu pedido foi encerrado.');
   end loop;
 end if;
 return result;
end; $$;
revoke all on function public.save_animal(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_animal(uuid,jsonb,jsonb) to authenticated;

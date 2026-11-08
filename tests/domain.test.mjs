import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animals} from '../src/data.mjs';
import {cities,filterAnimals,canTransition,ageLabel} from '../src/domain.mjs';
test('18 animais distintos, seis por município sergipano, sem dados reais',()=>{
 assert.equal(animals.length,18);assert.equal(new Set(animals.map(a=>a.id)).size,18);
 for(const city of cities){const local=animals.filter(a=>a.city===city);assert.equal(local.length,6);assert.equal(local.filter(a=>a.species==='Cão').length,3);assert.equal(local.filter(a=>a.species==='Gato').length,3);}
 assert.ok(animals.every(a=>a.state==='SE'&&a.demo&&a.photos.length&&a.description.length>=15));
});
test('filtros combinados e limites de idade',()=>{
 assert.equal(filterAnimals(animals,{city:'Itabaiana'}).length,6);
 assert.equal(filterAnimals(animals,{city:'Areia Branca',species:'Gato'}).length,3);
 assert.equal(filterAnimals(animals,{city:'Aracaju',species:'Gato',age:'Filhote',size:'Pequeno',breed:'SEM RAÇA'}).length,1);
 assert.equal(filterAnimals(animals,{breed:'inexistente'}).length,0);
 assert.equal(filterAnimals([{...animals[0],status:'adopted'}]).length,0);
 const boundary=[11,12,95,96].map((age_months,i)=>({...animals[0],id:i,age_months}));
 assert.equal(filterAnimals(boundary,{age:'Filhote'}).length,1);assert.equal(filterAnimals(boundary,{age:'Adulto'}).length,2);assert.equal(filterAnimals(boundary,{age:'Idoso'}).length,1);
});
test('adotante só cancela pedidos ativos; estados finais não reabrem',()=>{
 for(const from of ['pending','reviewing']){assert.ok(canTransition(from,'cancelled',false));assert.ok(!canTransition(from,'approved',false));assert.ok(canTransition(from,'approved',true));}
 for(const from of ['approved','rejected','cancelled'])for(const to of ['pending','reviewing','approved','rejected','cancelled'])assert.equal(canTransition(from,to,true),false);
 assert.equal(ageLabel(8),'8 meses');assert.equal(ageLabel(12),'1 ano');assert.equal(ageLabel(96),'8 anos');
});

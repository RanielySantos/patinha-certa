import {test} from 'node:test';
import assert from 'node:assert/strict';
import {suggestBreeds} from '../src/breeds.mjs';

test('sugestões usam animais da espécie selecionada e ignoram acentos e duplicatas',()=>{
  const animals=[{species:'Gato',breed:'Siamês'},{species:'Cão',breed:'Samoieda'},{species:'Cão',breed:'samoieda'},{species:'Cão',breed:'Sem raça definida'}];
  assert.deepEqual(suggestBreeds(animals,'Cão',' S '),['samoieda','Sem raça definida']);
  assert.deepEqual(suggestBreeds(animals,'Gato','siames'),['Siamês']);
  assert.deepEqual(suggestBreeds(animals,'Gato',''),[]);
  assert.deepEqual(suggestBreeds(animals,'Cão','Nova raça'),[]);
});

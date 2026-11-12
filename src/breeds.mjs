const normalize = value => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');

export function suggestBreeds(animals, species, query) {
  const prefix = normalize(query);
  if (!prefix) return [];
  const names = new Map();
  for (const animal of animals) {
    const name = animal.breed?.trim();
    if (animal.species === species && name && normalize(name).startsWith(prefix)) {
      names.set(normalize(name), name);
    }
  }
  return [...names.values()].sort((a,b)=>a.localeCompare(b,'pt-BR')).slice(0,8);
}

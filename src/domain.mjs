export const cities = ['Aracaju', 'Areia Branca', 'Itabaiana'];
export const statusLabels = { pending: 'Pendente', reviewing: 'Em análise', approved: 'Aprovado', rejected: 'Recusado', cancelled: 'Cancelado' };
export const activeStatuses = ['pending', 'reviewing'];
export function filterAnimals(animals, filters = {}) {
  return animals.filter(a => a.status === 'available' &&
    (!filters.city || a.city === filters.city) && (!filters.species || a.species === filters.species) &&
    (!filters.breed || a.breed.toLowerCase().includes(filters.breed.toLowerCase())) &&
    (!filters.size || a.size === filters.size) &&
    (!filters.age || (filters.age === 'Filhote' ? a.age_months < 12 : filters.age === 'Adulto' ? a.age_months >= 12 && a.age_months < 96 : a.age_months >= 96)));
}
export function ageLabel(months) { return months < 12 ? `${months} meses` : `${Math.floor(months / 12)} ${months < 24 ? 'ano' : 'anos'}`; }
export function canTransition(from, to, admin) {
  return admin ? (from === 'pending' && ['reviewing','approved','rejected'].includes(to)) || (from === 'reviewing' && ['approved','rejected'].includes(to)) : activeStatuses.includes(from) && to === 'cancelled';
}

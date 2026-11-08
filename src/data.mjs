import { cities } from './domain.mjs';
const names = ['Amora','Bento','Luna','Chico','Mel','Tom','Nina','Theo','Jade','Paçoca','Belinha','Simba','Cacau','Zeca','Pipoca','Tobias','Sol','Mingau'];
// Fotos ilustrativas do Unsplash; fontes e licença em docs/IMAGES.md.
const dogPhotos = ['photo-1552053831-71594a27632d','photo-1587300003388-59208cc962cb','photo-1543466835-00a7907e9de1','photo-1517849845537-4d257902454a','photo-1537151625747-768eb6cf92b2','photo-1518717758536-85ae29035b6d'];
const catPhotos = ['photo-1514888286974-6c03e2ca1dba','photo-1573865526739-10659fec78a5','photo-1518791841217-8f162f1e1131','photo-1533738363-b7f9aef128ce','photo-1495360010541-f48722b34f7d','photo-1511044568932-338cba0ad803'];
export const animals = names.map((name,i) => {
  const cat = i % 2 === 1, city = cities[Math.floor(i/6)];
  return { id: `00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`, name, city, state: 'SE', species: cat ? 'Gato' : 'Cão', breed: 'Sem raça definida', age_months: [8,24,36,5,108,18][i%6], size: cat ? 'Pequeno' : ['Médio','Grande','Pequeno'][i%3], sex: i%3 ? 'Macho' : 'Fêmea', status: 'available', vaccinated: i%3 !== 0, neutered: i%4 !== 0, demo: true, responsible: `Núcleo demonstrativo de ${city}`, description: `${name} é ${i%2 ? 'curioso e companheiro' : 'carinhosa e cheia de energia'}. Gosta de companhia, brincadeiras e de um cantinho tranquilo para descansar. Anúncio fictício ambientado em ${city}, Sergipe, para demonstrar a adoção responsável.`, photos: [`https://images.unsplash.com/${(cat ? catPhotos : dogPhotos)[Math.floor(i/2)%6]}?auto=format&fit=crop&w=1000&q=85`] };
});

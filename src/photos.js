const photos = {
  'photo-1552053831-71594a27632d': require('../assets/pets/photo-1552053831-71594a27632d.jpg'),
  'photo-1587300003388-59208cc962cb': require('../assets/pets/photo-1587300003388-59208cc962cb.jpg'),
  'photo-1543466835-00a7907e9de1': require('../assets/pets/photo-1543466835-00a7907e9de1.jpg'),
  'photo-1517849845537-4d257902454a': require('../assets/pets/photo-1517849845537-4d257902454a.jpg'),
  'photo-1537151625747-768eb6cf92b2': require('../assets/pets/photo-1537151625747-768eb6cf92b2.jpg'),
  'photo-1518717758536-85ae29035b6d': require('../assets/pets/photo-1518717758536-85ae29035b6d.jpg'),
  'photo-1514888286974-6c03e2ca1dba': require('../assets/pets/photo-1514888286974-6c03e2ca1dba.jpg'),
  'photo-1573865526739-10659fec78a5': require('../assets/pets/photo-1573865526739-10659fec78a5.jpg'),
  'photo-1518791841217-8f162f1e1131': require('../assets/pets/photo-1518791841217-8f162f1e1131.jpg'),
  'photo-1533738363-b7f9aef128ce': require('../assets/pets/photo-1533738363-b7f9aef128ce.jpg'),
  'photo-1495360010541-f48722b34f7d': require('../assets/pets/photo-1495360010541-f48722b34f7d.jpg'),
  'photo-1511044568932-338cba0ad803': require('../assets/pets/photo-1511044568932-338cba0ad803.jpg')
};
export function photoSource(uri) { const id=uri?.match(/images\.unsplash\.com\/(photo-[^?]+)/)?.[1];return photos[id]||{uri}; }

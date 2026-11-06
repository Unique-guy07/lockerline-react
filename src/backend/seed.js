// PROVIDED: do not edit.
// The starting data, the same records as the backend's seed files: tower A, its 48 doors and its 16 flats.

export const TOWER = { code: 'A', name: 'Tower A' };

/** D01–D20 small, D21–D40 medium, D41–D48 large (seed/doors.csv). */
export const DOORS = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1;
  return { no: `D${String(n).padStart(2, '0')}`, sizeClass: n <= 20 ? 'S' : n <= 40 ? 'M' : 'L' };
});

/** seed/residents.csv */
export const RESIDENTS = [
  { flat: '101', name: 'Iyer' }, { flat: '102', name: 'Banerjee' }, { flat: '103', name: 'Fernandes' },
  { flat: '104', name: 'Kapoor' }, { flat: '201', name: 'Reddy' }, { flat: '202', name: 'Malhotra' },
  { flat: '203', name: 'Shetty' }, { flat: '204', name: 'Bose' }, { flat: '301', name: 'Nair' },
  { flat: '302', name: 'Rao' }, { flat: '303', name: 'Ahuja' }, { flat: '304', name: 'Chawla' },
  { flat: '401', name: 'Dutta' }, { flat: '402', name: 'Gill' }, { flat: '403', name: 'Hegde' },
  { flat: '404', name: 'Jain' },
];

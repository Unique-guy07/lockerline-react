// PROVIDED: do not edit.
// The "database" for this page only: plain arrays, filled from seed.js when the page loads.
// Nothing is saved anywhere, so a refresh starts with a fresh building (every door free, no parcels).
import { DOORS, RESIDENTS, TOWER } from './seed.js';

export const store = {
  towers: [{ ...TOWER }],
  doors: DOORS.map((d) => ({ towerId: TOWER.code, no: d.no, sizeClass: d.sizeClass, currentParcelId: null })),
  residents: RESIDENTS.map((r) => ({ towerId: TOWER.code, flat: r.flat, name: r.name })),
  parcels: [],
  events: [],
  // Not in the MERN API: stands in for the residents' phones, which receive the pickup code by SMS.
  phones: [],
};

/** The settings the backend runs with (the real one reads them from its environment). */
export const settings = {
  freeWindowHours: 48,
  codeHashKey: 'lockerline-development-key',
};

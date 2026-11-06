// PROVIDED: do not edit.
// A courier's drop: the backend chooses the door and issues the pickup code.
import { iso, now, wholeSecond } from '../clock.js';
import { NoDoorFree, NoSuchFlat } from '../errors.js';
import { codeMatches, hashCode, newCode } from '../parcels/codes.js';
import { deliver } from '../phones/service.js';
import { settings, store } from '../store.js';

const TOWER = 'A';
const HOUR = 60 * 60 * 1000;
const SIZES = ['S', 'M', 'L'];

/** The free door of exactly this size with the lowest number, or undefined. */
function lowestFree(sizeClass) {
  return store.doors
    .filter((d) => d.towerId === TOWER && d.sizeClass === sizeClass && d.currentParcelId === null)
    .sort((a, b) => a.no.localeCompare(b.no))[0];
}

/** The size classes that still have at least one free door, small to large. */
function freeSizes() {
  return SIZES.filter((s) => store.doors.some((d) => d.towerId === TOWER && d.sizeClass === s && d.currentParcelId === null));
}

/** A code no parcel still waiting in a door has (one chance in a million of a clash, so draw again if so). */
function freshCode() {
  let code = newCode();
  while (store.parcels.some((p) => p.state === 'holding' && codeMatches(code, p.codeHash, settings.codeHashKey))) code = newCode();
  return code;
}

/**
 * The free door of exactly this size with the lowest number. The parcel, its door and its two events are
 * written together, after every check has passed, so a refused drop leaves nothing behind.
 */
export function drop({ sizeClass, flat }) {
  if (!store.residents.some((r) => r.towerId === TOWER && r.flat === flat)) throw new NoSuchFlat(flat);
  const door = lowestFree(sizeClass);
  if (!door) throw new NoDoorFree(sizeClass, freeSizes());

  const droppedAt = wholeSecond(now());
  const expiresAt = new Date(droppedAt.getTime() + settings.freeWindowHours * HOUR);
  const parcelId = `P${String(store.parcels.length + 1).padStart(3, '0')}`;
  const code = freshCode();
  store.parcels.push({
    parcelId, towerId: TOWER, flat, sizeClass, doorId: door.no, droppedAt,
    codeHash: hashCode(code, settings.codeHashKey), codeExpiresAt: expiresAt,
    codeUsedAt: null, collectedAt: null, dwellSeconds: null, state: 'holding',
  });
  door.currentParcelId = parcelId;
  store.events.push(
    { towerId: TOWER, parcelId, kind: 'dropped', at: droppedAt, data: { door: door.no } },
    { towerId: TOWER, parcelId, kind: 'code_issued', at: droppedAt, data: { expiresAt: iso(expiresAt) } },
  );

  const made = { parcelId, door: door.no, sizeClass, flat, droppedAt: iso(droppedAt), code, expiresAt: iso(expiresAt) };
  // Not in the MERN API: stands in for the SMS that takes the code to the resident's phone.
  deliver(flat, made);
  return made;
}

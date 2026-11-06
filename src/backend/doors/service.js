// PROVIDED: do not edit.
// The wall: every door of a tower, and one door on its own.
import { now } from '../clock.js';
import { NoSuchDoor, NoSuchTower } from '../errors.js';
import { store } from '../store.js';

/** A door's state is derived from what it holds, on every read; nothing stores it. */
function stateOf(door) {
  return door.currentParcelId === null ? 'free' : 'holding';
}

function requireTower(tower) {
  if (!store.towers.some((t) => t.code === tower)) throw new NoSuchTower(tower);
}

/** Whole seconds a parcel has waited, up to now. */
function dwellSeconds(parcel) {
  return Math.floor((now().getTime() - parcel.droppedAt.getTime()) / 1000);
}

const parcelById = (parcelId) => store.parcels.find((p) => p.parcelId === parcelId);

/** A free door is { no, size, state }; a holding door adds its parcel and how long it has waited. */
function shape(door, parcel) {
  const shaped = { no: door.no, size: door.sizeClass, state: stateOf(door) };
  return parcel ? { ...shaped, parcelId: parcel.parcelId, dwellSeconds: dwellSeconds(parcel) } : shaped;
}

/** The wall, optionally only one size and/or one state; `free` counts the free doors among those shown. */
export function wall(tower, { size, state } = {}) {
  requireTower(tower);
  const doors = store.doors
    .filter((d) => d.towerId === tower)
    .sort((a, b) => a.no.localeCompare(b.no))
    .map((d) => shape(d, d.currentParcelId === null ? null : parcelById(d.currentParcelId)))
    .filter((d) => (!size || d.size === size) && (!state || d.state === state));
  return { tower, free: doors.filter((d) => d.state === 'free').length, doors };
}

/** One door; a holding door read alone also names the flat its parcel is for. */
export function door(tower, no) {
  requireTower(tower);
  const found = store.doors.find((d) => d.towerId === tower && d.no === no);
  if (!found) throw new NoSuchDoor(tower, no);
  if (found.currentParcelId === null) return shape(found);
  const parcel = parcelById(found.currentParcelId);
  const { dwellSeconds: dwell, ...rest } = shape(found, parcel);
  return { ...rest, flat: parcel.flat, dwellSeconds: dwell };
}

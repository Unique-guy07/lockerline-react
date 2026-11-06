// PROVIDED: do not edit.
// One parcel and its whole history: the events are the only history the API gives.
import { iso } from '../clock.js';
import { NoSuchParcel } from '../errors.js';
import { store } from '../store.js';

/** An event as the API shows it: when, what, and its facts. */
function shapeEvent(e) {
  return { at: iso(e.at), kind: e.kind, ...e.data };
}

function shapeParcel(p) {
  return {
    parcelId: p.parcelId, door: p.doorId, sizeClass: p.sizeClass, flat: p.flat, state: p.state,
    droppedAt: iso(p.droppedAt),
    // oldest first; events written at the same time keep the order they were written in
    events: store.events.filter((e) => e.parcelId === p.parcelId).map(shapeEvent),
  };
}

export function parcel(parcelId) {
  const p = store.parcels.find((x) => x.parcelId === parcelId);
  if (!p) throw new NoSuchParcel(parcelId);
  return shapeParcel(p);
}

/** Not in the MERN API: stands in for a list of parcels (the caretaker's shelf of collected ones), in id order. */
export function parcels({ state } = {}) {
  return { parcels: store.parcels.filter((p) => !state || p.state === state).map(shapeParcel) };
}

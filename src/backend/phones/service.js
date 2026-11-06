// PROVIDED: do not edit.
// Not in the MERN API: stands in for the residents' phones. A real backend sends the pickup code by SMS
// and never keeps it; here the message waits in the flat's inbox, so the resident's screens can read it.
import { iso, now } from '../clock.js';
import { store } from '../store.js';

/** The SMS a drop sends to its flat: where the parcel is, the code, and until when the code is valid. */
export function deliver(flat, drop) {
  store.phones.push({
    flat, at: iso(now()), parcelId: drop.parcelId, door: drop.door, code: drop.code, expiresAt: drop.expiresAt,
  });
}

/** Every message a flat's phone has received, oldest first. */
export function messages(flat) {
  return {
    flat,
    messages: store.phones.filter((m) => m.flat === flat).map(({ at, parcelId, door, code, expiresAt }) => ({ at, parcelId, door, code, expiresAt })),
  };
}

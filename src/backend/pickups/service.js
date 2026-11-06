// PROVIDED: do not edit.
// A resident keys a code at the lobby: the right door opens, once.
import { iso, now, wholeSecond } from '../clock.js';
import { CodeExpired, CodeUsed, NoSuchCode } from '../errors.js';
import { codeMatches } from '../parcels/codes.js';
import { settings, store } from '../store.js';

const TOWER = 'A';

/** The parcel this code belongs to, or null. If an old, collected parcel shares the code, the parcel still waiting wins. */
function parcelFor(code) {
  const matching = store.parcels
    .filter((p) => p.towerId === TOWER && codeMatches(code, p.codeHash, settings.codeHashKey));
  return matching.find((p) => p.state === 'holding') || matching[0] || null;
}

/**
 * The door opens once. Marking the parcel collected (with its dwell), freeing the door and writing the event
 * happen together, so the wall never shows a free door with a parcel still on it.
 */
export function pickup(code) {
  const parcel = parcelFor(code);
  if (!parcel) throw new NoSuchCode();
  if (parcel.codeUsedAt) throw new CodeUsed();
  const openedAt = wholeSecond(now());
  if (openedAt > parcel.codeExpiresAt) throw new CodeExpired();

  const dwellSeconds = Math.floor((openedAt.getTime() - parcel.droppedAt.getTime()) / 1000);
  Object.assign(parcel, { state: 'collected', collectedAt: openedAt, dwellSeconds, codeUsedAt: openedAt });
  store.doors.find((d) => d.towerId === TOWER && d.no === parcel.doorId).currentParcelId = null;
  store.events.push({
    towerId: TOWER, parcelId: parcel.parcelId, kind: 'opened', at: openedAt, data: { door: parcel.doorId, dwellSeconds },
  });
  return { parcelId: parcel.parcelId, door: parcel.doorId, openedAt: iso(openedAt), dwellSeconds };
}

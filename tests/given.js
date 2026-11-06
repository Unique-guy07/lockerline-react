// Puts the parcel room into a state before a screen opens, and sets the clock, the way the ticket's "Given" says.
// Everything goes through the api the screens use; nothing here looks inside the app.
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Tuesday 3 November 2026, 14:30 in the building (India time): drops made now have codes valid until Thu 5 Nov, 14:30. */
export const TUE_1430 = new Date('2026-11-03T14:30:00+05:30');

/** Puts the clock at this moment; it keeps running on from there. */
export function clockAt(when) {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(when);
}

/**
 * Lets this much time pass on the clock, timers included, in small steps: between steps the screen gets to draw,
 * so a timer that a new screen starts (a door that closes by itself) also runs within the time.
 */
export async function wait(ms) {
  for (let left = ms; left > 0; left -= 100) await vi.advanceTimersByTimeAsync(Math.min(100, left));
}

/** Moves only the time of day on (as when the screen is opened later), firing nothing. */
export function jump(ms) {
  vi.setSystemTime(new Date(Date.now() + ms));
}

/** A person at the keyboard and mouse; works with the clock set or not. */
export function person() {
  return userEvent.setup({ advanceTimers: (ms) => (vi.isFakeTimers() ? vi.advanceTimersByTime(ms) : undefined) });
}

/** A courier's drop through the api: { parcelId, door, code, expiresAt, ... }. */
export async function drop(api, sizeClass, flat) {
  const { status, body } = await api.post('/drops', { sizeClass, flat });
  if (status !== 201) throw new Error(`the drop was refused: ${JSON.stringify(body)}`);
  return body;
}

/** Fills every door of one size. */
export async function fill(api, sizeClass, flat = '101') {
  const count = { S: 20, M: 20, L: 8 }[sizeClass];
  for (let i = 0; i < count; i += 1) await drop(api, sizeClass, flat);
}

/** A resident's pickup through the api. */
export async function pickUp(api, code) {
  const { status, body } = await api.post('/pickups', { code });
  if (status !== 200) throw new Error(`the pickup was refused: ${JSON.stringify(body)}`);
  return body;
}

/** The door numbers from one to another, as the ticket gives a range: doorsFrom('D01', 'D10') is D01, D02 … D10. */
export function doorsFrom(first, last) {
  const a = Number(first.slice(1));
  const b = Number(last.slice(1));
  return Array.from({ length: b - a + 1 }, (_, i) => `D${String(a + i).padStart(2, '0')}`);
}

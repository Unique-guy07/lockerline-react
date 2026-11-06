// PROVIDED: do not edit.
// The backend's front door: a method and a path go in, { status, body } comes out, as the HTTP API answers.
// Every refusal leaves in one problem shape: { type, title, status, detail, instance, ...extras }.
import * as doors from './doors/service.js';
import * as drops from './drops/service.js';
import { Refusal, ValidationError } from './errors.js';
import * as parcels from './parcels/service.js';
import * as phones from './phones/service.js';
import * as pickups from './pickups/service.js';

// ── Checking what a request sends, field by field (the messages are the real backend's) ──
const isText = (value) => typeof value === 'string';

function oneOf(errors, field, value, allowed) {
  if (value === undefined) errors.push({ field, message: 'Required' });
  else if (!allowed.includes(value)) {
    errors.push({ field, message: `Invalid enum value. Expected ${allowed.map((a) => `'${a}'`).join(' | ')}, received '${value}'` });
  }
}

function someText(errors, field, value) {
  if (value === undefined) errors.push({ field, message: 'Required' });
  else if (!isText(value)) errors.push({ field, message: `Expected string, received ${value === null ? 'null' : typeof value}` });
  else if (value.length < 1) errors.push({ field, message: 'String must contain at least 1 character(s)' });
}

function check(errors, data) {
  if (errors.length) throw new ValidationError(errors);
  return data;
}

function wallQuery(query) {
  const errors = [];
  if (query.size !== undefined) oneOf(errors, 'size', query.size, ['S', 'M', 'L']);
  if (query.state !== undefined) oneOf(errors, 'state', query.state, ['free', 'holding']);
  return check(errors, { size: query.size, state: query.state });
}

function dropBody(body = {}) {
  const errors = [];
  oneOf(errors, 'sizeClass', body.sizeClass, ['S', 'M', 'L']);
  someText(errors, 'flat', body.flat);
  return check(errors, { sizeClass: body.sizeClass, flat: body.flat });
}

function pickupBody(body = {}) {
  const errors = [];
  someText(errors, 'code', body.code);
  return check(errors, { code: body.code });
}

function parcelsQuery(query) {
  const errors = [];
  if (query.state !== undefined) oneOf(errors, 'state', query.state, ['holding', 'collected']);
  return check(errors, { state: query.state });
}

// ── The routes: method, path pattern, and what answers ──
const ROUTES = [
  { method: 'GET', path: /^\/towers\/([^/]+)\/doors$/, run: (m, query) => [200, doors.wall(m[1], wallQuery(query))] },
  { method: 'GET', path: /^\/towers\/([^/]+)\/doors\/([^/]+)$/, run: (m) => [200, doors.door(m[1], m[2])] },
  { method: 'POST', path: /^\/drops$/, run: (_m, _q, body) => [201, drops.drop(dropBody(body))] },
  { method: 'POST', path: /^\/pickups$/, run: (_m, _q, body) => [200, pickups.pickup(pickupBody(body).code)] },
  { method: 'GET', path: /^\/parcels\/([^/]+)$/, run: (m) => [200, parcels.parcel(m[1])] },
  // Not in the MERN API: stands in for a list of parcels, which the caretaker's shelf of collected parcels needs.
  { method: 'GET', path: /^\/parcels$/, run: (_m, query) => [200, parcels.parcels(parcelsQuery(query))] },
  // Not in the MERN API: stands in for the resident's phone, where the pickup code arrives by SMS.
  { method: 'GET', path: /^\/phones\/([^/]+)\/messages$/, run: (m) => [200, phones.messages(m[1])] },
];

function problem(path, { status, type, title, message, extras = {} }) {
  return { status, body: { type, title, status, detail: message, instance: path, ...extras } };
}

/** Answers one request: { status, body }. */
export function route(method, url, body) {
  const [path, queryText = ''] = url.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryText));
  const found = ROUTES.map((r) => ({ r, match: r.method === method && path.match(r.path) })).find((x) => x.match);
  if (!found) {
    return problem(path, { status: 404, type: 'about:blank', title: 'Not Found', message: `Nothing is served at ${path}` });
  }
  try {
    const [status, answer] = found.r.run(found.match, query, body);
    return { status, body: answer };
  } catch (error) {
    if (error instanceof Refusal) return problem(path, error);
    throw error;
  }
}

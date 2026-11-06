// PROVIDED: do not edit.
// The only door the screens use to reach the backend. api.get(path) and api.post(path, body) return a Promise
// of { status, body }: the HTTP status and the JSON body, refusals included (they are answers, not errors).
//
// Today the backend runs inside this page (src/backend/). To use the real LockerLine API instead, replace
// call() with a fetch, and nothing else changes:
//
//   const API_URL = 'http://localhost:8080';
//   async function call(method, path, body) {
//     const response = await fetch(API_URL + path, {
//       method,
//       headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
//       body: body === undefined ? undefined : JSON.stringify(body),
//     });
//     return { status: response.status, body: await response.json() };
//   }
import { route } from './backend/routes.js';

// The body travels as JSON both ways, as it would over the network: the screens and the backend never share an object.
const asJson = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

async function call(method, path, body) {
  const answer = route(method, path, asJson(body));
  return { status: answer.status, body: asJson(answer.body) };
}

export const api = {
  get: (path) => call('GET', path),
  post: (path, body) => call('POST', path, body),
};

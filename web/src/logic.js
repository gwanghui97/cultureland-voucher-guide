import { PLACES, ROUTES } from './data.js';

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '');

export function matchPlace(query) {
  const q = norm(query ?? '');
  if (!q) return null;
  const hit = PLACES.find((p) => p.aliases.some((a) => q.includes(norm(a))));
  return hit ? hit.id : null;
}

export function getRoute(placeId, typeId) {
  return ROUTES[`${placeId}:${typeId}`];
}

export function calcPoints(amount, fee) {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (fee.min != null && amount < fee.min) return null;
  return Math.floor(amount * (1 - fee.rate));
}

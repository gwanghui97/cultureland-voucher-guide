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

// fee.max 가 없을 때의 입력 상한(10억원). 정책 수치가 아니라 오입력 방지용
const INPUT_MAX = 1e9;

export function calcPoints(amount, fee) {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (fee.min != null && amount < fee.min) return null;
  if (amount > (fee.max ?? INPUT_MAX)) return null;
  return Math.floor(amount * (1 - fee.rate));
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchPlace, getRoute, calcPoints } from './logic.js';
import { PLACES, VOUCHER_TYPES, ROUTES, SOURCES } from './data.js';

test('all place×type combos have a route', () => {
  for (const p of PLACES) for (const t of VOUCHER_TYPES)
    assert.ok(getRoute(p.id, t.id), `${p.id}:${t.id}`);
  assert.equal(Object.keys(ROUTES).length, PLACES.length * VOUCHER_TYPES.length);
});
test('matchPlace aliases', () => {
  assert.equal(matchPlace('네이버에서 문상 쓸 수 있어?'), 'naver');
  assert.equal(matchPlace(' 씨유 '), 'cu');
  assert.equal(matchPlace('CU'), 'cu');
  assert.equal(matchPlace('스타벅스'), null);
  assert.equal(matchPlace('   '), null);
  assert.equal(matchPlace('GS25 편의점'), null);
  assert.equal(matchPlace('편의점'), null);
});
test('calcPoints', () => {
  const cl = { rate: 0.06, min: 1000 }, g18 = { rate: 0.065, min: null };
  assert.equal(calcPoints(10000, cl), 9400);
  assert.equal(calcPoints(10000, g18), 9350);
  assert.equal(calcPoints(999, cl), null);
  assert.equal(calcPoints(999, g18), 934);
  for (const bad of [-5, 0, 'abc', NaN, Infinity, 1000.5, '', null]) assert.equal(calcPoints(bad, cl), null, String(bad));
});
test('branch rules', () => {
  assert.equal(getRoute('naver', 'offline').next.action, 'goPlace');
  assert.equal(getRoute('naver', 'offline').next.placeId, 'cu');
  assert.equal(getRoute('naver', 'exchange').next.action, 'retype');
  assert.equal(getRoute('cu', 'exchange').next.action, 'retype');
  const EXPECT = {
    'naver:integrated': ['ok', 'guide'], 'naver:offline': ['blocked', 'goPlace'],
    'naver:exchange': ['via', 'guide'], 'naver:gift18': ['ok', 'guide'],
    'cu:integrated': ['ok', 'guide'], 'cu:offline': ['ok', 'guide'],
    'cu:exchange': ['via', 'guide'], 'cu:gift18': ['unverified', 'external'],
  };
  for (const [k, [status, action]] of Object.entries(EXPECT)) {
    const [p, t] = k.split(':'); const r = getRoute(p, t);
    assert.equal(r.status, status, k); assert.equal(r.primary.action, action, k);
    if (action === 'guide') assert.ok(r.methods.length > 0, k);
  }
  assert.equal(getRoute('cu', 'gift18').methods.length, 0);
  assert.deepEqual(getRoute('cu', 'integrated').methods.map(m => m.id), ['barcode', 'app']);
  assert.equal(getRoute('naver', 'integrated').fee.rate, 0.06);
  assert.equal(getRoute('naver', 'gift18').fee.rate, 0.065);
  assert.deepEqual(getRoute('cu', 'offline').methods.map(m => m.id), ['barcode']);
  assert.equal(getRoute('cu', 'gift18').status, 'unverified');
});
test('every combo: methods ids and next', () => {
  const EXPECT = {
    'naver:integrated': [['npay'], undefined], 'naver:offline': [[], 'goPlace'],
    'naver:exchange': [['exchange'], 'retype'], 'naver:gift18': [['npay18'], undefined],
    'cu:integrated': [['barcode', 'app'], undefined], 'cu:offline': [['barcode'], undefined],
    'cu:exchange': [['exchange'], 'retype'], 'cu:gift18': [[], undefined],
  };
  for (const [k, [ids, next]] of Object.entries(EXPECT)) {
    const [p, t] = k.split(':'); const r = getRoute(p, t);
    assert.deepEqual(r.methods.map(m => m.id), ids, k);
    assert.equal(r.next?.action, next, k);
    if (['blocked', 'unverified'].includes(r.status)) assert.notEqual(r.primary.action, 'guide', k);
  }
  for (const p of ['naver', 'cu']) assert.match(getRoute(p, 'exchange').methods[0].steps[0], /^교환/, p);
});
test('matchPlace more aliases', () => {
  assert.equal(matchPlace('네이버페이로 결제'), 'naver');
  assert.equal(matchPlace('NAVER'), 'naver');
  assert.equal(matchPlace(''), null);
  assert.equal(matchPlace(null), null);
});
test('calcPoints 18-digit ignores min', () => {
  assert.equal(calcPoints(1, { rate: 0.065, min: null }), 0);
});
test('sources without url are not confirmed', () => {
  for (const s of Object.values(SOURCES)) if (!s.url) assert.notEqual(s.status, 'confirmed', s.id);
  for (const r of Object.values(ROUTES)) for (const id of r.sourceIds) assert.ok(SOURCES[id], id);
});
test('facts match official sources (fact-check 2026-11-11)', () => {
  assert.equal(SOURCES.gift18.status, 'unverified');
  assert.deepEqual(getRoute('cu', 'integrated').restricted, ['담배', '택배', '상품권', '복권', 'T머니충전']);
  for (const s of Object.values(SOURCES)) assert.equal(s.checkedAt, '2026-11-11', s.id);
});

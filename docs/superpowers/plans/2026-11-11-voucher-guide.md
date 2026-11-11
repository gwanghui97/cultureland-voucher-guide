# 문화상품권 사용 길잡이 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용처 검색 → 상품권 종류 확인 → 가능 여부·조건 → 맞춤 사용 방법을 잇는 모바일 클릭형 시제품을 Vercel 공개 링크로 배포한다.

**Architecture:** `web/` 안의 Vite + React 정적 SPA. 정책·출처는 `src/data.js`(순수 데이터), 분기·매칭·계산은 `src/logic.js`(순수 함수, `node --test` 로 시험), 화면은 `src/screens/*.jsx`. 라우터 없이 `App.jsx` 의 상태 하나로 화면 전환.

**Tech Stack:** Node 22, Vite (react 템플릿, JS), React 18+, `node:test`(추가 의존성 없음), Python Pillow + PyMuPDF(에셋 전처리), Vercel CLI 48.

**Spec:** `docs/superpowers/specs/2026-11-11-voucher-guide-design.md`

## Global Constraints

- 마감 2026-11-12 18:00. 새 기능 추가 금지, 확정 시나리오(네이버쇼핑 + CU)만.
- 모바일 폭 기준, 최대 폭 430px 가운데 정렬. 360px·390px에서 가로 스크롤 없음.
- 브랜드 색 `#FF3838`, 텍스트 `#000000`, 흰 `#FFFFFF`. 로고는 빨강·검정 배경 위에 두지 않음.
- 로고·캐릭터는 `assets-src/` 의 제공 에셋만. 18자리(gift18) 경로 화면에 컬쳐랜드 로고·캐릭터 쓰지 않음.
- 모든 정책 카드 하단: `출처: <name> · 확인일 2026.11.11 · 원문 보기`(url 없으면 "원문 보기" 생략 + `미확인` 배지).
- 배지 문구 고정: `과거 공지와 차이`(status `changed`), `미확인`(status `unverified`).
- 가상 요소(예시 번호, 잔액, 충전 화면)에 `시연용` 라벨. 홈·상품권 수령 화면에 `앱 적용 제안 목업` 라벨.
- PIN 전체 입력 필드 없음. 실제 PIN·개인정보·API 키 저장소에 넣지 않음.
- 실시간 AI 없음. 자연어는 별칭 키워드 매칭.

## Review Focus

- 빈 입력·공백만 입력 → 검색 실행 안 됨(버튼 비활성), 오류 없음. → Task 1 `matchPlace('   ') === null`.
- 대소문자·공백 섞인 별칭("cu", " 씨유 ", "네이버에서 문상 쓸 수 있어?") → 정확히 매칭. → Task 1 테스트.
- 수수료 계산기에 빈 값·음수·1,000원 미만·숫자 아닌 값 → 결과 대신 "최소 1,000원부터 전환돼요" 표시, NaN 표시 안 됨. → Task 1 `calcPoints` 테스트.
- 교환권 → 교환 후 종류 재선택 시 선택했던 사용처가 유지됨. → Task 1 `next.action==='retype'` + Task 3 수동 확인.
- url 이 `null` 인 출처 → 깨진 링크 없이 `미확인` 배지. → Task 1 테스트(`SOURCES` 중 url null ⇒ status `unverified`).

---

### Task 1: 프로젝트 골격 + 데이터 + 로직 (시험 포함)

**Files:**
- Create: `web/` (Vite react 템플릿), `.gitignore`(루트), `web/src/data.js`, `web/src/logic.js`, `web/src/logic.test.js`
- Modify: `web/package.json`(scripts.test)

**Interfaces:**
- Produces (`data.js`):
  - `SOURCES: Record<string,{id,name,url:string|null,checkedAt:'2026-11-11',status:'confirmed'|'changed'|'unverified',note?:string}>`
    - `npayCl`: 컬쳐랜드 Npay 전환, `https://www.cultureland.co.kr/conversion/naverpay_bridge.do`, confirmed
    - `npayNotice`: 2023-12-21 공지(2024-01-01부터 6.5%), `https://m.cultureland.co.kr/tgl/noticeBoard.do?NoteID=2083`, status `changed`
    - `faq`: `https://m.cultureland.co.kr/cstm/faqMain.do`, confirmed
    - `cashUse`: `https://www.cultureland.co.kr/usecash/getCashHow.do`, confirmed
    - `gift18`: (주)문화상품권 Npay 전환, `https://www.culturegift.co.kr/conversion/`, confirmed
    - `cuHelp`: 컬쳐랜드 상품권 도움말(CU 바코드·제한 품목), `https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=1&class2=1`, confirmed
    - `appBarcode`: 컬쳐랜드 앱 바코드 도움말, `https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=2&class2=7`, confirmed
  - `PLACES: {id:'naver'|'cu', name, channel:'온라인'|'오프라인', category, aliases:string[]}[]`
    - naver aliases: `네이버쇼핑, 네이버, naver, 스마트스토어, npay, n페이, 네이버페이`
    - cu aliases: `cu, 씨유` (`편의점` 단독·GS25 등 타 편의점은 매칭 안 함 → 결과 없음)
  - `VOUCHER_TYPES: {id:'integrated'|'offline'|'exchange'|'gift18', name, digits:12|16|18, hint}[]`
    - integrated 16 "통합형 컬쳐랜드상품권", offline 16 "오프라인 전용 컬쳐랜드상품권", exchange 12 "교환권", gift18 18 "지류·온라인 문화상품권"
  - `ROUTES: Record<\`${placeId}:${typeId}\`, Route>` — 8개 전부. `Route = {status:'ok'|'via'|'blocked'|'unverified', headline, conditions:string[], fee?:{rate:number,min:number|null,sourceId}, primary:{label,action:'guide'|'retype'|'goPlace'|'external',placeId?,url?}, methods:{id,label,steps:string[]}[], restricted?:string[], next?:{label,action:'retype'|'goPlace',placeId?}, sourceIds:string[]}`
    - 값은 스펙 §4 ③ 표 그대로. naver:integrated fee `{rate:0.06,min:1000}` + sourceIds `['npayCl','npayNotice']`; naver:gift18 fee `{rate:0.065,min:null}`, conditions에 `일 20만원·월 50만원 한도`; naver:offline status `blocked`, next `{label:'CU에서 쓰기',action:'goPlace',placeId:'cu'}`; *:exchange status `via`, next `{label:'받은 상품권 종류 확인하기',action:'retype'}`; cu:integrated methods `[barcode, app]`; cu:offline methods `[barcode]`; cu:gift18 status `unverified`.
    - restricted(CU): `['담배','각종 상품권','교통카드 충전']`, conditions에 `일부 매장은 이용이 제한될 수 있어요. 방문 전 확인하세요.`
    - app 바코드 steps: `사용 가능한 컬쳐캐쉬 잔액 확인`, `앱 로그인 → 홈 → 바코드결제`, `오프라인 제휴처에서 CU 선택`, `바코드 확인 후 계산대에 제시`
- Produces (`logic.js`):
  - `matchPlace(query: string) => string|null` — 소문자·공백 제거 후 별칭이 query 에 포함되면 해당 placeId.
  - `getRoute(placeId: string, typeId: string) => Route`
  - `calcPoints(amount: unknown, fee:{rate,min}) => number|null` — 유한 정수 아님·≤0·(min 있으면 <min) ⇒ null, 아니면 `Math.floor(amount*(1-rate))`.
  - primary(상태별 주 행동): ok→`{label:'사용 방법 보기',action:'guide'}`; via→`{label:'상품권 교환하기',action:'guide'}`(guide 마지막에 retype); blocked(naver:offline)→`{label:'CU에서 쓰기',action:'goPlace',placeId:'cu'}`; unverified(cu:gift18)→`{label:'공식 발행사에서 확인하기',action:'external',url:SOURCES.gift18.url}`, methods `[]`.

- [ ] **Step 1: 골격** — 루트에서 `npm create vite@latest web -- --template react`, `cd web && npm i`. `git rev-parse --is-inside-work-tree` 실패할 때만 루트 `git init`. 루트 `.gitignore` 에 기존 줄 + `node_modules/`, `dist/`, `.vercel/`, `assets-src/`, `*.zip` 추가. `web/package.json` scripts 에 `"test": "node --test src/"`.

- [ ] **Step 2: 실패 시험 작성** `web/src/logic.test.js`

```js
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
test('sources without url are not confirmed', () => {
  for (const s of Object.values(SOURCES)) if (!s.url) assert.notEqual(s.status, 'confirmed', s.id);
  for (const r of Object.values(ROUTES)) for (const id of r.sourceIds) assert.ok(SOURCES[id], id);
});
```

- [ ] **Step 3: 실패 확인** — `cd web && npm test` → FAIL (모듈 없음).
- [ ] **Step 4: `data.js`, `logic.js` 구현** (위 Interfaces 값 그대로).
- [ ] **Step 5: 통과 확인** — `npm test` → 5 tests pass.
- [ ] **Step 6: Commit** — `git add .gitignore web docs && git commit -m "feat: voucher route data and logic"`

### Task 2: 에셋 전처리

**Files:**
- Create: `scripts/prep_assets.py`, 출력 `web/public/img/logo.png`, `web/public/img/catsh-question.webp`, `kid-thumb.webp`, `catsh-safety.webp`

**Interfaces:**
- Produces: 위 4개 정적 경로(`/img/...`), Task 3·4 에서 `<img src="/img/...">` 로 사용.

- [ ] **Step 1:** `prep_assets.py` — PyMuPDF 로 `assets-src/bi/cultureland/2025_Cultureland_BI,AppIcon,조합형.pdf` 1쪽을 300dpi 렌더 → 가로형 빨강 로고 영역(1쪽 상단 "가로형" 격자 안) 잘라 흰 배경 투명화 → 높이 64px PNG. Pillow 로 `assets-src/char/15_Question_catsh.png`, `08_엄지척.png`, `16_SafetyCatsh.png` 를 알파 bbox 로 자르고 너비 360px WebP(quality 80).
- [ ] **Step 2:** `python scripts/prep_assets.py` 실행 → 4개 파일 생성, 각 200KB 이하 (`ls -la web/public/img`). 로고 PNG 를 열어 눈으로 확인(격자선 없음).
- [ ] **Step 3: Commit** — `git add scripts web/public/img && git commit -m "chore: prepare brand assets"`

### Task 3: 화면 — 홈(제안 목업)·검색·종류 확인·구분 도우미

**Files:**
- Create: `web/src/App.jsx`(교체), `web/src/styles.css`(index.css 교체), `web/src/screens/Home.jsx`, `Search.jsx`, `TypePick.jsx`, `Helper.jsx`, `web/src/ui.jsx`
- Delete: Vite 기본 `App.css`, `assets/react.svg`

**Interfaces:**
- Consumes: Task 1 `PLACES`, `VOUCHER_TYPES`, `matchPlace`; Task 2 이미지.
- Produces:
  - `App` 상태 `{screen:'home'|'search'|'type'|'helper'|'result'|'guide'|'demoCharge', placeId:string|null, typeId:string|null}` 와 `go(screen, patch?)`. 모든 화면 props `{state, go}`.
  - `ui.jsx`: `Header({title, onBack})`, `Badge({kind:'ok'|'via'|'blocked'|'unverified'|'changed'|'demo'|'proposal', children})`, `SourceLine({sourceIds})`.
  - `SourceLine` 문구: `출처: ${name} · 확인일 2026.11.11` + url 있으면 `원문 보기`(새 탭), status `changed`→`과거 공지와 차이`, `unverified`→`미확인` 배지.

- [ ] **Step 1: Home** — 로고, `앱 적용 제안 목업` 배지, 컬쳐캐쉬 아이콘 그리드(바코드 결제·전환·쇼핑·쿠폰 + 강조된 `사용처 찾기`) → `go('search')`. 하단 두 번째 진입점 카드 "상품권 받으셨나요? 이 상품권 어디서 쓰지?" → `go('search')`.
- [ ] **Step 2: Search** — 제목 `문화상품권, 어디에서 쓰고 싶으세요?`, 입력창(placeholder `예: 네이버쇼핑, 편의점에서 쓸 수 있어?`), 카테고리 칩(온라인쇼핑→naver, 편의점→cu), 인기 사용처 버튼. 공백 입력 시 버튼 비활성. 매칭 실패 시: `아직 안내 정보가 없는 사용처예요` + 컬쳐캐쉬 사용처 안내 원문 링크(`SOURCES.cashUse.url`) + `네이버쇼핑`·`CU` 바로가기. 매칭 성공 → `go('type',{placeId})`. 하단 작은 글씨 `AI 연동 없이 키워드로 찾아요`.
- [ ] **Step 3: TypePick** — 상단 `{place.name} · {channel}` 배지, 문구(naver) `Npay를 통한 사용 경로가 있어요. 갖고 계신 상품권을 확인해 볼까요?` / (cu) `바코드로 결제할 수 있어요. 갖고 계신 상품권을 확인해 볼까요?`. 4종 카드 + `잘 모르겠어요` → `go('helper')`. 카드 탭 → `go('result',{typeId})`.
- [ ] **Step 4: Helper** — 캐릭터 `catsh-question.webp`, 제목 `번호 자릿수를 세어 보세요`, 12/16/18자리 예시 카드(가상 번호, `시연용` 배지; 16자리는 두 종류 통합형/오프라인 전용 구분 문구 포함), 안내 `자릿수는 단서일 뿐이에요. 발행사와 상품권에 적힌 이름도 확인하세요.`, `헌혈기념품 등 일부 12자리는 예외가 있어요.`. 카드 탭 → `go('result',{typeId})`. `그래도 모르겠어요` → 고객센터 `1577-2111` 안내 박스. 숫자 입력 필드 없음.
- [ ] **Step 5: 확인** — `npm run dev`, 브라우저 390px 에서 홈→검색("네이버에서 문상 쓸 수 있어?")→종류→도우미 흐름 클릭 확인, 콘솔 오류 0. `npm test` 여전히 통과.
- [ ] **Step 6: Commit** — `git commit -am "feat: home, search, type pick, helper screens"` (새 파일 `git add` 포함)

### Task 4: 화면 — 결과·맞춤 안내·시연 충전

**Files:**
- Create: `web/src/screens/Result.jsx`, `Guide.jsx`, `DemoCharge.jsx`
- Modify: `web/src/App.jsx`(화면 등록)

**Interfaces:**
- Consumes: `getRoute`, `calcPoints`, `SOURCES`, Task 3 `Header/Badge/SourceLine`, `go`.

- [ ] **Step 1: Result** — `route.status` 배지(ok `사용 가능`, via `교환 먼저`, blocked `이 경로는 쓸 수 없어요`, unverified `미확인`), headline, conditions 목록(경고 박스, `catsh-safety.webp`), fee 있으면 계산기: 기본값 10000, `input type="number" inputMode="numeric"`, 결과 `{n.toLocaleString()}P (수수료 {rate*100}%)`, null 이면 fee.min 있을 때 `최소 {min}원부터 전환돼요`, 없으면 `금액을 정확히 입력해 주세요`. CU 면 restricted 를 `결제 전에 확인하세요` 박스로 결과 상단에. `SourceLine`. 주 버튼은 `route.primary` 로만(guide→`go('guide')`, goPlace→`go('type',{placeId})`, external→새 탭). primary 가 guide 가 아니면 사용 방법 화면 진입 버튼 없음. naver:offline 보조 버튼 `다른 사용처 찾기`→`go('search')`. `route.next` 있으면 보조 버튼: goPlace → `go('type',{placeId})`, retype → `go('type')`(placeId 유지). gift18 에서는 로고·캐릭터 숨김, `타 발행사 공식 경로` 라벨.
- [ ] **Step 2: Guide** — 제목 `{place.name}에서 쓰는 방법`. methods 2개 이상이면 탭(`상품권 바코드` / `앱 바코드`). steps 는 번호 + 체크박스(로컬 상태). exchange 면 마지막에 `받은 상품권 종류 확인하기` 버튼(retype). 보조 버튼 `번호가 인식 안 돼요` → 펼침: `자릿수와 종류를 다시 확인하세요`, `교환권이면 교환소에서 먼저 교환하세요`, `고객센터 1577-2111`. 주 버튼(naver·integrated 류) `지금 충전하러 가기` → `go('demoCharge')`. 완료 영역 `kid-thumb.webp`. 하단 `다른 사용처도 찾아보기` → `go('search',{placeId:null})`(typeId 유지).
- [ ] **Step 3: DemoCharge** — 큰 `시연용` 배지, `실제 충전은 컬쳐랜드 앱에서 진행돼요` 문구, 가짜 PIN 필드 비활성(값 `1234-5678-****-****`), `처음으로` → `go('home',{placeId:null,typeId:null})`.
- [ ] **Step 4: 확인** — dev 서버 390px·360px 에서 8개 조합 전부 클릭(naver/cu × 4종) + 도우미 경유 1회 + naver:offline→`CU에서 쓰기` + exchange→재선택 시 사용처 유지. 가로 스크롤 없음, 콘솔 오류 0, `npm test` 통과, `npm run build` 성공.
- [ ] **Step 5: Commit** — `git add -A web && git commit -m "feat: result, guide, demo charge screens"`

### Task 5: Vercel 배포 + 링크 확인

**Files:**
- Create: `web/vercel.json` 없음(정적 기본값으로 충분). 루트 `README.md` 짧게: 실행·시험 명령, 구현/미구현 표(스펙 제출물 섹션 기준).

- [ ] **Step 0:** `cd web && npm test && npm run build` 둘 다 통과해야 진행.
- [ ] **Step 1:** `cd web && npx vercel login`(사용자) → `npx vercel --prod` (프로젝트 루트 = `web`, Vite 자동 감지).
- [ ] **Step 2:** Vercel 대시보드 Settings → Deployment Protection → Vercel Authentication **끔**(사용자 확인 필요, 외부 공개 행위).
- [ ] **Step 3: 확인** — 비로그인(시크릿) 브라우저로 production URL 열어 홈→네이버쇼핑→통합형→안내→시연 충전, CU→오프라인 전용→상품권 바코드 흐름 완주. 원문 보기 링크 3개 이상 열림.
- [ ] **Step 4: 설명 자료 PDF(5쪽)** — `docs/submission/설명자료.md` → make-pdf 로 `docs/submission/설명자료.pdf`. 쪽 구성: 1 문제·대상 사용자 / 2 해결책 + 앱 적용 구상(제안 목업 캡처) / 3 핵심 시나리오·온오프라인 구분(캡처) / 4 정확성·예외·출처 표 / 5 AI 활용·검증 사례(검색 요약 6.5% → 원문 6% 정정 등 실제 있었던 것만) + 구현/미구현 표. 1쪽에 배포 링크 + QR(`qrcode` Python 패키지로 PNG). 캡처는 390px 폭 production URL 에서.
- [ ] **Step 5: Commit** — `git add README.md docs/submission && git commit -m "docs: readme and submission pdf"`

---

**출처 URL 3개(npayNotice, gift18, cuHelp)** 를 사용자가 주면 `data.js` 에 url 넣고 status 를 `confirmed`(npayNotice 는 `changed` 유지)로 바꾼 뒤 `npm test` → 재배포. 이 작업은 어느 시점에 와도 Task 1 데이터만 수정.

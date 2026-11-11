// 정책·출처 데이터. 정책이 바뀌면 이 파일만 고친다. React·DOM import 금지.

const CHECKED = '2026-11-11';

export const SOURCES = {
  npayCl: { id: 'npayCl', name: '컬쳐랜드 Npay 전환', url: 'https://www.cultureland.co.kr/conversion/naverpay_bridge.do', checkedAt: CHECKED, status: 'confirmed' },
  npayNotice: { id: 'npayNotice', name: '컬쳐랜드 공지(2023-12-21)', url: 'https://m.cultureland.co.kr/tgl/noticeBoard.do?NoteID=2083', checkedAt: CHECKED, status: 'changed', note: '2023-12-21 공지: 2024-01-01부터 6.5%, 현재 공식 화면은 6%' },
  faq: { id: 'faq', name: '컬쳐랜드 자주 묻는 질문', url: 'https://m.cultureland.co.kr/cstm/faqMain.do', checkedAt: CHECKED, status: 'confirmed' },
  cashUse: { id: 'cashUse', name: '컬쳐캐쉬 사용처 안내', url: 'https://www.cultureland.co.kr/usecash/getCashHow.do', checkedAt: CHECKED, status: 'confirmed' },
  gift18: { id: 'gift18', name: '(주)문화상품권 Npay 전환', url: 'https://www.culturegift.co.kr/conversion/', checkedAt: CHECKED, status: 'unverified', note: '발행사 전환 페이지에서 Npay 수수료·한도 문장을 찾지 못함' },
  cuHelp: { id: 'cuHelp', name: '컬쳐랜드 상품권 도움말', url: 'https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=1&class2=1', checkedAt: CHECKED, status: 'confirmed' },
  appBarcode: { id: 'appBarcode', name: '컬쳐랜드 앱 바코드 도움말', url: 'https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=2&class2=7', checkedAt: CHECKED, status: 'confirmed' },
};

export const PLACES = [
  { id: 'naver', name: '네이버쇼핑', channel: '온라인', category: '쇼핑', aliases: ['네이버쇼핑', '네이버', 'naver', '스마트스토어', 'npay', 'n페이', '네이버페이'] },
  // '편의점' 단독·타 편의점은 매칭하지 않는다
  { id: 'cu', name: 'CU', channel: '오프라인', category: '편의점', aliases: ['cu', '씨유'] },
];

export const VOUCHER_TYPES = [
  { id: 'integrated', name: '통합형 컬쳐랜드상품권', digits: 16, hint: '16자리 컬쳐랜드상품권' },
  { id: 'offline', name: '오프라인 전용 컬쳐랜드상품권', digits: 16, hint: '16자리 컬쳐랜드상품권' },
  { id: 'exchange', name: '교환권', digits: 12, hint: '12자리 교환권 (헌혈기념품 등 12자리 예외 있음)' },
  { id: 'gift18', name: '지류·온라인 문화상품권', digits: 18, hint: '18자리 지류·온라인 문화상품권' },
];

const GUIDE = { label: '사용 방법 보기', action: 'guide' };
const RETYPE = { label: '받은 상품권 종류 확인하기', action: 'retype' };
const GO_CU = { label: 'CU에서 쓰기', action: 'goPlace', placeId: 'cu' };
const CU_RESTRICTED = ['담배', '택배', '상품권', '복권', 'T머니충전'];
const CU_STORE_NOTE = '가맹점 사정에 따라 다른 결제수단과 함께 결제(복합결제)가 안 될 수 있어요.';

const EXCHANGE_METHOD = {
  id: 'exchange',
  label: '교환하기',
  steps: [
    '교환: 교환권 번호 입력 → 수신 휴대폰번호 입력 → 상품권 수신(알림톡/문자)',
    '받은 상품권 종류 확인하기',
  ],
};
const BARCODE = { id: 'barcode', label: '상품권 바코드', steps: ['잔액 확인', '바코드 제시', '결제'] };
const APP = {
  id: 'app',
  label: '앱 바코드',
  steps: ['사용 가능한 컬쳐캐쉬 잔액 확인', '앱 로그인 → 홈 → 바코드결제', '오프라인 제휴처에서 CU 선택', '바코드 확인 후 계산대에 제시'],
};

export const ROUTES = {
  'naver:integrated': {
    status: 'ok',
    headline: '사용 가능(전환 경유)',
    conditions: ['컬쳐캐쉬 충전 → Npay 전환', '안내 수수료 6%(최종 확인 필요)', '최소 1,000원', '휴대폰 본인인증', '명의 일치', '전환 후 취소 불가'],
    fee: { rate: 0.06, min: 1000, sourceId: 'npayCl' },
    primary: GUIDE,
    methods: [{
      id: 'npay',
      label: 'Npay 포인트 전환',
      steps: ['컬쳐랜드 앱 충전(PIN 입력 또는 상품권 속 바로충전 링크)', 'Npay 포인트 전환', '네이버쇼핑 결제 시 포인트 사용'],
    }],
    sourceIds: ['npayCl', 'npayNotice'],
  },
  'naver:offline': {
    status: 'blocked',
    headline: '이 경로 불가',
    conditions: ['컬쳐캐쉬 충전 불가'],
    primary: GO_CU,
    methods: [],
    next: GO_CU,
    sourceIds: ['faq'],
  },
  'naver:exchange': {
    status: 'via',
    headline: '교환 먼저',
    conditions: ['교환소에서 교환', '수령한 상품권 종류를 다시 확인'],
    primary: { label: '상품권 교환하기', action: 'guide' },
    methods: [EXCHANGE_METHOD],
    next: RETYPE,
    sourceIds: ['faq'],
  },
  'naver:gift18': {
    status: 'ok',
    headline: '다른 공식 경로 있음',
    conditions: ['컬쳐랜드 충전 불가', '(주)문화상품권에서 Npay 직접 전환', '수수료 6.5%', '일 20만원·월 50만원 한도'],
    fee: { rate: 0.065, min: null, sourceId: 'gift18' },
    primary: GUIDE,
    methods: [{
      id: 'npay18',
      label: '(주)문화상품권 Npay 전환',
      steps: ['(주)문화상품권에서 Npay 포인트로 직접 전환', '네이버쇼핑 결제 시 포인트 사용'],
    }],
    sourceIds: ['gift18', 'faq'],
  },
  'cu:integrated': {
    status: 'ok',
    headline: '사용 가능(2가지 방법)',
    conditions: [CU_STORE_NOTE],
    primary: GUIDE,
    methods: [BARCODE, APP],
    restricted: CU_RESTRICTED,
    sourceIds: ['cuHelp', 'appBarcode'],
  },
  'cu:offline': {
    status: 'ok',
    headline: '사용 가능(상품권 바코드만)',
    conditions: ['오프라인 전용 상품권은 컬쳐캐쉬 충전이 안 돼요', '상품권 바코드로 CU에서 결제', CU_STORE_NOTE],
    primary: GUIDE,
    methods: [BARCODE],
    restricted: CU_RESTRICTED,
    sourceIds: ['cuHelp'],
  },
  'cu:exchange': {
    status: 'via',
    headline: '교환 먼저',
    conditions: ['교환 후 수령한 상품권 종류 재확인', '모든 교환권이 CU 결제 가능 상품권이 된다고 가정하지 않음'],
    primary: { label: '상품권 교환하기', action: 'guide' },
    methods: [EXCHANGE_METHOD],
    next: RETYPE,
    sourceIds: ['faq'],
  },
  'cu:gift18': {
    status: 'unverified',
    headline: '미확인',
    conditions: ['발행사 공식 안내를 확인하세요'],
    primary: { label: '공식 발행사에서 확인하기', action: 'external', url: SOURCES.gift18.url },
    methods: [],
    sourceIds: ['gift18'],
  },
};

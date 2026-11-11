import { Badge } from '../ui.jsx';

const ICONS = {
  barcode: 'M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12',
  convert: 'M5 9h13l-3-3M19 15H6l3 3',
  shop: 'M5 8h14l-1 11H6L5 8zM9 8a3 3 0 0 1 6 0',
  coupon: 'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7zM14 7v10',
  find: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l4 4',
};

function Icon({ d }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 앱 홈 목업에서 동작하지 않는 아이콘. 흐리게 + aria-disabled
const MOCK_TILES = [
  { id: 'barcode', label: '바코드 결제' },
  { id: 'convert', label: '전환' },
  { id: 'shop', label: '쇼핑' },
  { id: 'coupon', label: '쿠폰' },
];

export default function Home({ go }) {
  return (
    <main className="screen">
      <h1 className="sr-only">문화상품권 사용 길잡이</h1>
      <div className="home-top">
        <img className="logo" src="/img/logo.png" alt="컬쳐랜드" width="193" height="18" />
        <Badge kind="proposal">앱 적용 제안 목업</Badge>
      </div>

      <section className="card stack" aria-label="컬쳐캐쉬 홈 목업">
        <div className="tabs-mock" aria-hidden="true">
          <span className="on">컬쳐캐쉬</span>
          <span>상품권</span>
          <span>혜택</span>
        </div>
        <div className="tile-grid">
          {MOCK_TILES.map((t) => (
            <button key={t.id} type="button" className="tile" aria-disabled="true" title="목업 아이콘(동작하지 않아요)">
              <span className="tile-icon"><Icon d={ICONS[t.id]} /></span>
              {t.label}
            </button>
          ))}
          <button type="button" className="tile tile-hl" onClick={() => go('search')}>
            <span className="tile-icon"><Icon d={ICONS.find} /></span>
            사용처 찾기
          </button>
        </div>
        <p className="small">컬쳐캐쉬 탭 아이콘 옆에 &lsquo;사용처 찾기&rsquo;를 두는 제안이에요.</p>
      </section>

      <p className="section-label">상품권을 받은 직후</p>
      <button type="button" className="card card-btn entry-card" onClick={() => go('search')}>
        <img src="/img/catsh-question.webp" alt="" width="56" height="76" />
        <span className="grow">
          <span className="small">상품권 받으셨나요?</span>
          <span className="card-title block">이 상품권 어디서 쓰지?</span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>
    </main>
  );
}

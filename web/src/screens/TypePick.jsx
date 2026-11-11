import { PLACES, VOUCHER_TYPES } from '../data.js';
import { Header } from '../ui.jsx';

// 사용처별 안내 문구. data.js 에 필드가 생기면 그쪽으로 옮긴다.
const INTRO = {
  naver: 'Npay를 통한 사용 경로가 있어요. 갖고 계신 상품권을 확인해 볼까요?',
  cu: '바코드로 결제할 수 있어요. 갖고 계신 상품권을 확인해 볼까요?',
};

export default function TypePick({ state, go }) {
  const place = PLACES.find((p) => p.id === state.placeId);
  if (!place) {
    return (
      <main className="screen">
        <Header title="상품권 종류 확인" onBack={() => go('search')} />
        <p className="lead">사용처를 먼저 골라 주세요.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => go('search')}>
          사용처 찾기
        </button>
      </main>
    );
  }

  return (
    <main className="screen">
      <Header title="상품권 종류 확인" onBack={() => go('search')} />
      <div>
        <span className="badge">{place.name} · {place.channel}</span>
      </div>
      <h2 className="title">{INTRO[place.id]}</h2>

      <section className="stack" aria-label="상품권 종류">
        {VOUCHER_TYPES.map((t) => (
          <button key={t.id} type="button" className="card card-btn" onClick={() => go('result', { typeId: t.id })}>
            <span className="grow">
              <span className="card-title block">{t.name}</span>
              <span className="small">{t.hint}</span>
            </span>
            <span className="chev" aria-hidden="true">›</span>
          </button>
        ))}
        <button type="button" className="card card-btn" onClick={() => go('helper')}>
          <img src="/img/catsh-question.webp" alt="" width="40" height="54" className="thumb" />
          <span className="grow">
            <span className="card-title block">잘 모르겠어요</span>
            <span className="small">번호 자릿수로 함께 찾아봐요</span>
          </span>
          <span className="chev" aria-hidden="true">›</span>
        </button>
      </section>
    </main>
  );
}

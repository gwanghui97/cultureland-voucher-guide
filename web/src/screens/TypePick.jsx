import { PLACES, SEARCH, VOUCHER_TYPES } from '../data.js';
import { ActionButton, Header } from '../ui.jsx';

export default function TypePick({ state, go }) {
  const place = PLACES.find((p) => p.id === state.placeId);
  if (!place) {
    return (
      <main className="screen">
        <Header title="상품권 종류 확인" onBack={() => go('search')} />
        <p className="lead">사용처를 먼저 골라 주세요.</p>
        <ActionButton action={SEARCH} go={go} primary />
      </main>
    );
  }

  return (
    <main className="screen">
      <Header title="상품권 종류 확인" onBack={() => go('search')} />
      {state.query ? (
        <p className="small">&ldquo;{state.query}&rdquo; → {place.name}에서 쓰는 방법을 찾고 있어요</p>
      ) : null}
      <div>
        <span className="badge">{place.name} · {place.channel}</span>
      </div>
      <h2 className="title">{place.intro}</h2>

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

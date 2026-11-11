import { useState } from 'react';
import { PLACES, SEARCH, VOUCHER_TYPES } from '../data.js';
import { calcPoints, getRoute } from '../logic.js';
import { ActionButton, Badge, Header, RestrictedBox, SourceLine } from '../ui.jsx';

const STATUS_LABEL = {
  ok: '사용 가능',
  via: '교환 먼저',
  blocked: '이 경로는 쓸 수 없어요',
  unverified: '미확인',
};

// 0.065 * 100 이 6.500000000000001 처럼 보이지 않게
const percent = (rate) => (rate * 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 });

function FeeCalc({ fee }) {
  const [value, setValue] = useState('10000');
  const amount = Number(value);
  const points = calcPoints(amount, fee);
  let message;
  if (points != null) message = `${points.toLocaleString('ko-KR')}P (수수료 ${percent(fee.rate)}%)`;
  // 1000.5 처럼 최소 금액은 넘지만 정수가 아닌 값은 '정확히' 문구로
  else if (fee.min != null && !(amount >= fee.min)) message = `최소 ${fee.min.toLocaleString('ko-KR')}원부터 전환돼요`;
  else if (fee.max != null && amount > fee.max) message = `최대 ${fee.max.toLocaleString('ko-KR')}원까지 계산돼요`;
  else message = '금액을 정확히 입력해 주세요';

  return (
    <section className="card stack" aria-labelledby="fee-title">
      <h3 id="fee-title" className="card-title">전환 금액 계산</h3>
      <div className="field">
        <label htmlFor="fee-amount" className="small">충전할 금액(원)</label>
        <input
          id="fee-amount"
          className="input"
          type="number"
          inputMode="numeric"
          min={fee.min ?? 1}
          max={fee.max}
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <p className={points != null ? 'fee-result' : 'fee-result fee-error'} aria-live="polite">
        {points != null ? <span className="small block">받는 포인트</span> : null}
        {message}
      </p>
      <SourceLine sourceIds={[fee.sourceId]} />
    </section>
  );
}

export default function Result({ state, go }) {
  const place = PLACES.find((p) => p.id === state.placeId);
  const type = VOUCHER_TYPES.find((t) => t.id === state.typeId);
  const route = place && type ? getRoute(place.id, type.id) : null;

  if (!route) {
    return (
      <main className="screen">
        <Header title="가능 여부" onBack={() => go('type')} />
        <p className="lead">사용처와 상품권 종류를 먼저 골라 주세요.</p>
        <ActionButton action={SEARCH} go={go} primary />
      </main>
    );
  }

  const showNext = route.next && route.next !== route.primary;

  return (
    <main className="screen">
      <Header title="가능 여부" onBack={() => go('type')} />
      <div className="row">
        <span className="badge">{place.name} · {place.channel}</span>
        <span className="badge">{type.name}</span>
        {type.otherIssuer ? <span className="badge">{type.otherIssuer}</span> : null}
      </div>

      <div className="stack tight">
        <div>
          <Badge kind={route.status}>{STATUS_LABEL[route.status]}</Badge>
        </div>
        <h2 className="title">{route.headline}</h2>
      </div>

      <RestrictedBox items={route.restricted} />

      <section className="card stack" aria-labelledby="cond-title">
        <div className="cond-head">
          {type.otherIssuer ? null : <img src="/img/catsh-safety.webp" alt="" width="40" height="54" className="thumb" />}
          <h3 id="cond-title" className="card-title">확인할 조건</h3>
        </div>
        <ul className="cond-list">
          {route.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        {/* 상태 배지가 이미 미확인이면 출처 줄에서 다시 달지 않는다 */}
        <SourceLine sourceIds={route.sourceIds} hideUnverified={route.status === 'unverified'} />
      </section>

      {route.fee ? <FeeCalc fee={route.fee} /> : null}

      <div className="stack">
        <ActionButton action={route.primary} go={go} primary />
        {showNext ? <ActionButton action={route.next} go={go} /> : null}
        {route.secondary ? <ActionButton action={route.secondary} go={go} /> : null}
      </div>
    </main>
  );
}

import { useState } from 'react';
import { CS, PLACES, VOUCHER_TYPES } from '../data.js';
import { getRoute } from '../logic.js';
import { ActionButton, Header, RestrictedBox, SourceLine } from '../ui.jsx';

function Steps({ method, checked, toggle }) {
  return (
    <ol className="steps">
      {method.steps.map((step, i) => {
        const key = `${method.id}:${i}`;
        return (
          <li key={key}>
            <label className="step">
              <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <span>{step}</span>
            </label>
          </li>
        );
      })}
    </ol>
  );
}

export default function Guide({ state, go }) {
  const place = PLACES.find((p) => p.id === state.placeId);
  const type = VOUCHER_TYPES.find((t) => t.id === state.typeId);
  const route = place && type ? getRoute(place.id, type.id) : null;
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState({});
  const [askHelp, setAskHelp] = useState(false);

  if (!route || route.methods.length === 0) {
    return (
      <main className="screen">
        <Header title="사용 방법" onBack={() => go('result')} />
        <p className="lead">이 조합에는 안내할 사용 방법이 없어요.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => go('search')}>
          사용처 찾기
        </button>
      </main>
    );
  }

  const method = route.methods[tab] ?? route.methods[0];
  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));
  const done = method.steps.every((_, i) => checked[`${method.id}:${i}`]);

  return (
    <main className="screen">
      <Header title="사용 방법" onBack={() => go('result')} />
      <div className="row">
        <span className="badge">{type.name}</span>
        {type.otherIssuer ? <span className="badge">{type.otherIssuer}</span> : null}
      </div>
      <h2 className="title">{place.name}에서 쓰는 방법</h2>

      <RestrictedBox items={route.restricted} />

      {route.methods.length > 1 ? (
        <div className="seg" role="tablist" aria-label="사용 방법">
          {route.methods.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              id={`tab-${m.id}`}
              aria-selected={i === tab}
              aria-controls="method-panel"
              className={i === tab ? 'seg-btn on' : 'seg-btn'}
              onClick={() => setTab(i)}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}

      <section
        id="method-panel"
        className="card stack"
        {...(route.methods.length > 1 ? { role: 'tabpanel', 'aria-labelledby': `tab-${method.id}` } : { 'aria-label': method.label })}
      >
        <h3 className="card-title">{method.label}</h3>
        <p className="small">따라 한 단계에 체크해 보세요.</p>
        <Steps method={method} checked={checked} toggle={toggle} />
        <SourceLine sourceIds={route.sourceIds} />
      </section>

      {done ? (
        <section className="notice done" aria-live="polite">
          {type.otherIssuer ? null : <img src="/img/kid-thumb.webp" alt="" width="56" height="56" />}
          <p className="card-title">모든 단계를 확인했어요</p>
        </section>
      ) : null}

      <div className="stack">
        {route.demoCharge ? (
          <button type="button" className="btn btn-primary btn-block" onClick={() => go('demoCharge')}>
            지금 충전하러 가기
          </button>
        ) : null}
        {route.next?.action === 'retype' ? <ActionButton action={route.next} go={go} primary /> : null}

        <button
          type="button"
          className="btn btn-block"
          aria-expanded={askHelp}
          aria-controls="guide-help"
          onClick={() => setAskHelp((v) => !v)}
        >
          번호가 인식 안 돼요
        </button>
        {askHelp ? (
          <div id="guide-help" className="notice stack tight">
            <p>자릿수와 종류를 다시 확인하세요.</p>
            <p>교환권이면 교환소에서 먼저 교환하세요.</p>
            <a className="link" href={`tel:${CS.tel}`}>{CS.label}</a>
          </div>
        ) : null}

        <button type="button" className="btn-text" onClick={() => go('search', { placeId: null })}>
          다른 사용처도 찾아보기
        </button>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { CS, PLACES, SEARCH, VOUCHER_TYPES } from '../data.js';
import { getRoute } from '../logic.js';
import { ActionButton, Header, RestrictedBox, SourceLine } from '../ui.jsx';

function Steps({ method, checked, toggle, go }) {
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
            {method.demoCharge && i === 0 ? (
              <button type="button" className="btn btn-primary btn-block" onClick={() => go('demoCharge')}>
                지금 충전하러 가기
              </button>
            ) : null}
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
        <ActionButton action={SEARCH} go={go} primary />
      </main>
    );
  }

  const method = route.methods[tab] ?? route.methods[0];
  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));
  const done = method.steps.every((_, i) => checked[`${method.id}:${i}`]);
  const retype = route.next?.action === 'retype';
  // 주 버튼은 하나. 충전·종류 재확인이 없으면 '다른 사용처 찾기'가 주 버튼
  const searchIsPrimary = !method.demoCharge && !retype;

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
        <Steps method={method} checked={checked} toggle={toggle} go={go} />
        <SourceLine sourceIds={route.sourceIds} />
      </section>

      {done ? (
        <section className="notice done" aria-live="polite">
          {type.otherIssuer ? null : <img src="/img/kid-thumb.webp" alt="" width="56" height="56" />}
          <p className="card-title">모든 단계를 확인했어요</p>
        </section>
      ) : null}

      <div className="stack">
        {retype ? <ActionButton action={route.next} go={go} primary /> : null}

        <button
          type="button"
          className="btn btn-block"
          aria-expanded={askHelp}
          aria-controls="guide-help"
          onClick={() => setAskHelp((v) => !v)}
        >
          {route.help.label}
        </button>
        {askHelp ? (
          <div id="guide-help" className="notice stack tight">
            {route.help.tips.map((t) => <p key={t}>{t}</p>)}
            <a className="link" href={`tel:${CS.tel}`}>{CS.label}</a>
          </div>
        ) : null}

        <ActionButton action={SEARCH} go={go} primary={searchIsPrimary} />
      </div>
    </main>
  );
}

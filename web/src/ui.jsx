import { SOURCES } from './data.js';

const CHECKED_LABEL = '2026.11.11';

export function Header({ title, onBack }) {
  return (
    <header className="header">
      {onBack ? (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="header-spacer" />
      )}
      {title ? <h1 className="header-title">{title}</h1> : null}
    </header>
  );
}

// kind: ok | via | blocked | unverified | changed | demo | proposal
export function Badge({ kind, children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function SourceLine({ sourceIds = [], hideUnverified = false }) {
  const items = sourceIds.map((id) => SOURCES[id]).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="sources">
      {items.map((s) => (
        <p key={s.id} className="source-line">
          <span>출처: {s.name} · 확인일 {CHECKED_LABEL}</span>
          {s.url ? (
            <>
              <span aria-hidden="true">·</span>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                원문 보기
              </a>
            </>
          ) : null}
          {s.status === 'changed' ? <Badge kind="changed">과거 공지와 차이</Badge> : null}
          {s.status === 'unverified' && !hideUnverified ? <Badge kind="unverified">미확인</Badge> : null}
        </p>
      ))}
    </div>
  );
}

// data.js 의 { label, action, placeId?, url? } 를 버튼 하나로 그린다. Result·Guide 공용
export function ActionButton({ action, go, primary = false }) {
  const cls = primary ? 'btn btn-block btn-primary' : 'btn btn-block';
  if (action.action === 'external') {
    return (
      <a className={cls} href={action.url} target="_blank" rel="noopener noreferrer">
        {action.label}
        <span className="sr-only">(새 창)</span>
      </a>
    );
  }
  const handlers = {
    guide: () => go('guide'),
    goPlace: () => go('type', { placeId: action.placeId, typeId: null }),
    retype: () => go('type', { typeId: null }),
    search: () => go('search'),
  };
  const onClick = handlers[action.action];
  if (!onClick) throw new Error(`unknown action: ${action.action}`);
  return (
    <button type="button" className={cls} onClick={onClick}>
      {action.label}
    </button>
  );
}

// CU 제한 품목. 결과·안내 화면 상단
export function RestrictedBox({ items }) {
  if (!items?.length) return null;
  return (
    <section className="notice notice-warn stack tight" aria-labelledby="restricted-title">
      <p id="restricted-title" className="card-title">결제 전에 확인하세요</p>
      <p>제한 품목: {items.join(', ')}</p>
    </section>
  );
}

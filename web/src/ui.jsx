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
        <span style={{ width: 8 }} />
      )}
      {title ? <h1 className="header-title">{title}</h1> : null}
    </header>
  );
}

// kind: ok | via | blocked | unverified | changed | demo | proposal
export function Badge({ kind, children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function SourceLine({ sourceIds = [] }) {
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
          {s.status === 'unverified' ? <Badge kind="unverified">미확인</Badge> : null}
        </p>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { CATEGORY_CHIPS, PLACES, SOURCES } from '../data.js';
import { matchPlace } from '../logic.js';
import { Header } from '../ui.jsx';

export default function Search({ go }) {
  const [query, setQuery] = useState('');
  const [notFound, setNotFound] = useState(false);
  const empty = query.trim() === '';

  const pick = (placeId) => go('type', { placeId });

  const onSubmit = (e) => {
    e.preventDefault();
    if (empty) return;
    const placeId = matchPlace(query);
    if (placeId) pick(placeId);
    else setNotFound(true);
  };

  return (
    <main className="screen">
      <Header title="사용처 찾기" onBack={() => go('home')} />
      <h2 className="title">문화상품권, 어디에서 쓰고 싶으세요?</h2>

      <form className="field" onSubmit={onSubmit} role="search">
        <label htmlFor="place-q" className="sr-only">사용처 또는 질문</label>
        <input
          id="place-q"
          className="input"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNotFound(false);
          }}
          placeholder="예: 네이버쇼핑, 편의점에서 쓸 수 있어?"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={empty}>
          찾기
        </button>
      </form>

      {notFound ? (
        <section className="notice stack" aria-live="polite">
          <p className="card-title">아직 안내 정보가 없는 사용처예요</p>
          <a className="link" href={SOURCES.cashUse.url} target="_blank" rel="noopener noreferrer">
            {SOURCES.cashUse.name} 원문 보기
          </a>
          <p className="small">지금 안내할 수 있는 사용처</p>
          <div className="row">
            {PLACES.map((p) => (
              <button key={p.id} type="button" className="chip" onClick={() => pick(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="stack">
        <p className="section-label">카테고리</p>
        <div className="row">
          {CATEGORY_CHIPS.map((c) => (
            <button key={c.label} type="button" className="chip" onClick={() => pick(c.placeId)}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="stack">
        <p className="section-label">인기 사용처</p>
        {PLACES.map((p) => (
          <button key={p.id} type="button" className="card card-btn" onClick={() => pick(p.id)}>
            <span className="grow">
              <span className="card-title block">{p.name}</span>
              <span className="small">{p.channel} · {p.category}</span>
            </span>
            <span className="chev" aria-hidden="true">›</span>
          </button>
        ))}
      </section>

      <p className="small center">AI 연동 없이 키워드로 찾아요</p>
    </main>
  );
}

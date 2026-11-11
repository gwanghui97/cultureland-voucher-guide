import { useState } from 'react';
import { VOUCHER_TYPES } from '../data.js';
import { Badge, Header } from '../ui.jsx';

const byId = Object.fromEntries(VOUCHER_TYPES.map((t) => [t.id, t]));

// 가상 번호(시연용). 실제 PIN 아님
const SAMPLE = {
  12: '1234-5678-9012',
  16: '1234-5678-9012-3456',
  18: '1234-5678-9012-345678',
};

function Digits({ n }) {
  return (
    <span className="digits">
      {n}
      <small>자리</small>
    </span>
  );
}

function SingleCard({ type, go }) {
  return (
    <button type="button" className="card card-btn" onClick={() => go('result', { typeId: type.id })}>
      <Digits n={type.digits} />
      <span className="grow stack tight">
        <span className="card-title">{type.name}</span>
        <span className="sample-num">{SAMPLE[type.digits]}</span>
        <span><Badge kind="demo">시연용</Badge></span>
      </span>
      <span className="chev" aria-hidden="true">›</span>
    </button>
  );
}

export default function Helper({ go }) {
  const [askHelp, setAskHelp] = useState(false);
  const sixteen = [byId.integrated, byId.offline];

  return (
    <main className="screen">
      <Header title="상품권 구분 도우미" onBack={() => go('type')} />
      <div className="helper-hero">
        <img src="/img/catsh-question.webp" alt="" width="84" height="113" />
        <h2 className="title">번호 자릿수를 세어 보세요</h2>
      </div>
      <p className="lead">내 상품권과 닮은 예시를 눌러 주세요.</p>

      <section className="stack" aria-label="자릿수 예시">
        <SingleCard type={byId.exchange} go={go} />

        <div className="card stack">
          <div className="sample-head">
            <Digits n={16} />
            <span className="grow stack tight">
              <span className="card-title">컬쳐랜드상품권</span>
              <span className="sample-num">{SAMPLE[16]}</span>
              <span><Badge kind="demo">시연용</Badge></span>
            </span>
          </div>
          <p className="small">같은 16자리라도 두 종류예요. 상품권에 적힌 이름으로 골라 주세요.</p>
          {sixteen.map((t) => (
            <button key={t.id} type="button" className="btn btn-block" onClick={() => go('result', { typeId: t.id })}>
              {t.name}
            </button>
          ))}
        </div>

        <SingleCard type={byId.gift18} go={go} />
      </section>

      <div className="notice stack">
        <p>자릿수는 단서일 뿐이에요. 발행사와 상품권에 적힌 이름도 확인하세요.</p>
        <p className="small">헌혈기념품 등 일부 12자리는 예외가 있어요.</p>
      </div>

      <button
        type="button"
        className="btn btn-block"
        aria-expanded={askHelp}
        aria-controls="helper-cs"
        onClick={() => setAskHelp((v) => !v)}
      >
        그래도 모르겠어요
      </button>
      {askHelp ? (
        <div id="helper-cs" className="notice stack">
          <p className="card-title">고객센터에 물어보세요</p>
          <a className="link" href="tel:15772111">고객센터 1577-2111</a>
          <p className="small">받은 메시지(알림톡·문자)에 적힌 발행사 이름도 함께 확인하세요.</p>
        </div>
      ) : null}
    </main>
  );
}

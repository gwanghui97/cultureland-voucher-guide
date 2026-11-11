import { Badge, Header } from '../ui.jsx';

export default function DemoCharge({ go }) {
  return (
    <main className="screen">
      <Header title="충전 (시연용)" onBack={() => go('guide')} />
      <div className="demo-badge">
        <Badge kind="demo">시연용</Badge>
      </div>
      <h2 className="title">실제 충전은 컬쳐랜드 앱에서 진행돼요</h2>
      <p className="lead">이 화면은 앱에서 이어질 충전 단계를 보여 주는 시연 화면이에요. 아무것도 저장하거나 전송하지 않아요.</p>

      <div className="card field">
        <label htmlFor="demo-pin" className="small">상품권 번호(시연용 예시)</label>
        <input id="demo-pin" className="input" type="text" value="1234-5678-****-****" disabled readOnly />
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={() => go('home', { placeId: null, typeId: null })}>
        처음으로
      </button>
    </main>
  );
}

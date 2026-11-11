import { useEffect, useState } from 'react';
import Home from './screens/Home.jsx';
import Search from './screens/Search.jsx';
import TypePick from './screens/TypePick.jsx';
import Helper from './screens/Helper.jsx';
import { Header } from './ui.jsx';

// Task 4 에서 Result·Guide·DemoCharge 로 교체한다.
function Pending({ go, label }) {
  return (
    <main className="screen">
      <Header title={label} onBack={() => go('type')} />
      <p className="placeholder">{label} (Task 4)</p>
    </main>
  );
}

const SCREENS = {
  home: Home,
  search: Search,
  type: TypePick,
  helper: Helper,
  result: (p) => <Pending {...p} label="결과 화면" />,
  guide: (p) => <Pending {...p} label="사용 방법 화면" />,
  demoCharge: (p) => <Pending {...p} label="시연 충전 화면" />,
};

export default function App() {
  const [state, setState] = useState({ screen: 'home', placeId: null, typeId: null });
  const go = (screen, patch) => setState((s) => ({ ...s, ...patch, screen }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);

  const Screen = SCREENS[state.screen] ?? Home;
  return (
    <div className="app">
      <Screen state={state} go={go} />
    </div>
  );
}

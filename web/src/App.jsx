import { useEffect, useState } from 'react';
import Home from './screens/Home.jsx';
import Search from './screens/Search.jsx';
import TypePick from './screens/TypePick.jsx';
import Helper from './screens/Helper.jsx';
import Result from './screens/Result.jsx';
import Guide from './screens/Guide.jsx';
import DemoCharge from './screens/DemoCharge.jsx';

const SCREENS = {
  home: Home,
  search: Search,
  type: TypePick,
  helper: Helper,
  result: Result,
  guide: Guide,
  demoCharge: DemoCharge,
};

export default function App() {
  const [state, setState] = useState({ screen: 'home', placeId: null, typeId: null, query: null });
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

import { Routes, Route } from 'react-router-dom';
import Game from './components/Game';
import MapCanvas from './components/MapCanvas';
import RootPage from './components/Root';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>Minigolfpeli</h1>
      <Routes>
        <Route path='editor' element={<MapCanvas />} />
        <Route path='/:gameId' element={<Game />} />
        <Route path='*' element={<RootPage />} />
      </Routes>
    </div>
  );
}

export default App;

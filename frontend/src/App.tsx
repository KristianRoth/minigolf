import { Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Editor from './pages/Editor';
import RootPage from './pages/Root';

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
      <Routes>
        <Route path='/editor' element={<Editor />} />
        <Route path='/editor/:mapId' element={<Editor />} />
        <Route path='/:gameId' element={<Game />} />
        <Route path='*' element={<RootPage />} />
      </Routes>
    </div>
  );
}

export default App;

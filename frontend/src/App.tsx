import { Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Editor from './pages/Editor';
import RootPage from './pages/Root';

function App() {
  return (
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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

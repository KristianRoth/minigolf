import { Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Editor from './pages/Editor';
import Lander from './pages/Lander';

function App() {
  return (
    <div className='flex-container' >
      <div className='bg-image' />
      <Routes>
        <Route path='/editor' element={<Editor />} />
        <Route path='/editor/:mapId' element={<Editor />} />
        <Route path='/:gameId' element={<Game />} />
        <Route path='*' element={<Lander />} />
      </Routes>
    </div>
  );
}

export default App;

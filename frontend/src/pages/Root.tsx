import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Row from '../components/Row';
import { GameMap } from '../types';
import MapController from '../controllers/MapController';

const RootPage: React.FC = () => {
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [maps, setMaps] = useState<GameMap[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [name, gameId]);

  useEffect(() => {
    const fetchMaps = async () => {
      const response = await fetch(`/api/game-maps`);
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  }, []);

  const handleNavigate = () => {
    if (name && gameId) {
      navigate('/' + gameId);
      setGameId('');
      localStorage.setItem(`game-${gameId}-name`, name);
    } else {
      setError('Syötä arvot');
    }
  };
  return (
    <div className='column'>
      <h1>Minigolfpeli</h1>

      <button onClick={() => navigate(`/editor`)}>Tästä nappulasta editoriin</button>

      <p>Syötä pelin id</p>
      <input
        value={gameId}
        onChange={({ target }) => setGameId(target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleNavigate();
          }
        }}
      />
      <p>Syötä nimesi</p>
      <input
        value={name}
        onChange={({ target }) => setName(target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleNavigate();
          }
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        <button className='btn' onClick={handleNavigate}>
          Liity
        </button>
      </p>

      {maps.map((m) => {
        // TODO: The images should probably be set in state.
        const canvas = document.createElement('canvas');
        const controller = new MapController(canvas);
        controller.setGameMap(m);
        controller.init();
        const imageSrc = canvas.toDataURL();
        return (
          <Row key={m.id}>
            <div className='column'>
              <h2>Kartta {m.id}</h2>
              <img src={imageSrc} width={400}></img>
            </div>
          </Row>
        );
      })}
    </div>
  );
};

export default RootPage;

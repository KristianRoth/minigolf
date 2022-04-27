import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RootPage: React.FC = () => {
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [name, gameId]);

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
    </div>
  );
};

export default RootPage;

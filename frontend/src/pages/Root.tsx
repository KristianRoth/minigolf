import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

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
      <h1 className='text-2xl text-center mb-4 font-bold'>MINIGOLFPELI</h1>
      <Input
        label="GAME ID"
        value={gameId}
        onChange={({ target }) => setGameId(target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleNavigate();
          }
        }}
      />
      <Input
        label="NAME"
        value={name}
        onChange={({ target }) => setName(target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleNavigate();
          }
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Button className="justify-self-center dets" onClick={handleNavigate}>
        JOIN
      </Button>

    </div>
  );
};

export default RootPage;

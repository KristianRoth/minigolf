import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RootPage: React.FC = () => {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/' + gameId);
    setGameId('');
  };
  return (
    <div>
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
      <button className='btn' onClick={handleNavigate}>
        Liity
      </button>
    </div>
  );
};

export default RootPage;

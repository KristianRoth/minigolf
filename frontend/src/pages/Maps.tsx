import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Row from '../components/Row';
import { GameMap } from '../types';
import MapController from '../controllers/MapController';
import Button from '../components/Button';
import Input from '../components/Input';
import { gameMapFromDTO } from '../utils/dto';

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const Maps: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [maps, setMaps] = useState<(GameMap & { img: string })[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaps = async () => {
      const response = await fetch(`/api/game-maps`);
      const data = await response.json();

      const maps = data.map((m: unknown) => {
        const map = gameMapFromDTO(m);
        const canvas = document.createElement('canvas');
        const controller = new MapController(canvas);
        controller.setGameMap(map);
        controller.init();
        const imageSrc = canvas.toDataURL();
        return { ...map, img: imageSrc };
      });
      setMaps(maps);
    };
    fetchMaps();
  }, []);

  const handleStartGame = async (mapId: string) => {
    const response = await fetch(`/api/init-game/${mapId}`);
    const { gameId } = await response.json();
    if (gameId) {
      navigate(`/${gameId}`);
    }
  };

  return (
    <div className='column'>
      <h1 className='text-2xl text-center mb-4 font-bold'>MINIGOLFPELI</h1>
      <Input label='NAME' value={name} onChange={({ target }) => setName(target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {maps.map((m) => {
        return (
          <Row key={m.id}>
            <div className='column'>
              <h2>Kartta {m.id}</h2>
              <img src={m.img} width={400}></img>
              <Row>
                <Button onClick={() => handleStartGame(m.id)}>Pelaa</Button>
                <span style={{ marginLeft: '5px' }}>
                  Pelattu: {m.stats.count}, Keskiarvo: {round(m.stats.sum / m.stats.count)}
                </span>
              </Row>
            </div>
          </Row>
        );
      })}
    </div>
  );
};

export default Maps;

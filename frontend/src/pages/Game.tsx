import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GameController from '../controllers/GameController';
import MapController from '../controllers/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useWebsocket from '../hooks/useWebsocket';
import { CanvasMouseEvent, GameEvent } from '../types';
import { BASE_URL, GameStorage } from '../utils/api';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import Row from '../components/Row';

const colors = ['red', 'blue', 'cyan', 'green', 'yellow', 'orange', 'maroon'];

const getUrl = (gameId: string) => {
  const name = GameStorage.getPlayerName(gameId);
  const id = GameStorage.getPlayerId(gameId);

  let url = `ws://${BASE_URL}/game/${gameId}?name=${name}`;
  if (id) {
    url = `${url}&id=${id}`;
  }
  return url;
};

function Game() {
  const [debug, setDebug] = useState(false);
  const [playerId, setPlayerId] = useState(0);
  const [balls, setBalls] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [mapId, setMapId] = useState<string>('');

  const [mapRef, mapController] = useCanvasController(MapController);
  const [gameRef, gameController] = useCanvasController(GameController);

  const navigate = useNavigate();
  const { gameId = '' } = useParams();

  const onMouseDown = (event: CanvasMouseEvent) => {
    const onShot = (value: GameEvent) => {
      sendMessage(JSON.stringify(value));
    };
    gameController?.handleMouseDown(event, onShot);
  };
  const onMouseMove = (event: CanvasMouseEvent) => {
    gameController?.handleMouseMove(event);
  };

  const onOpen = useCallback(() => {
    console.log('connected');
    setConnected(true);
  }, []);

  const onClose = useCallback(() => {
    console.log('disconnected');
    setConnected(false);
  }, []);

  const onMessage = useCallback(
    (payload: any) => {
      try {
        const event: GameEvent = JSON.parse(payload.data as any);
        if (event.type === 'UPDATE') {
          const newBalls = event.playerStates.map(({ id, x, y, name }) => {
            return {
              id,
              x,
              y,
              name,
              color: colors[id % colors.length],
            };
          });
          gameController?.setBalls(newBalls);
          setBalls(newBalls);
        } else if (event.type === 'INIT') {
          GameStorage.setPlayerId(gameId, event.playerId.toString());
          gameController?.setPlayerId(event.playerId);
          mapController?.setGameMap(event.gameMap);
          setPlayerId(event.playerId);
          setMapId(event.gameMap.id);
        } else if (event.type === 'TURN_BEGIN') {
          gameController?.setHasTurn(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [gameController, mapController, gameId]
  );

  const { connect, sendMessage, close } = useWebsocket({
    url: getUrl(gameId),
    onOpen,
    onMessage,
    onClose,
  });

  useEffect(() => {
    if (connected) return;
    connect();

    return () => {
      close();
    };
  }, []);

  const disconnect = () => {
    close();
    GameStorage.removePlayerId(gameId);
    GameStorage.removePlayerName(gameId);
    window.location.reload();
  };

  const goToEdit = () => {
    navigate(`/editor/${mapId}`);
  };

  const menu = (onClose: () => void) => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
          <button onClick={() => setDebug(!debug)}>Toggle debug</button>
        </div>
        <div>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
        <div>
          <button onClick={() => goToEdit()}>Edit</button>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'end' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <CanvasGroup menu={menu}>
        <Canvas ref={mapRef} />
        <Canvas ref={gameRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} />
      </CanvasGroup>
      {debug && (
        <Row>
          <pre style={{ width: '50%', marginLeft: 10 }}>
            {JSON.stringify({ playerId, len: balls.length, balls }, undefined, 2)}
          </pre>
        </Row>
      )}
    </>
  );
}

export default Game;

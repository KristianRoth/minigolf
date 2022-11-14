import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GameController from '../controllers/GameController';
import MapController from '../controllers/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useWebsocket from '../hooks/useWebsocket';
import { CanvasMouseEvent, GameEvent, GameMap } from '../types';
import { GameStorage } from '../utils/api';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import Row from '../components/Row';

const colors = ['red', 'blue', 'cyan', 'green', 'yellow', 'orange', 'maroon'];

const getUrl = (gameId: string) => {
  const name = GameStorage.getPlayerName(gameId);
  const id = GameStorage.getPlayerId(gameId);

  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const { host } = window.location;

  let url = `${protocol}://${host}/ws/game/${gameId}?name=${name}`;
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
  const [gameMap, setGameMap] = useState<GameMap | null>(null);

  const [mapRef, mapController] = useCanvasController(MapController);
  const [gameRef, gameController] = useCanvasController(GameController);

  const navigate = useNavigate();
  const { gameId = '' } = useParams();

  const onShot = (value: GameEvent) => {
    sendMessage(JSON.stringify(value));
  };

  const onPointerDown = (event: CanvasMouseEvent) => {
    gameController?.handleMouseDown(event, onShot);
  };
  const onPointerMove = (event: CanvasMouseEvent) => {
    gameController?.handleMouseMove(event);
  };
  const onPointerUp = (event: CanvasMouseEvent) => {
    gameController?.handleMouseUp(event, onShot);
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
          const newBalls = event.playerStates.map(({ id, x, y, name, shotCount }) => {
            return {
              id,
              x,
              y,
              name,
              shotCount,
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
          setGameMap(event.gameMap);
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
    if (!gameMap) return;
    GameStorage.setGameMap(gameMap);
    navigate(`/editor/${gameMap.id}`);
  };

  const menu = (
    <>
      <div>
        <button onClick={() => setDebug(!debug)}>Toggle debug</button>
      </div>
      <div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
      <div>
        <button onClick={() => goToEdit()}>Edit</button>
      </div>
    </>
  );
  return (
    <>
      <CanvasGroup menu={menu} help={<p>Siperia opettaa.</p>}>
        <Canvas ref={mapRef} />
        <Canvas ref={gameRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
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

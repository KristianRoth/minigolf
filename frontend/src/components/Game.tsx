import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWebsocket from '../hooks/useWebsocket';
import { CanvasMouseEvent, GameEvent } from '../types';
import GameController from '../game/GameController';
import MapController from '../game/MapController';
import Canvas from './Canvas';
import useCanvasController from '../hooks/useCanvasController';

const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

const colors = ['red', 'blue', 'cyan', 'black', 'green', 'yellow', 'orange', 'maroon'];

const getUrl = (gameId: string) => {
  let name = localStorage.getItem(`game-${gameId}-name`);
  if (!name) {
    name = `Anon-${(Date.now() + '').slice(-7)}`;
    localStorage.setItem(`game-${gameId}-name`, name);
  }

  const id = localStorage.getItem(`game-${gameId}-id`);

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

  const [mapRef, mapController] = useCanvasController(MapController);
  const [gameRef, gameController] = useCanvasController(GameController);

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
          localStorage.setItem(`game-${gameId}-id`, event.playerId + '');
          gameController?.setPlayerId(event.playerId);
          mapController?.setGameMap(event.gameMap);
          setPlayerId(event.playerId);
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
    localStorage.removeItem(`game-${gameId}-id`);
    localStorage.removeItem(`game-${gameId}-name`);
    window.location.reload();
  };

  return (
    <>
      <div tabIndex={-1} className='canvas-container'>
        <Canvas index={1} ref={mapRef} />
        <Canvas index={2} ref={gameRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} />
      </div>

      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block' }}>
          <button style={{ marginLeft: 10 }} onClick={() => setDebug(!debug)}>
            Toggle debug
          </button>
          <button style={{ marginLeft: 10 }} onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>

        {debug && (
          <pre style={{ width: '50%', marginLeft: 10 }}>
            {JSON.stringify({ playerId, len: balls.length, balls }, undefined, 2)}
          </pre>
        )}
      </div>
    </>
  );
}

export default Game;

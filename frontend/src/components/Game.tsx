import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWebsocket from '../hooks/useWebsocket';
import { GameEvent } from '../types';
import GameController from '../game/GameController';
import MapController from '../game/MapController';

const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

const colors = ['red', 'blue', 'cyan', 'black', 'green', 'yellow', 'orange', 'maroon'];

const ROOT_ID = 'game-root';

const mapController = new MapController(ROOT_ID, 1);
const gameController = new GameController(ROOT_ID, 2);

function Game() {
  const [debug, setDebug] = useState(false);
  const [playerId, setPlayerId] = useState(0);
  const [balls, setBalls] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  const { gameId } = useParams();

  const onOpen = useCallback(() => {
    console.log('connected');
    setConnected(true);
  }, []);

  const onClose = useCallback(() => {
    console.log('disconnected');
    setConnected(false);
  }, []);

  const onMessage = useCallback((payload: any) => {
    try {
      const event: GameEvent = JSON.parse(payload.data as any);
      if (event.type === 'UPDATE') {
        const newBalls = event.playerStates.map((state) => {
          return {
            x: state.x,
            y: state.y,
            color: colors[state.id % colors.length],
            id: state.id,
          };
        });
        gameController.setBalls(newBalls);
        setBalls(newBalls);
      } else if (event.type === 'INIT') {
        gameController.setPlayerId(event.playerId);
        mapController.setGameMap(event.gameMap);
        setPlayerId(event.playerId);
      } else if (event.type === 'TURN_BEGIN') {
        gameController.setHasTurn(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const { connect, sendMessage, close } = useWebsocket({
    url: `ws://${BASE_URL}/game/${gameId}`,
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

  useEffect(() => {
    mapController.init();
    gameController.init();

    const onShot = (value: GameEvent) => {
      sendMessage(JSON.stringify(value));
    };
    gameController.setOnShot(onShot);
    gameController.setPlayerId(playerId);

    return () => {
      mapController.destroy();
      gameController.destroy();
    };
  }, [connected, sendMessage]);

  return (
    <>
      <div id={ROOT_ID} className='canvas-container'></div>

      <div style={{ width: '100%', marginTop: 10 }}>
        <button style={{ marginLeft: 10 }} onClick={() => setDebug(!debug)}>
          Toggle debug
        </button>
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

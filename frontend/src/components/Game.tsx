import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from './GameCanvas';
import useWebsocket from '../hooks/useWebsocket';
import { GameEvent } from '../types';
import MapCanvas from './MapCanvas';

const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

const colors = ['red', 'blue', 'cyan', 'black', 'green', 'yellow', 'orange', 'maroon'];

function Game() {
  const [balls, setBalls] = useState<any[]>([]);
  const [playerId, setPlayerId] = useState(0);
  const [hasTurn, setHasTurn] = useState(false);

  const { gameId } = useParams();

  const onOpen = useCallback(() => {
    console.log('Connected!');
  }, []);

  const onMessage = useCallback((payload: any) => {
    try {
      const event: GameEvent = JSON.parse(payload.data as any);

      // TODO: Move gamecontroller here.
      if (event.type === 'UPDATE') {
        const newBalls = event.playerStates.map((state) => {
          return {
            x: state.x,
            y: state.y,
            color: colors[state.id % colors.length],
            id: state.id,
          };
        });
        setBalls(newBalls);
      } else if (event.type === 'INIT') {
        setPlayerId(event.playerId);
      } else if (event.type === 'TURN_BEGIN') {
        setHasTurn(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onClose = useCallback(() => {
    console.log('Disconnected!');
  }, []);

  const { connect, sendMessage } = useWebsocket({
    url: `ws://${BASE_URL}/game/${gameId}`,
    onOpen,
    onMessage,
    onClose,
  });

  const switchTurn = useCallback(() => {
    setHasTurn(false);
  }, [setHasTurn]);

  useEffect(() => {
    if (connect) connect();
  }, [connect]);

  return (
    <div style={{ display: 'grid' }}>
      <MapCanvas />
      <Canvas balls={balls} sendMessage={sendMessage} hasTurn={hasTurn} playerId={playerId} switchTurn={switchTurn} />
    </div>
  );
}

export default Game;

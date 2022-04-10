import React, { useCallback, useEffect, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import useWebsocket from './hooks/useWebsocket';
import { GameEvent } from './types';

const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

const colors = ['red', 'blue', 'cyan', 'black', 'green', 'yellow', 'orange', 'maroon'];

function App() {
  const [balls, setBalls] = useState<any[]>([]);

  const onOpen = useCallback(() => {
    console.log('Connected!');
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
        setBalls(newBalls);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onClose = useCallback(() => {
    console.log('Disconnected!');
  }, []);

  const { connect, sendMessage } = useWebsocket({
    url: `ws://${BASE_URL}/game/test`,
    onOpen,
    onMessage,
    onClose,
  });

  useEffect(() => {
    if (connect) connect();
  }, [connect]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>Minigolfpeli</h1>
      <GameCanvas balls={balls} sendAction={(event: GameEvent) => sendMessage(JSON.stringify(event))} />
    </div>
  );
}

export default App;

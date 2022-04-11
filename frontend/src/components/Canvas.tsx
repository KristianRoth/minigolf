import React, { useRef, useState, useEffect } from 'react';
import GameController from '../game/GameController';
import { Ball } from '../types';

type GameCanvasProps = {
  balls: Ball[];
  sendMessage: (payload: string) => void;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ balls, sendMessage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameController, setGameController] = useState<GameController | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const controller = new GameController(canvasRef.current, (payload) => sendMessage(JSON.stringify(payload)));
    setGameController(controller);

    controller.init();

    return () => {
      controller.destroy();
    };
  }, [sendMessage]);

  useEffect(() => {
    gameController?.setBalls(balls);
  }, [balls]);

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #000',
          marginTop: 10,
        }}
      ></canvas>

      <pre style={{ textAlign: 'left', marginLeft: window.innerWidth / 3 }}>
        {JSON.stringify(gameController?.debug, undefined, 2)}
      </pre>
    </div>
  );
};

export default GameCanvas;

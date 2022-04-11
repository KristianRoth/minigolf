import React, { useRef, useState, useEffect } from 'react';
import GameController from '../game/GameController';
import { Ball, GameEvent } from '../types';

type GameCanvasProps = {
  balls: Ball[];
  hasTurn: boolean;
  playerId: number;
  switchTurn: () => void;
  sendMessage: (payload: string) => void;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ balls, hasTurn, playerId, sendMessage, switchTurn }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameController, setGameController] = useState<GameController | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const doShot = (payload: GameEvent) => {
      switchTurn();
      sendMessage(JSON.stringify(payload));
    };
    const controller = new GameController(canvasRef.current, doShot);
    setGameController(controller);

    controller.init();

    return () => {
      controller.destroy();
    };
  }, [sendMessage, switchTurn]);

  useEffect(() => {
    if (!gameController) return;
    gameController.setBalls(balls);
    gameController.setHasTurn(hasTurn);
    gameController.setPlayerId(playerId);
  }, [balls, hasTurn, playerId, gameController]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #000',
          // marginTop: 10,
          zIndex: 2,
          // position: 'relative',
          // left: 10,
          // top: 100,
          gridColumn: 1,
          gridRow: 1,
        }}
      ></canvas>

      <pre style={{ textAlign: 'left', margin: 'auto' }}>{JSON.stringify(gameController?.debug, undefined, 2)}</pre>
    </>
  );
};

export default GameCanvas;

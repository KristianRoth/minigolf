import React, { useRef, useState, useEffect } from 'react';

const GAME_WIDTH = 4900;
const GAME_HEIGHT = 2500;
const BLOCK_SIZE = 50 * 2;

const RATIO = GAME_HEIGHT / GAME_WIDTH;

const MapCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    setContext(canvasRef.current.getContext('2d'));

    const canvas = canvasRef.current;

    const width = window.innerWidth - 30;
    const height = width * RATIO;

    canvas.width = width;
    canvas.height = height;

    if (!context) return;

    const drawGrid = () => {
      const brickSize = canvas.width / (GAME_WIDTH / BLOCK_SIZE);

      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = '#CDCACA';

      for (let x = 0; x < canvas.width; x += brickSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += brickSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
      }
      context.stroke();
    };

    const drawBrick = (x: number, y: number, color: string, isWall = false) => {
      const brickSize = canvas.width / (GAME_WIDTH / BLOCK_SIZE);

      context.save();

      if (isWall) {
        context.strokeStyle = 'black';
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowColor = 'black';
        context.shadowBlur = 15;
      }
      context.beginPath();
      context.rect(x, y, brickSize, brickSize);
      context.fillStyle = color;
      context.fill();
      context.closePath();

      context.restore();
    };

    const drawBricks = () => {
      const brickSize = canvas.width / (GAME_WIDTH / BLOCK_SIZE);

      const xCount = Math.round(canvas.width / brickSize);
      const yCount = Math.round(canvas.height / brickSize);
      for (let x = xCount - 1; x >= 0; x -= 1) {
        for (let y = yCount - 1; y >= 0; y -= 1) {
          const isBorder = x === 0 || y === 0 || x === xCount - 1 || y === yCount - 1;
          const isMiddleAndUp = Math.abs(x - xCount / 2) < 2 && y < 0.65 * yCount;
          if (isBorder || isMiddleAndUp) {
            drawBrick(x * brickSize, y * brickSize, '#c6c6c6', true);
          } else {
            drawBrick(x * brickSize, y * brickSize, '#13a713');
          }
        }
      }

      for (let x = xCount - 1; x >= 0; x -= 1) {
        for (let y = yCount - 1; y >= 0; y -= 1) {
          const isBorder = x === 0 || y === 0 || x === xCount - 1 || y === yCount - 1;
          const isMiddleAndUp = Math.abs(x - xCount / 2) < 2 && y < 0.65 * yCount;
          if (isBorder || isMiddleAndUp) {
            drawBrick(x * brickSize, y * brickSize, '#c6c6c6', false);
          }
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      drawBricks();
    };

    const handleResize = () => {
      const width = window.innerWidth - 30;
      const height = width * RATIO;

      canvas.width = width;
      canvas.height = height;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [context]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '2px solid #000',
        zIndex: 1,
        gridColumn: 1,
        gridRow: 1,
      }}
    ></canvas>
  );
};

export default MapCanvas;

import React, { useRef, useState, useEffect } from 'react';
import { GameEvent } from '../types';

type Point = {
  x: number;
  y: number;
};

const clamp = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const distanceSquared = (point1: Point, point2: Point): number => {
  return Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
};

const distance = (point1: Point, point2: Point): number => {
  return Math.sqrt(distanceSquared(point1, point2));
};

type Ball = Point & { color: string; id: number };

type GameCanvasProps = {
  balls: Ball[];
  sendAction: (action: GameEvent) => void;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ balls, sendAction }) => {
  const BALL_RADIUS = 50;
  const MAX_LINE_LEN = 1000;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [shotLine, setShotLine] = useState<{ start: Point; end: Point } | null>(null);
  const [shotBallId, setShotBallId] = useState<number | null>(null);

  const [debug, setDebug] = useState<any>({});

  const setDimensions = () => {
    const width = window.innerWidth - 30;
    const height = width * (25 / 49);

    setWidth(width);
    setHeight(height);
  };

  const c = (value: number): number => {
    return clamp(value, 0, 4900, 0, width);
  };

  const dc = (value: number): number => {
    return clamp(value, 0, width, 0, 4900);
  };

  const calcEndpoint = (line: { start: Point; end: Point }) => {
    const { start, end } = line;

    const lineLength = distance(start, end);

    const vect = {
      x: (end.x - start.x) / lineLength,
      y: (end.y - start.y) / lineLength,
    };

    const realLength = Math.min(MAX_LINE_LEN, lineLength);

    const point: Point = {
      x: start.x + vect.x * realLength,
      y: start.y + vect.y * realLength,
    };

    return point;
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    setDimensions();
    const renderCtx = canvasRef.current.getContext('2d');
    setContext(renderCtx);

    const handleResize = () => {
      setDimensions();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (const ball of balls) {
      context.beginPath();
      context.fillStyle = ball.color;
      context.arc(c(ball.x), c(ball.y), c(BALL_RADIUS), 0, Math.PI * 2, true);
      context.fill();
      context.fillStyle = '#000';
      context.closePath();
    }

    if (shotLine) {
      const { start } = shotLine;
      const point = calcEndpoint(shotLine);
      // Draw our path
      context.beginPath();
      context.moveTo(c(start.x), c(start.y));
      context.lineTo(c(point.x), c(point.y));
      context.stroke();
    }
  }, [context, balls, shotLine]);

  useEffect(() => {
    if (!canvasRef.current || !context) return;

    const canvasElement = canvasRef.current;
    const canvasOffsetLeft = canvasElement.offsetLeft;
    const canvasOffsetTop = canvasElement.offsetTop;

    const handleMouseDown = (evt: MouseEvent) => {
      const clickedAt = {
        x: dc(evt.clientX - canvasOffsetLeft),
        y: dc(evt.clientY - canvasOffsetTop),
      };

      for (const ball of balls) {
        const isWithinBall = distanceSquared(clickedAt, ball) <= Math.pow(BALL_RADIUS, 2);
        if (isWithinBall) {
          setShotLine({ start: { x: ball.x, y: ball.y }, end: { ...clickedAt } });
          setShotBallId(ball.id);
          break;
        }
      }
    };

    const handleMouseUp = () => {
      if (shotLine && shotBallId) {
        const point = calcEndpoint(shotLine);
        sendAction({
          type: 'SHOT',
          x: point.x,
          y: point.y,
          id: shotBallId,
        });
      }
      setShotBallId(null);
      setShotLine(null);
    };

    const handleMouseMove = (evt: MouseEvent) => {
      const position = {
        x: dc(evt.clientX - canvasOffsetLeft),
        y: dc(evt.clientY - canvasOffsetTop),
      };

      setDebug(position);

      if (!shotLine) return;

      setShotLine({ ...shotLine, end: position });
    };

    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('mouseup', handleMouseUp);
    canvasElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('mousedown', handleMouseDown);
        canvasElement.removeEventListener('mouseup', handleMouseUp);
        canvasElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [context, balls, shotLine]);

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #000',
          marginTop: 10,
        }}
      ></canvas>
      <pre>{JSON.stringify(debug, undefined, 2)}</pre>
    </div>
  );
};

export default GameCanvas;

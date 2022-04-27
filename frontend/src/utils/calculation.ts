import { Point, Rotation } from '../types';
import { MAX_LINE_LEN } from './constants';

export const clamp = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

export const distanceSquared = (point1: Point, point2: Point): number => {
  return Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
};

export const distance = (point1: Point, point2: Point): number => {
  return Math.sqrt(distanceSquared(point1, point2));
};

const calcEndpoint = (start: Point, end: Point) => {
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

export const calculateLineEndPoints = (
  ballAt: Point,
  mouseAt: Point,
  rotation: Rotation
): { shot: Point; guide: Point } => {
  const guide = calcEndpoint(ballAt, mouseAt);
  const shot = (() => {
    const dx = guide.x - ballAt.x;
    const dy = guide.y - ballAt.y;
    switch (rotation) {
      case 'North':
        return guide;
      case 'East':
        return {
          x: ballAt.x - dy,
          y: ballAt.y + dx,
        };
      case 'South':
        return {
          x: ballAt.x - dx,
          y: ballAt.y - dy,
        };
      case 'West':
        return {
          x: ballAt.x + dy,
          y: ballAt.y - dx,
        };
    }
  })();
  return { guide, shot };
};

export const modulo = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export class PerSecondCounter {
  private length: number;
  private values: number[] = [];
  private lastTime: number = Date.now();

  constructor(length = 5) {
    this.length = length;
  }

  add() {
    const now = Date.now();
    const value = now - this.lastTime;
    this.values.unshift(value);
    this.values = this.values.slice(0, this.length);
    this.lastTime = now;
  }

  get value() {
    const avg = this.values.reduce((s, x) => s + x, 0) / this.length;
    return 1000 / avg;
  }
}

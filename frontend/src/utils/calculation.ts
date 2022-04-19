import { Point } from '../types';

export const clamp = (value: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

export const distanceSquared = (point1: Point, point2: Point): number => {
  return Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
};

export const distance = (point1: Point, point2: Point): number => {
  return Math.sqrt(distanceSquared(point1, point2));
};

export const calcEndpoint = (start: Point, end: Point, maxLength: number) => {
  const lineLength = distance(start, end);

  const vect = {
    x: (end.x - start.x) / lineLength,
    y: (end.y - start.y) / lineLength,
  };

  const realLength = Math.min(maxLength, lineLength);

  const point: Point = {
    x: start.x + vect.x * realLength,
    y: start.y + vect.y * realLength,
  };

  return point;
};

export const modulo = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

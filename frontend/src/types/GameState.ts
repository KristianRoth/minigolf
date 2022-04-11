export type Point = {
  x: number;
  y: number;
};

export type Ball = Point & { color: string; id: number };

export type GameState = {
  balls: Ball[];
};

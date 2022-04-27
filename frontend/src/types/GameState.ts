export type Point = {
  x: number;
  y: number;
};

export type Ball = Point & { color: string; id: number; name: string; shotCount: number };

export type GameState = {
  balls: Ball[];
};

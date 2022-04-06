export type GameMap = {
  id: string;
  name: string;
  creator: Creator;
  highscores: Score[];
  tiles: Tile[];
};

export type Tile = {
  x: number;
  y: number;
  ground: Ground;
  structure: Structure;
};

export type Structure = {
  type: 'WALL' | 'PORTAL';
  rotation: Rotation;
};

export type Ground = {
  type: 'SAND' | 'GRASS' | 'WATER';
  rotation: Rotation;
};

export enum Rotation {
  'NORTH',
  'EAST',
  'SOUTH',
  'WEST',
  'M-NORTH',
  'M-EAST',
  'M-SOUTH',
  'M-WEST'
}

export type GroundType = 'SAND' | 'GRASS' | 'WATER';
export type Score = any;
export type Creator = any;

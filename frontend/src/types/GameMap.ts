import { Point } from './GameState';

export enum Rotation {
  North,
  East,
  South,
  West,
}

export const ROTATIONS = Object.keys(Rotation).filter((v) => isNaN(Number(v)));

export enum StructureType {
  None,
  Wall,
  Circle,
  Start,
  Hole,
  Wedge,
  RoundedCorner,
  InvertedRoundedCorner,
}
export const STRUCTURE_TYPES = Object.keys(StructureType).filter((v) => isNaN(Number(v)));

export enum GroundType {
  Grass,
  Water,
  Gravel,
  GravelHeavy,
  Slope,
  SlopeDiagonal,
}

export const GROUND_TYPES = Object.keys(GroundType).filter((v) => isNaN(Number(v)));

export type Structure = {
  type: StructureType;
  rotation: Rotation;
};
export type Ground = {
  type: GroundType;
  rotation: Rotation;
};

export type GameMap = {
  id: string;
  name: string;
  creator: Creator;
  highscores: Score[];
  tiles: Tile[];
  stats: {
    sum: number;
    count: number;
  };
};

export type Tile = {
  pos: Point;
  ground: Ground;
  structure: Structure;
};

export type Score = any;
export type Creator = any;

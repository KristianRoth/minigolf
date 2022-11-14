import { Point } from './GameState';

export const ROTATIONS = ['North', 'East', 'South', 'West'] as const;
export type Rotation = typeof ROTATIONS[number];

const staticStructures = ['None', 'Start', 'Hole', 'Wall', 'Circle', 'Portal'] as const;
const rotateStructures = ['Wedge', 'RoundedCorner', 'InvertedRoundedCorner'] as const;
export const STRUCTURE_TYPES = [...staticStructures, ...rotateStructures] as const;

export type StaticStructure = {
  type: typeof staticStructures[number];
};
export type RotateStructure = {
  type: typeof rotateStructures[number];
  rotation: Rotation;
};
export type Structure = StaticStructure | RotateStructure;
export type StructureType = typeof STRUCTURE_TYPES[number];

const staticGroundTypes = ['Grass', 'Gravel', 'GravelHeavy', 'Water'] as const;
const rotateGroundTypes = ['Slope', 'SlopeDiagonal'] as const;
export const GROUND_TYPES = [...staticGroundTypes, ...rotateGroundTypes] as const;

export type StaticGroundType = {
  type: typeof staticGroundTypes[number];
};
export type RotateGroundType = {
  type: typeof rotateGroundTypes[number];
  rotation: Rotation;
};

export type Ground = StaticGroundType | RotateGroundType;

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

import { Point } from './GameState';

export type GameMap = {
  id: string;
  name: string;
  creator: Creator;
  highscores: Score[];
  tiles: Tile[];
};

export type Tile = {
  pos: Point;
  groundType: GroundType;
  structureType: StructureType;
};

type StructureType = 'Wall' | 'Portal' | 'Circle' | 'None';
export type Structure = {
  type: StructureType;
  rotation: Rotation;
};

type GroundType = 'Sand' | 'Grass' | 'Water';
export type Ground = {
  type: GroundType;
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
  'M-WEST',
}

export type Score = any;
export type Creator = any;

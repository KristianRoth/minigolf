import { Point } from './GameState';

const staticStructures = ['Start', 'Hole', 'Wall', 'Circle', 'Portal', 'None'] as const;
const rotateStructures = ['Wedge', 'Rounded_Corner', 'Inverted_Rounded_Corner'] as const;
export const structureTypes = [...staticStructures, ...rotateStructures] as const;

export type StaticStructure = {
  type: typeof staticStructures[number];
};
export type RotateStructure = {
  type: typeof rotateStructures[number];
  rotation: Rotation;
};

export type Structure = StaticStructure | RotateStructure;

export type StructureType = typeof structureTypes[number];

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
  structure: Structure;
};

export type GroundType = 'Sand' | 'Grass' | 'Water';
export type Rotation = 'North' | 'East' | 'South' | 'West';

export type Score = any;
export type Creator = any;

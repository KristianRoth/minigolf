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
  structure: Structure;
};

export type Structure = StaticStructure | RotateStructure

export type StaticStructure = {
  type: 'Wall' | 'Portal' | 'Circle' | 'Start' | 'Hole' | 'None'
}
export type RotateStructure = {
  type: 'Wedge' | 'Rounded_Corner' | 'Inverted_Rounded_Corner';
  rotation: Rotation;
}

export type StructureType = 'Wall' | 'Portal' | 'Circle' | 'Start' | 'Hole' | 'Wedge' | 'Rounded_Corner' | 'Inverted_Rounded_Corner' | 'None';
export type GroundType = 'Sand' | 'Grass' | 'Water';
export type Rotation = 'North' | 'East' | 'South' | 'West';


// export type Structure = {
//   type: StructureType;
//   rotation: Rotation;
// };
// export type Ground = {
//   type: GroundType;
//   rotation: Rotation;
// };

export type Score = any;
export type Creator = any;

export * from './Communication';
export * from './GameMap';
export * from './GameState';

export type Message = {
  user: string;
  value: string;
};

export type CanvasMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

export type EditorState = {
  mode: 'Structure' | 'Ground';
  structureIdx: number;
  groundIdx: number;
  rotationIdx: number;
  mapName: string;
  creator: string;
};

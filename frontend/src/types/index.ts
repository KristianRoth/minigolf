export * from './Communication';
export * from './GameMap';
export * from './GameState';

export type Message = {
  user: string;
  value: string;
};

export type CanvasMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

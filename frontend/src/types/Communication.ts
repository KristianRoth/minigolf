import { GameMap } from './GameMap';

export type GameEvent = Init | Update | Victory;

type EventType = 'INIT' | 'JOIN' | 'UPDATE' | 'VICTORY';

type BaseEvent<T extends EventType> = {
  user: string;
  type: T;
};

type Init = BaseEvent<'INIT'> & {
  mapId: GameMap['id'];
  players: string[];
};

type Update = BaseEvent<'UPDATE'> & {
  playerStates: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  }[];
};

type Victory = BaseEvent<'VICTORY'> & {
  player: string;
};

// type Join = BaseEvent & {
//   bar: string;
// }

// type Leave = BaseEvent & {
//   bar: string;
// }

// type Shot = BaseEvent & {
//   bar: string;
// }

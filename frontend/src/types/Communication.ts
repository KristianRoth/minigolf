import { GameMap } from './GameMap';

export type GameEvent = Init | Update | Victory | Chat | Shot;

type EventType = 'INIT' | 'JOIN' | 'UPDATE' | 'VICTORY' | 'CHAT' | 'SHOT';

type BaseEvent<T extends EventType> = {
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
    id: number;
  }[];
};

type Victory = BaseEvent<'VICTORY'> & {
  player: string;
};

type Chat = BaseEvent<'CHAT'> & {
  message: string;
};

type Shot = BaseEvent<'SHOT'> & {
  id: number;
  x: number;
  y: number;
};

// type Join = BaseEvent & {
//   bar: string;
// }

// type Leave = BaseEvent & {
//   bar: string;
// }

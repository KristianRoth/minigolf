import { GameMap } from './GameMap';

export type GameEvent =
  | {
      type: 'UPDATE';
      playerStates: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        id: number;
      }[];
    }
  | {
      type: 'SHOT';
      id: number;
      x: number;
      y: number;
    }
  | {
      type: 'INIT';
      mapId: GameMap['id'];
      players: string[];
    }
  | {
      type: 'JOIN';
    }
  | {
      type: 'VICTORY';
      player: string;
    }
  | {
      type: 'CHAT';
      message: string;
    };

// type Join = BaseEvent & {
//   bar: string;
// }

// type Leave = BaseEvent & {
//   bar: string;
// }

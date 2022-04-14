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
        name: string;
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
      playerId: number;
      gameMap: GameMap;
      // players: string[];
    }
  | {
      type: 'TURN_BEGIN';
      playerId: number;
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

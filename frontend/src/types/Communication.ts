import { GameMap } from './GameMap';

export type UpdateEvent = {
  type: 'UPDATE';
  playerStates: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    id: number;
    name: string;
    shotCount: number;
  }[];
};

export type ShotEvent = {
  type: 'SHOT';
  id: number;
  x: number;
  y: number;
};

export type InitEvent = {
  type: 'INIT';
  playerId: number;
  gameMap: GameMap;
  isDemo: boolean;
  // players: string[];
};

export type TurnBeginEvent = {
  type: 'TURN_BEGIN';
  playerId: number;
};
export type JoinEvent = {
  type: 'JOIN';
};

export type EffectEvent = {
  type: 'EFFECT';
  value: string;
};

export type SaveDemoMapEvent = {
  type: 'SAVE_DEMO_MAP';
  jwt: string;
};

export type VictoryEvent = {
  type: 'VICTORY';
  player: string;
};

export type ChatEvent = {
  type: 'CHAT';
  message: string;
};

export type GameEvent =
  | UpdateEvent
  | ShotEvent
  | InitEvent
  | TurnBeginEvent
  | JoinEvent
  | VictoryEvent
  | ChatEvent
  | EffectEvent
  | SaveDemoMapEvent;

import { GameMap } from './GameMap';

export type InitEvent = {
  type: 'INIT';
  playerId: number;
  name: string;
};

export type JoinEvent = {
  type: 'JOIN';
  playerId: number;
  name: string;
};

export type StartMapEvent = {
  type: 'START_MAP';
  playerId: number;
  gameMap: GameMap;
  isDemo: boolean;
};

export type IsReadyEvent = {
  type: 'IS_READY';
  value: boolean;
};

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
  x: number;
  y: number;
};

export type TurnBeginEvent = {
  type: 'TURN_BEGIN';
  playerId: number;
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
  | InitEvent
  | JoinEvent
  | StartMapEvent
  | UpdateEvent
  | ShotEvent
  | TurnBeginEvent
  | JoinEvent
  | VictoryEvent
  | ChatEvent
  | EffectEvent
  | SaveDemoMapEvent
  | IsReadyEvent;

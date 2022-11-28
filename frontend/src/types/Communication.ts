type GameMapDto = any;

export enum PlayerStatus {
  IsWaiting,
  IsReady,
  IsTurn,
  IsMoving,
  IsHole,
}

export type InitEvent = {
  type: 'INIT';
  playerId: number;
  name: string;
  token: string;
};

export type JoinEvent = {
  type: 'JOIN';
  playerId: number;
  name: string;
};

export type ReconnectEvent = {
  type: 'RECONNECT';
  playerId: number;
  name: string;
  gameMap: GameMapDto;
  isDemo: boolean;
  isTurn: boolean;
};

export type StartMapEvent = {
  type: 'START_MAP';
  playerId: number;
  gameMap: GameMapDto;
  isDemo: boolean;
};

export type EndMapEvent = {
  type: 'END_MAP';
  scores: {
    [playerId: string]: number[]; // List of scores for each player.
  };
  isGameOver: boolean;
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

export type StatusChangeEvent = {
  type: 'STATUS_CHANGE';
  playerId: number;
  status: PlayerStatus;
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
  | ReconnectEvent
  | StartMapEvent
  | EndMapEvent
  | UpdateEvent
  | ShotEvent
  | StatusChangeEvent
  | JoinEvent
  | VictoryEvent
  | ChatEvent
  | EffectEvent
  | SaveDemoMapEvent
  | IsReadyEvent;

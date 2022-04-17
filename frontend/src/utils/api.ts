import { GameMap } from '../types';

export const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

const n = (gameId: string) => `game-${gameId}-name`;
const i = (gameId: string) => `game-${gameId}-id`;
const m = (mapId: string) => `gameMap-${mapId}`;

export const GameStorage = {
  // Player-name
  setPlayerName: (gameId: string, name: string) => {
    localStorage.setItem(n(gameId), name);
  },
  getPlayerName: (gameId: string) => {
    let name = localStorage.getItem(n(gameId));
    if (!name) {
      name = `Anon-${(Date.now() + '').slice(-7)}`;
      localStorage.setItem(n(gameId), name);
    }
    return name;
  },
  removePlayerName: (gameId: string) => {
    localStorage.removeItem(n(gameId));
  },
  // Player-id
  setPlayerId: (gameId: string, id: string) => {
    localStorage.setItem(i(gameId), id);
  },
  getPlayerId: (gameId: string) => {
    return localStorage.getItem(i(gameId));
  },
  removePlayerId: (gameId: string) => {
    localStorage.removeItem(i(gameId));
  },
  // Game-map
  getGameMap: (mapId = '') => {
    const mapString = localStorage.getItem(m(mapId));
    if (mapString) {
      return JSON.parse(mapString) as GameMap;
    }
    return null;
  },
  setGameMap: (gameMap: GameMap) => {
    localStorage.setItem(m(gameMap.id), JSON.stringify(gameMap));
  },
  removeGameMap: (mapId = '') => {
    localStorage.removeItem(m(mapId));
  },
};

import { GameMap } from '../types';

const n = (gameId: string) => `game-${gameId}-name`;
const i = (gameId: string) => `game-${gameId}-id`;
const t = (gameId: string) => `game-${gameId}-token`;
const m = (mapId: string) => `gameMap-${mapId}`;

// TODO: Deprecate this.
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
  // Player-id
  setPlayerToken: (gameId: string, token: string) => {
    localStorage.setItem(t(gameId), token);
  },
  getPlayerToken: (gameId: string) => {
    return localStorage.getItem(t(gameId));
  },
  removePlayerToken: (gameId: string) => {
    localStorage.removeItem(t(gameId));
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
  getSavedMaps: () => {
    const maps: GameMap[] = [];
    for (const key in localStorage) {
      if (key.indexOf('gameMap') === 0) {
        const map = JSON.parse(localStorage.getItem(key) as string) as GameMap;
        maps.push(map);
      }
    }
    return maps;
  },
};

type FetchErrorDetails = {
  status: number;
  data: unknown;
};
class FetchError extends Error {
  details: FetchErrorDetails;

  constructor(msg: string, details: FetchErrorDetails) {
    super(msg);

    this.details = details;

    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

export const isFetchError = (err: unknown): err is FetchError => {
  return err instanceof FetchError;
};

type JSONFetchOptions =
  | {
      method?: RequestInit['method'];
      body?: Record<string, any>;
      headers?: RequestInit['headers'];
    }
  | undefined;

export const JSONFetch = async (url: string, options: JSONFetchOptions = {}): Promise<Record<string, any>> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new FetchError(response.statusText, { status: response.status, data });
  }
  return data;
};

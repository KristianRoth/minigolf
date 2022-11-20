import { GameMap, Tile } from '../types';
import { BLOCK_SIZE, GAME_HEIGHT } from './constants';

export const gameMapFromDTO = (dto: any): GameMap => {
  const tiles: Tile[] = [];
  (dto.tiles as string[][]).forEach((col, x) => {
    col.forEach((tileStr, y) => {
      const [gType, gRot, sType, sRot] = tileStr.split(',').map((val) => parseInt(val));

      const tile: Tile = {
        pos: {
          x: x * BLOCK_SIZE,
          y: y * BLOCK_SIZE,
        },
        ground: {
          type: gType,
          rotation: gRot,
        },
        structure: {
          type: sType,
          rotation: sRot,
        },
      };
      tiles.push(tile);
    });
  });

  return {
    ...dto,
    tiles,
  };
};

export const gameMapToDTO = (gameMap: GameMap): any => {
  const cols = GAME_HEIGHT / BLOCK_SIZE;
  const tiles: string[][] = [];
  for (let i = 0; i < gameMap.tiles.length; i += cols) {
    const tile_strings = gameMap.tiles.slice(i, i + cols).map((tile) => {
      return [tile.ground.type, tile.ground.rotation, tile.structure.type, tile.structure.rotation].join(',');
    });
    tiles.push(tile_strings);
  }

  return {
    ...gameMap,
    tiles,
  };
};

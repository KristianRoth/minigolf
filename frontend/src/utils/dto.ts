import { GameMap, Tile } from '../types';
import { BLOCK_SIZE, SIZE_X, SIZE_Y } from './constants';

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
  const tiles: string[][] = Array(SIZE_X)
    .fill('')
    .map(() => Array(SIZE_Y).fill(''));
  for (const tile of gameMap.tiles) {
    const x = Math.round(tile.pos.x / BLOCK_SIZE);
    const y = Math.round(tile.pos.y / BLOCK_SIZE);
    tiles[x][y] = [tile.ground.type, tile.ground.rotation, tile.structure.type, tile.structure.rotation].join(',');
  }

  return {
    ...gameMap,
    tiles,
  };
};

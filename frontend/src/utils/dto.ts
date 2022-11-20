import { GameMap, Tile, Rotation } from '../types';
import { BLOCK_SIZE, GAME_HEIGHT } from './constants';

enum Rot {
  North,
  East,
  South,
  West,
}

enum Struct {
  None,
  Wall,
  Circle,
  Start,
  Hole,
  Wedge,
  RoundedCorner,
  InvertedRoundedCorner,
}

enum Grnd {
  Grass,
  Water,
  Gravel,
  GravelHeavy,
  Slope,
  SlopeDiagonal,
}

const rotations: Rotation[] = ['North', 'East', 'South', 'West'];

const structures = ['None', 'Wall', 'Circle', 'Start', 'Hole', 'Wedge', 'RoundedCorner', 'InvertedRoundedCorner'];

const grounds = ['Grass', 'Water', 'Gravel', 'GravelHeavy', 'Slope', 'SlopeDiagonal'];

export const gameMapFromDTO = (dto: any): GameMap => {
  const tiles: Tile[] = [];
  (dto.tiles as string[][]).forEach((col, x) => {
    col.forEach((tileStr, y) => {
      const [gType, gRot, sType, sRot] = tileStr.split(',').map((val) => parseInt(val));

      const tile = {
        pos: {
          x: x * BLOCK_SIZE,
          y: y * BLOCK_SIZE,
        },
        ground: {
          type: grounds[gType] as any,
          rotation: rotations[gRot],
        },
        structure: {
          type: structures[sType] as any,
          rotation: rotations[sRot],
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
      return [
        grounds.indexOf(tile.ground.type),
        rotations.indexOf((tile.ground as any).rotation || 'North'),
        structures.indexOf(tile.structure.type),
        rotations.indexOf((tile.structure as any).rotation || 'North'),
      ].join(',');
    });
    tiles.push(tile_strings);
  }

  return {
    ...gameMap,
    tiles,
  };
};

import { StructureType, Tile } from '../types';

const empty = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let y = 0; y < 25; y += 1) {
    for (let x = 0; x < 49; x += 1) {
      tiles.push({
        ground: { type: 'Grass' },
        structure: {
          type: 'None',
        },
        pos: {
          x: x * 100,
          y: y * 100,
        },
      });
    }
  }
  return tiles;
};

const borders = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let y = 0; y < 25; y += 1) {
    for (let x = 0; x < 49; x += 1) {
      const isBorder = x === 0 || x === 48 || y === 0 || y === 24;
      const isSpawn = x === 2 && y === 12;
      const isHole = x === 46 && y === 12;

      let type: StructureType = 'None';
      if (isBorder) type = 'Wall';
      if (isSpawn) type = 'Start';
      if (isHole) type = 'Hole';
      tiles.push({
        ground: { type: 'Grass' },
        structure: {
          type,
        },
        pos: {
          x: x * 100,
          y: y * 100,
        },
      });
    }
  }
  return tiles;
};

export default {
  empty,
  borders,
};

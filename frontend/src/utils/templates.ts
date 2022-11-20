import { GroundType, Rotation, StructureType, Tile } from '../types';

const empty = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let y = 0; y < 25; y += 1) {
    for (let x = 0; x < 49; x += 1) {
      tiles.push({
        ground: { type: GroundType.Grass, rotation: Rotation.North },
        structure: {
          type: StructureType.None,
          rotation: Rotation.North,
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

      let type: StructureType = StructureType.None;
      if (isBorder) type = StructureType.Wall;
      if (isSpawn) type = StructureType.Start;
      if (isHole) type = StructureType.Hole;
      tiles.push({
        ground: { type: GroundType.Grass, rotation: Rotation.North },
        structure: {
          type,
          rotation: Rotation.North,
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

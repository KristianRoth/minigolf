import { GameMap, GroundType, StructureType, Tile } from '../types';
import CanvasController from './CanvasController';

const shouldRenderStructure = (type: 'full' | 'floor' | 'struct', tile: Tile) => {
  if (type === 'full') return true;
  const isFloor = [StructureType.Hole, StructureType.Start].includes(tile.structure.type);
  if (type === 'floor' && isFloor) return true;
  if (type === 'struct' && !isFloor) return true;
  return false;
};

class MapController extends CanvasController {
  protected gameMap: GameMap | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 0);
  }

  protected draw(type: 'full' | 'floor' | 'struct') {
    if (!this.gameMap) return;
    const { tiles } = this.gameMap;

    if (type !== 'struct') {
      this.renderGrassFloor();

      // Ground pass
      for (let i = tiles.length - 1; i >= 0; i -= 1) {
        const tile = tiles[i];
        if (tile.ground.type !== GroundType.Grass) {
          this.renderGround(tile.pos, tile.ground.type, (tile.ground as any).rotation);
        }
      }
    }

    // Shadow pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (shouldRenderStructure(type, tile)) {
        this.renderStructure(tile.pos, tile.structure.type, (tile.structure as any).rotation, true);
      }
    }

    // Structure pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (shouldRenderStructure(type, tile)) {
        this.renderStructure(tile.pos, tile.structure.type, (tile.structure as any).rotation);
      }
    }
  }

  protected render() {
    this.clear();
    this.draw('full');
  }

  setGameMap(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.render();
  }

  getMap() {
    return this.gameMap;
  }
}

export class GroundController extends MapController {
  protected render() {
    this.clear();
    this.draw('floor');
  }
}

export class StructureController extends MapController {
  protected render() {
    this.clear();
    this.draw('struct');
  }
}

export default MapController;

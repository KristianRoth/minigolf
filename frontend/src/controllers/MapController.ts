import { GameMap, GroundType } from '../types';
import CanvasController from './CanvasController';

class MapController extends CanvasController {
  protected gameMap: GameMap | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 0);
  }

  private draw() {
    if (!this.gameMap) return;
    const { tiles } = this.gameMap;

    this.renderGrassFloor();

    // Ground pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.ground.type !== GroundType.Grass) {
        this.renderGround(tile.pos, tile.ground.type, (tile.ground as any).rotation);
      }
    }

    // Shadow pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      this.renderStructure(tile.pos, tile.structure.type, (tile.structure as any).rotation, true);
    }

    // Structure pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      this.renderStructure(tile.pos, tile.structure.type, (tile.structure as any).rotation);
    }
  }

  protected render() {
    this.clear();
    this.draw();
  }

  setGameMap(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.render();
  }

  getMap() {
    return this.gameMap;
  }
}

export default MapController;

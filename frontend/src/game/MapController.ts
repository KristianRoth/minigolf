import { GameMap } from '../types';
import CanvasController from './CanvasController';

class MapController extends CanvasController {
  protected gameMap: GameMap | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, 0);
  }

  private draw() {
    if (!this.gameMap) return;
    const { tiles } = this.gameMap;

    // Ground pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.groundType === 'Grass') {
        this.renderGrass(tile.pos);
      }
    }

    // Shadow pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structureType === 'Wall') {
        this.renderWall(tile.pos);
      } else if (tile.structureType === 'Circle') {
        this.renderCircleWall(tile.pos);
      }
    }

    // Structure pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structureType === 'Wall') {
        this.renderWall(tile.pos, false);
      } else if (tile.structureType === 'Hole') {
        this.renderHole(tile.pos);
      } else if (tile.structureType === 'Start') {
        this.renderStart(tile.pos);
      }
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
}

export default MapController;

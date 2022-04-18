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
      if (tile.ground.type === 'Grass') {
        this.renderGrass(tile.pos);
      } else if (tile.ground.type === 'Slope') {
        this.renderSlope(tile.pos, tile.ground.rotation);
      } else if (tile.ground.type === 'SlopeDiagonal') {
        this.renderSlope(tile.pos, tile.ground.rotation, true);
      }
    }

    // Shadow pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structure.type === 'Wall') {
        this.renderWall(tile.pos);
      } else if (tile.structure.type === 'Circle') {
        this.renderCircleWall(tile.pos);
      } else if (tile.structure.type === 'Wedge') {
        this.renderWedge(tile.pos, tile.structure.rotation);
      } else if (tile.structure.type === 'RoundedCorner') {
        this.renderRoundedCorner(tile.pos, tile.structure.rotation);
      } else if (tile.structure.type === 'InvertedRoundedCorner') {
        this.renderInvertedRoundedCorner(tile.pos, tile.structure.rotation);
      }
    }

    // Structure pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structure.type === 'Wall') {
        this.renderWall(tile.pos, false);
      } else if (tile.structure.type === 'Circle') {
        this.renderCircleWall(tile.pos, false);
      } else if (tile.structure.type === 'Hole') {
        this.renderHole(tile.pos);
      } else if (tile.structure.type === 'Start') {
        this.renderStart(tile.pos);
      } else if (tile.structure.type === 'Wedge') {
        this.renderWedge(tile.pos, tile.structure.rotation, false);
      } else if (tile.structure.type === 'RoundedCorner') {
        this.renderRoundedCorner(tile.pos, tile.structure.rotation, false);
      } else if (tile.structure.type === 'InvertedRoundedCorner') {
        this.renderInvertedRoundedCorner(tile.pos, tile.structure.rotation, false);
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

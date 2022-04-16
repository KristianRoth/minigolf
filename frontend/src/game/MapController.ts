import { GameMap, Rotation } from '../types';
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
      if (tile.structure.type === 'Wall') {
        this.renderWall(tile.pos);
      } else if (tile.structure.type === 'Circle') {
        this.renderCircleWall(tile.pos);
      } else if (tile.structure.type === 'Wedge') {
        this.renderWedge(tile.pos, tile.structure.rotation);
      } else if (tile.structure.type === 'Rounded_Corner') {
        this.renderRoundedCorner(tile.pos, tile.structure.rotation);
      } else if (tile.structure.type === 'Inverted_Rounded_Corner') {
        this.renderInvertedRoundedCorner(tile.pos, tile.structure.rotation);
      }
    }

    // Structure pass
    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structure.type === 'Wall') {
        this.renderWall(tile.pos, false);
      } else if (tile.structure.type === 'Hole') {
        this.renderHole(tile.pos);
      } else if (tile.structure.type === 'Start') {
        this.renderStart(tile.pos);
      } else if (tile.structure.type === 'Wedge') {
        this.renderWedge(tile.pos, tile.structure.rotation, false);
      } else if (tile.structure.type === 'Rounded_Corner') {
        this.renderRoundedCorner(tile.pos, tile.structure.rotation, false);
      } else if (tile.structure.type === 'Inverted_Rounded_Corner') {
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

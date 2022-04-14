import { GameMap } from '../types';
import CanvasController from './CanvasController';

class MapController extends CanvasController {
  protected gameMap: GameMap | null = null;

  constructor(rootId: string, index: number) {
    super(rootId, index, 0);
  }

  private drawGrid() {
    const { canvas, context, blockSize } = this;

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = '#CDCACA';

    for (let x = 0; x < canvas.width; x += blockSize) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += blockSize) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    context.stroke();
  }

  private draw() {
    if (!this.gameMap) return;
    const { tiles } = this.gameMap;

    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.groundType === 'Grass') {
        this.renderGrass(tile.pos);
      }
    }

    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structureType === 'Wall') {
        this.renderWall(tile.pos);
      } else if (tile.structureType === 'Circle') {
        this.renderCircleWall(tile.pos);
      }
    }

    for (let i = tiles.length - 1; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (tile.structureType === 'Wall') {
        this.renderWall(tile.pos, false);
      }
    }
  }

  protected render() {
    this.clear();

    this.drawGrid();
    this.draw();
  }

  setGameMap(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.render();
  }
}

export default MapController;

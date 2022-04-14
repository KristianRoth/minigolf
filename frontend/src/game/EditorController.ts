import { GameMap, Point, StructureType, Tile } from '../types';
import CanvasController from './CanvasController';

const BLOCK_SIZE = 100;

type SetTilesHandler = (tiles: Tile[]) => void;

class EditorController extends CanvasController {
  protected gameMap: GameMap | null = null;

  private setTiles: SetTilesHandler | null = null;

  private structureType: StructureType = 'None';
  private tilePosition: Point | null = null;
  private mouseButtonElement: StructureType | null = null;

  constructor(rootId: string, index: number) {
    super(rootId, index);
  }

  protected setTile(structure: StructureType) {
    if (!this.gameMap || !this.tilePosition || !this.setTiles) return;
    const { x, y } = this.tilePosition;
    const newTiles: Tile[] = this.gameMap.tiles.map((tile) => {
      if (tile.pos.x === x && tile.pos.y === y) {
        return {
          ...tile,
          pos: {
            x,
            y,
          },
          structureType: structure,
        };
      }
      return tile;
    });
    this.setTiles(newTiles);
  }

  protected onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this.setTile(this.structureType);
      this.mouseButtonElement = this.structureType;
    } else if (event.button === 2) {
      this.mouseButtonElement = 'None';
      this.setTile('None');
    }
  }

  protected onMouseUp() {
    this.mouseButtonElement = null;
  }

  protected onMouseMove(event: MouseEvent) {
    super.onMouseMove(event);

    const { x, y } = this.tilePosition || { x: -1, y: -1 };
    if (this.mouseAt) {
      const posX = Math.floor(this.mouseAt.x / BLOCK_SIZE) * BLOCK_SIZE;
      const posY = Math.floor(this.mouseAt.y / BLOCK_SIZE) * BLOCK_SIZE;
      this.tilePosition = { x: posX, y: posY };
    }

    if (this.mouseButtonElement && this.tilePosition) {
      if (x !== this.tilePosition.x || y !== this.tilePosition.y) {
        this.setTile(this.mouseButtonElement);
      }
    }
  }

  protected renderStatus() {
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillText(`x: ${Math.round(x)}, y: ${Math.round(y)}`, 7, 0.75 * this.blockSize);
  }

  protected render() {
    this.clear();

    if (this.tilePosition) {
      const type = this.structureType;
      if (type === 'Wall') {
        this.renderWall(this.tilePosition);
      } else if (type === 'Circle') {
        this.renderCircleWall(this.tilePosition);
      }
    }
    this.renderCursor();
    this.renderStatus();
  }

  setTileHandler(setTiles: SetTilesHandler) {
    this.setTiles = setTiles;
  }

  setGameMap(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.render();
  }

  setStructureType(structureType: StructureType) {
    this.structureType = structureType;
  }
}

export default EditorController;

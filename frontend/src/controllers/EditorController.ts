import {
  CanvasMouseEvent,
  EditorState,
  GameMap,
  Ground,
  GROUND_TYPES,
  Point,
  Rotation,
  ROTATIONS,
  StructureType,
  STRUCTURE_TYPES,
  Tile,
} from '../types';
import { BLOCK_SIZE } from '../utils/constants';
import CanvasController from './CanvasController';

type SetTileHandler = (tile: Partial<Tile>) => void;

class EditorController extends CanvasController {
  protected gameMap: GameMap | null = null;
  private structureType: StructureType = 'None';
  private groundType: Ground['type'] = 'Grass';
  private mode: 'Structure' | 'Ground' = 'Structure';
  private tilePosition: Point | null = null;
  private dragStatus: 'insert' | 'delete' | null = null;
  private rotation: Rotation = 'North';
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private getTile(): Partial<Tile> {
    const isDelete = this.dragStatus === 'delete';
    if (this.mode === 'Structure') {
      return {
        pos: this.tilePosition as Point,
        structure: {
          type: isDelete ? 'None' : this.structureType,
          rotation: isDelete ? 'North' : this.rotation,
        },
      };
    }
    return {
      pos: this.tilePosition as Point,
      ground: {
        type: isDelete ? 'Grass' : this.groundType,
        rotation: isDelete ? 'North' : this.rotation,
      },
    };
  }

  handleMouseDown(event: CanvasMouseEvent, setTile: SetTileHandler) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.tilePosition) return;
    if (event.button === 0) {
      // Primary
      const tile = this.getTile();
      setTile(tile);
      this.dragStatus = 'insert';
    } else if (event.button === 2) {
      // Secondary
      this.dragStatus = 'delete';
      const tile = this.getTile();
      setTile(tile);
    }
  }

  handleMouseUp() {
    this.dragStatus = null;
  }

  handleMouseMove(event: CanvasMouseEvent, setTile: SetTileHandler) {
    super.setMouseAt(event);

    const { x, y } = this.tilePosition || { x: -1, y: -1 };
    if (this.mouseAt) {
      const posX = Math.floor(this.mouseAt.x / BLOCK_SIZE) * BLOCK_SIZE;
      const posY = Math.floor(this.mouseAt.y / BLOCK_SIZE) * BLOCK_SIZE;
      this.tilePosition = { x: posX, y: posY };
    }

    if (this.dragStatus && this.tilePosition) {
      if (x !== this.tilePosition.x || y !== this.tilePosition.y) {
        const tile = this.getTile();
        setTile(tile);
      }
    }
  }

  protected renderStatus() {
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillText(`x: ${Math.round(x)}, y: ${Math.round(y)}`, 7, 0.75 * this.blockSize);
  }

  protected renderEraser(point: Point) {
    this.context.save();
    this.context.fillStyle = '#fff';
    this.context.strokeStyle = '#fff';
    this.drawSquare(point);
    this.context.restore();
  }

  protected renderEditorElement() {
    const { groundType, structureType, mode } = this;

    if (!this.tilePosition) return;

    if (this.dragStatus === 'delete') {
      this.renderEraser(this.tilePosition);
      return;
    }

    if (mode === 'Ground') {
      this.renderGround(this.tilePosition, groundType, this.rotation);
    } else {
      this.renderStructure(this.tilePosition, structureType, this.rotation);
    }
  }

  protected render() {
    this.clear();

    this.renderEditorElement();
    this.renderCursor();
    this.renderStatus();
  }

  setGameMap(gameMap: GameMap) {
    this.gameMap = gameMap;
    this.render();
  }

  setEditorState(state: EditorState) {
    this.structureType = STRUCTURE_TYPES[state.structureIdx];
    this.groundType = GROUND_TYPES[state.groundIdx];
    this.rotation = ROTATIONS[state.rotationIdx];
    this.mode = state.mode;
  }
}

export default EditorController;

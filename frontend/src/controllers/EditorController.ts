import { CanvasMouseEvent, GameMap, Point, Rotation, StructureType } from '../types';
import { BLOCK_SIZE } from '../utils/constants';
import CanvasController from './CanvasController';

type SetTileHandler = (struct: StructureType, point: Point, rotation: Rotation) => void;

class EditorController extends CanvasController {
  protected gameMap: GameMap | null = null;
  private structureType: StructureType = 'None';
  private tilePosition: Point | null = null;
  private draggedElement: StructureType | null = null;
  private rotation: Rotation = 'North';
  private rotationIdx = 0;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  nextRotation() {
    this.rotationIdx++;
    return (['North', 'East', 'South', 'West'] as Rotation[])[this.rotationIdx % 4];
  }

  previousRotation() {
    this.rotationIdx--;
    return (['North', 'East', 'South', 'West'] as Rotation[])[this.rotationIdx % 4];
  }

  handleMouseDown(event: CanvasMouseEvent, setTile: SetTileHandler) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.tilePosition) return;
    if (event.button === 0) {
      // Primary
      setTile(this.structureType, this.tilePosition, this.rotation);
      this.draggedElement = this.structureType;
    } else if (event.button === 2) {
      // Secondary
      this.draggedElement = 'None';
      setTile('None', this.tilePosition, 'North');
    } else if (event.button === 3) {
      // Side
      this.rotation = this.previousRotation();
    } else if (event.button === 4) {
      // Side
      this.rotation = this.nextRotation();
    }
  }

  handleMouseUp() {
    this.draggedElement = null;
  }

  handleMouseMove(event: CanvasMouseEvent, setTile: SetTileHandler) {
    super.setMouseAt(event);

    const { x, y } = this.tilePosition || { x: -1, y: -1 };
    if (this.mouseAt) {
      const posX = Math.floor(this.mouseAt.x / BLOCK_SIZE) * BLOCK_SIZE;
      const posY = Math.floor(this.mouseAt.y / BLOCK_SIZE) * BLOCK_SIZE;
      this.tilePosition = { x: posX, y: posY };
    }

    if (this.draggedElement && this.tilePosition) {
      if (x !== this.tilePosition.x || y !== this.tilePosition.y) {
        setTile(this.draggedElement, this.tilePosition, this.rotation);
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

  protected render() {
    this.clear();

    if (this.tilePosition) {
      const type = this.structureType;
      if (type === 'None' || this.draggedElement === 'None') {
        this.renderEraser(this.tilePosition);
      } else if (type === 'Wall') {
        this.renderWall(this.tilePosition);
      } else if (type === 'Circle') {
        this.renderCircleWall(this.tilePosition);
      } else if (type === 'Hole') {
        this.renderHole(this.tilePosition);
      } else if (type === 'Start') {
        this.renderStart(this.tilePosition);
      } else if (type === 'Wedge') {
        this.renderWedge(this.tilePosition, this.rotation);
      } else if (type === 'Rounded_Corner') {
        this.renderRoundedCorner(this.tilePosition, this.rotation);
      } else if (type === 'Inverted_Rounded_Corner') {
        this.renderInvertedRoundedCorner(this.tilePosition, this.rotation);
      }
    }
    this.renderCursor();
    this.renderStatus();
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

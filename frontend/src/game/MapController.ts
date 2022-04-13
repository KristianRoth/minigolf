import CanvasController from './CanvasController';

class MapController extends CanvasController {
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

  private drawBrick = (x: number, y: number, color: string, isWall = false) => {
    const { context, blockSize } = this;

    context.save();

    if (isWall) {
      context.strokeStyle = 'black';
      context.shadowOffsetX = 5;
      context.shadowOffsetY = 5;
      context.shadowColor = 'black';
      context.shadowBlur = 15;
    }
    context.beginPath();
    context.rect(x, y, blockSize, blockSize);
    context.fillStyle = color;
    context.fill();
    context.closePath();

    context.restore();
  };

  private drawBricks() {
    const { canvas, blockSize } = this;

    const xCount = Math.round(canvas.width / blockSize);
    const yCount = Math.round(canvas.height / blockSize);
    for (let x = xCount - 1; x >= 0; x -= 1) {
      for (let y = yCount - 1; y >= 0; y -= 1) {
        const isBorder = x === 0 || y === 0 || x === xCount - 1 || y === yCount - 1;
        const isMiddleAndUp = Math.abs(x - xCount / 2) < 2 && y < 0.65 * yCount;
        if (isBorder || isMiddleAndUp) {
          this.drawBrick(x * blockSize, y * blockSize, '#c6c6c6', true);
        } else {
          this.drawBrick(x * blockSize, y * blockSize, '#13a713');
        }
      }
    }

    for (let x = xCount - 1; x >= 0; x -= 1) {
      for (let y = yCount - 1; y >= 0; y -= 1) {
        const isBorder = x === 0 || y === 0 || x === xCount - 1 || y === yCount - 1;
        const isMiddleAndUp = Math.abs(x - xCount / 2) < 2 && y < 0.65 * yCount;
        if (isBorder || isMiddleAndUp) {
          this.drawBrick(x * blockSize, y * blockSize, '#c6c6c6', false);
        }
      }
    }
  }

  protected render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.drawBricks();
  }
}

export default MapController;

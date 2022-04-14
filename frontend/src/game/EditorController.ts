import CanvasController from './CanvasController';

type SetItemHandler = (item: any) => void;

class EditorController extends CanvasController {
  private setItem: SetItemHandler | null = null;

  constructor(rootId: string, index: number) {
    super(rootId, index);
  }

  protected onMouseDown(event: MouseEvent) {
    if (!this.setItem) return;
    const clickedAt = this.getMousePosition(event);
    this.setItem({ type: 'Wall', ...clickedAt });
  }

  protected onMouseUp() {
    /* */
  }

  protected onMouseMove(event: MouseEvent) {
    super.onMouseMove(event);
  }

  protected renderStatus() {
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillText(`x: ${Math.round(x)}, y: ${Math.round(y)}`, 7, 0.75 * this.blockSize);
  }

  protected render() {
    this.clear();

    if (this.mouseAt) {
      this.renderWall(this.mouseAt);
    }
    // this.renderCursor();
    this.renderStatus();
  }

  setItemHandler(handler: SetItemHandler) {
    this.setItem = handler;
  }
}

export default EditorController;

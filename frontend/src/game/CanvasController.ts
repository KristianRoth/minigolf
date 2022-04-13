import { clamp } from './helpers';
import { Point } from '../types';

const GAME_WIDTH = 4900;
const GAME_HEIGHT = 2500;
const BALL_RADIUS = 50;
const BLOCK_SIZE = BALL_RADIUS * 2;

const RATIO = GAME_HEIGHT / GAME_WIDTH;

class CanvasController {
  protected animationReqId: number | null = null;

  protected tick = 0;
  protected rootId = '';
  protected index = -1;
  protected canvas: HTMLCanvasElement;
  protected context: CanvasRenderingContext2D;
  protected mouseAt: Point | null = null;

  constructor(rootId: string, index: number, tick = 60) {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('canvas-layer');
    this.canvas.style.zIndex = index + '';
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.rootId = rootId;
    this.index = index;
    this.tick = tick;
  }

  protected c(value: number): number {
    return clamp(value, 0, GAME_WIDTH, 0, this.canvas.width);
  }

  protected dc(value: number): number {
    return clamp(value, 0, this.canvas.width, 0, GAME_WIDTH);
  }

  protected getMousePosition(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.dc(event.clientX - rect.left);
    const y = this.dc(event.clientY - rect.top);
    return { x, y };
  }

  protected onResize() {
    const width = window.innerWidth - 30;
    const height = width * RATIO;

    this.canvas.width = width;
    this.canvas.height = height;
    this.render();
  }

  protected onMouseMove(event: MouseEvent) {
    this.mouseAt = this.getMousePosition(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMouseUp(_event: MouseEvent) {
    // console.log('MouseUp at: %s', event);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMouseDown(_event: MouseEvent) {
    // console.log('MouseDown at: %s', event);
  }

  protected render() {
    // console.log('Rendering');
  }

  protected get blockSize() {
    return this.c(BLOCK_SIZE);
  }

  init() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));

    document.getElementById(this.rootId)?.appendChild(this.canvas);
    this.onResize();

    if (this.tick === 0) {
      return;
    }

    const animate = () => {
      this.render();
      this.animationReqId = window.requestAnimationFrame(animate);
    };
    this.animationReqId = window.requestAnimationFrame(animate);
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    this.canvas.remove();

    if (this.animationReqId) {
      window.cancelAnimationFrame(this.animationReqId);
    }
  }
}

export default CanvasController;

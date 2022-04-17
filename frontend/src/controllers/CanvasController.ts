import { Ball, CanvasMouseEvent, Point, Rotation } from '../types';
import { clamp } from '../utils/calculation';
import { GAME_WIDTH, RATIO, BALL_RADIUS, CIRCLE_RADIUS, BLOCK_SIZE, HALF_BLOCK } from '../utils/constants';

class CanvasController {
  protected animationReqId: number | null = null;
  protected tick = 0;
  protected canvas: HTMLCanvasElement;
  protected context: CanvasRenderingContext2D;
  protected mouseAt: Point | null = null;

  constructor(canvas: HTMLCanvasElement, tick = 60) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tick = tick;
  }

  protected c(value: number): number {
    return clamp(value, 0, GAME_WIDTH, 0, this.canvas.width);
  }

  protected dc(value: number): number {
    return clamp(value, 0, this.canvas.width, 0, GAME_WIDTH);
  }

  protected getMousePosition(event: CanvasMouseEvent) {
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

  protected setMouseAt(event: CanvasMouseEvent) {
    this.mouseAt = this.getMousePosition(event);
  }

  protected render() {
    // console.log('Rendering');
  }

  protected clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  protected setShadowOpts() {
    this.context.strokeStyle = 'black';
    this.context.shadowBlur = 15;
    this.context.shadowOffsetX = 5;
    this.context.shadowOffsetY = 5;
    this.context.shadowColor = 'black';
  }

  protected renderCursor() {
    if (!this.mouseAt) return;
    const { x, y } = this.mouseAt;
    this.context.beginPath();
    this.context.moveTo(this.c(x), this.c(y - BALL_RADIUS));
    this.context.lineTo(this.c(x), this.c(y + BALL_RADIUS));
    this.context.moveTo(this.c(x - BALL_RADIUS), this.c(y));
    this.context.lineTo(this.c(x + BALL_RADIUS), this.c(y));
    this.context.stroke();
  }

  protected renderBall(ball: Ball) {
    this.context.save();
    this.setShadowOpts();
    this.context.fillStyle = ball.color;
    this.renderCircle(ball, BALL_RADIUS);
    this.context.restore();
  }

  protected renderLine(p1: Point, p2: Point) {
    this.context.beginPath();
    this.context.moveTo(this.c(p1.x), this.c(p1.y));
    this.context.lineTo(this.c(p2.x), this.c(p2.y));
    this.context.stroke();
  }

  protected renderSquare(point: Point) {
    this.context.beginPath();
    this.context.rect(this.c(point.x), this.c(point.y), this.blockSize, this.blockSize);
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  protected renderCircle(point: Point, radius: number) {
    this.context.beginPath();

    this.context.ellipse(this.c(point.x), this.c(point.y), this.c(radius), this.c(radius), 0, Math.PI * 2, 0);

    this.context.fill();
    this.context.closePath();
  }

  protected renderWall(point: Point, doShadow = true) {
    this.context.save();

    if (doShadow) {
      this.setShadowOpts();
    }

    this.context.lineWidth = 0.3;
    this.context.fillStyle = '#b8b8b8';
    this.context.strokeStyle = '#ededed';
    this.renderSquare(point);
    this.context.restore();
  }

  protected renderWedge(point: Point, rotation: Rotation, doShadow = true) {
    this.context.save();
    this.context.beginPath();
    if (doShadow) {
      this.setShadowOpts();
    }
    this.context.translate(this.c(point.x + BALL_RADIUS), this.c(point.y + BALL_RADIUS));
    this.context.rotate(this.getRotationAngle(rotation));
    this.context.moveTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.lineTo(this.c(HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.lineTo(this.c(-HALF_BLOCK), this.c(HALF_BLOCK));
    this.context.lineWidth = 0.3;
    this.context.fillStyle = '#b8b8b8';
    this.context.strokeStyle = '#ededed';
    this.context.stroke();
    this.context.fill();
    this.context.restore();
  }

  protected renderRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.context.save();
    this.context.beginPath();
    if (doShadow) {
      this.setShadowOpts();
    }
    this.context.translate(this.c(point.x + BALL_RADIUS), this.c(point.y + BALL_RADIUS));
    this.context.rotate(this.getRotationAngle(rotation));
    this.context.moveTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.lineTo(this.c(HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.arcTo(
      this.c(HALF_BLOCK),
      this.c(HALF_BLOCK),
      this.c(-HALF_BLOCK),
      this.c(HALF_BLOCK),
      this.c(BLOCK_SIZE)
    );
    this.context.lineWidth = 0.3;
    this.context.fillStyle = '#b8b8b8';
    this.context.strokeStyle = '#ededed';
    this.context.fill();
    this.context.restore();
  }

  protected renderInvertedRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.context.save();
    this.context.beginPath();
    if (doShadow) {
      this.setShadowOpts();
    }
    this.context.translate(this.c(point.x + BALL_RADIUS), this.c(point.y + BALL_RADIUS));
    this.context.rotate(this.getRotationAngle(rotation));
    this.context.moveTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.lineTo(this.c(HALF_BLOCK), this.c(-HALF_BLOCK));
    this.context.arcTo(
      this.c(-HALF_BLOCK),
      this.c(-HALF_BLOCK),
      this.c(-HALF_BLOCK),
      this.c(HALF_BLOCK),
      this.c(BLOCK_SIZE)
    );
    this.context.lineWidth = 0.3;
    this.context.fillStyle = '#b8b8b8';
    this.context.strokeStyle = '#ededed';
    this.context.fill();
    this.context.restore();
  }

  protected renderHole(point: Point) {
    this.context.save();
    this.context.fillStyle = '#000000';
    this.renderCircle({ x: point.x + BALL_RADIUS, y: point.y + BALL_RADIUS }, BALL_RADIUS);
    this.context.restore();
  }

  protected renderStart(point: Point) {
    this.context.save();
    this.context.fillStyle = '#fc0303';
    this.renderCircle({ x: point.x + BALL_RADIUS, y: point.y + BALL_RADIUS }, 10);
    this.context.restore();
  }

  protected renderGrass(point: Point) {
    this.context.save();
    this.context.fillStyle = '#13a713';
    this.context.strokeStyle = '#13a713';
    this.renderSquare(point);
    this.context.restore();
  }

  protected renderCircleWall(point: Point, doShadow = true) {
    const { x, y } = point;
    this.context.save();

    if (doShadow) {
      this.setShadowOpts();
    }

    this.context.fillStyle = '#c6c6c6';

    this.renderCircle({ x: x + BALL_RADIUS, y: y + BALL_RADIUS }, CIRCLE_RADIUS);

    this.context.restore();
  }

  protected get blockSize() {
    return this.c(BLOCK_SIZE);
  }

  protected getRotationAngle(rot: Rotation) {
    switch (rot) {
      case 'North':
        return 0;
      case 'East':
        return Math.PI / 2;
      case 'South':
        return Math.PI;
      case 'West':
        return -Math.PI / 2;
    }
  }

  init() {
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
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
    window.removeEventListener('resize', this.onResize);
    if (this.animationReqId) {
      window.cancelAnimationFrame(this.animationReqId);
    }
  }
}

export default CanvasController;

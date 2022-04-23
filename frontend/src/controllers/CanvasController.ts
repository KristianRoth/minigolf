import { Ball, CanvasMouseEvent, Ground, Point, Rotation, Structure } from '../types';
import { clamp } from '../utils/calculation';
import { GAME_WIDTH, RATIO, BALL_RADIUS, CIRCLE_RADIUS, BLOCK_SIZE, HALF_BLOCK } from '../utils/constants';

const colors = {
  wall: '#b8b8b8',
  wallBorder: '#ededed',
  hole: '#000000',
  start: '#fc0303',
  grass: '#13a713',
  gravel: '#a5c400',
  gravelHeavy: '#a97200',
  water: '#0002fd',
  slope: {
    North: '#34c42f',
    East: '#176314',
    South: '#187814',
    West: '#30d42a',
  },
} as const;

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
    return clamp(value, 0, this.canvas.width / window.devicePixelRatio, 0, GAME_WIDTH);
  }

  protected getMousePosition(event: CanvasMouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.dc(event.clientX - rect.left);
    const y = this.dc(event.clientY - rect.top);
    return { x, y };
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

  protected onResize() {
    let width = window.innerWidth - 20;
    let height = width * RATIO;

    if (height > window.innerHeight) {
      height = window.innerHeight - 20;
      width = height * (1 / RATIO);
    }

    const { devicePixelRatio = 1 } = window;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
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
    this.context.moveTo(this.c(x), this.c(y - HALF_BLOCK));
    this.context.lineTo(this.c(x), this.c(y + HALF_BLOCK));
    this.context.moveTo(this.c(x - HALF_BLOCK), this.c(y));
    this.context.lineTo(this.c(x + HALF_BLOCK), this.c(y));
    this.context.stroke();
  }

  protected drawLine(p1: Point, p2: Point, isDashed = false) {
    this.renderElement(() => {
      if (isDashed) {
        this.context.setLineDash([this.c(100), this.c(40)]);
      }
      this.context.beginPath();
      this.context.moveTo(this.c(p1.x), this.c(p1.y));
      this.context.lineTo(this.c(p2.x), this.c(p2.y));
      this.context.stroke();
    });
  }

  protected drawSquare(point: Point) {
    this.context.beginPath();
    this.context.rect(this.c(point.x), this.c(point.y), this.blockSize, this.blockSize);
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  protected drawCircle(point: Point, radius: number) {
    this.context.beginPath();
    this.context.ellipse(this.c(point.x), this.c(point.y), this.c(radius), this.c(radius), 0, Math.PI * 2, 0);
    this.context.fill();
    this.context.closePath();
  }

  private renderElement(callback: () => void) {
    this.context.save();
    callback();
    this.context.restore();
  }

  private renderWallElement(doShadow: boolean, callback: () => void) {
    this.renderElement(() => {
      if (doShadow) {
        this.setShadowOpts();
      }

      this.context.lineWidth = 0.5;
      this.context.fillStyle = colors.wall;
      this.context.strokeStyle = colors.wallBorder;

      callback();
    });
  }

  protected renderWall(point: Point, doShadow = true) {
    this.renderWallElement(doShadow, () => {
      this.drawSquare(point);
    });
  }

  protected renderCircleWall(point: Point, doShadow = true) {
    this.renderWallElement(doShadow, () => {
      const { x, y } = point;
      this.drawCircle({ x: x + HALF_BLOCK, y: y + HALF_BLOCK }, CIRCLE_RADIUS);
    });
  }

  protected renderWedge(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(doShadow, () => {
      this.context.beginPath();
      this.context.translate(this.c(point.x + HALF_BLOCK), this.c(point.y + HALF_BLOCK));
      this.context.rotate(this.getRotationAngle(rotation));
      this.context.moveTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
      this.context.lineTo(this.c(HALF_BLOCK), this.c(-HALF_BLOCK));
      this.context.lineTo(this.c(-HALF_BLOCK), this.c(HALF_BLOCK));
      this.context.lineTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
      this.context.stroke();
      this.context.fill();
    });
  }

  protected renderRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(doShadow, () => {
      this.context.beginPath();
      this.context.translate(this.c(point.x + HALF_BLOCK), this.c(point.y + HALF_BLOCK));
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
      this.context.lineTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
      this.context.stroke();
      this.context.fill();
    });
  }

  protected renderInvertedRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(doShadow, () => {
      this.context.beginPath();
      this.context.translate(this.c(point.x + HALF_BLOCK), this.c(point.y + HALF_BLOCK));
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
      this.context.lineTo(this.c(-HALF_BLOCK), this.c(-HALF_BLOCK));
      this.context.stroke();
      this.context.fill();
    });
  }

  protected renderHole(point: Point) {
    this.renderElement(() => {
      this.context.fillStyle = colors.hole;
      this.drawCircle({ x: point.x + HALF_BLOCK, y: point.y + HALF_BLOCK }, HALF_BLOCK);
    });
  }

  protected renderStart(point: Point) {
    this.renderElement(() => {
      this.context.fillStyle = colors.start;
      this.drawCircle({ x: point.x + HALF_BLOCK, y: point.y + HALF_BLOCK }, 10);
    });
  }

  protected renderBall(ball: Ball) {
    this.renderElement(() => {
      this.setShadowOpts();
      this.context.fillStyle = ball.color;
      this.drawCircle(ball, BALL_RADIUS);
    });
  }

  protected renderStaticGround(point: Point, color: string) {
    this.renderElement(() => {
      this.context.fillStyle = color;
      this.context.strokeStyle = color;
      this.drawSquare(point);
    });
  }

  protected renderSlope(point: Point, rotation: Rotation, isDiagonal = false) {
    const [middleX, middleY] = [this.c(point.x + HALF_BLOCK), this.c(point.y + HALF_BLOCK)];
    const rotationAngle = this.getRotationAngle(rotation) - (isDiagonal ? Math.PI / 4 : 0);
    const quarterBlock = this.c(HALF_BLOCK / 2);

    this.renderElement(() => {
      this.context.fillStyle = colors.slope[rotation];
      this.context.strokeStyle = colors.slope[rotation];
      this.drawSquare(point);
      //
      this.context.translate(middleX, middleY);
      this.context.rotate(rotationAngle);
      this.context.translate(-middleX, -middleY);
      // Draw line
      this.context.fillStyle = colors.wallBorder;
      this.context.strokeStyle = colors.wallBorder;
      this.context.beginPath();
      this.context.moveTo(middleX - quarterBlock, middleY);
      this.context.lineTo(middleX, middleY - quarterBlock);
      this.context.lineTo(middleX + quarterBlock, middleY);
      this.context.stroke();
    });
  }

  protected renderStructure(
    point: Point,
    structureType: Structure['type'],
    rotation: Rotation = 'North',
    doShadow = false
  ) {
    switch (structureType) {
      case 'Start':
        this.renderStart(point);
        return;
      case 'Hole':
        this.renderHole(point);
        return;
      case 'Circle':
        this.renderCircleWall(point, doShadow);
        return;
      case 'Wall':
        this.renderWall(point, doShadow);
        return;
      case 'Wedge':
        this.renderWedge(point, rotation, doShadow);
        return;
      case 'RoundedCorner':
        this.renderRoundedCorner(point, rotation, doShadow);
        return;
      case 'InvertedRoundedCorner':
        this.renderInvertedRoundedCorner(point, rotation, doShadow);
        return;
      case 'Portal':
        console.log('TODO: IMPLEMENT PORTAL');
        return;
    }
  }

  protected renderGround(point: Point, groundType: Ground['type'], rotation: Rotation = 'North') {
    switch (groundType) {
      case 'Grass':
        this.renderStaticGround(point, colors.grass);
        return;
      case 'Water':
        this.renderStaticGround(point, colors.water);
        return;
      case 'Gravel':
        this.renderStaticGround(point, colors.gravel);
        return;
      case 'GravelHeavy':
        this.renderStaticGround(point, colors.gravelHeavy);
        return;
      case 'Slope':
        this.renderSlope(point, rotation, false);
        return;
      case 'SlopeDiagonal':
        this.renderSlope(point, rotation, true);
        return;
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

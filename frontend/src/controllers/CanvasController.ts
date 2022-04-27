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
  portal: {
    base: '#000000',
    center: '#e68a00',
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

  protected renderGrassFloor() {
    this.context.save();
    this.context.fillStyle = colors.grass;
    this.context.strokeStyle = colors.grass;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
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
    this.context.save();
    if (isDashed) {
      this.context.setLineDash([this.c(100), this.c(40)]);
    }
    this.context.beginPath();
    this.context.moveTo(this.c(p1.x), this.c(p1.y));
    this.context.lineTo(this.c(p2.x), this.c(p2.y));
    this.context.stroke();
    this.context.restore();
  }

  protected drawSquare() {
    this.context.beginPath();
    this.context.rect(-HALF_BLOCK, -HALF_BLOCK, BLOCK_SIZE, BLOCK_SIZE);
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  protected drawCircle(point: Point, radius: number) {
    this.context.beginPath();
    this.context.ellipse(point.x, point.y, radius, radius, 0, Math.PI * 2, 0);
    this.context.fill();
    this.context.closePath();
  }

  protected renderElement(callback: () => void, middle: Point, rotation: Rotation = 'North') {
    this.context.save();
    const scale = this.canvas.width / GAME_WIDTH;
    this.context.scale(scale, scale);
    this.context.translate(middle.x + HALF_BLOCK, middle.y + HALF_BLOCK);
    this.context.rotate(this.getRotationAngle(rotation));
    callback();
    this.context.restore();
  }

  private renderWallElement(callback: () => void, doShadow: boolean, middle: Point, rotation: Rotation = 'North') {
    this.renderElement(
      () => {
        if (doShadow) {
          this.setShadowOpts();
        }

        this.context.lineWidth = 0.5;
        this.context.fillStyle = colors.wall;
        this.context.strokeStyle = colors.wallBorder;

        callback();
      },
      middle,
      rotation
    );
  }

  protected renderWall(point: Point, doShadow = true) {
    this.renderWallElement(
      () => {
        this.drawSquare();
      },
      doShadow,
      point
    );
  }

  protected renderCircleWall(point: Point, doShadow = true) {
    this.renderWallElement(
      () => {
        this.drawCircle({ x: 0, y: 0 }, CIRCLE_RADIUS);
      },
      doShadow,
      point
    );
  }

  protected renderWedge(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(
      () => {
        this.context.beginPath();
        this.context.moveTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.lineTo(HALF_BLOCK, -HALF_BLOCK);
        this.context.lineTo(-HALF_BLOCK, HALF_BLOCK);
        this.context.lineTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.stroke();
        this.context.fill();
      },
      doShadow,
      point,
      rotation
    );
  }

  protected renderRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(
      () => {
        this.context.beginPath();
        this.context.moveTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.lineTo(HALF_BLOCK, -HALF_BLOCK);
        this.context.arcTo(HALF_BLOCK, HALF_BLOCK, -HALF_BLOCK, HALF_BLOCK, BLOCK_SIZE);
        this.context.lineTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.stroke();
        this.context.fill();
      },
      doShadow,
      point,
      rotation
    );
  }

  protected renderInvertedRoundedCorner(point: Point, rotation: Rotation, doShadow = true) {
    this.renderWallElement(
      () => {
        this.context.beginPath();
        this.context.moveTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.lineTo(HALF_BLOCK, -HALF_BLOCK);
        this.context.arcTo(-HALF_BLOCK, -HALF_BLOCK, -HALF_BLOCK, HALF_BLOCK, BLOCK_SIZE);
        this.context.lineTo(-HALF_BLOCK, -HALF_BLOCK);
        this.context.stroke();
        this.context.fill();
      },
      doShadow,
      point,
      rotation
    );
  }

  protected renderHole(point: Point) {
    this.renderElement(() => {
      this.context.fillStyle = colors.hole;
      this.drawCircle({ x: 0, y: 0 }, HALF_BLOCK);
    }, point);
  }

  protected renderPortal(point: Point) {
    this.renderElement(() => {
      const grd = this.context.createRadialGradient(0, 0, HALF_BLOCK / 3, 0, 0, HALF_BLOCK);
      grd.addColorStop(0, 'black');
      grd.addColorStop(1, 'orange');
      this.context.fillStyle = grd;
      this.drawCircle({ x: 0, y: 0 }, HALF_BLOCK);
    }, point);
  }

  protected renderStart(point: Point) {
    this.renderElement(() => {
      this.context.fillStyle = colors.start;
      this.drawCircle({ x: 0, y: 0 }, 10);
    }, point);
  }

  protected renderBall(ball: Ball) {
    this.renderElement(() => {
      this.setShadowOpts();
      this.context.fillStyle = ball.color;
      this.drawCircle({ x: -HALF_BLOCK, y: -HALF_BLOCK }, BALL_RADIUS);
    }, ball);
  }

  protected renderStaticGround(point: Point, color: string) {
    this.renderElement(() => {
      this.context.lineWidth = 5;
      this.context.fillStyle = color;
      this.context.strokeStyle = color;
      this.drawSquare();
    }, point);
  }

  protected renderSlope(point: Point, rotation: Rotation, isDiagonal: boolean) {
    this.renderElement(
      () => {
        this.context.lineWidth = 5;
        this.context.fillStyle = colors.slope[rotation];
        this.context.strokeStyle = colors.slope[rotation];
        this.drawSquare();
        this.context.strokeStyle = colors.wallBorder;
        this.context.lineWidth = 3;
        this.context.beginPath();
        if (!isDiagonal) {
          this.context.moveTo(-BLOCK_SIZE / 4, BLOCK_SIZE / 8);
          this.context.lineTo(0, -BLOCK_SIZE / 8);
          this.context.lineTo(BLOCK_SIZE / 4, BLOCK_SIZE / 8);
        } else {
          this.context.moveTo(-BLOCK_SIZE / 8, BLOCK_SIZE / 4);
          this.context.lineTo(-BLOCK_SIZE / 8, -BLOCK_SIZE / 8);
          this.context.lineTo(BLOCK_SIZE / 4, -BLOCK_SIZE / 8);
        }
        this.context.stroke();
      },
      point,
      rotation
    );
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
        this.renderPortal(point);
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

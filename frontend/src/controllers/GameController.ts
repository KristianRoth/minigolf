import { Ball, CanvasMouseEvent, GameEvent, Point } from '../types';
import { calcEndpoint, getMirroredPoint, PerSecondCounter } from '../utils/calculation';
import { MAX_LINE_LEN } from '../utils/constants';
import CanvasController from './CanvasController';

type OnShotHandler = (action: GameEvent) => void;

const shotModes = ['normal', 'inverted'] as const;
type ShotMode = typeof shotModes[number];

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;
  private playerName = '';
  private playerColor = '';
  private shotMode: ShotMode = 'normal';
  private touchDrag: { start: Point; end: Point } | null = null;
  private fpsCounter = new PerSecondCounter(50);
  private tickCounter = new PerSecondCounter(50);

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private findTouchLineEndPoint(ball: Ball): Point {
    const { start, end } = this.touchDrag as { start: Point; end: Point };
    const point = calcEndpoint(start, end, MAX_LINE_LEN);
    const mirroredPoint = getMirroredPoint(start, point);
    const dx = mirroredPoint.x - start.x;
    const dy = mirroredPoint.y - start.y;
    return { x: ball.x + dx || ball.x, y: ball.y + dy || ball.y };
  }

  doShot(point: Point, ball: Ball, onShot: OnShotHandler) {
    onShot({
      type: 'SHOT',
      x: point.x - ball.x,
      y: point.y - ball.y,
      id: ball.id,
    });
    this.setHasTurn(false);
  }

  handleMouseDown(event: CanvasMouseEvent, onShot: OnShotHandler) {
    event.preventDefault();
    super.setMouseAt(event);

    if (event.button === 2) {
      this.shotMode = this.shotMode === 'normal' ? 'inverted' : 'normal';
      return;
    }
    if (!this.ball || !this.hasTurn) return;

    const { ball } = this;
    const clickedAt = this.getMousePosition(event);

    if (event.pointerType !== 'mouse') {
      this.touchDrag = { start: clickedAt, end: clickedAt };
      return;
    }
    // MOUSE
    let point = calcEndpoint({ x: ball.x, y: ball.y }, clickedAt, MAX_LINE_LEN);
    if (this.shotMode === 'inverted') {
      point = getMirroredPoint({ x: ball.x, y: ball.y }, point);
    }
    this.doShot(point, ball, onShot);
  }

  handleMouseMove(event: CanvasMouseEvent) {
    event.preventDefault();
    super.setMouseAt(event);
    if (this.touchDrag && this.mouseAt) {
      this.touchDrag = { ...this.touchDrag, end: this.mouseAt };
    }
  }

  handleMouseUp(event: CanvasMouseEvent, onShot: OnShotHandler) {
    if (event.pointerType === 'mouse' || !this.touchDrag) return;
    if (!this.ball || !this.hasTurn) return;

    const shotPoint = this.findTouchLineEndPoint(this.ball);
    this.doShot(shotPoint, this.ball, onShot);
    this.touchDrag = null;
  }

  protected renderShotLine() {
    if (!this.hasTurn || !this.mouseAt || !this.ball) return;

    const { ball } = this;

    if (this.touchDrag) {
      const lineEndPoint = this.findTouchLineEndPoint(ball);
      this.drawLine(ball, lineEndPoint);
      return;
    }

    const point = calcEndpoint({ x: ball.x, y: ball.y }, this.mouseAt, MAX_LINE_LEN);
    if (this.shotMode === 'inverted') {
      const mirroredPoint = getMirroredPoint({ x: ball.x, y: ball.y }, point);
      this.drawLine(ball, mirroredPoint);
      this.drawLine(ball, point, true);
    } else {
      this.drawLine(ball, point);
    }
  }

  protected renderStatus() {
    this.context.save();
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillStyle = this.playerColor;

    const fps = Math.round(this.fpsCounter.value);
    const tick = Math.round(this.tickCounter.value);
    const text = `x: ${Math.round(x)}, y: ${Math.round(y)}, ${this.playerName} | fps: ${fps}, tick: ${tick}`;
    this.context.fillText(text, 7, 0.75 * this.blockSize);
    this.context.restore();
  }

  protected render() {
    this.clear();
    this.fpsCounter.add();

    this.renderShotLine();

    for (const ball of this.balls) {
      this.renderBall(ball);
    }

    this.renderCursor();
    this.renderStatus();
  }

  setBalls(balls: Ball[]) {
    if (!this.playerName && this.playerId) {
      const ball = balls.find((b) => b.id === this.playerId);
      this.playerName = ball?.name || '';
      this.playerColor = ball?.color || '';
    }
    this.balls = balls;
    this.tickCounter.add();
  }

  setHasTurn(hasTurn: boolean) {
    this.hasTurn = hasTurn;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
    this.hasTurn = true;
  }

  get ball(): Ball | null {
    return this.balls.find((b) => b.id === this.playerId) || null;
  }

  get debug() {
    return {
      mouseAt: this.mouseAt,
      balls: this.balls,
    };
  }
}

export default GameController;

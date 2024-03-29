import mitt from 'mitt';
import { Ball, CanvasMouseEvent, Point, Rotation, ROTATIONS, ShotEvent } from 'types';
import { calcEndpoint, calculateLineEndPoints, modulo, PerSecondCounter } from 'utils/calculation';
import { BALL_RADIUS } from 'utils/constants';
import CanvasController from './CanvasController';

type GameControllerEvents = {
  shot: ShotEvent;
};

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private gameHeading = '';
  private playerId = 0;
  private playerName = '';
  private playerColor = '';
  private shotRotationIdx = 0;
  private touchDrag: { start: Point; end: Point } | null = null;
  private effect = '';
  private fpsCounter = new PerSecondCounter(50);
  private tickCounter = new PerSecondCounter(50);

  public emitter = mitt<GameControllerEvents>();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private findTouchLineEndPoint(ball: Ball): Point {
    const { start, end } = this.touchDrag as { start: Point; end: Point };
    const { shot } = calculateLineEndPoints(start, end, Rotation.South);
    const dx = shot.x - start.x;
    const dy = shot.y - start.y;
    return { x: ball.x + dx || ball.x, y: ball.y + dy || ball.y };
  }

  private drawLineFromBall(ball: Ball, endpoint: Point, isDashed = false) {
    const start = calcEndpoint(ball, endpoint, BALL_RADIUS + 2);
    this.drawLine(start, endpoint, isDashed);
  }

  private doShot(point: Point, ball: Ball) {
    const x = point.x - ball.x;
    const y = point.y - ball.y;

    if (x === 0 && y === 0) return;

    this.emitter.emit('shot', {
      type: 'SHOT',
      x,
      y,
    });
    this.setHasTurn(false);
    this.doEffect('SHOT');
    this.shotRotationIdx = 0;
  }

  doEffect(effect: string) {
    this.effect = effect;
    setTimeout(() => {
      this.effect = '';
    }, 2000);
  }

  handleMouseDown(event: CanvasMouseEvent) {
    event.preventDefault();
    super.setMouseAt(event);

    if (event.button === 2) {
      this.shotRotationIdx = modulo(this.shotRotationIdx + 1, ROTATIONS.length);
      return;
    }
    if (!this.ball || !this.hasTurn) return;

    const clickedAt = this.getMousePosition(event);

    if (event.pointerType !== 'mouse') {
      this.touchDrag = { start: clickedAt, end: clickedAt };
      return;
    }
    // MOUSE
    const { shot } = calculateLineEndPoints(this.ball, clickedAt, this.shotRotationIdx);
    this.doShot(shot, this.ball);
  }

  handleMouseMove(event: CanvasMouseEvent) {
    event.preventDefault();
    super.setMouseAt(event);
    if (this.touchDrag && this.mouseAt) {
      this.touchDrag = { ...this.touchDrag, end: this.mouseAt };
    }
  }

  handleMouseUp(event: CanvasMouseEvent) {
    if (event.pointerType === 'mouse' || !this.touchDrag) return;
    if (!this.ball || !this.hasTurn) return;

    const shotPoint = this.findTouchLineEndPoint(this.ball);
    this.doShot(shotPoint, this.ball);
    this.touchDrag = null;
  }

  protected renderShotLine() {
    if (!this.hasTurn || !this.mouseAt || !this.ball) return;

    const { ball } = this;

    if (this.touchDrag) {
      const lineEndPoint = this.findTouchLineEndPoint(ball);
      this.drawLineFromBall(ball, lineEndPoint);
      return;
    }

    const rotation = ROTATIONS[this.shotRotationIdx];
    const { shot, guide } = calculateLineEndPoints(ball, this.mouseAt, this.shotRotationIdx);
    if (rotation !== 'North') {
      this.drawLineFromBall(ball, guide, true);
    }
    this.drawLineFromBall(ball, shot);
  }

  protected renderStatus() {
    this.context.save();
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillStyle = this.playerColor;

    const state: Record<string, any> = {
      name: this.playerName,
      shot: this.ball?.shotCount || 0,
      x: Math.round(x),
      y: Math.round(y),
      fps: Math.round(this.fpsCounter.value),
      tick: Math.round(this.tickCounter.value),
    };
    if (this.effect) {
      state.effect = this.effect;
    }

    const text = JSON.stringify(state).slice(1, -1).replaceAll('"', '').replaceAll(',', ', ').replaceAll(':', ': ');
    this.context.fillText(text, 7, 0.75 * this.blockSize);
    this.context.restore();
  }

  protected renderHeading() {
    if (!this.gameHeading) return;
    this.context.save();
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    this.context.font = `${5 * this.blockSize}px serif`;

    this.context.fillText(this.gameHeading, this.canvas.width / 2, this.canvas.height / 2);

    this.context.restore();
  }

  protected render() {
    this.clear();
    this.fpsCounter.add();

    this.renderShotLine();

    this.renderCursor();
    this.renderStatus();
    this.renderHeading();
  }

  setBalls(balls: Ball[]) {
    this.balls = balls;
    this.tickCounter.add();
  }

  setHasTurn(hasTurn: boolean) {
    this.hasTurn = hasTurn;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
  }

  setHeading(heading: string) {
    this.gameHeading = heading;
  }

  get ball(): Ball | null {
    return this.balls.find((b) => b.id === this.playerId) || null;
  }

  get debug() {
    return {
      playerId: this.playerId,
      balls: this.balls,
    };
  }

  destroy(): void {
    super.destroy();
    this.emitter.all.clear();
  }
}

export default GameController;

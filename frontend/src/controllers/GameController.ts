import { Ball, CanvasMouseEvent, GameEvent, Point, ROTATIONS } from '../types';
import { calculateLineEndPoints, modulo, PerSecondCounter } from '../utils/calculation';
import CanvasController from './CanvasController';

type OnShotHandler = (action: GameEvent) => void;

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;
  private playerName = '';
  private playerColor = '';
  private shotRotationIdx = 0;
  private touchDrag: { start: Point; end: Point } | null = null;
  private effect = '';
  private fpsCounter = new PerSecondCounter(50);
  private tickCounter = new PerSecondCounter(50);

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  private findTouchLineEndPoint(ball: Ball): Point {
    const { start, end } = this.touchDrag as { start: Point; end: Point };
    const { shot } = calculateLineEndPoints(start, end, 'South');
    const dx = shot.x - start.x;
    const dy = shot.y - start.y;
    return { x: ball.x + dx || ball.x, y: ball.y + dy || ball.y };
  }

  doShot(point: Point, ball: Ball, onShot: OnShotHandler) {
    const x = point.x - ball.x;
    const y = point.y - ball.y;

    if (x === 0 && y === 0) return;

    onShot({
      type: 'SHOT',
      x,
      y,
      id: ball.id,
    });
    this.setHasTurn(false);
    this.doEffect('SHOT');
  }

  doEffect(effect: string) {
    this.effect = effect;
    setTimeout(() => {
      this.effect = '';
    }, 2000);
  }

  handleMouseDown(event: CanvasMouseEvent, onShot: OnShotHandler) {
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
    const { shot } = calculateLineEndPoints(this.ball, clickedAt, ROTATIONS[this.shotRotationIdx]);
    this.doShot(shot, this.ball, onShot);
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

    const rotation = ROTATIONS[this.shotRotationIdx];
    const { shot, guide } = calculateLineEndPoints(ball, this.mouseAt, ROTATIONS[this.shotRotationIdx]);
    if (rotation !== 'North') {
      this.drawLine(ball, guide, true);
    }
    this.drawLine(ball, shot);
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

  protected render() {
    this.clear();
    this.fpsCounter.add();

    this.renderShotLine();

    let playerBall: Ball | undefined = undefined;
    for (const ball of this.balls) {
      if (ball.id === this.playerId) {
        playerBall = ball;
      } else {
        this.renderBall(ball);
      }
    }
    if (playerBall) {
      this.renderBall(playerBall);
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
      playerId: this.playerId,
      balls: this.balls,
    };
  }
}

export default GameController;

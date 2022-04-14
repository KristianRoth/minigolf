import { calcEndpoint } from './helpers';
import { Ball, GameEvent } from '../types';
import CanvasController from './CanvasController';

const MAX_LINE_LEN = 1000;

type OnShotHandler = (action: GameEvent) => void;

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;
  private playerName = '';
  private playerColor = '';

  private onShot: OnShotHandler | null = null;

  constructor(rootId: string, index: number) {
    super(rootId, index);
  }

  protected onMouseDown(event: MouseEvent) {
    const clickedAt = this.getMousePosition(event);
    const ball = this.balls.find((b) => b.id === this.playerId);

    if (!ball || !this.hasTurn || !this.onShot) return;

    const point = calcEndpoint({ x: ball.x, y: ball.y }, clickedAt, MAX_LINE_LEN);

    this.onShot({
      type: 'SHOT',
      x: point.x - ball.x,
      y: point.y - ball.y,
      id: ball.id,
    });
    this.setHasTurn(false);
  }

  protected onMouseUp() {
    /* */
  }

  protected onMouseMove(event: MouseEvent) {
    super.onMouseMove(event);
  }

  protected renderShotLine() {
    if (this.hasTurn && this.mouseAt) {
      const ball = this.balls.find((b) => b.id === this.playerId);
      if (ball) {
        const point = calcEndpoint({ x: ball.x, y: ball.y }, this.mouseAt, MAX_LINE_LEN);
        this.renderLine(ball, point);
      }
    }
  }

  protected renderStatus() {
    this.context.save();
    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillStyle = this.playerColor;
    this.context.fillText(`x: ${Math.round(x)}, y: ${Math.round(y)}, ${this.playerName}`, 7, 0.75 * this.blockSize);
    this.context.restore();
  }

  protected render() {
    this.clear();

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
  }

  setHasTurn(hasTurn: boolean) {
    this.hasTurn = hasTurn;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
    this.hasTurn = true;
  }

  setOnShot(onShot: OnShotHandler) {
    this.onShot = onShot;
  }

  get debug() {
    return {
      mouseAt: this.mouseAt,
      balls: this.balls,
    };
  }
}

export default GameController;

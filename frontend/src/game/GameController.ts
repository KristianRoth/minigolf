import { calcEndpoint } from './helpers';
import { Ball, GameEvent } from '../types';
import CanvasController from './CanvasController';

const BALL_RADIUS = 50;
const MAX_LINE_LEN = 1000;

type OnShotHandler = (action: GameEvent) => void;

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;
  private playerName = '';

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

  protected render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.hasTurn && this.mouseAt) {
      const ball = this.balls.find((b) => b.id === this.playerId);
      if (ball) {
        const point = calcEndpoint({ x: ball.x, y: ball.y }, this.mouseAt, MAX_LINE_LEN);
        this.context.beginPath();
        this.context.moveTo(this.c(ball.x), this.c(ball.y));
        this.context.lineTo(this.c(point.x), this.c(point.y));
        this.context.stroke();
      }
    }

    for (const ball of this.balls) {
      this.context.beginPath();
      this.context.fillStyle = ball.color;
      this.context.arc(this.c(ball.x), this.c(ball.y), this.c(BALL_RADIUS), 0, Math.PI * 2, true);
      this.context.fill();
      this.context.fillStyle = '#000';
      this.context.closePath();
      if (ball.id === this.playerId) {
        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.ellipse(
          this.c(ball.x),
          this.c(ball.y),
          this.c(BALL_RADIUS + 10),
          this.c(BALL_RADIUS + 10),
          0,
          Math.PI * 2,
          0
        );
        this.context.stroke();
      }
      this.context.lineWidth = 1;
    }

    if (this.mouseAt) {
      const { x, y } = this.mouseAt;
      this.context.beginPath();
      this.context.moveTo(this.c(x), this.c(y - BALL_RADIUS));
      this.context.lineTo(this.c(x), this.c(y + BALL_RADIUS));
      this.context.moveTo(this.c(x - BALL_RADIUS), this.c(y));
      this.context.lineTo(this.c(x + BALL_RADIUS), this.c(y));
      this.context.stroke();
    }

    const { x, y } = this.mouseAt || { x: NaN, y: NaN };
    this.context.font = `${0.8 * this.blockSize}px serif`;
    this.context.fillText(`x: ${Math.round(x)}, y: ${Math.round(y)}, ${this.playerName}`, 7, 0.75 * this.blockSize);
  }

  setBalls(balls: Ball[]) {
    if (!this.playerName && this.playerId) {
      this.playerName = balls.find((b) => b.id === this.playerId)?.name || '';
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

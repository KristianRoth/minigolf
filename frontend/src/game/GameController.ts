import { calcEndpoint } from './helpers';
import { Ball, GameEvent, Point } from '../types';
import CanvasController from './CanvasController';

const BALL_RADIUS = 50;
const MAX_LINE_LEN = 1000;

type ClickState = { ball: Ball; end: Point };
type OnShotHandler = (action: GameEvent) => void;

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;

  private clickState: ClickState | null = null;
  private onShot: OnShotHandler | null = null;

  constructor(rootId: string, index: number) {
    super(rootId, index);
  }

  private setClickState(clickState: ClickState | null) {
    this.clickState = clickState;
  }

  protected onMouseDown(event: MouseEvent) {
    this.setClickState(null);

    const clickedAt = this.getMousePosition(event);

    const ball = this.balls.find((b) => b.id === this.playerId);

    if (!ball || !this.hasTurn) return;

    this.setClickState({
      ball: { ...ball },
      end: clickedAt,
    });
  }

  protected onMouseUp() {
    const clickState = this.clickState;
    this.setClickState(null);

    if (clickState && this.onShot) {
      const { ball, end } = clickState;
      const point = calcEndpoint({ x: ball.x, y: ball.y }, end, MAX_LINE_LEN);

      this.onShot({
        type: 'SHOT',
        x: point.x - ball.x,
        y: point.y - ball.y,
        id: ball.id,
      });
      this.setHasTurn(false);
    }
  }

  protected onMouseMove(event: MouseEvent) {
    super.onMouseMove(event);

    const clickState = this.clickState;

    if (clickState) {
      this.setClickState({
        ...clickState,
        end: this.mouseAt as Point,
      });
    }
  }

  protected render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.clickState) {
      const { ball, end } = { ...this.clickState };
      const point = calcEndpoint({ x: ball.x, y: ball.y }, end, MAX_LINE_LEN);
      this.context.beginPath();
      this.context.moveTo(this.c(ball.x), this.c(ball.y));
      this.context.lineTo(this.c(point.x), this.c(point.y));
      this.context.stroke();
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
    this.context.fillText(
      `x: ${Math.round(x)}, y: ${Math.round(y)}, Player: ${this.playerId}`,
      7,
      0.75 * this.blockSize
    );
  }

  setBalls(balls: Ball[]) {
    this.balls = balls;
  }

  setHasTurn(hasTurn: boolean) {
    this.hasTurn = hasTurn;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
  }

  setOnShot(onShot: OnShotHandler) {
    this.onShot = onShot;
  }

  get debug() {
    return {
      mouseAt: this.mouseAt,
      ...this.clickState,
      balls: this.balls,
    };
  }
}

export default GameController;

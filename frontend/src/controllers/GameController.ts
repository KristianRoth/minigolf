import { Ball, CanvasMouseEvent, GameEvent } from '../types';
import { calcEndpoint } from '../utils/calculation';
import { MAX_LINE_LEN } from '../utils/constants';
import CanvasController from './CanvasController';

type OnShotHandler = (action: GameEvent) => void;

class GameController extends CanvasController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;
  private playerName = '';
  private playerColor = '';

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  handleMouseDown(event: CanvasMouseEvent, onShot: OnShotHandler) {
    const clickedAt = this.getMousePosition(event);
    const ball = this.balls.find((b) => b.id === this.playerId);

    if (!ball || !this.hasTurn) return;

    const point = calcEndpoint({ x: ball.x, y: ball.y }, clickedAt, MAX_LINE_LEN);

    onShot({
      type: 'SHOT',
      x: point.x - ball.x,
      y: point.y - ball.y,
      id: ball.id,
    });
    this.setHasTurn(false);
  }

  handleMouseMove(event: CanvasMouseEvent) {
    super.setMouseAt(event);
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

  get debug() {
    return {
      mouseAt: this.mouseAt,
      balls: this.balls,
    };
  }
}

export default GameController;

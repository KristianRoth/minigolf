import { calcEndpoint, clamp } from './helpers';
import { Ball, GameEvent, Point } from '../types';

const GAME_WIDTH = 4900;
const GAME_HEIGHT = 2500;
const BALL_RADIUS = 50;
const MAX_LINE_LEN = 1000;

const RATIO = GAME_HEIGHT / GAME_WIDTH;

type ClickState = { ball: Ball; end: Point };
type OnShotHandler = (action: GameEvent) => void;

class GameController {
  private balls: Ball[] = [];
  private hasTurn = false;
  private playerId = 0;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private clickState: ClickState | null = null;
  private mouseAt: Point | null = null;
  private onShot: OnShotHandler;

  constructor(canvas: HTMLCanvasElement, onShot: OnShotHandler) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.onShot = onShot;
    this.onResize();
  }

  private c(value: number): number {
    return clamp(value, 0, GAME_WIDTH, 0, this.canvas.width);
  }

  private dc(value: number): number {
    return clamp(value, 0, this.canvas.width, 0, GAME_WIDTH);
  }

  private getMousePosition(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.dc(event.clientX - rect.left);
    const y = this.dc(event.clientY - rect.top);
    return { x, y };
  }

  private setClickState(clickState: ClickState | null) {
    this.clickState = clickState;
  }

  private onMouseDown = (event: MouseEvent) => {
    this.setClickState(null);

    const clickedAt = this.getMousePosition(event);

    const ball = this.balls.find((b) => b.id === this.playerId);

    if (!ball || !this.hasTurn) return;

    this.setClickState({
      ball: { ...ball },
      end: clickedAt,
    });

    this.render();
  };

  private onMouseUp = () => {
    const clickState = this.clickState;
    this.setClickState(null);

    if (clickState) {
      const { ball, end } = clickState;
      const point = calcEndpoint({ x: ball.x, y: ball.y }, end, MAX_LINE_LEN);

      this.onShot({
        type: 'SHOT',
        x: point.x - ball.x,
        y: point.y - ball.y,
        id: ball.id,
      });
    }

    this.render();
  };

  private onMouseMove = (event: MouseEvent) => {
    const position = this.getMousePosition(event);

    this.mouseAt = position;

    const clickState = this.clickState;

    if (clickState) {
      this.setClickState({
        ...clickState,
        end: position,
      });
    }

    if (this.clickState !== clickState) {
      this.render();
    }
  };

  private onResize = () => {
    const width = window.innerWidth - 30;
    const height = width * RATIO;

    this.canvas.width = width;
    this.canvas.height = height;
  };

  private render() {
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
  }

  init() {
    document.body.addEventListener('mousedown', this.onMouseDown);
    document.body.addEventListener('mouseup', this.onMouseUp);
    document.body.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    document.body.removeEventListener('mousedown', this.onMouseDown);
    document.body.removeEventListener('mouseup', this.onMouseUp);
    document.body.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
  }

  setBalls(balls: Ball[]) {
    this.balls = balls;
    this.render();
  }

  setHasTurn(hasTurn: boolean) {
    this.hasTurn = hasTurn;
    this.render();
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
    this.render();
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

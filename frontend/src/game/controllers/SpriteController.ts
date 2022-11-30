import { Ball, Point } from 'types';
import { BALL_RADIUS } from 'utils/constants';
import CanvasController from './CanvasController';

type AnimateFn = () => void;
class AnimationQueue {
  private queue: AnimateFn[];
  private fps: number;
  private lastEvent: number = Date.now();
  private lastFn: AnimateFn = () => {
    /* */
  };

  constructor(queue: AnimateFn[], fps = 60) {
    this.queue = queue;
    this.fps = fps;
  }

  /** Returns true when queue is empty */
  public animate(): boolean {
    const now = Date.now();
    if (now - this.lastEvent < 1000 / this.fps) {
      this.lastFn();
      return false;
    }
    const animateFn = this.queue.shift();
    if (!animateFn) return true;

    this.lastEvent = now;
    this.lastFn = animateFn;
    animateFn();
    return false;
  }
}

class SpriteController extends CanvasController {
  private balls: Ball[] = [];
  private playerId = 0;

  private animations: Record<string, AnimationQueue> = {};

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  protected render() {
    this.clear();

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

    for (const [key, queue] of Object.entries(this.animations)) {
      const isDone = queue.animate();
      if (isDone) {
        delete this.animations[key];
      }
    }
  }

  public animateHole(hole: Point, ball: Ball) {
    const queue: AnimateFn[] = [];
    const iters = 60;
    for (let i = 0; i < iters; i += 1) {
      const size = BALL_RADIUS - i * (BALL_RADIUS / iters);
      queue.push(() => {
        this.renderElement(() => {
          this.context.fillStyle = ball.color;
          this.context.rotate(-i * 15 * (Math.PI / 180));
          this.drawCircle({ x: size, y: size }, size);
        }, hole);
      });
    }
    this.animations[Date.now()] = new AnimationQueue(queue);
  }

  setBalls(balls: Ball[]) {
    this.balls = balls;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
  }

  getBalls(): Ball[] {
    return this.balls;
  }
}

export default SpriteController;

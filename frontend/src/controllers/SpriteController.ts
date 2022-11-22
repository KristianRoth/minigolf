import { Ball } from '../types';
import CanvasController from './CanvasController';

class SpriteController extends CanvasController {
  private balls: Ball[] = [];
  private playerId = 0;

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
  }

  setBalls(balls: Ball[]) {
    this.balls = balls;
  }

  setPlayerId(playerId: number) {
    this.playerId = playerId;
  }
}

export default SpriteController;

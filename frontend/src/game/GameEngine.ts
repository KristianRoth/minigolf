import GameController from './controllers/GameController';
import { GameStorage } from '../utils/api';
import { GroundController, StructureController } from './controllers/MapController';
import SpriteController from './controllers/SpriteController';
import { GameEvent, InitEvent, UpdateEvent } from '../types';
import { gameMapFromDTO } from '../utils/dto';
import EventEmitter from 'events';

const colors = ['red', 'blue', 'cyan', 'green', 'yellow', 'orange', 'maroon'];

const getUrl = (gameId: string) => {
  const name = GameStorage.getPlayerName(gameId);
  const id = GameStorage.getPlayerId(gameId);

  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const { host } = window.location;

  let url = `${protocol}://${host}/ws/game/${gameId}?name=${name}`;
  if (id) {
    url = `${url}&id=${id}`;
  }
  return url;
};

class GameEngine extends EventEmitter {
  socket: WebSocket | null = null;

  constructor(
    private gameId: string,
    private groundController: GroundController,
    private structController: StructureController,
    private spriteController: SpriteController,
    private gameController: GameController
  ) {
    super();
  }

  public init() {
    this.gameController.on('message', this.sendMessage.bind(this));
    this.socket = new WebSocket(getUrl(this.gameId));
    this.socket.addEventListener('open', this.onOpen.bind(this));
    this.socket.addEventListener('message', this.onMessage.bind(this));
    this.socket.addEventListener('close', this.onClose.bind(this));
  }

  public destroy() {
    this.removeAllListeners();
    if (!this.socket) return;
    this.socket.removeEventListener('open', this.onOpen);
    this.socket.removeEventListener('message', this.onMessage);
    this.socket.removeEventListener('close', this.onClose);
    if (this.socket.readyState === this.socket.OPEN) this.socket.close(1000);
    this.socket = null;
  }

  public sendMessage(payload: any) {
    this.socket?.send(JSON.stringify(payload));
  }

  private onOpen() {
    console.log('connected');
    this.emit('connected');
  }

  private onClose() {
    console.log('disconnected');
    this.emit('disconnected');
  }

  private onMessage(payload: any) {
    let event: GameEvent;
    try {
      event = JSON.parse(payload.data) as GameEvent;
    } catch (err) {
      console.error(err);
      return;
    }
    switch (event.type) {
      case 'UPDATE': {
        this.handleUpdate(event);
        break;
      }
      case 'INIT': {
        this.handleInit(event);
        break;
      }
      case 'TURN_BEGIN': {
        this.gameController.setHasTurn(true);
        break;
      }
      case 'EFFECT': {
        this.gameController.doEffect(event.value);
        break;
      }
      case 'SAVE_DEMO_MAP': {
        const newState = { isOpen: true, saveDemoJWT: event.jwt };
        setTimeout(() => {
          this.emit('save-demo', newState);
        }, 200);
        break;
      }
    }
  }

  private handleUpdate(event: UpdateEvent) {
    const newBalls = event.playerStates
      .map(({ id, x, y, name, shotCount }) => {
        return {
          id,
          x,
          y,
          name,
          shotCount,
          color: colors[id % colors.length],
        };
      })
      .sort((a, b) => a.id - b.id);
    this.gameController.setBalls(newBalls);
    this.spriteController.setBalls(newBalls);
  }

  private handleInit(event: InitEvent) {
    GameStorage.setPlayerId(this.gameId, event.playerId.toString());
    this.gameController?.setPlayerId(event.playerId);
    this.spriteController?.setPlayerId(event.playerId);

    const map = gameMapFromDTO(event.gameMap);
    this.groundController?.setGameMap(map);
    this.structController?.setGameMap(map);
    this.emit('init', event);
  }
}

export default GameEngine;

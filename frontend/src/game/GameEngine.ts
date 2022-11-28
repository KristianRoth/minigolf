import mitt from 'mitt';
import {
  GameEvent,
  InitEvent,
  PlayerStatus,
  ReconnectEvent,
  StartMapEvent,
  StatusChangeEvent,
  UpdateEvent,
} from 'types';
import { GameStorage } from 'utils/api';
import { gameMapFromDTO } from 'utils/dto';
import GameController from './controllers/GameController';
import { GroundController, StructureController } from './controllers/MapController';
import SpriteController from './controllers/SpriteController';

const colors = ['red', 'blue', 'cyan', 'green', 'yellow', 'orange', 'maroon'];

const getUrl = (gameId: string) => {
  const name = GameStorage.getPlayerName(gameId);
  const id = GameStorage.getPlayerId(gameId);
  const token = GameStorage.getPlayerToken(gameId);

  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const { host } = window.location;

  let url = `${protocol}://${host}/ws/game/${gameId}?name=${name}`;

  if (id) url = `${url}&id=${id}`;
  if (token) url = `${url}&token=${token}`;
  return url;
};

type GameEngineEvents = {
  'start-map': { isDemo: boolean };
  'save-demo': any;
  connected: undefined;
  disconnected: undefined;
};

class GameEngine {
  private socket: WebSocket | null = null;

  public emitter = mitt<GameEngineEvents>();

  constructor(
    private gameId: string,
    private groundController: GroundController,
    private structController: StructureController,
    private spriteController: SpriteController,
    private gameController: GameController
  ) {}

  public init() {
    this.gameController.emitter.on('shot', this.sendMessage.bind(this));
    this.socket = new WebSocket(getUrl(this.gameId));
    this.socket.addEventListener('open', this.onOpen.bind(this));
    this.socket.addEventListener('message', this.onMessage.bind(this));
    this.socket.addEventListener('close', this.onClose.bind(this));
    this.socket.addEventListener('error', this.onError.bind(this));
  }

  public destroy() {
    this.emitter.all.clear();
    if (!this.socket) return;
    this.socket.removeEventListener('open', this.onOpen);
    this.socket.removeEventListener('message', this.onMessage);
    this.socket.removeEventListener('close', this.onClose);
    this.socket.removeEventListener('error', this.onError);
    if (this.socket.readyState === this.socket.OPEN) this.socket.close(1000);
    this.socket = null;
  }

  public sendMessage(payload: GameEvent) {
    this.socket?.send(JSON.stringify(payload));
  }

  private onOpen() {
    this.emitter.emit('connected');
  }

  private onClose() {
    this.emitter.emit('disconnected');
  }

  private onError(error: any) {
    console.log('WebSocket error: ', error);
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
      case 'JOIN': {
        console.log(`Player ${event.name} has joined`);
        break;
      }
      case 'INIT': {
        this.handleInit(event);
        break;
      }
      case 'RECONNECT': {
        this.handleReconnect(event);
        break;
      }
      case 'START_MAP': {
        this.handleStartMap(event);
        break;
      }
      case 'END_MAP': {
        this.gameController.setHeading('End map');
        break;
      }
      case 'UPDATE': {
        this.handleUpdate(event);
        break;
      }
      case 'STATUS_CHANGE': {
        this.handleStatusChange(event);
        break;
      }
      case 'EFFECT': {
        this.gameController.doEffect(event.value);
        break;
      }
      case 'SAVE_DEMO_MAP': {
        const newState = { isOpen: true, saveDemoJWT: event.jwt };
        setTimeout(() => {
          this.emitter.emit('save-demo', newState);
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
    GameStorage.setPlayerToken(this.gameId, event.token);
    this.gameController.setPlayerId(event.playerId);
    this.spriteController.setPlayerId(event.playerId);
  }

  private handleStartMap(event: StartMapEvent) {
    this.gameController.setHeading('');
    this.startMap(event.gameMap, event.isDemo);
  }

  private handleReconnect(event: ReconnectEvent) {
    this.startMap(event.gameMap, event.isDemo);
    this.gameController.setHasTurn(event.isTurn);
    this.gameController.setPlayerId(event.playerId);
    this.spriteController.setPlayerId(event.playerId);
  }

  private handleStatusChange(event: StatusChangeEvent) {
    switch (event.status) {
      case PlayerStatus.IsTurn: {
        this.gameController.setHasTurn(true);
        break;
      }
    }
  }

  private startMap(mapDto: any, isDemo: boolean) {
    const map = gameMapFromDTO(mapDto);
    this.groundController?.setGameMap(map);
    this.structController?.setGameMap(map);
    this.emitter.emit('start-map', { isDemo });
  }
}

export default GameEngine;

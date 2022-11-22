import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import Row from '../components/Row';
import GameController from '../controllers/GameController';
import { GroundController, StructureController } from '../controllers/MapController';
import SpriteController from '../controllers/SpriteController';
import useCanvasController from '../hooks/useCanvasController';
import useWebsocket from '../hooks/useWebsocket';
import { GameEvent } from '../types';
import { GameStorage, JSONFetch } from '../utils/api';
import { gameMapFromDTO, gameMapToDTO } from '../utils/dto';

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

class OverlayState {
  isDemo = false;
  isOpen = false;
  saveDemoJWT = '';
}

function Game() {
  const [debug, setDebug] = useState(false);
  const [connected, setConnected] = useState(false);
  const [overlayState, setOverlayState] = useState<OverlayState>(new OverlayState());

  const [spriteRef, spriteController] = useCanvasController(SpriteController);
  const [groundRef, groundController] = useCanvasController(GroundController);
  const [structRef, structController] = useCanvasController(StructureController);
  const [gameRef, gameController] = useCanvasController(GameController);

  const navigate = useNavigate();
  const { gameId = '' } = useParams();

  const onShot = (value: GameEvent) => {
    sendMessage(JSON.stringify(value));
  };

  const onOpen = useCallback(() => {
    console.log('connected');
    setConnected(true);
  }, []);

  const onClose = useCallback(() => {
    console.log('disconnected');
    setConnected(false);
  }, []);

  const onMessage = useCallback(
    (payload: any) => {
      try {
        const event: GameEvent = JSON.parse(payload.data as any);
        switch (event.type) {
          case 'UPDATE': {
            const newBalls = event.playerStates.map(({ id, x, y, name, shotCount }) => {
              return {
                id,
                x,
                y,
                name,
                shotCount,
                color: colors[id % colors.length],
              };
            });
            gameController?.setBalls(newBalls);
            spriteController?.setBalls(newBalls);
            break;
          }
          case 'INIT': {
            GameStorage.setPlayerId(gameId, event.playerId.toString());
            gameController?.setPlayerId(event.playerId);
            spriteController?.setPlayerId(event.playerId);

            const map = gameMapFromDTO(event.gameMap);
            groundController?.setGameMap(map);
            structController?.setGameMap(map);
            setOverlayState({ ...overlayState, isDemo: event.isDemo });
            break;
          }
          case 'TURN_BEGIN': {
            gameController?.setHasTurn(true);
            break;
          }
          case 'EFFECT': {
            gameController?.doEffect(event.value);
            break;
          }
          case 'SAVE_DEMO_MAP': {
            setTimeout(() => {
              setOverlayState({ ...overlayState, isOpen: true, saveDemoJWT: event.jwt });
            }, 200);
            break;
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [gameController, groundController, structController, spriteController, gameId, overlayState]
  );

  const { connect, sendMessage, close } = useWebsocket({
    url: getUrl(gameId),
    onOpen,
    onMessage,
    onClose,
  });

  useEffect(() => {
    if (connected) return;
    connect();
    return () => {
      close();
    };
  }, []);

  useEffect(() => {
    if (!overlayState.isDemo || !overlayState.isOpen) return;
    const confirm = window.confirm("Do you wan't to save the map?");
    setOverlayState({ ...overlayState, isOpen: false });
    if (!confirm) return;

    (async () => {
      const map = groundController?.getMap();
      if (!map || !overlayState.saveDemoJWT) return;
      try {
        const data = await JSONFetch('/api/game-maps', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${overlayState.saveDemoJWT}`,
          },
          body: gameMapToDTO(map),
        });
        if (data.gameMap) {
          close();
          navigate(`/editor/${data.gameMap}`);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [overlayState, groundController]);

  const disconnect = () => {
    close();
    GameStorage.removePlayerId(gameId);
    GameStorage.removePlayerName(gameId);
    window.location.reload();
  };

  const goToEdit = () => {
    const gameMap = groundController?.getMap();
    if (!gameMap) return;
    GameStorage.setGameMap(gameMap);
    close();
    navigate(`/editor/${gameMap.id}`);
  };

  const menu = (
    <>
      <div>
        <button onClick={() => setDebug(!debug)}>Toggle debug</button>
      </div>
      <div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
      <div>
        <button onClick={() => goToEdit()}>Edit</button>
      </div>
    </>
  );
  return (
    <>
      <CanvasGroup menu={menu} help={<p>Tekemällä oppii.</p>}>
        <Canvas ref={groundRef} />
        <Canvas ref={spriteRef} />
        <Canvas ref={structRef} />
        <Canvas
          ref={gameRef}
          onPointerDown={(event) => gameController?.handleMouseDown(event, onShot)}
          onPointerMove={(event) => gameController?.handleMouseMove(event)}
          onPointerUp={(event) => gameController?.handleMouseUp(event, onShot)}
        />
      </CanvasGroup>
      {debug && gameController && (
        <Row>
          <pre style={{ width: '50%', marginLeft: 10 }}>{JSON.stringify(gameController.debug, undefined, 2)}</pre>
        </Row>
      )}
    </>
  );
}

export default Game;

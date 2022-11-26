import Button from 'components/Button';
import Canvas from 'components/Canvas';
import CanvasGroup from 'components/CanvasGroup';
import Row from 'components/Row';
import { SpriteController, GroundController, StructureController, GameController, GameEngine } from 'game';
import useCanvasController from 'hooks/useCanvasController';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameStorage, JSONFetch } from 'utils/api';
import { gameMapToDTO } from 'utils/dto';

class OverlayState {
  isDemo = false;
  isOpen = false;
  saveDemoJWT = '';
}

function Game() {
  const [gameExists, setGameExists] = useState(false);

  const [debug, setDebug] = useState(false);
  const [overlayState, setOverlayState] = useState<OverlayState>(new OverlayState());

  const navigate = useNavigate();
  const { gameId = '' } = useParams();

  const [spriteRef, spriteController] = useCanvasController(SpriteController);
  const [groundRef, groundController] = useCanvasController(GroundController);
  const [structRef, structController] = useCanvasController(StructureController);
  const [gameRef, gameController] = useCanvasController(GameController);

  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);

  useEffect(() => {
    const token = GameStorage.getPlayerToken(gameId);
    const headers: RequestInit['headers'] = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
    fetch(`/api/game/${gameId}`, { headers }).then((res) => {
      if (res.ok) {
        setGameExists(true);
      } else {
        navigate('/');
      }
    });
  }, [gameId, navigate]);

  useEffect(() => {
    if (!gameExists || !(gameController && groundController && structController && spriteController && gameId)) return;
    const engine = new GameEngine(gameId, groundController, structController, spriteController, gameController);
    engine.init();

    engine.emitter.on('start-map', (event) => {
      setOverlayState((prev) => ({ ...prev, isDemo: event.isDemo }));
    });

    engine.emitter.on('save-demo', (event) => {
      setOverlayState((prev) => ({ ...prev, ...event }));
    });

    setGameEngine(engine);

    return () => {
      setGameEngine(null);
      engine.destroy();
    };
  }, [gameController, groundController, structController, spriteController, gameId, gameExists]);

  const saveMap = async () => {
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
        navigate(`/editor/${data.gameMap}`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!overlayState.isDemo || !overlayState.isOpen) return;
    const confirm = window.confirm("Do you wan't to save the map?");
    setOverlayState({ ...overlayState, isOpen: false });
    if (!confirm) return;

    saveMap();
  }, [overlayState]);

  const disconnect = () => {
    gameEngine?.destroy();
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
      <Row>
        <Button onClick={() => gameEngine?.sendMessage({ type: 'IS_READY', value: true })}>IS_READY</Button>
      </Row>
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
          onPointerDown={(e) => gameController?.handleMouseDown(e)}
          onPointerMove={(e) => gameController?.handleMouseMove(e)}
          onPointerUp={(e) => gameController?.handleMouseUp(e)}
        />
      </CanvasGroup>
      {debug && gameController && (
        <>
          <Row>
            <pre style={{ width: '50%', marginLeft: 10 }}>{JSON.stringify(gameController.debug, undefined, 2)}</pre>
          </Row>
        </>
      )}
    </>
  );
}

export default Game;

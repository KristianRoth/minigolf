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
    if (!(gameController && groundController && structController && spriteController && gameId)) return;
    const engine = new GameEngine(gameId, groundController, structController, spriteController, gameController);
    engine.init();

    engine.on('init', (event) => {
      setOverlayState((prev) => ({ ...prev, isDemo: event.isDemo }));
    });

    engine.on('save-demo', (event: any) => {
      setOverlayState((prev) => ({ ...prev, ...event }));
    });

    setGameEngine(engine);

    return () => {
      setGameEngine(null);
      engine.destroy();
    };
  }, [gameController, groundController, structController, spriteController, gameId]);

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
        close();
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
        <Row>
          <pre style={{ width: '50%', marginLeft: 10 }}>{JSON.stringify(gameController.debug, undefined, 2)}</pre>
        </Row>
      )}
    </>
  );
}

export default Game;

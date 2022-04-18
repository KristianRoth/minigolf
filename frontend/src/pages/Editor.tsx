import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorController from '../controllers/EditorController';
import MapController from '../controllers/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useUndoRedo from '../hooks/useUndoRedo';
import { CanvasMouseEvent, GameMap, GROUND_TYPES, ROTATIONS, STRUCTURE_TYPES, Tile } from '../types';
import { BASE_URL, GameStorage } from '../utils/api';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import Row from '../components/Row';
import templates from '../utils/templates';

function Editor() {
  const [id, setId] = useState('');
  const [mapName, setMapName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');

  // TODO: Put these into an editor-state object.
  const [mode, setMode] = useState<'Structure' | 'Ground'>('Structure');
  const [structureIdx, setStructureIdx] = useState<number>(0);
  const [groundIdx, setGroundIdx] = useState<number>(0);
  const [rotationIdx, setRotationIdx] = useState<number>(0);

  const {
    state: tiles,
    setState: setTiles,
    index: undoIndex,
    maxIndex: maxUndoIndex,
    goBack,
    goForward,
  } = useUndoRedo<Tile[]>([]);

  const { mapId } = useParams();
  const navigate = useNavigate();
  const [mapRef, mapController] = useCanvasController(MapController);
  const [editorRef, editorController] = useCanvasController(EditorController);

  const setTile = (tile: Partial<Tile>) => {
    if (!tile.pos) return;
    const { x, y } = tile.pos;
    const newTiles: Tile[] = tiles.map((t) => {
      if (t.pos.x === x && t.pos.y === y) {
        return {
          ...t,
          ...tile,
        };
      }
      return t;
    });
    setTiles(newTiles);
  };

  const onMouseDown = (event: CanvasMouseEvent) => {
    editorController?.handleMouseDown(event, setTile);
  };
  const onMouseMove = (event: CanvasMouseEvent) => {
    editorController?.handleMouseMove(event, setTile);
  };

  const onMouseUp = () => {
    editorController?.handleMouseUp();
  };

  const getMapFromState = (): GameMap => {
    return {
      id,
      tiles,
      name: mapName,
      creator,
      highscores: [],
    };
  };

  const setStateFromMap = (gameMap: GameMap) => {
    const { id, tiles, name, creator } = gameMap;
    setId(id);
    setTiles(tiles);
    setMapName(name);
    setCreator(creator);
  };

  useEffect(() => {
    if (!editorController) return;
    const structure = STRUCTURE_TYPES[structureIdx];
    const rotation = ROTATIONS[rotationIdx];
    const ground = GROUND_TYPES[groundIdx];
    editorController.setStructureType(structure);
    editorController.setRotationType(rotation);
    editorController.setGroundType(ground);
    editorController.setMode(mode);

    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      if (event.shiftKey) {
        const nextIdx = (rotationIdx + direction + 4) % 4;
        setRotationIdx(nextIdx);
      } else if (mode === 'Structure') {
        const nextIdx = (structureIdx + direction + STRUCTURE_TYPES.length) % STRUCTURE_TYPES.length;
        setStructureIdx(nextIdx);
      } else if (mode === 'Ground') {
        const nextIdx = (groundIdx + direction + GROUND_TYPES.length) % GROUND_TYPES.length;
        setGroundIdx(nextIdx);
      }
    };

    document.body.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      document.body.removeEventListener('wheel', wheelHandler);
    };
  }, [structureIdx, groundIdx, rotationIdx, mode, editorController]);

  useEffect(() => {
    const savedMap = GameStorage.getGameMap(mapId);
    if (savedMap) {
      setStateFromMap(savedMap);
    } else {
      setId((Date.now() + '').slice(-6));
      setTiles(templates.borders());
    }
  }, [mapId]);

  useEffect(() => {
    const map = getMapFromState();
    mapController?.setGameMap(map);
    editorController?.setGameMap(map);
  }, [tiles]);

  const save = () => {
    const newMap = getMapFromState();
    GameStorage.setGameMap(newMap);
    if (mapId !== newMap.id) {
      navigate(`/editor/${newMap.id}`);
    }
  };

  const remove = () => {
    GameStorage.removeGameMap(mapId);
    navigate(`/editor`);
  };

  const startGame = async () => {
    const newMap = getMapFromState();
    GameStorage.setGameMap(newMap);

    const response = await fetch(`http://${BASE_URL}/game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: newMap.id, tiles: newMap.tiles }),
    });
    const { gameId } = await response.json();
    navigate(`/${gameId}`);
  };

  return (
    <>
      <CanvasGroup>
        <Canvas ref={mapRef} />
        <Canvas ref={editorRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
      </CanvasGroup>

      <Row>
        <button
          style={{ marginLeft: 10, color: mode === 'Structure' ? 'blue' : undefined }}
          onClick={() => setMode('Structure')}
        >
          Structure
        </button>
        <button
          style={{ marginLeft: 10, color: mode === 'Ground' ? 'blue' : undefined }}
          onClick={() => setMode('Ground')}
        >
          Ground
        </button>
      </Row>

      {mode === 'Structure' && (
        <Row style={{ marginLeft: 30 }}>
          {STRUCTURE_TYPES.map((st, i) => (
            <button
              key={`${st}-button`}
              style={{ marginLeft: 10, color: structureIdx === i ? 'blue' : undefined }}
              onClick={() => setStructureIdx(i)}
            >
              {st}
            </button>
          ))}
        </Row>
      )}

      {mode === 'Ground' && (
        <Row style={{ marginLeft: 30 }}>
          {GROUND_TYPES.map((gt, i) => (
            <button
              key={`${gt}-button`}
              style={{ marginLeft: 10, color: groundIdx === i ? 'blue' : undefined }}
              onClick={() => setGroundIdx(i)}
            >
              {gt}
            </button>
          ))}
        </Row>
      )}

      <Row>
        <strong style={{ marginLeft: 10 }}>Kartan nimi</strong>
        <input style={{ marginLeft: 10 }} value={mapName} onChange={({ target }) => setMapName(target.value)}></input>
      </Row>
      <Row>
        <strong style={{ marginLeft: 10 }}>Tekijän nimi</strong>
        <input style={{ marginLeft: 10 }} value={creator} onChange={({ target }) => setCreator(target.value)}></input>
      </Row>
      <Row>
        <button style={{ marginLeft: 10 }} disabled={undoIndex === 1} onClick={() => goBack(1)}>
          Undo
        </button>
        <button style={{ marginLeft: 10 }} disabled={undoIndex === maxUndoIndex} onClick={() => goForward(2)}>
          Redo
        </button>
        <button style={{ marginLeft: 10 }} onClick={() => save()}>
          Tallenna
        </button>
        <button style={{ marginLeft: 10 }} onClick={() => remove()}>
          Poista
        </button>
        <button style={{ marginLeft: 10 }} onClick={() => startGame()}>
          Käynnistä peli
        </button>
      </Row>
    </>
  );
}

export default Editor;

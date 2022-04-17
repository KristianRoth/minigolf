import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorController from '../controllers/EditorController';
import MapController from '../controllers/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useUndoRedo from '../hooks/useUndoRedo';
import { CanvasMouseEvent, GameMap, Point, Rotation, StructureType, structureTypes, Tile } from '../types';
import { BASE_URL, GameStorage } from '../utils/api';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import Row from '../components/Row';
import templates from '../utils/templates';

function Editor() {
  const [id, setId] = useState('');
  const [mapName, setMapName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [structureIdx, setStructureIdx] = useState<number>(0);

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

  const setTile = (struct: StructureType, position: Point, rotation: Rotation) => {
    if (!position) return;
    const { x, y } = position;
    const structure = {
      type: struct,
      rotation: rotation,
    };
    const newTiles: Tile[] = tiles.map((tile) => {
      if (tile.pos.x === x && tile.pos.y === y) {
        return {
          ...tile,
          structure,
        };
      }
      return tile;
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
    const structure = structureTypes[structureIdx];
    editorController.setStructureType(structure);

    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      const nextIdx = (structureIdx + direction + structureTypes.length) % structureTypes.length;
      setStructureIdx(nextIdx);
    };

    document.body.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      document.body.removeEventListener('wheel', wheelHandler);
    };
  }, [structureIdx, editorController]);

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
        {structureTypes.map((st, i) => (
          <button
            key={`${st}-button`}
            style={{ marginLeft: 10, color: structureIdx === i ? 'blue' : undefined }}
            onClick={() => setStructureIdx(i)}
          >
            {st}
          </button>
        ))}

        <button style={{ marginLeft: 50 }} disabled={undoIndex === 1} onClick={() => goBack(1)}>
          Undo
        </button>
        <button style={{ marginLeft: 1 }} disabled={undoIndex === maxUndoIndex} onClick={() => goForward(2)}>
          Redo
        </button>
      </Row>
      <Row>
        <strong>Kartan nimi</strong>
        <input style={{ marginLeft: 10 }} value={mapName} onChange={({ target }) => setMapName(target.value)}></input>
      </Row>
      <Row>
        <strong>Tekijän nimi</strong>
        <input style={{ marginLeft: 10 }} value={creator} onChange={({ target }) => setCreator(target.value)}></input>
      </Row>
      <Row>
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

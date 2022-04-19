import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from '../components/Canvas';
import CanvasGroup from '../components/CanvasGroup';
import EditorMenu from '../components/EditorMenu';
import EditorController from '../controllers/EditorController';
import MapController from '../controllers/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useUndoRedo from '../hooks/useUndoRedo';
import { CanvasMouseEvent, EditorState, GameMap, GROUND_TYPES, ROTATIONS, STRUCTURE_TYPES, Tile } from '../types';
import { GameStorage } from '../utils/api';
import { modulo } from '../utils/calculation';
import templates from '../utils/templates';

function Editor() {
  const [id, setId] = useState('');
  const [mapName, setMapName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const {
    state: tiles,
    setState: setTiles,
    index: undoIdx,
    maxIndex: maxUndoIdx,
    goBack,
    goForward,
  } = useUndoRedo<Tile[]>([]);

  // TODO: Put these into an editor-state object.
  const [mode, setMode] = useState<'Structure' | 'Ground'>('Structure');
  const [structureIdx, setStructureIdx] = useState<number>(0);
  const [groundIdx, setGroundIdx] = useState<number>(0);
  const [rotationIdx, setRotationIdx] = useState<number>(0);

  const editorState: EditorState = useMemo(
    () => ({
      mode,
      structureIdx,
      groundIdx,
      rotationIdx,
      mapName,
      creator,
    }),
    [mode, structureIdx, groundIdx, rotationIdx, mapName, creator]
  );

  const setEditorState = (newState: Partial<EditorState>) => {
    const state = {
      ...editorState,
      ...newState,
    };
    setMode(state.mode);
    setStructureIdx(state.structureIdx);
    setGroundIdx(state.groundIdx);
    setRotationIdx(state.rotationIdx);
    setMapName(state.mapName);
    setCreator(state.creator);
  };

  const { mapId } = useParams();
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

  const getMapFromState = (): GameMap => {
    return {
      id,
      tiles,
      name: mapName,
      creator,
      highscores: [],
    };
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

  useEffect(() => {
    const savedMap = GameStorage.getGameMap(mapId);
    if (savedMap) {
      const { id, tiles, name, creator } = savedMap;
      setId(id);
      setTiles(tiles);
      setMapName(name);
      setCreator(creator);
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

  useEffect(() => {
    if (!editorController) return;
    editorController.setEditorState(editorState);

    const changeMode = () => {
      const newMode: EditorState['mode'] = editorState.mode === 'Ground' ? 'Structure' : 'Ground';
      setEditorState({ mode: newMode });
    };

    const setElement = (direction: number) => {
      if (editorState.mode === 'Structure') {
        const nextIdx = modulo(editorState.structureIdx + direction, STRUCTURE_TYPES.length);
        setEditorState({ structureIdx: nextIdx });
      } else if (editorState.mode === 'Ground') {
        const nextIdx = modulo(editorState.groundIdx + direction, GROUND_TYPES.length);
        setEditorState({ groundIdx: nextIdx });
      }
    };

    const wheelHandler = (event: WheelEvent) => {
      event.preventDefault();
      if (event.shiftKey) {
        changeMode();
      } else {
        const direction = event.deltaY > 0 ? -1 : 1;
        setElement(direction);
      }
    };

    const keyHandler = (event: KeyboardEvent) => {
      event.preventDefault();
      const { shiftKey, ctrlKey } = event;
      const key = event.key.toUpperCase();
      switch (key) {
        case 'R': {
          const direction = shiftKey ? 1 : -1;
          const nextIdx = modulo(editorState.rotationIdx + direction, ROTATIONS.length);
          setEditorState({ rotationIdx: nextIdx });
          break;
        }
        case 'Z':
          if (ctrlKey) goBack(1);
          break;
        case 'Y':
          if (ctrlKey) goForward(1);
          break;
        case 'ARROWUP':
          setElement(1);
          break;
        case 'ARROWDOWN':
          setElement(-1);
          break;
        case 'ARROWLEFT':
          changeMode();
          break;
        case 'ARROWRIGHT':
          changeMode();
          break;
      }
    };

    document.body.addEventListener('wheel', wheelHandler, { passive: false });
    document.body.addEventListener('keyup', keyHandler);

    return () => {
      document.body.removeEventListener('wheel', wheelHandler);
      document.body.removeEventListener('keyup', keyHandler);
    };
  }, [editorState, editorController, goBack, goForward]);

  const menu = (
    <EditorMenu
      state={{ ...editorState, undoIdx, maxUndoIdx }}
      gameMap={getMapFromState()}
      setState={setEditorState}
      goBack={goBack}
      goForward={goForward}
    />
  );
  return (
    <>
      <CanvasGroup menu={menu}>
        <Canvas ref={mapRef} />
        <Canvas ref={editorRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
      </CanvasGroup>
      <div>{menu}</div>
    </>
  );
}

export default Editor;

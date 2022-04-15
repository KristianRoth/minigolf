import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorController from '../game/EditorController';
import MapController from '../game/MapController';
import useCanvasController from '../hooks/useCanvasController';
import useUndoRedo from '../hooks/useUndoRedo';
import { CanvasMouseEvent, GameMap, Point, StructureType, Tile } from '../types';
import Canvas from './Canvas';

const structureTypes: StructureType[] = ['Wall', 'Circle', 'None'];

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

  const { gameId } = useParams();
  const navigate = useNavigate();
  const [mapRef, mapController] = useCanvasController(MapController);
  const [editorRef, editorController] = useCanvasController(EditorController);

  const setTile = (struct: StructureType, position: Point) => {
    if (!position) return;
    const { x, y } = position;
    const newTiles: Tile[] = tiles.map((tile) => {
      if (tile.pos.x === x && tile.pos.y === y) {
        return {
          ...tile,
          pos: {
            x,
            y,
          },
          structureType: struct,
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
    editorController?.setStructureType(structure);

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
    const savedMapString = gameId ? localStorage.getItem(`gameMap-${gameId}`) : '';
    if (savedMapString) {
      const map: GameMap = JSON.parse(savedMapString);
      setStateFromMap(map);
    } else {
      const tiles: Tile[] = [];
      for (let y = 0; y < 25; y += 1) {
        for (let x = 0; x < 49; x += 1) {
          tiles.push({
            groundType: 'Grass',
            structureType: 'None',
            pos: {
              x: x * 100,
              y: y * 100,
            },
          });
        }
      }
      setId(Date.now() + '');
      setTiles(tiles);
    }
  }, [gameId]);

  useEffect(() => {
    const map = getMapFromState();
    mapController?.setGameMap(map);
    editorController?.setGameMap(map);
  }, [tiles]);

  const save = () => {
    const newMap = getMapFromState();
    localStorage.setItem(`gameMap-${newMap.id}`, JSON.stringify(newMap));
    if (gameId !== newMap.id) {
      navigate(`/editor/${newMap.id}`);
    }
  };

  const remove = () => {
    localStorage.removeItem(`gameMap-${gameId}`);
    navigate(`/editor`);
  };

  const startGame = () => {
    console.log('TODO: START GAME CALLED');
    const newMap = getMapFromState();
    localStorage.setItem(`gameMap-${newMap.id}`, JSON.stringify(newMap));
    navigate(`/${newMap.id}`);
    // TODO: Post the game map to backend.
    //  -> on success navigate to the game-page.
  };

  // TODO: Refactor everything. Remove copy-paste shit.
  return (
    <>
      <div tabIndex={-1} className='canvas-container'>
        <Canvas index={1} ref={mapRef} />
        <Canvas index={2} ref={editorRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
      </div>

      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block' }}>
          <button
            style={{ marginLeft: 10, color: structureIdx === 0 ? 'blue' : undefined }}
            onClick={() => setStructureIdx(0)}
          >
            Seinä
          </button>
          <button
            style={{ marginLeft: 10, color: structureIdx === 1 ? 'blue' : undefined }}
            onClick={() => setStructureIdx(1)}
          >
            Tappi
          </button>
          <button
            style={{ marginLeft: 10, color: structureIdx === 2 ? 'blue' : undefined }}
            onClick={() => setStructureIdx(2)}
          >
            Pyyhi
          </button>

          <button style={{ marginLeft: 50 }} disabled={undoIndex === 1} onClick={() => goBack(1)}>
            Undo
          </button>
          <button style={{ marginLeft: 1 }} disabled={undoIndex === maxUndoIndex} onClick={() => goForward(2)}>
            Redo
          </button>
        </div>
      </div>
      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block', marginLeft: 10 }}>
          <strong>Kartan nimi</strong>
          <input style={{ marginLeft: 10 }} value={mapName} onChange={({ target }) => setMapName(target.value)}></input>
        </div>
      </div>
      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block', marginLeft: 10 }}>
          <strong>Tekijän nimi</strong>
          <input style={{ marginLeft: 10 }} value={creator} onChange={({ target }) => setCreator(target.value)}></input>
        </div>
      </div>
      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block' }}>
          <button style={{ marginLeft: 10 }} onClick={() => save()}>
            Tallenna
          </button>
          <button style={{ marginLeft: 10 }} onClick={() => remove()}>
            Poista
          </button>
          <button style={{ marginLeft: 10 }} onClick={() => startGame()}>
            Käynnistä peli
          </button>
        </div>
      </div>
    </>
  );
}

export default Editor;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorController from '../game/EditorController';
import MapController from '../game/MapController';
import { GameMap, StructureType, Tile } from '../types';

const ROOT_ID = 'editor-root';

const mapController = new MapController(ROOT_ID, 1);
const editorController = new EditorController(ROOT_ID, 2);

const structureTypes: StructureType[] = ['Wall', 'Circle', 'None'];

function Editor() {
  const [id, setId] = useState('');
  const [mapName, setMapName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [structureIdx, setStructureIdx] = useState<number>(0);
  const [tiles, setTiles] = useState<Tile[]>([]);

  const { gameId } = useParams();
  const navigate = useNavigate();

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
  }, [structureIdx]);

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

    mapController.init();
    editorController.init();

    editorController.setTileHandler(setTiles);
    return () => {
      mapController.destroy();
      editorController.destroy();
    };
  }, [gameId]);

  useEffect(() => {
    const map = getMapFromState();
    mapController.setGameMap(map);
    editorController.setGameMap(map);
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
    // TODO: Post the game map to backend.
    //  -> on success navigate to the game-page.
  };

  // TODO: Refactor everything. Remove copy-paste shit.
  return (
    <>
      <div id={ROOT_ID} tabIndex={-1} className='canvas-container'></div>

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

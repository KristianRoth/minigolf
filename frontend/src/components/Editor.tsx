import { useEffect, useState } from 'react';
import EditorController from '../game/EditorController';
import MapController from '../game/MapController';
import { GameMap, StructureType, Tile } from '../types';

const ROOT_ID = 'editor-root';

const mapController = new MapController(ROOT_ID, 1);
const editorController = new EditorController(ROOT_ID, 2);

function Editor() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mapName, setMapName] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [structure, setStructure] = useState<StructureType>('Wall');

  useEffect(() => {
    const savedMapString = localStorage.getItem('gameMap');
    if (savedMapString) {
      const map: GameMap = JSON.parse(savedMapString);
      setTiles(map.tiles);
      setCreator(map.creator);
      setMapName(map.name);
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

      setTiles(tiles);
    }

    mapController.init();
    editorController.init();

    editorController.setTileHandler(setTiles);
    return () => {
      mapController.destroy();
      editorController.destroy();
    };
  }, []);

  useEffect(() => {
    const newMap: GameMap = {
      creator: '',
      highscores: [],
      id: '',
      name: '',
      tiles,
    };
    mapController.setGameMap(newMap);
    editorController.setGameMap(newMap);
  }, [tiles]);

  useEffect(() => {
    editorController.setStructureType(structure);
  }, [structure]);

  const save = () => {
    const newMap: GameMap = {
      creator,
      highscores: [],
      id: '',
      name: mapName,
      tiles,
    };
    localStorage.setItem('gameMap', JSON.stringify(newMap));
  };

  const remove = () => {
    localStorage.removeItem('gameMap');
    window.location.reload();
  };

  return (
    <>
      <div id={ROOT_ID} className='canvas-container'></div>

      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block' }}>
          <button style={{ marginLeft: 10 }} onClick={() => setStructure('Wall')}>
            Seinä
          </button>
          <button style={{ marginLeft: 10 }} onClick={() => setStructure('Circle')}>
            Tappi
          </button>
          <button style={{ marginLeft: 10 }} onClick={() => setStructure('None')}>
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
        </div>
      </div>
      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ display: 'inline-block' }}>
          <button style={{ marginLeft: 10 }} onClick={() => remove()}>
            Poista
          </button>
        </div>
      </div>
    </>
  );
}

export default Editor;

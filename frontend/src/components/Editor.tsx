import { useEffect } from 'react';
import EditorController from '../game/EditorController';
import MapController from '../game/MapController';
import { GameMap, Tile } from '../types';

const ROOT_ID = 'editor-root';

const mapController = new MapController(ROOT_ID, 1);
const editorController = new EditorController(ROOT_ID, 2);

function Editor() {
  useEffect(() => {
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

    const gameMap: GameMap = {
      creator: '',
      highscores: [],
      id: '',
      name: '',
      tiles,
    };

    mapController.init();
    editorController.init();
    mapController.setGameMap(gameMap);
    return () => {
      mapController.destroy();
      editorController.destroy();
    };
  });

  return <div id={ROOT_ID} className='canvas-container'></div>;
}

export default Editor;

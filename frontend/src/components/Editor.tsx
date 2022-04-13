import { useEffect } from 'react';

import MapController from '../game/MapController';

const ROOT_ID = 'editor-root';

const mapController = new MapController(ROOT_ID, 1);

function Editor() {
  useEffect(() => {
    mapController.init();

    return () => {
      mapController.destroy();
    };
  });

  return <div id={ROOT_ID} className='canvas-container'></div>;
}

export default Editor;

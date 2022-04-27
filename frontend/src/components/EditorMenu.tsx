import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STRUCTURE_TYPES, GROUND_TYPES, EditorState, GameMap, ROTATIONS } from '../types';
import { GameStorage, BASE_URL } from '../utils/api';
import { modulo } from '../utils/calculation';
import Button from './Button';
import Input from './Input';
import Row from './Row';

type EditorMenuProps = {
  state: EditorState & { undoIdx: number; maxUndoIdx: number };
  gameMap: GameMap;
  setState: (state: Partial<EditorState>) => void;
  goBack: (val: number) => void;
  goForward: (val: number) => void;
};
const EditorMenu: React.FC<EditorMenuProps> = ({ state, gameMap, setState, goBack, goForward }) => {
  const { mapId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState<'toolbar' | 'maps'>('toolbar');

  const onSave = () => {
    GameStorage.setGameMap(gameMap);
    if (mapId !== gameMap.id) {
      navigate(`/editor/${gameMap.id}`);
    }
  };

  const onRemove = () => {
    GameStorage.removeGameMap(mapId);
    navigate(`/editor`);
  };

  const onStartGame = async () => {
    GameStorage.setGameMap(gameMap);

    const response = await fetch(`http://${BASE_URL}/game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: gameMap.id, tiles: gameMap.tiles }),
    });
    const { gameId } = await response.json();
    navigate(`/${gameId}`);
  };

  const Toolbar = () => (
    <>
      <div className='column'>
        <Row style={{ width: '100%' }}>
          <Button
            style={{ color: state.mode === 'Structure' ? 'green' : undefined }}
            onClick={() => setState({ mode: 'Structure' })}
          >
            Structure
          </Button>
          <Button
            style={{ color: state.mode === 'Ground' ? 'green' : undefined }}
            onClick={() => setState({ mode: 'Ground' })}
          >
            Ground
          </Button>
          <Button style={{ visibility: 'hidden' }}>Structure</Button>
        </Row>

        {state.mode === 'Structure' && (
          <>
            {STRUCTURE_TYPES.map((st, i) => (
              <div style={{ paddingLeft: 10, width: 'fit-content' }} className='row' key={`${st}-button`}>
                <Button
                  style={{ marginLeft: 10, color: state.structureIdx === i ? 'blue' : undefined }}
                  onClick={() => setState({ structureIdx: i })}
                >
                  {st}
                </Button>
              </div>
            ))}
          </>
        )}

        {state.mode === 'Ground' && (
          <>
            {GROUND_TYPES.map((gt, i) => (
              <div style={{ paddingLeft: 10, width: 'fit-content' }} className='row' key={`${gt}-button`}>
                <Button
                  style={{ marginLeft: 10, color: state.groundIdx === i ? 'blue' : undefined }}
                  onClick={() => setState({ groundIdx: i })}
                >
                  {gt}
                </Button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className='column'>
        <Input
          label={'Kartan nimi'}
          value={state.mapName}
          onChange={({ target }) => setState({ mapName: target.value })}
        />

        <Input
          label={'Tekijän nimi'}
          value={state.creator}
          onChange={({ target }) => setState({ creator: target.value })}
        />
        <div className='p' style={{ display: 'inline-flex' }}>
          <Button disabled={state.undoIdx === 1} onClick={() => goBack(1)}>
            Undo
          </Button>
          <Button style={{ marginLeft: 10 }} disabled={state.undoIdx === state.maxUndoIdx} onClick={() => goForward(2)}>
            Redo
          </Button>
          <Button
            style={{ marginLeft: 10 }}
            onClick={() => setState({ rotationIdx: modulo(state.rotationIdx + 1, ROTATIONS.length) })}
          >
            Rotate
          </Button>
        </div>
        <div className='p' style={{ display: 'inline-flex', paddingBottom: 0 }}>
          <Button onClick={onSave}>Tallenna</Button>
          <Button style={{ marginLeft: 10 }} onClick={onRemove}>
            Poista
          </Button>
          <Button style={{ marginLeft: 10 }} onClick={onStartGame}>
            Käynnistä peli
          </Button>
        </div>
        <div className='p' style={{ display: 'inline-flex', paddingBottom: 0 }}>
          <Button onClick={() => setPage('maps')}>Näytä kartat</Button>
        </div>
      </div>
    </>
  );

  return (
    <div className='row'>
      {page === 'toolbar' && <Toolbar />}
      {page === 'maps' && <MapMenu setPage={() => setPage('toolbar')} />}
    </div>
  );
};

const MapMenu: React.FC<{ setPage: () => void }> = ({ setPage }) => {
  const maps = useMemo(() => GameStorage.getSavedMaps(), []);
  const navigate = useNavigate();

  return (
    <div className='p' style={{ paddingTop: 0 }}>
      <p>Tallennetut kartat</p>
      {maps.map(({ id, name, creator }) => (
        <div className='row' key={id}>
          <Button onClick={() => navigate(`/editor/${id}`)}>Avaa</Button>
          <span style={{ marginLeft: '5px' }}>
            id: {id}, name: {name}, creator: {creator}
          </span>
        </div>
      ))}
      <Button style={{ marginTop: '5px' }} onClick={() => setPage()}>
        Näytä editori
      </Button>
    </div>
  );
};

export default EditorMenu;

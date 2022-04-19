import { useParams, useNavigate } from 'react-router-dom';
import { STRUCTURE_TYPES, GROUND_TYPES, EditorState, GameMap, ROTATIONS } from '../types';
import { GameStorage, BASE_URL } from '../utils/api';
import { modulo } from '../utils/calculation';
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

  return (
    <>
      <Row>
        <button
          style={{ marginLeft: 10, color: state.mode === 'Structure' ? 'blue' : undefined }}
          onClick={() => setState({ mode: 'Structure' })}
        >
          Structure
        </button>
        <button
          style={{ marginLeft: 10, color: state.mode === 'Ground' ? 'blue' : undefined }}
          onClick={() => setState({ mode: 'Ground' })}
        >
          Ground
        </button>

        <button
          style={{ marginLeft: 40, color: state.mode === 'Ground' ? 'blue' : undefined }}
          onClick={() => setState({ rotationIdx: modulo(state.rotationIdx + 1, ROTATIONS.length) })}
        >
          Rotate
        </button>
      </Row>

      {state.mode === 'Structure' && (
        <Row style={{ marginLeft: 30 }}>
          {STRUCTURE_TYPES.map((st, i) => (
            <button
              key={`${st}-button`}
              style={{ marginLeft: 10, color: state.structureIdx === i ? 'blue' : undefined }}
              onClick={() => setState({ structureIdx: i })}
            >
              {st}
            </button>
          ))}
        </Row>
      )}

      {state.mode === 'Ground' && (
        <Row style={{ marginLeft: 30 }}>
          {GROUND_TYPES.map((gt, i) => (
            <button
              key={`${gt}-button`}
              style={{ marginLeft: 10, color: state.groundIdx === i ? 'blue' : undefined }}
              onClick={() => setState({ groundIdx: i })}
            >
              {gt}
            </button>
          ))}
        </Row>
      )}

      <Row>
        <strong style={{ marginLeft: 10 }}>Kartan nimi</strong>
        <input
          style={{ marginLeft: 10 }}
          value={state.mapName}
          onChange={({ target }) => setState({ mapName: target.value })}
        ></input>
      </Row>
      <Row>
        <strong style={{ marginLeft: 10 }}>Tekijän nimi</strong>
        <input
          style={{ marginLeft: 10 }}
          value={state.creator}
          onChange={({ target }) => setState({ creator: target.value })}
        ></input>
      </Row>
      <Row>
        <button style={{ marginLeft: 10 }} disabled={state.undoIdx === 1} onClick={() => goBack(1)}>
          Undo
        </button>
        <button style={{ marginLeft: 10 }} disabled={state.undoIdx === state.maxUndoIdx} onClick={() => goForward(2)}>
          Redo
        </button>
        <button style={{ marginLeft: 10 }} onClick={onSave}>
          Tallenna
        </button>
        <button style={{ marginLeft: 10 }} onClick={onRemove}>
          Poista
        </button>
        <button style={{ marginLeft: 10 }} onClick={onStartGame}>
          Käynnistä peli
        </button>
      </Row>
    </>
  );
};

export default EditorMenu;

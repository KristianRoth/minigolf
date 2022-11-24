import Button from 'components/Button';
import CheckBox from 'components/CheckBox';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from '../components/Select';
import Slider from '../components/Slider';
import { Option } from '../types/Options';
import { JSONFetch } from '../utils/api';

type OptionsState = Record<string, string | number | boolean>;

const CreateTab: React.FC = () => {
  const [name, setName] = useState('');
  const [lobbyOptions, setLobbyOptions] = useState<null | Record<string, Option>>(null);
  const [gameOptions, setGameOptions] = useState<null | Record<string, Option>>(null);
  const [lobbyOptionsState, setLobbyOptionsState] = useState<null | OptionsState>(null);
  const [gameOptionsState, setGameOptionsState] = useState<null | OptionsState>(null);

  const [loading, setLoading] = useState(true);

  const getDefaultState = (options: Record<string, Option>) => {
    return Object.entries(options).reduce((acc, [name, option]) => {
      return { ...acc, [name]: option.value };
    }, {});
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const data = await JSONFetch(`/api/game-options`);
      setLobbyOptions(data.lobbyOptions);
      setLobbyOptionsState(getDefaultState(data.lobbyOptions || {}));
      setGameOptions(data.gameOptions);
      setGameOptionsState(getDefaultState(data.gameOptions || {}));
      setLoading(false);
    };
    fetchOptions();
  }, []);

  const genericOnChange = (name: string, state: OptionsState, changeState: (newState: OptionsState) => void) => {
    return (newValue: string | number | boolean) => {
      changeState({ ...state, [name]: newValue });
    };
  };

  const generateJSX = (
    options: null | Record<string, Option>,
    state: OptionsState,
    changeState: (newState: OptionsState) => void
  ) =>
    Object.entries(options || {}).map(([name, option]) => {
      switch (option.type) {
        case 'FLOAT_OPTION':
          return (
            <div key={name}>
              <Slider
                label={option.name}
                state={state[name] as string}
                setState={genericOnChange(name, state, changeState)}
                min={option.min}
                max={option.max}
              />
            </div>
          );
        case 'INT_OPTION':
          return (
            <div key={name}>
              <Slider
                label={option.name}
                state={state[name] as string}
                setState={genericOnChange(name, state, changeState)}
                min={option.min}
                max={option.max}
              />
            </div>
          );
        case 'SELECT_OPTION':
          return (
            <div key={name}>
              <Select
                label={option.name}
                options={option.options}
                state={state[name] as string}
                setState={genericOnChange(name, state, changeState)}
              />
            </div>
          );
        case 'BOOL_OPTION':
          return (
            <div key={name}>
              <CheckBox
                label={option.name}
                state={option.value as boolean}
                setState={genericOnChange(name, state, changeState)}
              />
            </div>
          );
      }
    });

  const navigate = useNavigate();

  const startGame = async () => {
    try {
      const data = await JSONFetch('/api/create-game', {
        method: 'POST',
        body: { lobbyOptions: lobbyOptionsState, gameOptions: gameOptionsState },
      });
      if (data.gameId) {
        navigate(`/${data.gameId}`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const lobbyOptionsJSX = generateJSX(lobbyOptions, lobbyOptionsState || {}, setLobbyOptionsState);
  const gameOptionsJSX = generateJSX(gameOptions, gameOptionsState || {}, setGameOptionsState);

  return (
    <>
      {loading ? (
        <>Loading</>
      ) : (
        <>
          <h1>LOBBY OPTIONS</h1>
          <div className='mb-6'>{lobbyOptionsJSX}</div>
          <h1>GAME OPTIONS</h1>
          <div>{gameOptionsJSX}</div>
          <Button className='w-full mt-2' onClick={startGame}>
            START
          </Button>
        </>
      )}
    </>
  );
};

export default CreateTab;

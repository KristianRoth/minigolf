import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Slider from '../components/Slider';
import { Option } from '../types/Options';
import { JSONFetch } from '../utils/api';

const CreateTab: React.FC = () => {
  const [name, setName] = useState('');
  const [options, setOptions] = useState<null | Record<string, Option>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      const data = await JSONFetch(`/api/game-options`);
      setOptions(data);
      setLoading(false);
    };
    fetchOptions();
  }, []);

  const navigate = useNavigate();

  const optionJSX = Object.entries(options || {}).map(([name, option]) => {
    switch (option.type) {
      case 'FLOAT_OPTION':
        return (
          <div key={name}>
            <Slider label={option.name} defaultValue={option.value} min={option.min} max={option.max} />
          </div>
        );
      case 'SELECT_OPTION':
        return (
          <div key={name}>
            {name}
            <span className='ml-2 text-blue-800'>{option.name}</span>
          </div>
        );
    }
  });

  return <>{loading ? <>Loading</> : <div className='column'>{optionJSX}</div>}</>;
};

export default CreateTab;

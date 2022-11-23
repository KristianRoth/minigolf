import Button from 'components/Button';
import Input from 'components/Input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const EditorTab: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  return (
    <div className='column'>
      <h1 className='text-2xl text-center mb-4 font-bold'>MINIGOLFPELI</h1>

      <Input label='NAME OF THE MAP' value={name} onChange={({ target }) => setName(target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button onClick={() => navigate(`/editor`)}>Tästä nappulasta editoriin</Button>
    </div>
  );
};

export default EditorTab;

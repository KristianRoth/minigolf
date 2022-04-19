import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
const Input: React.FC<InputProps & { label: string }> = ({ label, ...props }) => {
  return (
    <div className='p'>
      <label>
        <strong>{label}</strong>
      </label>
      <input style={{ width: '90%' }} {...props}></input>
    </div>
  );
};

export default Input;

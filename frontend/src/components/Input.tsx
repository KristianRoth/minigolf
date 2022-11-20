import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
const Input: React.FC<InputProps & { label: string }> = ({ label, ...props }) => {
  return (
    <input
      className='text-center placeholder:text-yellow-800 text-yellow-800 m-2 bg-yellow-300 border-solid border-2 border-yellow-600 font-semibold py-2 px-6 rounded-xl'
      placeholder={label}
      {...props}
    ></input>
  );
};

export default Input;

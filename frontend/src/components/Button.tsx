import { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
const Button: React.FC<ButtonProps> = (props) => {
  return (
    <button 
      {...props}
      className={`text-yellow-800 hover:scale-110 m-2 bg-yellow-300 border-solid border-2 border-yellow-600 font-semibold py-2 px-6 rounded-xl ${props.className}`}>
      {props.children}
    </button>
  );
};

export default Button;

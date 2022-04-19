import { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
const Button: React.FC<ButtonProps> = (props) => {
  return (
    <div>
      <button {...props}>{props.children}</button>
    </div>
  );
};

export default Button;

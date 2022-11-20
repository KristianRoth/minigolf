import { InputHTMLAttributes, useState } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
const Slider: React.FC<InputProps & { label: string }> = ({ label, ...props }) => {
  const [value, setValue] = useState(props.defaultValue);
  return (
    <div>
      <div className='w-full text-center font-semibold text-xl'>{label}</div>
      <div className='flex flex-row mb-2'>
        <div className='range-value'>
          <input type='number' onChange={(e) => setValue(e.target.value)} value={value} />
        </div>
        <input
          {...props}
          defaultValue={undefined}
          value={value}
          type='range'
          className='w-full'
          onChange={(e) => setValue(e.target.value)}
        ></input>
      </div>
    </div>
  );
};

export default Slider;

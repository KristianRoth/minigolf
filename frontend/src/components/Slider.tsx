const Slider: React.FC<{
  label: string;
  state: string;
  setState: (newValue: string | number | boolean) => void;
  min: number;
  max: number;
}> = ({ label, ...props }) => {
  return (
    <div>
      <div className='w-full text-center font-semibold text-xl'>{label}</div>
      <div className='flex flex-row mb-2'>
        <div className='range-value'>
          <input type='number' onChange={(e) => props.setState(e.target.value)} value={props.state} />
        </div>
        <input
          defaultValue={undefined}
          value={props.state}
          type='range'
          className='w-full'
          onChange={(e) => props.setState(parseFloat(e.target.value))}
          min={props.min}
          max={props.max}
        ></input>
      </div>
    </div>
  );
};

export default Slider;

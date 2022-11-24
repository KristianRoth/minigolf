const CheckBox: React.FC<{ label: string; state: boolean; setState: (newState: boolean) => void }> = ({
  label,
  state,
  setState,
}) => {
  return (
    <div>
      <div className='w-full text-center font-semibold text-xl'>{label}</div>
      <div className='w-full flex flex-row justify-center'>
        <input checked={state} type='checkbox' onChange={(e) => setState(e.target.value == 'checked')}></input>
      </div>
    </div>
  );
};

export default CheckBox;

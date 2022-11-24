const Select: React.FC<{ label: string; options: string[]; state: string; setState: (newState: string) => void }> = ({
  label,
  options,
  state,
  setState,
}) => {
  return (
    <div>
      <div className='w-full text-center font-semibold text-xl'>{label}</div>
      <div className='w-full'>
        <select className='w-full' value={state} onChange={(e) => setState(e.target.value)}>
          {options.map((option) => (
            <option className='w-full' key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Select;

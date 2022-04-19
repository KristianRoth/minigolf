const Row: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <div className='row p' {...props}>
      {children}
    </div>
  );
};

export default Row;

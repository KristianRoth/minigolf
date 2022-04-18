const Row: React.FC<React.HTMLProps<HTMLCanvasElement>> = ({ children, ...props }) => {
  return (
    <div style={{ width: '100%', marginTop: 10, ...props.style }}>
      <div style={{ display: 'inline-block' }}>{children}</div>
    </div>
  );
};

export default Row;

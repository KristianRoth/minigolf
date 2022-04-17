const Row: React.FC = ({ children }) => {
  return (
    <div style={{ width: '100%', marginTop: 10 }}>
      <div style={{ display: 'inline-block' }}>{children}</div>
    </div>
  );
};

export default Row;

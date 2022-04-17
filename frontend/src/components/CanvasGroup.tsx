import React from 'react';

const CanvasGroup: React.FC = ({ children }) => {
  return (
    <div tabIndex={-1} className='canvas-container'>
      {React.Children.map(children, (c, i) => {
        const el = React.cloneElement(c as React.ReactElement<any>, {
          style: { zIndex: i + 1 },
        });
        return el;
      })}
    </div>
  );
};

export default CanvasGroup;

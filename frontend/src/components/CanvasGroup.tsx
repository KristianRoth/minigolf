import React, { ReactNode, useState } from 'react';

const CanvasGroup: React.FC<{ menu?: (onClose: () => void) => ReactNode }> = ({ children, menu }) => {
  const [isOpen, setIsOpen] = useState(false);

  const layerCount = React.Children.count(children);

  return (
    <div tabIndex={-1} className='canvas-container'>
      {React.Children.map(children, (c, i) => {
        const el = React.cloneElement(c as React.ReactElement<any>, {
          style: { zIndex: i + 1 },
        });
        return el;
      })}
      {isOpen && menu && (
        <div className='canvas-menu' style={{ zIndex: layerCount + 1, padding: '8px' }}>
          {menu && menu(() => setIsOpen(false))}
        </div>
      )}

      {!isOpen && menu && (
        <button className='canvas-menu-toggle' style={{ zIndex: layerCount + 1 }} onClick={() => setIsOpen(!isOpen)}>
          menu
        </button>
      )}
    </div>
  );
};

export default CanvasGroup;

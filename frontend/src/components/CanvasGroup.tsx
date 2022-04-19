import React, { ReactNode, useState } from 'react';

type CanvasGroupProps = React.HTMLProps<HTMLDivElement> & { menu?: ReactNode };
const CanvasGroup: React.FC<CanvasGroupProps> = ({ children, menu, ...attrs }) => {
  const [isOpen, setIsOpen] = useState(false);

  const layerCount = React.Children.count(children);

  return (
    <div tabIndex={-1} className='canvas-container' {...attrs}>
      {React.Children.map(children, (c, i) => {
        const el = React.cloneElement(c as React.ReactElement<any>, {
          style: { zIndex: i + 1 },
        });
        return el;
      })}
      {isOpen && menu && (
        <div className='canvas-menu' style={{ zIndex: layerCount + 1 }}>
          <div className='canvas-menu-container'>
            {menu}

            <div className='canvas-menu-close'>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </div>
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

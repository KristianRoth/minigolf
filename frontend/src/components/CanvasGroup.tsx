import React, { ReactNode, useEffect, useState } from 'react';

type CanvasGroupProps = React.HTMLProps<HTMLDivElement> & { menu?: ReactNode; help?: ReactNode };
const CanvasGroup: React.FC<CanvasGroupProps> = ({ children, menu, help, ...attrs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const fullScreen = () => {
    const root = document.getElementById('root');
    if (root) {
      root
        .requestFullscreen()
        .then(() => {
          doClose();
        })
        .catch((e) => console.log('FULL SCREEN ERROR', e));
    }
  };

  const doClose = () => {
    setIsOpen(false);
    setShowInstructions(false);
  };

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === 'Q') {
        setIsOpen(!isOpen);
        setShowInstructions(false);
      }
    };
    document.body.addEventListener('keyup', keyHandler);
    return () => {
      document.body.removeEventListener('keyup', keyHandler);
    };
  }, [isOpen]);

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
            {!showInstructions && menu}
            {showInstructions && help}
            <div className='canvas-menu-footer'>
              <button onClick={() => setShowInstructions(!showInstructions)}>?</button>
              <button onClick={() => fullScreen()}>Full screen</button>
              <button onClick={() => doClose()}>Close</button>
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

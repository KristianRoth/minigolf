import React, { useCallback } from 'react';
import { CanvasMouseEvent } from '../types';

type CanvasProps = React.HTMLProps<HTMLCanvasElement>;

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  const onContextMenu = useCallback((e: CanvasMouseEvent) => e.preventDefault(), []);

  return (
    <canvas
      ref={ref}
      className='canvas-layer'
      style={{ zIndex: 1, ...props.style }}
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onContextMenu={onContextMenu}
    ></canvas>
  );
});

export default Canvas;

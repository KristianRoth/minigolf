import React, { useCallback } from 'react';
import { CanvasMouseEvent } from '../types';

type CanvasProps = React.HTMLProps<HTMLCanvasElement>;

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  const { style, ...rest } = props;
  const onContextMenu = useCallback((e: CanvasMouseEvent) => e.preventDefault(), []);

  return (
    <canvas
      ref={ref}
      className='canvas-layer'
      tabIndex={-1}
      {...rest}
      style={{ zIndex: 1, ...style }}
      onContextMenu={onContextMenu}
    ></canvas>
  );
});

export default Canvas;

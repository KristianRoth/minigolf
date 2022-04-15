import { useState, useCallback } from 'react';
import CanvasController from '../game/CanvasController';

const useCanvasController = <T extends CanvasController>(
  Controller: new (canvas: HTMLCanvasElement) => T
): [(canvas: HTMLCanvasElement) => void, T | null] => {
  const [controller, setController] = useState<T | null>(null);
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas !== null) {
        const controller = new Controller(canvas);
        controller.init();
        setController(controller);
      }
    },
    [Controller]
  );
  return [canvasRef, controller];
};

export default useCanvasController;

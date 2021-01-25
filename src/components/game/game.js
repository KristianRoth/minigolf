import { Stage, useTick, Graphics } from '@inlet/react-pixi';
import { useState, useCallback } from 'react';


const Ball = () => {
  let [x, setX] = useState(0);
  let [y, setY] = useState(0);
  const radius = 10;

  useTick((delta) => {
    setX(x + delta);
    setY(y + delta);
  })

  const draw = useCallback((g) => {
    g.clear();
    g.beginFill(0xffffff, 1);
    g.drawCircle(x, y, radius);
  }, [x, y, radius]);

  return (
    <Graphics draw={draw} />
  );
}

const Game = () => {
  return (
    <div className="Game" >
      <Stage x={100} y={100} >
        <Ball />
      </Stage>
    </div>
  )
}



export default Game;
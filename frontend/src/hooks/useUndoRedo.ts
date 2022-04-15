import { useMemo, useState } from 'react';

const isEqual = (val1: any, val2: any) => JSON.stringify(val1) === JSON.stringify(val2);

const useUndoRedo = <T>(init: T, maxMemory = 20) => {
  const [states, setStates] = useState([init]);
  const [index, setIndex] = useState(0);
  const state = useMemo(() => states[index], [states, index]);

  const setState = (value: T) => {
    if (isEqual(state, value)) {
      return;
    }
    const copy = states.slice(-maxMemory);
    copy.push(value);
    setStates(copy);
    setIndex(copy.length - 1);
  };

  const resetState = (init: T) => {
    setIndex(0);
    setStates([init]);
  };

  const goBack = (steps = 1) => {
    setIndex(Math.max(0, Number(index) - (Number(steps) || 1)));
  };

  const goForward = (steps = 1) => {
    setIndex(Math.min(states.length - 1, Number(index) + (Number(steps) || 1)));
  };
  return {
    state,
    setState,
    resetState,
    index,
    maxIndex: states.length - 1,
    goBack,
    goForward,
  };
};

export default useUndoRedo;

// this is a decorator for the old existing reducer (RSE exercise), which
  // is adding the capability of undo/redo
export const withUndoRedo = (reducer) => {
  let past=[]; // using a closure
  let lastUndoIndex;
  lastUndoIndex = lastUndoIndex || 0;
  return (state, action) => { // the internal function of the closure
    if (past.length === 0 || action.type !== 'UNDO'){
      past.push(state);
    }
    if (state === undefined){
      return {
        canUndo: false,
        canRedo: false,
        ...reducer(state, action),
      };
    }
    if (action.type==='UNDO'){
      lastUndoIndex++;
      const returnedState = past[past.length - lastUndoIndex];
      return {
        ...returnedState,
        canRedo: true,
      }
    }
    const newPresent = reducer(state, action);
    if (
      newPresent.nextInstructionId != state.nextInstructionId
    ) {
      return {
        ...newPresent,
        canUndo: true,
        canRedo: false,
      }
    }
    return state;
  }
};
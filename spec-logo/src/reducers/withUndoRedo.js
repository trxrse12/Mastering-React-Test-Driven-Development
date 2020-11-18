// this is a decorator for the old existing reducer
export const withUndoRedo = (reducer) => {
  let oldState=[];
  return (state, action) => {
    oldState.push(state);

    if (state === undefined){
      return {
        canUndo: false,
        canRedo: false,
        ...reducer(state, action),
      };
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
    } else {
      if (action.type==='UNDO'){
        return {...oldState[oldState.length - 2]}
      }
    }
    return state;
  }
};
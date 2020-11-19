// this is a decorator for the old existing reducer (RSE exercise), which
  // is adding the capability of undo/redo
export const withUndoRedo = (reducer) => {
  let past=[]; // using a closure
  let lastUndoIndex;
  lastUndoIndex = lastUndoIndex || 0;

  let future=[];
  let lastRedoIndex;

  return (state, action) => { // the internal function of the closure
    console.log('\n\n\n\n\n');
    console.log('SSSSSSSSSSSSSSSSSSSSSSSSSSs state=', state);
    console.log('SSSSSSSSSSSSSSSSSSSSSSSSSSs action=', action?.type);
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
      const undoReturnedState = past[past.length - lastUndoIndex];
      // add the current state to the redo array
      future.push(state);
      lastRedoIndex = lastRedoIndex || 0;
      return {
        ...undoReturnedState,
        canRedo: true,
      }
    }
    if (action.type==='REDO'){
      lastRedoIndex++;
      console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP future', future);
      console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLL lastRedoIndex=', lastRedoIndex )
      const redoReturnedState = future[future.length - lastRedoIndex];
      console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRR redoReturnedState=', redoReturnedState );
      return {
        ...redoReturnedState,
        canUndo: true,
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
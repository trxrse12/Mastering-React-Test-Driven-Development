import React from 'react';
import { connect } from 'react-redux';
import { initialState } from './parser';

const mapStateToProps = ({ script }) => ({ script });
const mapDispatchToProps = {
  reset: () => ({ type: 'RESET' }),
  undo: () => ({type: 'UNDO'})
};

export const MenuButtons = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ script: {canUndo, nextInstructionId},
                                       undo,
                                       reset }) => {
  const canReset = nextInstructionId !== 0;

  return (
    <React.Fragment>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={reset} disabled={!canReset}>
        Reset
      </button>
    </React.Fragment>
  );
});

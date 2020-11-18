import {withUndoRedo} from '../../src/reducers/withUndoRedo';

describe('withUndoRedo', () => {
  let decoratedReducedSpy;
  let reducer;
  const innerAction ={type: 'INNER'};
  const undoAction = {type: 'UNDO'};
  const present = {a:123, nextInstructionId: 0};
  const future = {b:234, nextInstructionId: 1};

  beforeEach(() => {
    decoratedReducedSpy = jest.fn();
    reducer = withUndoRedo(decoratedReducedSpy);
  });

  describe('when initializing state', () => {

    it('calls the decorated reducers with an undefined state and an action', () => {
      const action = {type: 'UNKNOWN'};
      reducer(undefined, action);
      expect(decoratedReducedSpy).toHaveBeenCalledWith(
        undefined,
        action
      )
    });
    it('returns a value of what the inner reducer returns', () => {
      decoratedReducedSpy.mockReturnValue({a:123});
      expect(reducer(undefined)).toMatchObject({a:123})
    });
    it('cannot undo', () => {
      expect(reducer(undefined)).toMatchObject({ canUndo: false});
    });
    it('cannot redo', () => {
      expect(reducer(undefined)).toMatchObject({canRedo: false});
    });
  });

  describe('performing an action', () => {

    beforeEach(() => {
      decoratedReducedSpy.mockReturnValue(future);
    });
    it('can undo after a new present has been provided', () => {
      const result = reducer(
        {canUndo: false, present},
        innerAction,
      );
      expect(result.canUndo).toBeTruthy();
    });

    it('forwards action to the inner reducer', () => {
      reducer(present, innerAction);
      expect(decoratedReducedSpy).toHaveBeenCalledWith(
        present,
        innerAction,
      )
    });

    it('returns the result of the inner reducer ', () => {
      const result = reducer(present, innerAction);
      expect(result).toMatchObject(future); // because in the bfe I mock the returned result of the inner reducer
    });

    it('returns the previous state if nextInstructionId does not increment', () => {
      decoratedReducedSpy.mockReturnValue({
        nextInstructionId: 0
      });
      const result = reducer(present, innerAction);
      expect(result).toMatchObject(present);
    });
  });

  describe('undo', () => {
    let newState ;

    beforeEach(() => {
      decoratedReducedSpy.mockReturnValue(future);
      newState = reducer(present, innerAction); // input present and returns future
    });

    it('can undo one level', () => {
      const updated  = reducer(newState, undoAction); // input future and undo
      expect(updated).toMatchObject(present); // returns present
    });

    it('can undo multiple levels', () => {
      const futureFuture = {c: 345, nextInstructionId: 3};
      decoratedReducedSpy.mockReturnValue(futureFuture);
      newState = reducer(newState, innerAction);

      const updated = reducer(
        reducer(newState, undoAction),
        undoAction
      );
      expect(updated).toMatchObject(present);
    });

    it('sets canRedo to true after undoing', () => {
      const updated = reducer(newState, undoAction);
      expect(updated.canRedo).toBeTruthy();
    });
  });
});
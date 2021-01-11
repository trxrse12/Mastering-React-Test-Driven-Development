import {
  duplicateForSharing,
  sharingSaga
} from '../../src/middleware/sharingSagas';
import {storeSpy, expectRedux} from 'expect-redux';
import { act} from 'react-dom/test-utils';
import {configureStore} from "../../src/store";

describe('duplicateForSharing', () => {
  let dispatch;
  let store;
  let next;

  beforeEach(() => {
    dispatch = jest.fn();
    store = { dispatch };
    next = jest.fn();
  });

  const callMiddleware = action =>
    duplicateForSharing(store)(next)(action);

  it('calls next with the action', () => {
    const action = { a: 123 };
    callMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('returns the result of the next action', () => {
    next.mockReturnValue({ a: 123 });
    expect(callMiddleware({})).toEqual({ a: 123 });
  });

  it('dispatches a new SHARE_NEW_ACTION action if the action is of type SUBMIT_EDIT_LINE', () => {
    const action = { type: 'SUBMIT_EDIT_LINE', text: 'abc' };
    callMiddleware(action);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SHARE_NEW_ACTION',
      innerAction: action
    });
  });

  it('does not dispatch a SHARE_NEW_ACTION action if the action is not of type SUBMIT_EDIT_LINE', () => {
    const action = { type: 'UNKNOWN' };
    callMiddleware(action);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('sharing saga', () => {
  let store;
  let socketSpyFactory;
  let sendSpy;
  let socketSpy;

  beforeEach(() => {
    sendSpy = jest.fn();
    socketSpyFactory = jest.spyOn(window, 'WebSocket');
    socketSpyFactory.mockImplementation(() => {
      socketSpy = {
        send: sendSpy
      };
      return socketSpy;
    });
    store = configureStore([storeSpy]);
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        protocol: 'http',
        host: 'test:1234',
        pathname: '/index.html'
      }
    });
  });

  afterEach(() => {
    socketSpyFactory.mockReset();
  });

  describe('START_SHARING', () => {

    // test helper that triggers the websockets's message event manually for the TDD purpose
    const notifySocketOpened = async () => {
      await act(async () => {
        socketSpy.onopen()
      })
    };

    // test helper that triggers the websocket's onmessage event manually for TDD purpose
    const sendSocketMessage = async message => {
      await act(async () => {
        socketSpy.onmessage({data: JSON.stringify(message) })
      });
    };

    it('opens a websocket when starting to share', () => {
      store.dispatch({type: 'START_SHARING'});
      expect(socketSpyFactory).toHaveBeenCalledWith('ws://test:1234/share');
    });

    it('dispatches a START_SHARING action to the socket', async () => {
      store.dispatch({type: 'START_SHARING'});
      await notifySocketOpened();
      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({type: 'START_SHARING'})
      )
    });

    it('dispatches an action of STARTED_SHARING with a URL containing the id that is returning from the server', async () => {
      store.dispatch({type: 'START_SHARING'});
      await notifySocketOpened();
      await sendSocketMessage({type: 'UNKNOWN', id: 123});
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({
          type: 'STARTED_SHARING',
          url: 'http://test:1234/index.html?watching=123',
        })
    });
  });
});
import { call, put, takeLatest, take } from 'redux-saga/effects';
import {eventChannel, END} from 'redux-saga';

let presenterSocket;

// adapter layer between sagas (which work on generators)
//    and WobSockets APIs (which work on callbacks passed by even
const openWebSocket = () => {
  const host = window.location.host;
  const socket = new WebSocket(`ws://${host}/share`);
  return new Promise(resolve => {
    socket.onopen = () => {resolve(socket)}
  })
};

// adapter layer between the cb driven WebSocket API and the generator driven sagas
const receiveMessage = (socket) =>
  new Promise(resolve => {
    socket.onmessage = evt => {resolve(evt.data)};
  });

const buildUrl = (id) => {
  const {protocol, host, pathname} = window.location;
  return `${protocol}://${host}${pathname}?watching=${id}`
};

// used by the server
function* startSharing() {
  presenterSocket = yield openWebSocket(); // this is the socket returned by the promise
  presenterSocket.send(JSON.stringify({type: 'START_SHARING'}));
  const message = yield receiveMessage(presenterSocket);
  const presenterSessionId = JSON.parse(message).id; // the id from the server
  yield put({
    type: 'STARTED_SHARING',
    url: buildUrl(presenterSessionId)
  })
}

// used by the server
function* stopSharing() {
  presenterSocket.close();
  yield put({type: 'STOPPED_SHARING'});
}

function* shareNewAction({ innerAction }) {
  if (presenterSocket &&
      presenterSocket.readyState === WebSocket.OPEN){
    presenterSocket.send(
      JSON.stringify({type: 'NEW_ACTION', innerAction})
    )
  }
}

// used by the client to create an eventChannel at the client
const webSocketListener = socket =>
  eventChannel(emitter => {
    socket.onmessage = emitter;
    socket.onclose = () => emitter(END);
    // now the unsubcribe function
    return () => {
      socket.onmessage = undefined;
      socket.onclose = undefined;
    }
  });

// used by the client side saga (see below) to watch the eventChannel
function* watchUntilStopRequest(chan) {
  try {
    while (true) {
      let evt = yield take(chan);
      yield put(JSON.parse(evt.data));
    }
  } finally {
    yield put({type: 'STOPPED_WATCHING'});
  }
}

// the watcher side saga
function* startWatching() {
  const sessionId = new URLSearchParams(
    window.location.search.substring(1)
  ).get('watching');
  if (sessionId){
    const watcherSocket = yield openWebSocket();
    yield put({type: 'RESET'});
    watcherSocket.send(
      JSON.stringify({type: 'START_WATCHING', id: sessionId})
    );
    yield put({type: 'STARTED_WATCHING'});
    const channel = yield call(webSocketListener, watcherSocket);
    yield call(watchUntilStopRequest, channel);
  }
}

export function* sharingSaga() {
  yield takeLatest('TRY_START_WATCHING', startWatching);
  yield takeLatest('START_SHARING', startSharing);
  yield takeLatest('STOP_SHARING', stopSharing);
  yield takeLatest('SHARE_NEW_ACTION', shareNewAction);
}

// middleware
export const duplicateForSharing = store => next => action => {
  if (action.type === 'SUBMIT_EDIT_LINE') {
    store.dispatch({
      type: 'SHARE_NEW_ACTION',
      innerAction: action
    });
  }
  return next(action);
};

import { call, put, takeLatest, take } from 'redux-saga/effects';

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

function* startSharing() {
  const presenterSocket = yield openWebSocket(); // this is the socket returned by the promise
  presenterSocket.send(JSON.stringify({type: 'START_SHARING'}));
  const message = yield receiveMessage(presenterSocket);
  const presenterSessionId = JSON.parse(message).id; // eads the id from the server
  yield put({
    type: 'STARTED_SHARING',
    url: buildUrl(presenterSessionId)
  })
}

function* stopSharing() {}

function* shareNewAction({ innerAction }) {}

function* startWatching() {}

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

"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expressWs2 = exports.app = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _express = _interopRequireDefault(require("express"));

var _expressWs = _interopRequireDefault(require("express-ws"));

var app = (0, _express["default"])();
exports.app = app;
var expressWs2 = (0, _expressWs["default"])(app);
exports.expressWs2 = expressWs2;
app.use(_express["default"].json());
app.use(_express["default"]["static"]('dist'));
var nextSessionId = 0;
var sessions = {};

var sendJson = function sendJson(subscriber, obj) {
  return subscriber.send(JSON.stringify(obj));
};

var OPEN = 1;

var clearSubscribers = function clearSubscribers(session) {
  return session.subscribers = session.subscribers.filter(function (subscriber) {
    return subscriber.readyState === OPEN;
  });
};

var sendToSubscribers = function sendToSubscribers(session, obj) {
  clearSubscribers(session);
  session.subscribers.forEach(function (subscriber) {
    return sendJson(subscriber, obj);
  });
};

var findSessionId = function findSessionId(ws) {
  return Object.keys(sessions).find(function (id) {
    return sessions[id] && sessions[id].presenter === ws;
  });
};

var stopSharingIfPresenter = function stopSharingIfPresenter(ws) {
  var sessionId = findSessionId(ws);
  var session = sessions[sessionId];

  if (session) {
    session.subscribers.forEach(function (subscriber) {
      return subscriber.close();
    });
    sessions[sessionId] = undefined;
  }
};

app.ws('/share', function (ws, req) {
  ws.on('close', function (msg) {
    stopSharingIfPresenter(ws);
  });
  ws.on('message', function (msg) {
    var session;
    var request = JSON.parse(msg);

    switch (request.type) {
      case 'START_SHARING':
        sendJson(ws, {
          status: 'STARTED',
          id: nextSessionId
        });
        sessions[nextSessionId] = {
          presenter: ws,
          history: [],
          subscribers: []
        };
        nextSessionId++;
        break;

      case 'START_WATCHING':
        session = sessions[request.id];

        if (session) {
          session.subscribers = [].concat((0, _toConsumableArray2["default"])(session.subscribers), [ws]);
          session.history.forEach(function (obj) {
            return sendJson(ws, obj);
          });
        }

        break;

      case 'NEW_ACTION':
        session = sessions[findSessionId(ws)];
        sendToSubscribers(session, request.innerAction);
        session.history = [].concat((0, _toConsumableArray2["default"])(session.history), [request.innerAction]);
    }
  });
});
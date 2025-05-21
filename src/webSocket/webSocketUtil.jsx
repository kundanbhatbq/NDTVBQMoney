import Stomp from "stompjs";

export const createWebSocketConnection = (url, onConnectCallback, onErrorCallback) => {
  const socket = new WebSocket(url);
  const client = Stomp.over(socket);
  client.heartbeat.outgoing = 0;
  client.heartbeat.incoming = 0;
  client.connect("bqprime", "itacs9", onConnectCallback, onErrorCallback, "/");
  client.debug = null

  return client;
};

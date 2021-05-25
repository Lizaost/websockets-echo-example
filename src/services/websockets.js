import React, {useEffect, useState} from 'react';
import {EventEmitter} from 'events';

const config = {
  url: 'wss://echo.websocket.org',
  reconnect: true,
};


class SocketClient {
  static instance;

  socket;

  reconnectTimeout;

  eventEmitter = new EventEmitter();

  messageCallback;

  constructor(config, messageCallback) {
    this.config = config;
    this.messageCallback = messageCallback;
    this.init();
  }

  static getInstance(config, messageCallback) {
    if (!this.instance) {
      this.instance = new SocketClient(config, messageCallback);
    }
    return this.instance;
  }

  init() {
    this.socket = new WebSocket(this.config.url);
    this.socket.addEventListener('close', () => this.onClose());
    this.socket.addEventListener('open', () => this.onOpen());
    this.socket.addEventListener('message', (e) => this.onMessage(e));
  }

  onClose() {
    console.log("WEBSOCKET CLOSED");
    if (this.config.reconnect) {
      this.reconnectTimeout = setTimeout(() => {
        this.init();
      }, 5000);
    }
  };

  onOpen() {
    console.log("WEBSOCKET OPEN");
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
  };

  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    this.config.reconnect = false;
    this.socket?.close();
  };

  open() {
    if (this.socket?.readyState === WebSocket.CLOSED) {
      this.init();
    }
  }

  sendMessage(text) {
    const event = 'message';
    this.socket?.send(JSON.stringify({event, data: text}));
  };

  onMessage(e) {
    const message = JSON.parse(e.data);
    if (this.messageCallback) {
      this.messageCallback(message);
    }
  }
}

export function useWebSocket(externalConfig, messageCallback) {
  const conf = {
    ...config,
    ...externalConfig
  };
  const [socketClient, setSocketClient] = useState(SocketClient.getInstance(conf, messageCallback));

  useEffect(() => {
    setSocketClient(SocketClient.getInstance(conf, messageCallback));
  }, [socketClient?.socket?.readyState, messageCallback]);

  return socketClient;
}


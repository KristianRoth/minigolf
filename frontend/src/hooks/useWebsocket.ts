import { useState, useEffect, useCallback } from "react";

type EventHandler = (event: any) => void;

type UseWebsocketParams = {
  url: string;
  onOpen: EventHandler;
  onMessage: EventHandler;
  onClose: EventHandler;
};

type UseWebsocketReturnType = {
  connect: () => void;
  sendMessage: (value: string) => void;
  close: () => void;
};

// "http://localhost:8080/chat"

const useWebsocket = (params: UseWebsocketParams): UseWebsocketReturnType => {
  const { onOpen, onMessage, onClose, url } = params;
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("open", onOpen);
    return () => {
      socket.removeEventListener("open", onOpen);
    };
  }, [socket, onOpen]);

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("close", onClose);
    return () => {
      socket.removeEventListener("close", onClose);
    };
  }, [socket, onClose]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    setSocket(ws);
  }, [url]);

  const sendMessage = (value: string) => {
    if (!socket) return;
    console.log("Sending message: ", value);
    socket.send(value);
  };

  const close = useCallback(() => {
    if (!socket) return;
    if (socket.readyState === socket.OPEN) socket.close(1000);
  }, [socket]);

  return {
    connect,
    sendMessage,
    close,
  };
};

export default useWebsocket;

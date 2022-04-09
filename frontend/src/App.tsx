import React, { useState, useEffect, useCallback } from "react";
import useWebsocket from "./hooks/useWebsocket";

type Message = {
  user: string;
  value: string;
};

function App() {
  const [connected, setConnected] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const onOpen = useCallback(() => {
    console.log("Connected!");
    setConnected(true);
  }, []);

  const onMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.data);
      console.log(message);
      setMessages([...messages, message]);
      if (!users.find((u) => message.user === u)) {
        setUsers([...users, message.user]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onClose = useCallback(() => {
    console.log("Disconnected!");
    setConnected(false);
  }, []);

  const { connect, sendMessage, close } = useWebsocket({
    url: "ws://localhost:8080/chat",
    onOpen,
    onMessage,
    onClose,
  });

  return (
    <div className="container mx-auto px-4">
      <h1 className="my-3">Minigolf peli</h1>

      {connected ? (
        <Chat
          messages={messages}
          users={users}
          sendMessage={sendMessage}
          close={close}
        />
      ) : (
        <button className="btn" onClick={() => connect()}>
          Liity
        </button>
      )}
    </div>
  );
}

type ChatProps = {
  messages: Message[];
  users: string[];
  sendMessage: (message: string) => void;
  close: () => void;
};
const Chat: React.FC<ChatProps> = ({ messages, users, sendMessage, close }) => {
  const [messageInput, setMessageInput] = useState("");
  const [showUsers, setShowUsers] = useState(false);

  const handleSendMessage = () => {
    sendMessage(messageInput);
    setMessageInput("");
  };

  return (
    <div>
      <p>Liitytty peliin</p>
      <button className="btn" onClick={() => close()}>
        Poistu
      </button>
      <h2>Keskustelu</h2>
      {messages.map(({ user, value }) => (
        <p key={user + value}>
          {user}: {value}
        </p>
      ))}
      <input
        value={messageInput}
        onChange={({ target }) => setMessageInput(target.value)}
      />
      <button className="btn" onClick={handleSendMessage}>
        Lähetä
      </button>

      <div>
        <button className="btn" onClick={() => setShowUsers((prev) => !prev)}>
          {showUsers ? "Piilota käyttäjät" : "Näytä käyttäjät"}
        </button>
        {showUsers && users.map((user) => <p key={user}>{user}</p>)}
      </div>
    </div>
  );
};

export default App;

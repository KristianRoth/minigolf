import React, { useState, useCallback } from 'react';
import useWebsocket from '../hooks/useWebsocket';

type Message = {
  user: string;
  value: string;
};

const BASE_URL = (() => {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:8080';
  }
  return window.location.host;
})();

function Chat() {
  const [connected, setConnected] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const onOpen = useCallback(() => {
    console.log('Connected!');
    setConnected(true);
  }, []);

  const onMessage = useCallback(
    (event: any) => {
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
    },
    [messages, users]
  );

  const onClose = useCallback(() => {
    console.log('Disconnected!');
    setConnected(false);
  }, []);

  const { connect, sendMessage, close } = useWebsocket({
    url: `ws://${BASE_URL}/chat`,
    onOpen,
    onMessage,
    onClose,
  });

  const sendChatMessage = (message: string) => {
    sendMessage(message);
    setMessages([...messages, { user: '', value: message }]);
  };

  return (
    <div className='container mx-auto px-4'>
      {connected ? (
        <ChatView messages={messages} users={users} sendChatMessage={sendChatMessage} close={close} />
      ) : (
        <button className='btn' onClick={() => connect()}>
          Liity
        </button>
      )}
    </div>
  );
}

type ChatProps = {
  messages: Message[];
  users: string[];
  sendChatMessage: (message: string) => void;
  close: () => void;
};
const ChatView: React.FC<ChatProps> = ({ messages, users, sendChatMessage, close }) => {
  const [messageInput, setMessageInput] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const handleSendMessage = () => {
    sendChatMessage(messageInput);
    setMessageInput('');
  };

  return (
    <div>
      <p>Liitytty peliin</p>
      <button className='btn' onClick={() => close()}>
        Poistu
      </button>
      <h2>Keskustelu</h2>
      {messages.map(({ user, value }, index) => (
        <p key={index}>
          {user ? `Käyttäjä ${user}` : 'Sinä'}: {value}
        </p>
      ))}
      <input
        value={messageInput}
        onChange={({ target }) => setMessageInput(target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleSendMessage();
          }
        }}
      />
      <button className='btn' onClick={handleSendMessage}>
        Lähetä
      </button>

      <div>
        <button className='btn' onClick={() => setShowUsers((prev) => !prev)}>
          {showUsers ? 'Piilota käyttäjät' : 'Näytä käyttäjät'}
        </button>
        {showUsers && users.map((user) => <p key={user}>{user}</p>)}
      </div>
    </div>
  );
};

export default Chat;

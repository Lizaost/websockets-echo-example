import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {useWebSocket} from "./services/websockets";
import './App.css';

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    return () => {
      socketClient.close();
    }
  }, []);

  const addMessage = useCallback((type, value) => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const newMessage = {
      type,
      value,
      time
    };
    setMessages(messages => [...messages, newMessage]);
  }, [messages]);

  const submitHandler = (event) => {
    event.preventDefault();
    socketClient.sendMessage(message);
    addMessage('send', message);
    setMessage("");
  };

  const onMessage = useCallback(({data}) => {
    addMessage('reply', data);
  }, [messages, addMessage]);

  const socketClient = useWebSocket({}, onMessage);

  const isSendingAllowed = useMemo(() => socketClient?.socket.readyState && message, [socketClient.socket, message]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>WebSockets echo example</h1>
        <div className="MessagesForm">
          <label htmlFor="message" className="MessagesFormLabel">Message</label>
          <input id="message" type="text" placeholder="Message" className="MessagesFormInput"
                 value={message} onChange={(e) => setMessage(e.target.value)}/>
          <button disabled={!isSendingAllowed} onClick={submitHandler}
                  className="MessagesFormButton">
            Send
          </button>
        </div>
        <div className="MessagesLog">
          {messages.map(message => <div className="MessageBlock">
            <span className={message.type === 'send' ? 'SendMessage' : 'ReplyMessage'}>
              {message.type.toUpperCase()}:{' '}
            </span>
            {message.value}
          </div>)}
        </div>
      </header>
    </div>
  );
}

export default App;

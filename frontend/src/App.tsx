import { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = event.data;
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = () => {
    if (wsRef.current && room) {
      wsRef.current.send(JSON.stringify({ action: 'join', room }));
      setCurrentRoom(room);
    }
  };

  const sendMessage = () => {
    const input = document.getElementById('message');
    const message = input?.value;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoom && message) {
      wsRef.current.send(JSON.stringify({ action: 'message', room: currentRoom, payload: message }));
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      input.value = '';
    }
  };

  return (
    <div className="h-screen bg-black">
      {/* Room Selection */}
      <div className="p-4">
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="p-2 rounded-lg border border-gray-700"
          placeholder="Enter room name"
        />
        <button onClick={joinRoom} className="bg-blue-500 p-2 m-2 text-white rounded-lg">
          Join Room
        </button>
      </div>

      {/* Message Display */}
      <div className="h-[75vh] overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded p-2 mb-4 ${
              message.startsWith('You:')
                ? 'bg-blue-100 text-black'
                : 'bg-white text-black'
            }`}
          >
            {message}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="w-full bg-white flex p-4">
        <input
          type="text"
          id="message"
          className="flex-1 p-2 rounded-lg border border-gray-700"
          placeholder="Enter your message"
        />
        <button onClick={sendMessage} className="bg-purple-500 p-4 m-4 text-white rounded-lg">
          Send Message
        </button>
      </div>
    </div>
  );
}

export default App;

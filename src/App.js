import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hi! I\'m **CampusBot**. Ask me about placements!' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteraction, setHasInteraction] = useState(false);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:5000/chat'
    : 'https://campusbot-backend.onrender.com/chat';

  const handleSend = async (queryText = userInput) => {
    const text = queryText.trim();
    if (!text) return;

    if (!hasInteraction) setHasInteraction(true);

    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: '⚠️ Server not responding. Please ensure the backend is running.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ sender: 'bot', text: 'Chat cleared! How can I help you now?' }]);
    setHasInteraction(false); // Optionally show chips again on clear
  };

  const quickChips = [
    "Highest package 2025",
    "Amazon hiring process",
    "Companies for 8+ CGPA",
    "Tech roles in 2024",
    "Highest package in 2024"
  ];

  return (
    <div className="app-wrapper">
      <div className="glass-bg"></div>
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-info">
            <h1>🎓 DTU-CampusBot</h1>
            <p className="status"><span className="dot"></span> Online</p>
          </div>
          <button className="clear-btn" onClick={clearChat} title="Clear Chat">🗑️</button>
        </header>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.sender}`}>
              <div className={`message ${msg.sender}`}>
                <div
                  className="msg-content"
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="message bot loading">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        <div className="footer-area">
          {!hasInteraction && (
            <div className="quick-chips">
              {quickChips.map((chip, i) => (
                <button key={i} className="chip" onClick={() => handleSend(chip)}>{chip}</button>
              ))}
            </div>
          )}

          <div className="input-area">
            <input
              type="text"
              placeholder="Ask about companies, packages, CGPA..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={() => handleSend()}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

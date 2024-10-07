"use client";

import { useState, useEffect } from 'react';

interface Message {
  type: 'user' | 'cohere';
  text: string;
}

export default function ChatPage() {
  const [userMessage, setUserMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Add user message to chat
    const newMessages = [...messages, { type: 'user', text: userMessage }];
    setMessages(newMessages);
    setUserMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      const cohereMessage = data.message;

      // Add cohere response to chat
      setMessages([...newMessages, { type: 'cohere', text: cohereMessage }]);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat display area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 max-w-xs rounded-lg ${
              message.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Input section */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter your message..."
          className="border p-2 flex-grow rounded-l-md"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

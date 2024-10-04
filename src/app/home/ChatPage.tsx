'use client';

import { useState, useEffect } from 'react';

export default function ChatPage() {
  const [userMessage, setUserMessage] = useState('');
  const [cohereResponse, setCohereResponse] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      setCohereResponse(data.message); 
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  useEffect(() => {
    setCohereResponse('');
  }, [userMessage]);

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter the prompt"
          className="border p-2 flex-grow rounded-l-md"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600">
          Submit
        </button>
      </form>
      {cohereResponse && (
        <div className="border p-4 rounded-md cursor-text select-text"> 
          <strong>Response:</strong> {cohereResponse}
        </div>
      )}
    </div>
  );
}


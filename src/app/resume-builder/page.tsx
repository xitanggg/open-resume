"use client";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "components/Resume";
import { useState, useRef, useEffect } from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { Send, X } from 'lucide-react';

interface Message {
  type: 'user' | 'cohere';
  text: string;
}

// Chat Sidebar Component
interface ChatSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userMessage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userMessage.trim()) return;

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

      setMessages([...newMessages, { type: 'cohere', text: cohereMessage }]);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Chat</h2>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t p-4 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-end">
            <textarea
              ref={textareaRef}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden dark:bg-gray-600 dark:text-gray-200"
              rows={1}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Create: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Provider store={store}>
      <main className="relative h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-3 md:grid-cols-6">
          <div className="col-span-3">
            <ResumeForm />
          </div>
          <div className="col-span-3">
            <Resume />
          </div>
        </div>

        {!isSidebarOpen && ( // Hide button when sidebar is open
          <button
            className="fixed bottom-10 right-5 z-50 flex items-center rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
            onClick={toggleSidebar}
          >
            <FaWandMagicSparkles className="mr-2" />
            <span>Chat</span>
          </button>
        )}

        <ChatSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </main>
    </Provider>
  );
};

export default Create;

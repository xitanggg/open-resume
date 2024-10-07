"use client";

import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "components/Resume";
import ChatPage from "home/ChatPage";
import { useState } from "react";

// Floating Chat Button Component
interface FloatingChatButtonProps {
  toggleChat: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ toggleChat }) => (
  <button
    className="fixed bottom-5 right-5 z-50 rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
    onClick={toggleChat}
  >
    Chat
  </button>
);

// Chat Window Component
interface ChatWindowProps {
  toggleChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ toggleChat }) => (
  <div className="fixed bottom-16 right-5 z-50 w-80 h-96 bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="flex justify-between items-center p-2 bg-blue-500 text-white">
      <h3>Chat</h3>
      <button onClick={toggleChat} className="text-white">
        ✖️
      </button>
    </div>
    <div className="p-8 h-full">
      <ChatPage />
    </div>
  </div>
);

const Create: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <Provider store={store}>
      <main className="relative h-full w-full overflow-hidden bg-gray-50">
        <div className="grid grid-cols-3 md:grid-cols-6">
          <div className="col-span-3">
            <ResumeForm />
          </div>
          <div className="col-span-3">
            <Resume />
          </div>
        </div>

        {/* Floating Chat Button */}
        <FloatingChatButton toggleChat={toggleChat} />

        {/* Conditionally render Chat Window with ChatPage */}
        {isChatOpen && <ChatWindow toggleChat={toggleChat} />}
      </main>
    </Provider>
  );
};

export default Create;

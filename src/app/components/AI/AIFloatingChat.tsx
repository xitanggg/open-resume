"use client";
import { useState, useRef, useEffect } from "react";
import { cx } from "lib/cx";
import { callAI, hasAPIKey } from "lib/ai/ai-service";
import { buildChatResponsePrompt } from "lib/ai/ai-prompts";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { emoji: "🔍", label: "Review Resume", prompt: "Review my resume and give me 3 specific suggestions to improve it." },
  { emoji: "📄", label: "Improve Writing", prompt: "How can I make my resume bullet points more impactful?" },
  { emoji: "🎯", label: "ATS Tips", prompt: "What are the top 5 tips to make my resume more ATS-friendly?" },
  { emoji: "✉️", label: "Cover Letter", prompt: "Help me write a cover letter based on my resume." },
];

export const AIFloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resume = useAppSelector(selectResume);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getResumeContext = (): string => {
    const parts: string[] = [];
    if (resume.profile.name) parts.push(`Name: ${resume.profile.name}`);
    if (resume.profile.summary) parts.push(`Summary: ${resume.profile.summary}`);
    
    resume.workExperiences.forEach((w) => {
      if (w.jobTitle || w.company) {
        parts.push(`Work: ${w.jobTitle} at ${w.company} — ${w.descriptions.join("; ")}`);
      }
    });
    
    resume.educations.forEach((e) => {
      if (e.school || e.degree) {
        parts.push(`Education: ${e.degree} from ${e.school}`);
      }
    });
    
    resume.projects.forEach((p) => {
      if (p.project) {
        parts.push(`Project: ${p.project} — ${p.descriptions.join("; ")}`);
      }
    });
    
    if (resume.skills.descriptions.length > 0) {
      parts.push(`Skills: ${resume.skills.descriptions.join(", ")}`);
    }
    
    return parts.join("\n") || "No resume content yet.";
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (!hasAPIKey()) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content },
        {
          role: "assistant",
          content: "⚠️ Please set your Gemini API key first. Click the ✨ AI Settings button in the top navigation bar.",
        },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prompt = buildChatResponsePrompt(content, getResumeContext());
      const response = await callAI({
        system: prompt.system,
        user: prompt.user,
        type: "chat",
      });
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${error.message || "Something went wrong. Please try again."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cx(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white",
          "hover:shadow-xl hover:shadow-purple-400/30 hover:scale-105",
          "active:scale-95",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-purple-400 opacity-30 animate-ping" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] animate-ai-slide-in">
          <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white/95 shadow-2xl shadow-purple-200/40 backdrop-blur-xl">
            {/* Chat Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Resume Assistant</h3>
                <p className="text-xs text-white/70">Ask anything about your resume</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                </span>
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Hi! 👋 I can help with your resume.
                    <br />
                    Try a quick action or ask anything!
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    {QUICK_ACTIONS.map(({ emoji, label, prompt }) => (
                      <button
                        key={label}
                        onClick={() => sendMessage(prompt)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm"
                      >
                        <span>{emoji}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cx(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cx(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-700 rounded-bl-md"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 rounded-bl-md">
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your resume..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-40 disabled:hover:shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

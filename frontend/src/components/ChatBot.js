import React, { useState, useEffect, useRef } from 'react';
import { X, PaperPlaneTilt, Robot, User as UserIcon, Sparkle } from '@phosphor-icons/react';
import api from '../api/axios';
import { toast } from 'sonner';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const { data } = await api.get(`/api/chat/history/?session_id=${sessionId}`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat history', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat/', {
        message: input,
        session_id: sessionId
      });

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from assistant');
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'How do I check my attendance?',
    'Where can I submit assignments?',
    'How to view my marks?',
    'Show me the timetable',
  ];

  const handleSuggestionClick = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="open-chatbot-button"
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#0047AB] text-white rounded-full shadow-lg hover:bg-[#003380] hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 group"
        >
          <Robot size={32} weight="duotone" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <div className="absolute right-20 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Need help? Ask me!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          data-testid="chatbot-window"
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-zinc-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0047AB] to-[#003380] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkle size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Portal Assistant</h3>
                <p className="text-xs text-white/80">Here to help you navigate</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              data-testid="close-chatbot-button"
              className="hover:bg-white/20 p-2 rounded transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#0047AB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Robot size={32} className="text-[#0047AB]" weight="duotone" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900 mb-2">Welcome to Portal Assistant!</h4>
                <p className="text-sm text-zinc-600 mb-4">Ask me anything about the portal</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      className="block w-full text-left px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm hover:border-[#0047AB] hover:bg-blue-50 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, idx) => (
              <div
                key={idx}
                data-testid={`message-${message.role}`}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-[#0047AB] text-white'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <UserIcon size={18} weight="bold" />
                  ) : (
                    <Robot size={18} weight="duotone" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#0047AB] text-white'
                      : 'bg-white border border-zinc-200 text-zinc-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3" data-testid="loading-indicator">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-200 text-zinc-700">
                  <Robot size={18} weight="duotone" />
                </div>
                <div className="bg-white border border-zinc-200 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                data-testid="chatbot-input"
                disabled={loading}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                data-testid="send-message-button"
                className="px-4 py-2 bg-[#0047AB] text-white rounded-md hover:bg-[#003380] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">
              AI-powered assistant • May occasionally make mistakes
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

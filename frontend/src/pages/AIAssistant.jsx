import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/api.service';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { toast } from 'react-toastify';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your StudyAI coach. Ask me questions like:\n\n• What should I study today?\n• How many hours are left?\n• Which subject is weakest?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What should I study today?",
    "How many hours are left?",
    "Which subject is weakest?",
    "Give me productivity tips."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Clear input if sending from main input field
    if (!textToSend) setInput('');

    // User Message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await aiService.chat(text);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data.data,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error.message || 'Error communicating with coach');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Study <span className="text-gradient">Coach</span> 🤖
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
          Your personal academic counselor and progress auditor
        </p>
      </div>

      {/* Main Chat Interface */}
      <GlassCard className="flex-1 flex flex-col min-h-0 overflow-hidden !p-0 border-brand-500/10" hover={false}>
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-lg shadow-lg shadow-brand-500/20">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[70%] p-4 rounded-[2rem] text-sm whitespace-pre-line leading-relaxed shadow-sm font-medium
                    ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700/50'
                    }`}
                >
                  {msg.text}
                  <span className={`block text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-cyan-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-cyan-500/20">
                    👤
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing State Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-lg animate-pulse">
                🤖
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-[2rem] rounded-tl-none flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 bg-slate-50/50 dark:bg-slate-950/20">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-xs font-bold px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-500 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
          <input
            type="text"
            placeholder="Type your question for the AI Study Coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 glass-input rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
          />
          <Button
            variant="primary"
            onClick={() => handleSendMessage()}
            className="shrink-0 rounded-2xl px-6 py-4"
          >
            Send ⚡
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIAssistant;

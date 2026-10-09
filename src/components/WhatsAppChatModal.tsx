import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Send, MessageCircle, Sparkles, Check, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const WhatsAppChatModal: React.FC = () => {
  const { isWhatsAppOpen, setIsWhatsAppOpen, ownerPhone, ownerWhatsAppUrl } = useStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: `Marhaba! Welcome to NasBaladna Fresh Produce. You can chat with our team here or directly on WhatsApp at ${ownerPhone} (77315415). How can we assist with your fresh harvest delivery today?`,
      time: 'Just now',
    },
  ]);

  if (!isWhatsAppOpen) return null;

  const quickPrompts = [
    'I want to place a Bulk Wholesale Order',
    'What was harvested this morning?',
    'What is the delivery time to The Pearl?',
    'Can I order custom portion weights?',
  ];


  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated warm concierge reply
    setTimeout(() => {
      let replyText =
        'Thank you for reaching out! Our produce is hand-picked daily at 5:00 AM from our Al Khor and Al Rayyan greenhouses and packed under cold-chain standards. Your order will reach your doorstep within 35-45 minutes.';
      if (text.toLowerCase().includes('pearl') || text.toLowerCase().includes('delivery')) {
        replyText =
          'Yes! We deliver across The Pearl, West Bay, Lusail, and all Doha zones within 30-45 minutes in our temperature-controlled chilled vans (4°C).';
      } else if (text.toLowerCase().includes('harvest')) {
        replyText =
          'Today we harvested sweet Pani Dodam oranges, vine cluster tomatoes, crisp Persian cucumbers, and fresh hydroponic mint & coriander!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-rep-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end items-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[90vh] border border-slate-200">
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                NB
              </div>
              <span className="w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full absolute bottom-0 right-0" />
            </div>

            <div>
              <h3 className="font-bold text-sm leading-tight">NasBaladna Farm Concierge</h3>
              <span className="text-[11px] text-emerald-200">
                Online · <span className="font-mono">{ownerPhone}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={ownerWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-1 rounded-lg"
              title="Launch external WhatsApp app"
            >
              Open App
            </a>
            <button
              onClick={() => setIsWhatsAppOpen(false)}
              className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* WhatsApp Background Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] ${
                m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#E7FFDB] text-slate-900 rounded-br-xs'
                    : 'bg-white text-slate-900 rounded-bl-xs'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-2.5 py-1 rounded-full text-slate-600 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 text-base sm:text-xs px-3 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  sender: 'amen' | 'user';
  content: string;
  timestamp?: string;
}

interface QuickAction {
  id: string;
  label: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'amen',
    content: '<strong>Akwaaba, Amara.</strong>I see you completed Module 1.3 — The Uncomfortable Truths. That one is heavy. How are you sitting with it?',
    timestamp: 'Today · 11:42 PM',
  },
  {
    id: '2',
    sender: 'user',
    content: 'Honestly I had to pause. The land dispute story shook me. I keep thinking about Kwesi.',
  },
  {
    id: '3',
    sender: 'amen',
    content:
      "That's the right thing to feel. His story is meant to interrupt the romanticised version of return that social media sells us.\n\nYou don't have to carry his grief. But you do have to know it exists, before you arrive holding only your own.",
  },
  {
    id: '4',
    sender: 'user',
    content: 'Should I be worried about what my presence does there?',
  },
  {
    id: '5',
    sender: 'amen',
    content:
      "Yes — and that worry is a sign you're ready for the work, not unfit for it.\n\n<strong>Three concrete things:</strong>\n1. Spend in cedis at locally-owned places, not hard currency at expat hotels.\n2. Tip generously where it matters — guides, drivers, household staff.\n3. Resist the urge to \"develop\" or \"fix\" anything in your first visit. Listen first.\n\nWould you like a 4-minute audio that goes deeper, or sit with what we've said?",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', label: '+ Tell me more' },
  { id: '2', label: "+ I'm overwhelmed" },
  { id: '3', label: '+ Connect me with a Custodian' },
];

export default function AmenAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: inputValue,
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate Amen response after 1 second
      setTimeout(() => {
        const amenResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'amen',
          content: 'I hear you. Take the time you need. What else is on your mind?',
        };
        setMessages(prev => [...prev, amenResponse]);
      }, 1000);
    }
  };

  const handleQuickAction = (label: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: label.replace('+ ', ''),
    };
    setMessages([...messages, newMessage]);

    // Simulate Amen response
    setTimeout(() => {
      const amenResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'amen',
        content: 'Great. Let me help you with that.',
      };
      setMessages(prev => [...prev, amenResponse]);
    }, 1000);
  };

  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 38px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-brass/15">
        <div className="w-11 h-11 rounded-full bg-brass flex items-center justify-center text-forest-deepest font-semibold display text-lg">
          A
        </div>
        <div className="flex-1">
          <div className="font-medium text-cream">Amen AI</div>
          <div className="text-xs text-cream/50 mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brass"></span>
            Online · WhatsApp parity active
          </div>
        </div>
        <button className="btn-ghost-dark text-xs">View on WhatsApp</button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((message, index) => (
          <div key={message.id}>
            {message.timestamp && (
              <div className="text-center my-3">
                <span className="eyebrow eyebrow-cream" style={{ fontSize: '9px' }}>
                  {message.timestamp}
                </span>
              </div>
            )}
            <div
              className={`chat-msg ${message.sender === 'amen' ? 'amen' : 'user'}`}
              dangerouslySetInnerHTML={{
                __html: message.content
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-brass/15 max-w-3xl mx-auto w-full">
        {/* Quick Action Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_ACTIONS.map(action => (
            <span
              key={action.id}
              className="tag tag-brass cursor-pointer hover:opacity-80 transition"
              onClick={() => handleQuickAction(action.label)}
            >
              {action.label}
            </span>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex items-end gap-3">
          <textarea
            className="field-dark resize-none flex-1"
            rows={2}
            placeholder="Type a message…"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="btn-primary !px-5"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{ opacity: inputValue.trim() ? 1 : 0.5 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-cream/40 mono">
          <span>Unlimited messages · Preparation tier</span>
          <span>Crisis-aware · escalates to a human in 60s</span>
        </div>
      </div>

      {/* Crisis Button */}
      <button className="crisis-btn" onClick={() => alert('SOS modal')}>
        SOS
      </button>
    </div>
  );
}

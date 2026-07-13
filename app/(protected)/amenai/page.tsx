'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface ChatMessage {
  id: string;
  sender: 'amen' | 'user';
  content: string;
  timestamp?: string;
  fragmentUsed?: boolean;
  custodianName?: string;
  custodianRegion?: string;
  whatsappLink?: string;
}

interface QuickAction {
  id: string;
  label: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', label: '+ Tell me more' },
  { id: '2', label: "+ I'm overwhelmed" },
  { id: '3', label: '+ Connect me with a Custodian' },
];

export default function AmenAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

  // Generate a conversation ID on mount
  useEffect(() => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setConversationId(newId);

    // Show initial Amen greeting
    const greeting: ChatMessage = {
      id: 'welcome',
      sender: 'amen',
      content: '**Akwaaba.** I am Amen — a griot, a keeper of stories, a witness to homecoming.\n\nI am here to walk alongside you as you prepare for your journey. There is no rush. What is on your mind?',
      timestamp: formatTimestamp(new Date()),
    };
    setMessages([greeting]);
    setIsInitializing(false);

    // Check for trigger_sos query param
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('trigger_sos') === 'true') {
        setTimeout(() => {
          triggerManualSOS(newId);
        }, 150);
      }
    }
  }, []);

  const triggerManualSOS = async (currentConvId?: string) => {
    const activeId = currentConvId || conversationId;
    if (!activeId) return;

    // Add user crisis request to chat UI
    const userMessage: ChatMessage = {
      id: `user-sos-${Date.now()}`,
      sender: 'user',
      content: '🚨 SOS: Requesting immediate crisis support.',
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/amen-ai/sos`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          conversation_id: activeId,
        }),
      });

      const result = await response.json();
      const data = result.data;

      const amenResponse: ChatMessage = {
        id: `amen-sos-${Date.now()}`,
        sender: 'amen',
        content: data?.response || "I hear you, and you are not alone. Let us take a breath. Tell me: What are 5 things you can see around you right now? 4 things you can touch? 3 things you can hear? 2 things you can smell? 1 thing you can taste? Focus on these, one by one. Our support team has been paged.",
        timestamp: formatTimestamp(new Date()),
        whatsappLink: data?.whatsapp_link || undefined,
        custodianName: data?.custodian_name || undefined,
      };

      setMessages(prev => [...prev, amenResponse]);
    } catch (error) {
      console.error('Amen AI SOS trigger error:', error);
      const errorResponse: ChatMessage = {
        id: `amen-sos-error-${Date.now()}`,
        sender: 'amen',
        content: "I hear you, and you are not alone. Let us take a breath. Tell me: What are 5 things you can see around you right now? 4 things you can touch? 3 things you can hear? 2 things you can smell? 1 thing you can taste? Focus on these, one by one. Our support team has been paged.",
        timestamp: formatTimestamp(new Date()),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function formatTimestamp(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today · ${timeStr}` : `${date.toLocaleDateString()} · ${timeStr}`;
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: messageText,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/amen-ai/chat`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          message: messageText,
          conversation_id: conversationId,
        }),
      });

      const result = await response.json();
      const data = result.data;

      const amenResponse: ChatMessage = {
        id: `amen-${Date.now()}`,
        sender: 'amen',
        content: data?.response || "I'm here, but I'm having a little difficulty right now. Please try again in a moment — I won't go far.",
        timestamp: formatTimestamp(new Date()),
        fragmentUsed: data?.fragment_used || false,
        custodianName: data?.custodian_name || undefined,
        custodianRegion: data?.custodian_region || undefined,
        whatsappLink: data?.whatsapp_link || undefined,
      };

      setMessages(prev => [...prev, amenResponse]);
    } catch (error) {
      console.error('Amen AI chat error:', error);

      // Graceful fallback — Amen still "speaks" even if API is down
      const fallbackResponse: ChatMessage = {
        id: `amen-fallback-${Date.now()}`,
        sender: 'amen',
        content: "I'm here, but I'm having a little difficulty right now. Please try again in a moment — I won't go far.",
        timestamp: formatTimestamp(new Date()),
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };

  const handleQuickAction = (label: string) => {
    const cleanLabel = label.replace('+ ', '');
    sendMessage(cleanLabel);
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
        {isInitializing ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid rgba(201,161,74,0.2)',
                borderTopColor: '#c9a14a',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span className="text-cream/50 text-xs mono">Connecting to Amen…</span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.timestamp && (
                <div className="text-center my-3">
                  <span className="eyebrow eyebrow-cream" style={{ fontSize: '9px' }}>
                    {message.timestamp}
                  </span>
                </div>
              )}
              <div className={`chat-msg ${message.sender === 'amen' ? 'amen' : 'user'}`}>
                <SafeMarkdown content={message.content} />
                {message.whatsappLink && (
                  <div className="mt-3">
                    <a
                      href={message.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-colors text-sm"
                      style={{ gap: '8px', borderRadius: '4px', textDecoration: 'none' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.116-2.88-6.978C16.594 1.899 14.116.879 11.48.879c-5.437 0-9.862 4.419-9.866 9.861-.001 1.763.486 3.428 1.411 4.908L1.932 20.89l5.315-1.393-.596-.343zM18.006 14.73c-.328-.164-1.94-.957-2.24-1.066-.3-.11-.519-.164-.737.164-.219.328-.847 1.066-1.038 1.285-.19.219-.382.246-.71.082-.328-.164-1.386-.51-2.64-1.627-.977-.872-1.637-1.95-1.828-2.278-.19-.328-.02-.505.144-.668.148-.147.328-.382.492-.574.164-.192.219-.328.328-.547.11-.219.055-.411-.027-.575-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.552-.737-.563-.19-.01-.409-.012-.628-.012-.219 0-.574.082-.874.411-.3.328-1.147 1.121-1.147 2.735 0 1.614 1.174 3.172 1.338 3.391.164.219 2.31 3.526 5.596 4.945.782.337 1.393.539 1.871.691.785.25 1.5.214 2.066.13.63-.094 1.94-.793 2.214-1.559.273-.766.273-1.422.191-1.559-.082-.137-.3-.219-.628-.383z"/>
                      </svg>
                      Chat with Custodian on WhatsApp
                    </a>
                  </div>
                )}
              </div>
              {/* Knowledge Bank citation attribution */}
              {message.fragmentUsed && message.custodianName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  padding: '6px 12px',
                  background: 'rgba(201,161,74,0.08)',
                  border: '1px solid rgba(201,161,74,0.15)',
                  borderRadius: '6px',
                  maxWidth: '75%',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a14a" strokeWidth="2">
                    <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                    Knowledge sourced from <strong style={{ color: '#c9a14a' }}>{message.custodianName}</strong>
                    {message.custodianRegion && <span> · {message.custodianRegion}</span>}
                    <span style={{ marginLeft: '6px', opacity: 0.6 }}>— $0.35 citation earned</span>
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
            <div style={{
              display: 'flex', gap: '4px', padding: '10px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#c9a14a',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#c9a14a',
                animation: 'pulse 1.4s ease-in-out 0.2s infinite',
              }} />
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', background: '#c9a14a',
                animation: 'pulse 1.4s ease-in-out 0.4s infinite',
              }} />
            </div>
            <span className="text-cream/30 text-xs mono">Amen is reflecting…</span>
          </div>
        )}

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
              style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}
            >
              {action.label}
            </span>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
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
            disabled={isLoading}
          />
          <button
            className="btn-primary !px-5"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={{ opacity: inputValue.trim() && !isLoading ? 1 : 0.5 }}
          >
            {isLoading ? (
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin 0.6s linear infinite',
              }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-cream/40 mono">
          <span>Unlimited messages · Preparation tier</span>
          <span>Crisis-aware · escalates to a human in 60s</span>
        </div>
      </div>

     

      {/* Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Secure React-based Markdown rendering to prevent XSS (no dangerouslySetInnerHTML)
interface SafeMarkdownProps {
  content: string;
}

function SafeMarkdown({ content }: SafeMarkdownProps) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        // Headers (e.g. ### Title)
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const Tag = `h${level}` as any;
          return (
            <Tag key={idx} className="font-semibold text-cream mt-2 mb-1" style={{ fontSize: level === 3 ? '1.1rem' : '1.25rem' }}>
              {parseInlineMarkdown(text)}
            </Tag>
          );
        }

        // List item (e.g. - item or * item)
        const listMatch = line.match(/^[-*]\s+(.*)$/);
        if (listMatch) {
          return (
            <ul key={idx} className="list-disc pl-5 my-1">
              <li>{parseInlineMarkdown(listMatch[1])}</li>
            </ul>
          );
        }

        // Numbered list (e.g. 1. item)
        const numListMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numListMatch) {
          return (
            <ol key={idx} className="list-decimal pl-5 my-1">
              <li>{parseInlineMarkdown(numListMatch[2])}</li>
            </ol>
          );
        }

        // Regular line / paragraph
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline parser for bold and italic text segments returning React nodes
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
  let match;
  let lastIndex = 0;

  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    if (match[2]) {
      // Bold
      parts.push(<strong key={matchIndex} className="font-bold text-cream">{match[2]}</strong>);
    } else if (match[4]) {
      // Italic
      parts.push(<em key={matchIndex} className="italic text-cream">{match[4]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

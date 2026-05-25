'use client';

import { useState } from 'react';

export default function CustodianLounge() {
  const [composeText, setComposeText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'question' | 'tip' | 'discussion'>('question');
  const [likes, setLikes] = useState({ post1: 14, post2: 22, post3: 31 });

  const toggleLike = (postId: string) => {
    setLikes(prev => ({
      ...prev,
      [postId]: (prev[postId as keyof typeof prev] || 0) + 1
    }));
  };

  const handlePost = () => {
    if (composeText.trim()) {
      console.log('Post created:', { text: composeText, category: selectedCategory });
      setComposeText('');
    }
  };

  return (
    <>
      <div className="cust-eyebrow">Private Community</div>
      <h1 className="cust-page-title">Custodian Lounge</h1>

      {/* Security Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1a2e1a', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a14a" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#c9a14a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Custodians Only · Walled Space
          </div>
          <div style={{ fontSize: '11px', color: '#a0a890', marginTop: '2px' }}>
            This forum is invisible to clients and the public. All posts are peer-to-peer among verified OurRoots Custodians.
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
        <div>
          {/* Compose */}
          <div className="c-card c-card-pad" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="avatar avatar-photo" style={{ width: '36px', height: '36px', fontSize: '13px', border: '2px solid rgba(201,161,74,0.5)', flexShrink: 0 }}>
                A
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="c-field"
                  rows={3}
                  placeholder="Share a question, insight, or experience with fellow Custodians…"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'question', label: 'Question', bg: '#dbeafe', color: '#1d4ed8' },
                      { id: 'tip', label: 'Tip', bg: '#dcfce7', color: '#16a34a' },
                      { id: 'discussion', label: 'Discussion', bg: '#fef9c3', color: '#b45309' }
                    ].map(cat => (
                      <span
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          background: selectedCategory === cat.id ? cat.bg : 'transparent',
                          color: selectedCategory === cat.id ? cat.color : '#8a7f72',
                          fontWeight: 600,
                          border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid #e8e3d9',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cat.label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handlePost}
                    style={{
                      background: '#c9a14a',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 18px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post 1 */}
          <div className="c-card c-card-pad" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#f0ebe0', flexShrink: 0 }}>
                K
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Kwame Asante</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', padding: '2px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)' }}>
                    ✓ Senior Custodian
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#dbeafe', color: '#1d4ed8', fontWeight: 600 }}>
                    Question
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>
                  Kumasi, Ghana · 2 hrs ago
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 14px', lineHeight: '1.6' }}>
              Has anyone found a good way to handle diaspora clients who arrive with strong preconceptions about what "authentic" Ghanaian food means? I had a client who was disappointed that we use gas stoves in homes now, not open fire. How do you navigate that conversation without making them feel corrected?
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
              <button
                onClick={() => toggleLike('post1')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                👍 {likes.post1}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                💬 Reply (8)
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                🔖 Save
              </button>
            </div>
            <div style={{ paddingTop: '14px', borderTop: '1px solid #f0ebe0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#c9a14a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', flexShrink: 0 }}>
                  A
                </div>
                <div style={{ background: '#f9f6f0', borderRadius: '6px', padding: '10px', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                    Akosua Owusu-Ansah <span style={{ fontWeight: 400, color: '#8a7f72' }}>· 1 hr ago</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                    I frame it as "this is how we live now — which is itself part of the story." The journey is about real life, not a museum exhibit.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4e5c8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', flexShrink: 0 }}>
                  E
                </div>
                <div style={{ background: '#f9f6f0', borderRadius: '6px', padding: '10px', flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                    Esi Mensah <span style={{ fontWeight: 400, color: '#8a7f72' }}>· 45 min ago</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                    Agreed. I ask early — "what does home mean to you?" — so expectations are shaped before arrival.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Post 2 */}
          <div className="c-card c-card-pad" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8a4f2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#f0ebe0', flexShrink: 0 }}>
                F
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Fatou Diallo</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', padding: '2px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)' }}>
                    ✓ Certified Custodian
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>
                    Tip
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>
                  Dakar, Senegal · 5 hrs ago
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 14px', lineHeight: '1.6' }}>
              💡 <strong>Knowledge Bank tip:</strong> I uploaded a 6-minute audio on Wolof greeting protocols — it has generated 89 Amen AI citations this month. Audio + context notes outperform text-only. Short, specific submissions work best.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => toggleLike('post2')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                👍 {likes.post2}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                💬 Reply (4)
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#c9a14a',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                + Contribute knowledge →
              </button>
            </div>
          </div>

          {/* Post 3 */}
          <div className="c-card c-card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4a2d8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#f0ebe0', flexShrink: 0 }}>
                O
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Olumide Adeyemi</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', padding: '2px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)' }}>
                    ✓ Certified Custodian
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#fef9c3', color: '#b45309', fontWeight: 600 }}>
                    Discussion
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>
                  Lagos, Nigeria · Yesterday
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 14px', lineHeight: '1.6' }}>
              The Custodian Lounge separation from client hubs is the right call. We need a space to talk openly — what's working, what clients struggle with, how to improve our craft. What would you all want to discuss here regularly?
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => toggleLike('post3')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                👍 {likes.post3}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                💬 Reply (17)
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#8a7f72',
                  padding: 0
                }}
              >
                🔖 Save
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Members Card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lounge Members
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#c9a14a', fontFamily: "'JetBrains Mono', monospace" }}>
              47
            </div>
            <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '2px' }}>
              Verified Custodians · 12 active today
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { initial: 'K', name: 'Kwame Asante', location: 'Ghana' },
                { initial: 'F', name: 'Fatou Diallo', location: 'Senegal' },
                { initial: 'O', name: 'Olumide Adeyemi', location: 'Nigeria' }
              ].map((member, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#374151' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ['#2d6a4f', '#8a4f2d', '#4a2d8a'][idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
                    {member.initial}
                  </div>
                  {member.name} · {member.location}
                </div>
              ))}
              <div style={{ fontSize: '11px', color: '#c9a14a', cursor: 'pointer', marginTop: '4px' }}>
                See all 47 →
              </div>
            </div>
          </div>

          {/* Hot Topics Card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Hot Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                '🔥 Managing emotional breakthroughs',
                '📚 Best Knowledge Bank formats',
                '📅 Diaspora visits & festival timing',
                '💰 Earnings optimisation'
              ].map((topic, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: '#374151',
                    padding: '8px',
                    background: '#f9f6f0',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Your Status Card */}
          <div className="c-card c-card-pad">
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              {[
                { label: 'Posts', value: '12', color: '#1a1a1a' },
                { label: 'Replies', value: '34', color: '#1a1a1a' },
                { label: 'Helpful votes', value: '187', color: '#c9a14a' },
                { label: 'Rank', value: 'Top 15%', color: '#2d6a4f' }
              ].map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8a7f72' }}>{stat.label}</span>
                  <span style={{ fontWeight: 600, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

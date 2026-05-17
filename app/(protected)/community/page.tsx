'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Hub {
  id: string;
  adinkra: string;
  emoji: string;
  name: string;
  description: string;
  members: number;
  activeThreads: number;
  access: 'free' | 'community' | 'preparation' | 'locked';
  accessLabel: string;
  borderColor?: string;
  tags?: string[];
  youreHere?: boolean;
}

interface Thread {
  id: string;
  author: string;
  authorInitials: string;
  avatarClass: string;
  tag: string;
  tagColor: 'brass' | 'emerald' | 'rose';
  timeAgo: string;
  title: string;
  excerpt: string;
  replies: number;
  hearts: number;
  pinned?: boolean;
}

const HUBS: Hub[] = [
  {
    id: 'hub_love',
    adinkra: 'Akoma',
    emoji: '💕',
    name: 'The Love Hub',
    description: 'Emotional support, identity sharing. Open community for all heritage seekers — read AND post, regardless of tier. 312 relatives. 7 active threads.',
    members: 312,
    activeThreads: 7,
    access: 'free',
    accessLabel: 'Free for everyone',
    borderColor: 'var(--rose)',
    youreHere: true,
  },
  {
    id: 'hub_citizenship',
    adinkra: 'Gye Nyame',
    emoji: '🛂',
    name: 'The Citizenship Hub',
    description: 'Relocation, citizenship, Right of Abode, legal pathways. 184 relatives. 4 active threads.',
    members: 184,
    activeThreads: 4,
    access: 'community',
    accessLabel: 'Read free · post Community+',
  },
  {
    id: 'hub_business',
    adinkra: 'Dwennimmen',
    emoji: '💼',
    name: 'The Business Hub',
    description: 'Pan-African entrepreneurship, investment, diaspora business. 97 relatives. 3 active threads.',
    members: 97,
    activeThreads: 3,
    access: 'community',
    accessLabel: 'Read free · post Community+',
  },
  {
    id: 'hub_foodie',
    adinkra: 'Asaase Yaa',
    emoji: '🍲',
    name: 'The Foodie Hub',
    description: 'Recipes, culinary heritage, food as cultural connection. 156 relatives. 6 active threads.',
    members: 156,
    activeThreads: 6,
    access: 'community',
    accessLabel: 'Read free · post Community+',
  },
  {
    id: 'hub_solo',
    adinkra: 'Nkyinkyim',
    emoji: '🎒',
    name: 'The Solo Hub',
    description: 'Solo travellers, women\'s safety, meetups, buddy systems. Heightened safety monitoring. 78 relatives.',
    members: 78,
    activeThreads: 2,
    access: 'community',
    accessLabel: 'Read free · post Community+',
  },
  {
    id: 'hub_prosperity',
    adinkra: 'Sankofa',
    emoji: '🌟',
    name: 'The Prosperity Hub',
    description: 'Post-journey integration, purpose discovery, returnee community. Unlocks after Stage 5 completion.',
    members: 0,
    activeThreads: 0,
    access: 'locked',
    accessLabel: 'Returnees · Preparation tier',
  },
];

const THREADS: Thread[] = [
  {
    id: 't1',
    author: 'Jasmine M.',
    authorInitials: 'JM',
    avatarClass: 'avatar-photo',
    tag: 'First-time return',
    tagColor: 'brass',
    timeAgo: '2 hours ago',
    title: 'Anyone else terrified about meeting "their" village for the first time?',
    excerpt: 'My DNA test says I\'m 71% Igbo. I\'ve connected with a small village outside Onitsha. They want to do a welcome ceremony. I\'m panicking. What if I disappoint them.',
    replies: 12,
    hearts: 8,
  },
  {
    id: 't2',
    author: 'Daniel T.',
    authorInitials: 'DT',
    avatarClass: 'avatar-photo-2',
    tag: 'Practical',
    tagColor: 'emerald',
    timeAgo: '1 day ago',
    title: 'How much cash do I actually need? The reality, not the brochure version',
    excerpt: 'Travelling to Accra in July. The DIY guide says budget USD $80/day. But I\'ve heard wildly different numbers.',
    replies: 28,
    hearts: 14,
  },
  {
    id: 't3',
    author: 'Rachel K.',
    authorInitials: 'RK',
    avatarClass: 'avatar-photo-3',
    tag: 'Heavy',
    tagColor: 'rose',
    timeAgo: '3 days ago',
    title: 'My grandmother just died. I was supposed to take her to Ghana with me.',
    excerpt: 'She was 89. She never got to go. I had the ticket booked for September. I don\'t know what to do with this grief now.',
    replies: 47,
    hearts: 102,
    pinned: true,
  },
];

export default function CommunityPage() {
  const router = useRouter();
  const [activeHub] = useState<string>('hub_love');

  const handleHubClick = (hubId: string) => {
    router.push(`/community/${hubId}`);
  };

  const getTagColor = (tagColor: string) => {
    switch (tagColor) {
      case 'brass':
        return 'tag-brass';
      case 'emerald':
        return 'tag-emerald';
      case 'rose':
        return 'tag-rose';
      default:
        return 'tag-dark';
    }
  };

  return (
    <>
      

      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow eyebrow-cream mb-3">Community Hubs · 6 active · moderated by Custodians</div>
        <h1 className="display text-5xl font-light leading-tight mb-3">Where relatives gather.</h1>
        <p className="text-cream/70 max-w-2xl">
          No likes, no metrics, no algorithm. Threaded conversations among people who understand what you carry. Each hub carries an Adinkra symbol and a purpose.
        </p>
      </div>

      {/* Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {HUBS.map(hub => (
          <div
            key={hub.id}
            className="scard-dark p-5 cursor-pointer hover:border-brass/40 transition"
            style={hub.borderColor ? { borderLeft: `3px solid ${hub.borderColor}` } : {}}
            onClick={() => handleHubClick(hub.id)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="eyebrow eyebrow-cream">
                {hub.adinkra} {hub.emoji}
              </div>
              <span className={`tag ${hub.access === 'free' ? 'tag-rose' : hub.access === 'locked' ? 'tag-brass' : 'tag-dark'}`}>
                {hub.accessLabel}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="display text-xl text-cream mb-2">{hub.name}</h3>
            <p className="text-xs text-cream/60 leading-relaxed mb-3">{hub.description}</p>

            {/* Members */}
            {hub.access !== 'locked' ? (
              <>
                <div className="member-strip mb-3">
                  <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '10px', border: '2px solid var(--forest-deepest)' }}>
                    JM
                  </div>
                  <div className="avatar avatar-photo-2" style={{ width: '28px', height: '28px', fontSize: '10px', border: '2px solid var(--forest-deepest)', marginLeft: '-8px' }}>
                    DT
                  </div>
                  <div className="avatar avatar-photo-4" style={{ width: '28px', height: '28px', fontSize: '10px', border: '2px solid var(--forest-deepest)', marginLeft: '-8px' }}>
                    RK
                  </div>
                  <div className="avatar avatar-photo-3" style={{ width: '28px', height: '28px', fontSize: '10px', border: '2px solid var(--forest-deepest)', marginLeft: '-8px' }}>
                    AJ
                  </div>
                  <div
                    className="avatar"
                    style={{
                      width: '28px',
                      height: '28px',
                      fontSize: '10px',
                      border: '2px solid var(--forest-deepest)',
                      marginLeft: '-8px',
                      background: 'rgba(201,161,74,0.15)',
                      color: 'var(--brass-light)',
                    }}
                  >
                    +{Math.max(0, hub.members - 4)}
                  </div>
                  <div className="member-count">{hub.members} members {hub.youreHere ? '· you\'re here' : ''}</div>
                </div>
                {hub.youreHere && <span className="tag tag-brass">You're here</span>}
              </>
            ) : (
              <div className="member-strip mb-3">
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(201,161,74,0.08)',
                    border: '2px dashed rgba(201,161,74,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(201,161,74,0.4)" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div className="member-count" style={{ marginLeft: '8px' }}>
                  Unlocks after your return
                </div>
              </div>
            )}
            {hub.access === 'locked' && <span className="tag tag-dark">Locked until return</span>}
          </div>
        ))}
      </div>

      {/* Active Threads Section */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="eyebrow eyebrow-cream mb-1">The Love Hub · active threads</div>
          <h2 className="display text-2xl">Sorted by quietness · longest unanswered first</h2>
        </div>
        <button className="btn-primary">+ New thread</button>
      </div>

      {/* Threads List */}
      <div className="space-y-3">
        {THREADS.map(thread => (
          <div
            key={thread.id}
            className="scard-dark p-5 cursor-pointer hover:border-brass/40 transition"
            onClick={() => router.push(`/community/hub_love/${thread.id}`)}
          >
            <div className="flex items-start gap-4">
              <div className={`avatar ${thread.avatarClass} flex-shrink-0`}>{thread.authorInitials}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="font-medium text-cream">{thread.author}</div>
                  <span className={`tag ${getTagColor(thread.tagColor)}`}>{thread.tag}</span>
                  <span className="text-xs text-cream/40 mono">· {thread.timeAgo}</span>
                </div>
                <h3 className="font-medium text-cream mb-2">{thread.title}</h3>
                <p className="text-sm text-cream/70 leading-relaxed mb-3">{thread.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-cream/50">
                  <span>{thread.replies} replies</span>
                  <span>· {thread.hearts} hearts</span>
                  {thread.pinned && <span className="text-brass-light">Pinned by Akosua</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

     
    </>
  );
}

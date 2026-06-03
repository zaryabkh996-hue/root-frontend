'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAuthButtons from './components/HeaderAuthButtons';
import { AuthService } from '@/app/lib/authService';

const COUNTRY_DATA: Record<string, string[]> = {
  Ghana: ['Accra', 'Cape Coast', 'Kumasi', 'Elmina', 'Tamale', 'Takoradi'],
  Nigeria: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City'],
  Senegal: ['Dakar', 'Saint-Louis', 'Touba', 'Thiès'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  Ethiopia: ['Addis Ababa', 'Gondar', 'Lalibela', 'Axum'],
  Egypt: ['Cairo', 'Alexandria', 'Luxor', 'Aswan'],
  Morocco: ['Casablanca', 'Marrakech', 'Fes', 'Rabat'],
  Tanzania: ['Dar es Salaam', 'Zanzibar City', 'Arusha', 'Dodoma'],
  Benin: ['Cotonou', 'Porto-Novo', 'Ouidah'],
  Gambia: ['Banjul', 'Serekunda', 'Bakau'],
};

const COMMON_LANGUAGES = [
  'English',
  'French',
  'Portuguese',
  'Arabic',
  'Swahili',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Zulu',
  'Xhosa',
  'Shona',
  'Amharic',
  'Oromo',
  'Somali',
  'Twi',
  'Ga',
  'Ewe',
  'Fante',
  'Wolof',
  'Bambara',
  'Lingala',
  'Kinyarwanda',
];

type CustodianApplicationForm = {
  name: string;
  email: string;
  country: string;
  location: string;
  years_experience: number;
  specialty: string;
  availability: 'Available' | 'Booked';
  description: string;
  short_bio: string;
  about: string;
  certification: string;
  coc_status: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  languages: string[];
  services: Array<{ name: string; price: number; description: string }>;
};

interface FeaturedCustodian {
  id: number;
  name: string;
  location: string;
  country: string;
  years_experience: number;
  specialty: string;
  description: string;
  avatar_initials: string;
  avatar_class: string;
  tags: string[];
  verified: boolean;
};

export default function Home() {
  const router = useRouter();
  const [showCustodianModal, setShowCustodianModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [languageToAdd, setLanguageToAdd] = useState('');
  const [featuredCustodians, setFeaturedCustodians] = useState<FeaturedCustodian[]>([]);
  const [custodiansLoading, setCustodiansLoading] = useState(true);
  const [totalCustodians, setTotalCustodians] = useState(0);

  const defaultServices = useMemo(
    () => [
      { name: 'Free 15-min introduction', price: 0, description: 'Video call · meet, ask anything, no commitment' },
      { name: 'Pre-trip preparation call', price: 80, description: '60 min · video · personalised plan for your visit' },
      { name: 'Cape Coast accompaniment', price: 280, description: 'Full day in-person · castle visit + integration walk' },
      { name: 'Post-trip integration', price: 60, description: "45 min · video · once you're home in the diaspora" },
    ],
    []
  );

  const [custodianForm, setCustodianForm] = useState<CustodianApplicationForm>({
    name: '',
    email: '',
    country: '',
    location: '',
    years_experience: 0,
    specialty: '',
    availability: 'Available',
    description: '',
    short_bio: '',
    about: '',
    certification: '',
    coc_status: '',
    whatsapp: '',
    instagram: '',
    linkedin: '',
    languages: [],
    services: defaultServices,
  });

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    try {
      const user = JSON.parse(userRaw);
      setCustodianForm((prev) => ({
        ...prev,
        name: user?.name || prev.name,
        email: user?.email || prev.email,
      }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedCustodians = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
        const apiUrl = `${backendUrl}/api/custodians?page=1&limit=3`;


        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });



        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Failed to fetch custodians: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Transform backend data to match FeaturedCustodian interface
        const transformedCustodians = (data.custodians || []).map((custodian: any) => {
          // Generate avatar initials from name
          const avatar_initials = custodian.name
            ? custodian.name
              .split(' ')
              .map((word: string) => word.charAt(0))
              .join('')
              .toUpperCase()
              .substring(0, 2)
            : 'C';

          // Parse tags if they're stored as JSON string
          let tags = [];
          if (custodian.tags) {
            if (typeof custodian.tags === 'string') {
              try {
                tags = JSON.parse(custodian.tags);
              } catch {
                tags = custodian.tags.split(',').map((tag: string) => tag.trim());
              }
            } else if (Array.isArray(custodian.tags)) {
              tags = custodian.tags;
            }
          }

          // Determine verified status (active status means verified)
          const verified = custodian.status === 'active' || custodian.status === null;

          return {
            id: custodian.id,
            name: custodian.name || 'Unknown Custodian',
            location: custodian.location || 'Unknown Location',
            country: custodian.country || 'Unknown Country',
            years_experience: custodian.years_experience || 0,
            specialty: custodian.specialty || 'General Guidance',
            description: custodian.description || 'No description available',
            avatar_initials,
            avatar_class: custodian.avatar_class || 'avatar-photo',
            tags: tags || [],
            verified,
          };
        });


        setFeaturedCustodians(transformedCustodians);
        setTotalCustodians(data.total || 0);
      } catch (error) {
        setFeaturedCustodians([]);
      } finally {
        setCustodiansLoading(false);
      }
    };

    fetchFeaturedCustodians();
  }, []);

  const openCustodianModal = () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setShowCustodianModal(true);
  };

  const closeCustodianModal = () => {
    setShowCustodianModal(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(false);
    setLanguageToAdd('');
  };

  const addLanguage = (lang: string) => {
    if (!lang) return;
    setCustodianForm((prev) => {
      if (prev.languages.includes(lang)) return prev;
      return { ...prev, languages: [...prev.languages, lang] };
    });
  };

  const removeLanguage = (lang: string) => {
    setCustodianForm((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== lang) }));
  };

  const handleBrowseCustodians = () => {
    if (AuthService.isAuthenticated()) {
      router.push('/custodians');
    } else {
      router.push('/login');
    }
  };

  const handleViewCustodianProfile = (custodianId: number) => {
    if (AuthService.isAuthenticated()) {
      router.push(`/custodians/${custodianId}`);
    } else {
      router.push('/login');
    }
  };

  const handleCustodianApply = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      setSubmitting(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';

      const response = await fetch(`${backendUrl}/api/custodians/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(custodianForm),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.error ||
          data?.message ||
          (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
          'Failed to submit application.';
        throw new Error(message);
      }

      setSubmitSuccess('Thank you for your application! We have received it and will review it shortly. You will be notified once your custodian status is approved.');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCustodianFormValid = useMemo(() => {
    return (
      custodianForm.name.trim().length > 0 &&
      custodianForm.email.trim().length > 0 &&
      custodianForm.country.trim().length > 0 &&
      custodianForm.location.trim().length > 0 &&
      custodianForm.specialty.trim().length > 0 &&
      custodianForm.description.trim().length > 0 &&
      custodianForm.short_bio.trim().length > 0 &&
      custodianForm.about.trim().length > 0 &&
      custodianForm.languages.length > 0 &&
      Number.isFinite(custodianForm.years_experience) &&
      custodianForm.years_experience >= 0
    );
  }, [custodianForm]);

  return (
    <div>
      {/* Top header */}
      <header className="bg-forest-deepest text-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-5 flex items-center justify-between">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-95 transition-all"
          >
            <img src="/logo-icon.svg" alt="Our Roots Africa" className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0" style={{ maxHeight: '32px' }} />
            <div className="flex flex-col">
              <div className="font-serif text-sm md:text-lg font-bold leading-tight text-[#f3ede0]">
                OurRoots<span className="text-[#c9a14a]">.Africa</span>
              </div>
              <div className="text-[7px] md:text-[8px] text-[#c9a14a] font-mono tracking-[0.2em] font-bold mt-0.5 leading-none">
                SANCTUARY EDITION
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#how-it-works" className="ul-link text-cream/80 hover:text-cream">How it works</a>
            <a href="#the-6-stages" className="ul-link text-cream/80 hover:text-cream hidden lg:inline">The 6 stages</a>
            <a href="#custodians" className="ul-link text-cream/80 hover:text-cream hidden lg:inline">Custodians</a>
            <a href="#pricing" className="ul-link text-cream/80 hover:text-cream hidden lg:inline">Pricing</a>
            <a href="#faq" className="ul-link text-cream/80 hover:text-cream hidden lg:inline">FAQ</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3" style={{ flexShrink: 0 }}>
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <HeaderAuthButtons />
            </div>

            {/* Mobile Actions: Always show primary CTA outside drawer */}
            <div className="flex md:hidden items-center gap-2">
              <a 
                href="/quiz" 
                className="navbar-cta-primary flex items-center justify-center font-semibold transition-colors"
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  background: '#c9a14a',
                  color: '#0a1810',
                  borderRadius: '4px',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Begin
              </a>
              {/* Hamburger Button: minimum 44px touch target */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-11 h-11 flex items-center justify-center text-cream focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isMobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute top-0 right-0 h-screen w-64 bg-[#0a1810] border-l border-brass/10 p-6 flex flex-col gap-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-brass/10 pb-4">
                <span className="font-serif text-base font-bold text-[#f3ede0]">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-cream"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-cream/80 font-medium">
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brass py-2 border-b border-brass/5">How it works</a>
                <a href="#the-6-stages" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brass py-2 border-b border-brass/5">The 6 stages</a>
                <a href="#custodians" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brass py-2 border-b border-brass/5">Custodians</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brass py-2 border-b border-brass/5">Pricing</a>
                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brass py-2 border-b border-brass/5">FAQ</a>
              </nav>
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-brass/10">
                {/* Mobile Drawer Auth Actions */}
                <a 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center border border-brass/25 hover:border-brass text-cream font-semibold rounded"
                >
                  Login
                </a>
                <a 
                  href="/quiz" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center bg-brass hover:bg-brass-light text-forest-deepest font-semibold rounded"
                >
                  Begin
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-forest-deepest text-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="eyebrow eyebrow-cream fade-up d1 mb-6">For the African diaspora · Established 2026</div>
            <h1 className="display text-6xl md:text-7xl font-light leading-[0.95] fade-up d2 mb-8">
              The journey home begins long before<br /><em className="text-brass-light">a flight is booked.</em>
            </h1>
            <p className="text-lg text-cream/80 max-w-xl leading-relaxed fade-up d3 mb-10">
              OurRoots.Africa is a digital sanctuary — not a travel app. We prepare relatives of the African diaspora — emotionally, culturally, and practically — to return home.
            </p>
            <div className="flex flex-wrap gap-3 fade-up d4">
              <a href="/quiz" className="btn-primary inline-flex">
                Discover your Travel DNA
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6"></path></svg>
              </a>
              <button type="button" className="btn-secondary" onClick={openCustodianModal}>
                Become a Custodian
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 text-cream/60 fade-up d5">
              <div className="flex items-center gap-2 text-sm"><span className="w-1 h-1 rounded-full bg-brass"></span> 5 minutes</div>
              <div className="flex items-center gap-2 text-sm"><span className="w-1 h-1 rounded-full bg-brass"></span> Free to begin</div>
              <div className="flex items-center gap-2 text-sm"><span className="w-1 h-1 rounded-full bg-brass"></span> Trauma-informed</div>
              <div className="flex items-center gap-2 text-sm"><span className="w-1 h-1 rounded-full bg-brass"></span> No sales pressure</div>
            </div>
          </div>
          <div className="lg:col-span-5 fade-up d3">
            <div className="hero-photo aspect-[4/5] relative">
              <div className="absolute bottom-6 left-6 right-6 z-10 bg-forest-deepest/85 backdrop-blur p-5 border border-brass/30">
                <div className="eyebrow eyebrow-cream mb-2">From the manifesto</div>
                <p className="display text-lg leading-snug text-cream italic">"You are not a tourist. You are a relative returning."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section id="how-it-works" className="bg-forest-deep text-cream py-28 relative">
        <div className="max-w-4xl mx-auto px-8 manifesto">
          <div className="eyebrow eyebrow-cream mb-10 ornament">Our manifesto</div>
          <p>Global travel technology was built for markets that already work — for those with credit cards that don't get declined and passports that open every door. <strong>It was not built for us.</strong></p>
          <p>So we built this. A platform for migrant workers, traders, pilgrims, students, diaspora returnees, and the <em>relatives</em> who carry the weight of displacement in their bodies — not as tourists, but as people coming home to a continent that has been waiting.</p>
          <p>We design chat-native and voice-native products in local languages. We meet relatives on the channels they already trust — <em>WhatsApp, voice notes, the way an elder calls a child.</em> We treat the informal economy as the starting point, never the edge case.</p>
          <p>The test for everything we ship is not whether it works in San Francisco. It is whether <strong>Amara, in Atlanta</strong>, scared and hopeful and standing at the threshold of a journey her great-great-grandmother could not finish, can walk through it without fracturing.</p>
        </div>
      </section>

      {/* 6-Stage Framework */}
      <section id="the-6-stages" className="bg-cream py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="eyebrow mb-4 ornament">The six-stage journey</div>
            <h2 className="display text-5xl font-light leading-tight max-w-3xl mx-auto">A trauma-informed framework for returning home — built with cultural psychologists, Ghanaian elders, and 70+ diaspora relatives.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="scard p-7">
              <div className="flex items-center justify-between mb-5"><div className="stage-dot current">1</div><span className="tag tag-emerald">Free</span></div>
              <h3 className="display text-2xl mb-2">Emotional Preparation</h3>
              <p className="text-sm text-ink-dim leading-relaxed mb-4">Mindset, expectations, and emotional readiness. Learn that "returning home" is a journey, not a destination — and that Ghana is not Wakanda.</p>
              <div className="text-xs mono text-ink-dim">5 modules · 50 min · audio + video</div>
            </div>
            <a href="#modal-stage2" className="block">
              <div className="scard p-7">
                <div className="flex items-center justify-between mb-5"><div className="stage-dot locked">2</div><span className="tag tag-brass">Community+</span></div>
                <h3 className="display text-2xl mb-2">Cultural Intelligence</h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-4">Greetings, protocols, elder etiquette, market language, sacred space behaviour. Beyond "learn medaase" — the depth Western travel guides skip.</p>
                <div className="text-xs mono text-ink-dim">8 modules · 2h 30min</div>
              </div>
            </a>
            <a href="#modal-stage3" className="block">
              <div className="scard p-7">
                <div className="flex items-center justify-between mb-5"><div className="stage-dot locked">3</div><span className="tag tag-brass">Preparation+</span></div>
                <h3 className="display text-2xl mb-2">Practical Preparation</h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-4">Visa paperwork, health, packing, money, transport, accommodation. The DIY budget travel guide and the "Ghana reality check" briefing.</p>
                <div className="text-xs mono text-ink-dim">6 modules · 2h · checklists + PDFs</div>
              </div>
            </a>
            <a href="#modal-stage4" className="block">
              <div className="scard p-7">
                <div className="flex items-center justify-between mb-5"><div className="stage-dot locked">4</div><span className="tag tag-brass">Preparation+</span></div>
                <h3 className="display text-2xl mb-2">Arrival Orientation</h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-4">First 72 hours. Airport handover, host family meeting, jet-lag protocol, the chief's blessing if a Day Name awaits you.</p>
                <div className="text-xs mono text-ink-dim">4 modules · 1h 20min</div>
              </div>
            </a>
            <a href="#modal-stage5" className="block">
              <div className="scard p-7">
                <div className="flex items-center justify-between mb-5"><div className="stage-dot locked">5</div><span className="tag tag-brass">Preparation+</span></div>
                <h3 className="display text-2xl mb-2">Heritage Journey</h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-4">The deepest part. Cape Coast Castle. The Door of No Return. Real-time emotional support via Amen AI on WhatsApp throughout your in-country experience.</p>
                <div className="text-xs mono text-ink-dim">7 modules · live support</div>
              </div>
            </a>
            <a href="#modal-stage6" className="block">
              <div className="scard p-7">
                <div className="flex items-center justify-between mb-5"><div className="stage-dot locked">6</div><span className="tag tag-brass">Preparation+</span></div>
                <h3 className="display text-2xl mb-2">Post-Journey Integration</h3>
                <p className="text-sm text-ink-dim leading-relaxed mb-4">Re-entry is its own journey. The Love Hub community, debrief sessions, the question of whether — and how — you carry Africa home with you.</p>
                <div className="text-xs mono text-ink-dim">5 modules · ongoing community</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Meet Amen AI */}
      <section className="bg-forest-deepest text-cream py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow eyebrow-cream mb-4 ornament">Meet Amen AI</div>
            <h2 className="display text-5xl font-light leading-tight mb-6">A companion who speaks your <em className="text-brass-light italic">two languages</em>.</h2>
            <p className="text-cream/75 text-lg leading-relaxed mb-6">Amen AI is a culturally intelligent guide trained on authentic African voices, trauma-informed care, and the specific protocols of every country you might be returning to. She lives both inside the app and on WhatsApp, where you already are.</p>
            <p className="text-cream/75 leading-relaxed mb-8">When you wake up at 3 AM in Atlanta unable to sleep because tomorrow is the day you booked your ticket — Amen is awake too.</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-brass/15 border border-brass/40 flex items-center justify-center text-brass flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <div><div className="font-medium mb-0.5">WhatsApp parity</div><p className="text-sm text-cream/70">Start a conversation in the app, continue on WhatsApp, never lose your thread.</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-brass/15 border border-brass/40 flex items-center justify-center text-brass flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
                <div><div className="font-medium mb-0.5">Validation before instruction</div><p className="text-sm text-cream/70">Every response leads with acknowledgement. "Your feelings are valid" comes before "here is what to do."</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-brass/15 border border-brass/40 flex items-center justify-center text-brass flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div><div className="font-medium mb-0.5">Crisis-aware</div><p className="text-sm text-cream/70">If you tell her you're not okay, a real human is paged within 60 seconds.</p></div>
              </div>
            </div>
          </div>
          <div className="scard-dark p-8 relative">
            <div className="absolute -top-3 left-8 bg-forest-deepest px-3 eyebrow eyebrow-cream">In-app preview</div>
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-brass/15">
              <div className="w-11 h-11 rounded-full bg-brass flex items-center justify-center text-forest-deepest font-semibold display text-lg">A</div>
              <div><div className="font-medium">Amen AI</div><div className="text-xs text-cream/60 mono">Online · Cultural companion</div></div>
            </div>
            <div className="space-y-4">
              <div className="chat-msg amen"><strong className="display text-brass-light text-lg block mb-1">Akwaaba, Amara.</strong>I see you completed Module 1.3 — The Uncomfortable Truths. That one is heavy. How are you sitting with it?</div>
              <div className="chat-msg user">Honestly I had to pause. The land dispute story shook me.</div>
              <div className="chat-msg amen">It's meant to. That weight is the work. You don't have to do anything with it tonight. Would you like a 4-minute audio that helps process this kind of moment, or would you rather just sit with it?</div>
            </div>
            <div className="mt-5 pt-5 border-t border-brass/15 flex gap-2">
              <input className="field-dark flex-1" placeholder="Type a message…"></input>
              <button className="btn-primary !px-4 " disabled>Send</button>
            </div>
          </div>
        </div>
      </section>

      {/* Custodians */}
      <section id="custodians" className="bg-cream-warm py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="eyebrow mb-4 ornament">Cultural Custodians</div>
              <h2 className="display text-5xl font-light leading-tight">The human bridge to home.</h2>
            </div>
            <p className="text-ink-dim text-lg leading-relaxed">Vetted local advisors across Africa — heritage educators, language teachers, naming-ceremony elders, family-history researchers. Book a free 15-minute introduction directly from any profile. No middlemen, no waiting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {custodiansLoading ? (
              <div className="col-span-3 text-center py-12 text-ink-dim">Loading custodians...</div>
            ) : featuredCustodians.length === 0 ? (
              <>
                <div className="scard p-6">
                  <div className="avatar avatar-lg avatar-photo mb-4">A</div>
                  <h3 className="display text-xl mb-1">Akosua O.</h3>
                  <div className="eyebrow mb-3">Accra · Ghana · 12 yrs</div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">Heritage educator specialising in Cape Coast and Elmina. Twi, Fante, English. Has guided 200+ diaspora relatives through the Door of No Return.</p>
                  <div className="flex flex-wrap gap-1.5 mb-4"><span className="tag tag-brass">Heritage sites</span><span className="tag tag-emerald">Twi</span></div>
                  <button className="btn-ghost w-full justify-center">View profile · Book intro</button>
                </div>
                <div className="scard p-6">
                  <div className="avatar avatar-lg avatar-photo-2 mb-4">K</div>
                  <h3 className="display text-xl mb-1">Kwame B.</h3>
                  <div className="eyebrow mb-3">Kumasi · Ghana · 8 yrs</div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">Ashanti cultural protocol and naming-ceremony facilitator. Connections to traditional courts. Trauma-informed.</p>
                  <div className="flex flex-wrap gap-1.5 mb-4"><span className="tag tag-emerald">Naming ceremony</span><span className="tag tag-brass">Protocol</span></div>
                  <button className="btn-ghost w-full justify-center">View profile · Book intro</button>
                </div>
                <div className="scard p-6">
                  <div className="avatar avatar-lg avatar-photo-3 mb-4">N</div>
                  <h3 className="display text-xl mb-1">Nia M.</h3>
                  <div className="eyebrow mb-3">Lagos · Nigeria · 6 yrs</div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">Yoruba family-history researcher. DNA-to-village mapping for diaspora seeking genealogical roots. Igbo and Yoruba.</p>
                  <div className="flex flex-wrap gap-1.5 mb-4"><span className="tag tag-terra">Genealogy</span><span className="tag tag-emerald">Yoruba</span></div>
                  <button className="btn-ghost w-full justify-center">View profile · Book intro</button>
                </div>
              </>
            ) : (
              featuredCustodians.map((custodian) => (
                <div key={custodian.id} className="scard p-6 flex flex-col">
                  <div className={`avatar avatar-lg ${custodian.avatar_class || 'avatar-photo'} mb-4`}>
                    {custodian.avatar_initials || custodian.name?.charAt(0) || 'C'}
                  </div>
                  <h3 className="display text-xl mb-1">{custodian.name}</h3>
                  <div className="eyebrow mb-3">{custodian.location} · {custodian.country} · {custodian.years_experience} yrs</div>
                  <p className="text-sm text-ink-dim leading-relaxed mb-4">{custodian.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {custodian.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className={`tag ${tag.includes('Heritage') || tag.includes('Genealogy') ? 'tag-terra' : tag.includes('Naming') ? 'tag-emerald' : 'tag-brass'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <button className="btn-ghost w-full justify-center" onClick={() => handleViewCustodianProfile(custodian.id)}>
                      View profile · Book intro
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <button className="btn-ghost" onClick={handleBrowseCustodians}>Browse all {totalCustodians} Custodians →</button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-cream py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="eyebrow mb-4 ornament">Pricing</div>
            <h2 className="display text-5xl font-light leading-tight mb-4">Pay only for the months you're <em className="italic text-brass-dim">actively planning</em>.</h2>
            <p className="text-ink-dim text-lg max-w-2xl mx-auto">Heritage travel is a finite journey — typically 3 to 6 months of preparation, not a continuous annual subscription. Cancel any time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Free */}
            <div className="scard p-7 flex flex-col">
              <div className="eyebrow mb-2">Tier 01 · Latent</div>
              <h3 className="display text-3xl mb-1">Free</h3>
              <div className="text-ink-dim text-sm mb-6">Score 0–39 · Foundation</div>
              <div className="display text-4xl mb-1">$0</div>
              <div className="text-xs text-ink-dim mono mb-6">No card required</div>
              <ul className="space-y-2.5 text-sm mb-7 flex-1">
                <li className="flex gap-2"><span className="text-brass">✓</span> Travel DNA Quiz</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Stage 1 — full (5 modules)</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Amen AI · 10 messages / 30 days</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> The Love Hub · full read + post</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> 5 other Hubs · read-only</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Browse Custodians</li>
                <li className="flex gap-2 text-ink-faint"><span>—</span> Stages 2–6 locked</li>
              </ul>
              <a href="/quiz" className="btn-ghost w-full justify-center">Begin free</a>
            </div>
            {/* Community */}
            <div className="scard p-7 flex flex-col">
              <div className="eyebrow mb-2">Tier 02 · Active</div>
              <h3 className="display text-3xl mb-1">Community</h3>
              <div className="text-ink-dim text-sm mb-6">Score 40–59 · Cultural fluency</div>
              <div className="flex items-baseline gap-2 mb-1"><span className="display text-4xl">$27</span><span className="text-ink-dim">/month</span></div>
              <div className="text-xs text-ink-dim mono mb-6">Cancel any time</div>
              <ul className="space-y-2.5 text-sm mb-7 flex-1">
                <li className="flex gap-2"><span className="text-brass">✓</span> Everything in Free</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Stage 2 unlocked</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Amen AI · 75 messages / 30 days</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> 5 Hubs · post + reply (Citizenship · Business · Foodie · Solo · Love)</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Library · 5 audio guides</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Custodian profiles · view</li>
              </ul>
              <a href="#modal-community" className="btn-ghost w-full justify-center">Choose Community</a>
            </div>
            {/* Preparation */}
            <div className="scard-dark p-7 flex flex-col relative" style={{ background: 'var(--forest-deepest)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brass text-forest-deepest text-xs mono font-semibold px-3 py-1 tracking-wider">MOST POPULAR</div>
              <div className="eyebrow eyebrow-cream mb-2">Tier 03 · Immersive</div>
              <h3 className="display text-3xl mb-1 text-cream">Preparation</h3>
              <div className="text-cream/60 text-sm mb-6">Score 60–100 · Active planning</div>
              <div className="flex items-baseline gap-2 mb-1"><span className="display text-4xl text-brass">$67</span><span className="text-cream/60">/month</span></div>
              <div className="text-xs text-cream/60 mono mb-6">3-mo $177 · 6-mo $347 · save up to 17%</div>
              <ul className="space-y-2.5 text-sm mb-7 flex-1 text-cream">
                <li className="flex gap-2"><span className="text-brass">✓</span> Everything in Community</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> All 6 stages unlocked</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Amen AI · unlimited</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Library · all 22 audio guides</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Custodian Marketplace · book + pay</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> DIY Budget Travel Guide · full</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Day Name &amp; Stage certificates</li>
                <li className="flex gap-2"><span className="text-brass">✓</span> Post-journey integration</li>
              </ul>
              <a href="#modal-preparation" className="btn-primary w-full justify-center">Choose Preparation</a>
            </div>
          </div>
          <p className="text-center text-sm text-ink-faint mt-10">For the rare Experiential Execution tier (score 85–100): trauma-informed 1-on-1 coaching coming Q3 2026. For now, Preparation tier delivers the full self-guided journey.</p>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-forest-deepest text-cream py-24">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="lg:col-span-1">
            <div className="avatar avatar-xl avatar-photo-4 mb-5">DO</div>
            <div className="eyebrow eyebrow-cream mb-1">Founder</div>
            <h3 className="display text-2xl">Dennis Obel</h3>
            <a className="ul-link text-brass-light text-sm mt-2 inline-block">dennisobel.com →</a>
          </div>
          <div className="lg:col-span-2">
            <p className="display text-2xl leading-snug mb-6 text-cream">"I am Kenyan, lived in Sydney for fifteen years, and watched the diaspora — friends, family, strangers in airports — wrestle with the same shape of grief and longing every time we talked about going home."</p>
            <p className="text-cream/75 leading-relaxed">OurRoots.Africa is the platform I wish had existed when my mother died and I had to bury her three continents away from where she was born. It is built by Africans, for Africans of every diaspora, and it is built with the assumption that emotional preparation matters as much as airline tickets.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-cream py-24">
        <div className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="eyebrow mb-4 ornament">Frequently asked</div>
            <h2 className="display text-4xl font-light">The questions before the questions.</h2>
          </div>
          <div className="space-y-3">
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">Is OurRoots only for African Americans?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">No. OurRoots is built primarily for the African diaspora — anyone of African descent living outside the continent — but is open to anyone drawn to meet Africa with intention. Our framework is deepest for those reconnecting, but the cultural intelligence applies to any thoughtful relative.</p></details>
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">What if I cannot afford it?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">Stage 1 — the full Emotional Preparation — is free, forever. We mean it. If the paid tiers don't work for your budget, write to us. We have a hardship pathway and we will find a way.</p></details>
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">Do I need a DNA test before starting?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">No. Many of our relatives don't know their specific heritage country. The Travel DNA Quiz is about your <em>readiness</em> for the journey, not your genetic ancestry. We support you whether you know your roots or are still searching for them.</p></details>
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">Which countries do you serve?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">Today: Ghana (deepest coverage), Kenya, Nigeria, Senegal, Ethiopia. Adding South Africa, Tanzania, Cameroon, and Côte d'Ivoire through 2026.</p></details>
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">What does "trauma-informed" actually mean here?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">Five things, encoded in our architecture: validation before information, pace set by you, crisis as a first-class flow (not buried in support pages), privacy that is genuinely sacred (your journal is unreadable by us), and a visual system that holds — rather than performs — safety.</p></details>
            <details className="scard p-5"><summary className="cursor-pointer font-medium flex items-center justify-between">Can I cancel any time?<span className="text-brass mono">+</span></summary><p className="mt-3 text-ink-dim leading-relaxed text-sm">Yes. Cancel any time in your settings. Your access continues until the end of your current billing period — no refund for the current month, but you will not be charged again.</p></details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-deep text-cream py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="ornament eyebrow eyebrow-cream mb-6 inline-flex">Begin</div>
          <h2 className="display text-5xl font-light leading-tight mb-6">Take the Travel DNA Quiz.</h2>
          <p className="text-cream/75 text-lg mb-10">Five minutes. No card required. Save your result and unlock Stage 1 immediately.</p>
          <a href="/quiz" className="btn-primary text-base inline-flex !px-8 !py-4">
            Begin your journey
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6"></path></svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-deepest text-cream/70 py-14 border-t border-brass/15">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 border-2 border-brass flex items-center justify-center text-brass display text-lg font-semibold">O</div>
              <div className="display text-base font-semibold text-cream">OurRoots<span className="text-brass">.Africa</span></div>
            </div>
            <p className="leading-relaxed text-xs">A digital sanctuary for the African diaspora. Operated by 3Men Pty Ltd, Surry Hills, Sydney NSW · Australia.</p>
            <p className="text-xs mt-3 mono">ABN 83 678 873 839</p>
          </div>
          <div>
            <div className="eyebrow eyebrow-cream mb-4">Platform</div>
            <ul className="space-y-2 text-xs">
              <li>Travel DNA Quiz</li>
              <li><a href="#the-6-stages">The 6 stages</a></li>
              <li>Amen AI</li>
              <li>Custodians</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow eyebrow-cream mb-4">Company</div>
            <ul className="space-y-2 text-xs"><li>About</li><li>Founder</li><li>Press</li><li>Careers</li><li>Contact</li></ul>
          </div>
          <div>
            <div className="eyebrow eyebrow-cream mb-4">Legal</div>
            <ul className="space-y-2 text-xs"><li>Privacy</li><li>Terms</li><li>Custodian Code</li><li>Trauma-informed pledge</li></ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-10 pt-6 border-t border-brass/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-cream/50">
          <div>
            <div>© 2026 OurRoots.Africa · 3Men Pty Ltd</div>
            <div className="mt-1">Level 1, 63-73 Ann Street, Surry Hills NSW 2010, Australia</div>
          </div>
          <div className="mono">
            <a href="mailto:support@ourroots.africa" className="hover:underline">support@ourroots.africa</a> ·{' '}
            <a href="https://wa.me/61433960900" target="_blank" rel="noopener noreferrer" className="hover:underline">
              WhatsApp +61 433 960 900
            </a>
          </div>
        </div>
      </footer>

      {showCustodianModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 24, 16, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={closeCustodianModal}
        >
          <div
            className="scard-dark p-8 w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '840px',
              maxHeight: '86vh',
              overflowY: 'auto',
              border: '1px solid rgba(201,161,74,0.25)',
              background: 'var(--forest-deep)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="eyebrow eyebrow-cream mb-2">Custodian Application</div>
                <h2 className="display text-3xl text-cream">Register as a Custodian</h2>
                <div className="text-sm text-cream/60 mt-2">
                  Your application is saved as pending. An admin will review and activate your profile.
                </div>
              </div>
              <button
                type="button"
                onClick={closeCustodianModal}
                className="text-cream/60 hover:text-cream text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {submitError && (
              <div
                className="p-4 mb-5"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  color: 'rgba(243, 237, 224, 0.95)',
                  fontSize: '13px',
                }}
              >
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div
                className="p-4 mb-5"
                style={{
                  background: 'rgba(34, 197, 94, 0.10)',
                  border: '1px solid rgba(34, 197, 94, 0.22)',
                  borderRadius: '6px',
                  color: 'rgba(243, 237, 224, 0.95)',
                  fontSize: '13px',
                }}
              >
                {submitSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-cream/60 block mb-2">Name *</label>
                <input
                  className="field-dark"
                  value={custodianForm.name}
                  onChange={(e) => setCustodianForm({ ...custodianForm, name: e.target.value })}
                  placeholder="E.g., Akosua O."
                />
              </div>
              <div>
                <label className="text-xs text-cream/60 block mb-2">Email *</label>
                <input
                  type="email"
                  className="field-dark"
                  value={custodianForm.email}
                  onChange={(e) => setCustodianForm({ ...custodianForm, email: e.target.value })}
                  placeholder="E.g., akosua@example.com"
                />
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Country *</label>
                <select
                  className="field-dark"
                  value={custodianForm.country}
                  onChange={(e) =>
                    setCustodianForm({
                      ...custodianForm,
                      country: e.target.value,
                      location: '',
                    })
                  }
                >
                  <option value="">Select country</option>
                  {Object.keys(COUNTRY_DATA)
                    .sort()
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Location (City) *</label>
                <select
                  className="field-dark"
                  value={custodianForm.location}
                  onChange={(e) => setCustodianForm({ ...custodianForm, location: e.target.value })}
                  disabled={!custodianForm.country}
                  style={{
                    opacity: custodianForm.country ? 1 : 0.6,
                    cursor: custodianForm.country ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">{custodianForm.country ? 'Select city' : 'Select country first'}</option>
                  {custodianForm.country &&
                    (COUNTRY_DATA[custodianForm.country] || []).sort().map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Years Experience *</label>
                <input
                  type="number"
                  min={0}
                  className="field-dark"
                  value={custodianForm.years_experience}
                  onChange={(e) =>
                    setCustodianForm({ ...custodianForm, years_experience: Number(e.target.value || 0) })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Specialty *</label>
                <select
                  className="field-dark"
                  value={custodianForm.specialty}
                  onChange={(e) => setCustodianForm({ ...custodianForm, specialty: e.target.value })}
                >
                  <option value="">Select specialty</option>
                  <option value="Heritage sites">Heritage sites</option>
                  <option value="Naming ceremony">Naming ceremony</option>
                  <option value="Genealogy">Genealogy</option>
                  <option value="Language">Language</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Availability *</label>
                <select
                  className="field-dark"
                  value={custodianForm.availability}
                  onChange={(e) =>
                    setCustodianForm({ ...custodianForm, availability: e.target.value as 'Available' | 'Booked' })
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-cream/60 block mb-2">Certification</label>
                <input
                  className="field-dark"
                  value={custodianForm.certification}
                  onChange={(e) => setCustodianForm({ ...custodianForm, certification: e.target.value })}
                  placeholder="E.g., Licensed tour guide, Elder council letter..."
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs text-cream/60 block mb-2">Short Bio (Quote) *</label>
              <textarea
                className="field-dark"
                value={custodianForm.short_bio}
                onChange={(e) => setCustodianForm({ ...custodianForm, short_bio: e.target.value })}
                rows={2}
                placeholder="One strong sentence that captures your work."
                style={{ resize: 'none' }}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs text-cream/60 block mb-2">Description *</label>
              <textarea
                className="field-dark"
                value={custodianForm.description}
                onChange={(e) => setCustodianForm({ ...custodianForm, description: e.target.value })}
                rows={3}
                placeholder="What do you help diaspora relatives with?"
                style={{ resize: 'none' }}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs text-cream/60 block mb-2">About *</label>
              <textarea
                className="field-dark"
                value={custodianForm.about}
                onChange={(e) => setCustodianForm({ ...custodianForm, about: e.target.value })}
                rows={4}
                placeholder="Your background, training, protocols you observe, and what makes you safe to work with."
                style={{ resize: 'none' }}
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4 mb-2">
                <label className="text-xs text-cream/60 block">Languages *</label>
                <div className="text-xs text-cream/45">Select at least 1</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {custodianForm.languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="tag tag-brass"
                    style={{ cursor: 'pointer' }}
                  >
                    {lang} ×
                  </button>
                ))}
              </div>

              <div className="flex gap-3 items-center">
                <select
                  className="field-dark"
                  value={languageToAdd}
                  onChange={(e) => setLanguageToAdd(e.target.value)}
                >
                  <option value="">Add language</option>
                  {COMMON_LANGUAGES.filter((l) => !custodianForm.languages.includes(l)).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn-ghost-dark"
                  onClick={() => {
                    addLanguage(languageToAdd);
                    setLanguageToAdd('');
                  }}
                  disabled={!languageToAdd}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="eyebrow eyebrow-cream mb-3">Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-cream/60 block mb-2">WhatsApp</label>
                  <input
                    className="field-dark"
                    value={custodianForm.whatsapp}
                    onChange={(e) => setCustodianForm({ ...custodianForm, whatsapp: e.target.value })}
                    placeholder="+233..."
                  />
                </div>
                <div>
                  <label className="text-xs text-cream/60 block mb-2">Instagram</label>
                  <input
                    className="field-dark"
                    value={custodianForm.instagram}
                    onChange={(e) => setCustodianForm({ ...custodianForm, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream/60 block mb-2">LinkedIn</label>
                  <input
                    className="field-dark"
                    value={custodianForm.linkedin}
                    onChange={(e) => setCustodianForm({ ...custodianForm, linkedin: e.target.value })}
                    placeholder="profile link"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleCustodianApply}
                disabled={submitting || !isCustodianFormValid}
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
              <button type="button" className="btn-ghost-dark" onClick={closeCustodianModal} disabled={submitting}>
                Close
              </button>
            </div>

            <div className="text-xs text-cream/45 mt-5">
              Your application will be reviewed by our team. You will be notified via email once approved.
            </div>
          </div>
        </div>
      )}


      {/* Stage 2 Modal */}
      <div id="modal-community" className="modal-overlay">
        <div className="modal-card scard-dark p-9" style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}>
          <div className="eyebrow eyebrow-cream mb-3">Unlock Stage 2 · Cultural Intelligence</div>
          <h2 className="display text-3xl mb-3 text-cream">Continue your journey</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-6">Greetings, protocols, elder etiquette, market language, sacred space behaviour.</p>
          <div className="scard-warm p-5 mb-5" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '3px solid var(--brass)' }}>
            <div className="flex items-center justify-between mb-2"><div className="text-cream font-medium">Community tier</div><div className="display text-3xl text-brass-light">$27<span className="text-sm text-cream/60">/mo</span></div></div>
            <div className="text-xs text-cream/65 leading-relaxed">Cancel any time. Your progress is preserved. Most relatives stay subscribed for 3–6 months.</div>
          </div>
          <div className="space-y-2 mb-6 text-sm text-cream/85">
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 2 (8 modules)</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 1 + 2</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Amen AI 75 messages / 30 days</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Full Community Hubs participation</div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">Pay $27 / month</button>
            <a href="#" className="btn-ghost-dark">Maybe later</a>
          </div>
          <div className="text-xs text-cream/50 mt-5 text-center">Secure checkout via Stripe · Paystack also accepted in NGN, ZAR, GHS</div>
        </div>
      </div>

      {/* Stage 3 Modal */}
      <div id="modal-stage3" className="modal-overlay">
        <div className="modal-card scard-dark p-9" style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}>
          <div className="eyebrow eyebrow-cream mb-3">Unlock Stage 3 · Practical Preparation</div>
          <h2 className="display text-3xl mb-3 text-cream">Continue your journey</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-6">Visa paperwork, health, packing, money, transport, accommodation.</p>
          <div className="scard-warm p-5 mb-5" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '3px solid var(--brass)' }}>
            <div className="flex items-center justify-between mb-2"><div className="text-cream font-medium">Preparation tier</div><div className="display text-3xl text-brass-light">$67<span className="text-sm text-cream/60">/mo</span></div></div>
            <div className="text-xs text-cream/65 leading-relaxed">Cancel any time. Your progress is preserved. Most relatives stay subscribed for 3–6 months.</div>
          </div>
          <div className="space-y-2 mb-6 text-sm text-cream/85">
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 3 (6 modules)</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> All Stages 1–6 unlocked</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Amen AI unlimited</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Full Community Hubs participation</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Custodian Marketplace · book + pay</div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">Pay $67 / month</button>
            <a href="#" className="btn-ghost-dark">Maybe later</a>
          </div>
          <div className="text-xs text-cream/50 mt-5 text-center">Secure checkout via Stripe · Paystack also accepted in NGN, ZAR, GHS</div>
        </div>
      </div>

      {/* Stage 4 Modal */}
      <div id="modal-preparation" className="modal-overlay">
        <div className="modal-card scard-dark p-9" style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}>
          <div className="eyebrow eyebrow-cream mb-3">Unlock Stage 4 · Arrival Orientation</div>
          <h2 className="display text-3xl mb-3 text-cream">Continue your journey</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-6">First 72 hours. Airport handover, host family meeting, jet-lag protocol, the chief's blessing if a Day Name awaits you.</p>
          <div className="scard-warm p-5 mb-5" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '3px solid var(--brass)' }}>
            <div className="flex items-center justify-between mb-2"><div className="text-cream font-medium">Preparation tier</div><div className="display text-3xl text-brass-light">$67<span className="text-sm text-cream/60">/mo</span></div></div>
            <div className="text-xs text-cream/65 leading-relaxed">Cancel any time. Your progress is preserved. Most relatives stay subscribed for 3–6 months.</div>
          </div>
          <div className="space-y-2 mb-6 text-sm text-cream/85">
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 4 (4 modules)</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> All Stages 1–6 unlocked</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Amen AI unlimited</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Full Community Hubs participation</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Custodian Marketplace · book + pay</div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">Pay $67 / month</button>
            <a href="#" className="btn-ghost-dark">Maybe later</a>
          </div>
          <div className="text-xs text-cream/50 mt-5 text-center">Secure checkout via Stripe · Paystack also accepted in NGN, ZAR, GHS</div>
        </div>
      </div>

      {/* Stage 5 Modal */}
      <div id="modal-stage5" className="modal-overlay">
        <div className="modal-card scard-dark p-9" style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}>
          <div className="eyebrow eyebrow-cream mb-3">Unlock Stage 5 · Heritage Journey</div>
          <h2 className="display text-3xl mb-3 text-cream">Continue your journey</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-6">The deepest part. Cape Coast Castle. The Door of No Return. Real-time emotional support via Amen AI on WhatsApp throughout your in-country experience.</p>
          <div className="scard-warm p-5 mb-5" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '3px solid var(--brass)' }}>
            <div className="flex items-center justify-between mb-2"><div className="text-cream font-medium">Preparation tier</div><div className="display text-3xl text-brass-light">$67<span className="text-sm text-cream/60">/mo</span></div></div>
            <div className="text-xs text-cream/65 leading-relaxed">Cancel any time. Your progress is preserved. Most relatives stay subscribed for 3–6 months.</div>
          </div>
          <div className="space-y-2 mb-6 text-sm text-cream/85">
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 5 (7 modules)</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> All Stages 1–6 unlocked</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Amen AI unlimited</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Full Community Hubs participation</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Custodian Marketplace · book + pay</div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">Pay $67 / month</button>
            <a href="#" className="btn-ghost-dark">Maybe later</a>
          </div>
          <div className="text-xs text-cream/50 mt-5 text-center">Secure checkout via Stripe · Paystack also accepted in NGN, ZAR, GHS</div>
        </div>
      </div>

      {/* Stage 6 Modal */}
      <div id="modal-stage6" className="modal-overlay">
        <div className="modal-card scard-dark p-9" style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}>
          <div className="eyebrow eyebrow-cream mb-3">Unlock Stage 6 · Post-Journey Integration</div>
          <h2 className="display text-3xl mb-3 text-cream">Continue your journey</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-6">Re-entry is its own journey. The Love Hub community, debrief sessions, the question of whether — and how — you carry Africa home with you.</p>
          <div className="scard-warm p-5 mb-5" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '3px solid var(--brass)' }}>
            <div className="flex items-center justify-between mb-2"><div className="text-cream font-medium">Preparation tier</div><div className="display text-3xl text-brass-light">$67<span className="text-sm text-cream/60">/mo</span></div></div>
            <div className="text-xs text-cream/65 leading-relaxed">Cancel any time. Your progress is preserved. Most relatives stay subscribed for 3–6 months.</div>
          </div>
          <div className="space-y-2 mb-6 text-sm text-cream/85">
            <div className="flex gap-2"><span className="text-brass">✓</span> Stage 6 (5 modules)</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> All Stages 1–6 unlocked</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Amen AI unlimited</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Full Community Hubs participation</div>
            <div className="flex gap-2"><span className="text-brass">✓</span> Custodian Marketplace · book + pay</div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">Pay $67 / month</button>
            <a href="#" className="btn-ghost-dark">Maybe later</a>
          </div>
          <div className="text-xs text-cream/50 mt-5 text-center">Secure checkout via Stripe · Paystack also accepted in NGN, ZAR, GHS</div>
        </div>
      </div>
    </div>
  );
}

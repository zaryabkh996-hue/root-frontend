'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Custodian {
  id: string;
  name: string;
  location: string;
  country: string;
  years: number;
  specialty: string;
  avatar: string;
  avatarClass: string;
  gradientBg: string;
  availability: 'Available' | 'Booked';
  availabilityText: string;
  availabilityStyle: 'tag-emerald' | 'tag-rose';
  description: string;
  tags: { label: string; color: 'brass' | 'dark' | 'terra' }[];
  verified: boolean;
  topCustodian?: boolean;
  priceFrom: number;
  shareText: string;
}

const CUSTODIANS: Custodian[] = [
  {
    id: 'akosua',
    name: 'Akosua O.',
    location: 'Accra',
    country: 'Ghana',
    years: 12,
    specialty: 'Heritage sites',
    avatar: 'A',
    avatarClass: 'avatar-photo',
    gradientBg: 'linear-gradient(160deg,#3a1f0a 0%,#1a0f05 40%,#5c3a1a 100%)',
    availability: 'Available',
    availabilityText: 'Available',
    availabilityStyle: 'tag-emerald',
    description: 'Heritage educator. Cape Coast & Elmina specialist. 200+ diaspora relatives guided through the Door of No Return.',
    tags: [
      { label: 'Heritage sites', color: 'brass' },
      { label: 'Twi · Fante', color: 'dark' },
    ],
    verified: true,
    priceFrom: 80,
    shareText: "Heritage sites · Cape Coast specialist",
  },
  {
    id: 'kwame',
    name: 'Kwame B.',
    location: 'Kumasi',
    country: 'Ghana',
    years: 8,
    specialty: 'Naming ceremony',
    avatar: 'K',
    avatarClass: 'avatar-photo-2',
    gradientBg: 'linear-gradient(160deg,#2a1f0a 0%,#1a1205 40%,#4a3a15 100%)',
    availability: 'Available',
    availabilityText: 'Available',
    availabilityStyle: 'tag-emerald',
    description: 'Ashanti cultural protocol. Naming ceremonies, traditional courts. Trauma-informed with grief-counselling background.',
    tags: [
      { label: 'Naming ceremony', color: 'brass' },
      { label: 'Twi', color: 'dark' },
    ],
    verified: true,
    priceFrom: 95,
    shareText: "Naming ceremony · Ashanti protocol",
  },
  {
    id: 'nia',
    name: 'Nia M.',
    location: 'Lagos',
    country: 'Nigeria',
    years: 6,
    specialty: 'Genealogy',
    avatar: 'N',
    avatarClass: 'avatar-photo-3',
    gradientBg: 'linear-gradient(160deg,#0a1e0f 0%,#051008 40%,#1a3a1f 100%)',
    availability: 'Booked',
    availabilityText: 'Booked through May',
    availabilityStyle: 'tag-rose',
    description: 'Yoruba family-history researcher. DNA-to-village mapping for diaspora seeking genealogical roots.',
    tags: [
      { label: 'Genealogy', color: 'terra' },
      { label: 'Yoruba · Igbo', color: 'dark' },
    ],
    verified: true,
    priceFrom: 120,
    shareText: "Genealogy · DNA-to-village mapping",
  },
  {
    id: 'efua',
    name: 'Mama Efua.',
    location: 'Cape Coast',
    country: 'Ghana',
    years: 15,
    specialty: 'Heritage sites',
    avatar: 'M',
    avatarClass: 'avatar-photo-4',
    gradientBg: 'linear-gradient(160deg,#3a1a0a 0%,#1a0a05 40%,#5c2a15 100%)',
    availability: 'Available',
    availabilityText: 'Available',
    availabilityStyle: 'tag-emerald',
    description: 'Cultural advisor & ritual facilitator. Specialises in pre-castle emotional preparation and post-castle integration.',
    tags: [
      { label: 'Heritage sites', color: 'brass' },
      { label: 'Spiritual', color: 'dark' },
    ],
    verified: true,
    topCustodian: true,
    priceFrom: 110,
    shareText: "Heritage sites · Ritual facilitation",
  },
  {
    id: 'solomon',
    name: 'Solomon W.',
    location: 'Addis Ababa',
    country: 'Ethiopia',
    years: 9,
    specialty: 'Heritage sites',
    avatar: 'S',
    avatarClass: 'avatar-photo',
    gradientBg: 'linear-gradient(160deg,#1a0f2a 0%,#0a0515 40%,#2a1a40 100%)',
    availability: 'Available',
    availabilityText: 'Available',
    availabilityStyle: 'tag-emerald',
    description: 'Ethiopian Orthodox heritage. Lalibela rock churches, Axum, Rastafari connection for Caribbean diaspora.',
    tags: [
      { label: 'Heritage sites', color: 'brass' },
      { label: 'Amharic', color: 'dark' },
    ],
    verified: true,
    priceFrom: 90,
    shareText: "Heritage sites · Ethiopian Orthodox",
  },
  {
    id: 'fatou',
    name: 'Fatou D.',
    location: 'Dakar',
    country: 'Senegal',
    years: 7,
    specialty: 'Heritage sites',
    avatar: 'F',
    avatarClass: 'avatar-photo-6',
    gradientBg: 'linear-gradient(160deg,#0a2a1a 0%,#051510 40%,#1a4a2f 100%)',
    availability: 'Available',
    availabilityText: 'Available',
    availabilityStyle: 'tag-emerald',
    description: 'Senegambian Wolof scholar. Gorée Island specialist. Bridges French-speaking diaspora and Anglophone returnees.',
    tags: [
      { label: 'Heritage sites', color: 'brass' },
      { label: 'Wolof · French', color: 'dark' },
    ],
    verified: true,
    priceFrom: 85,
    shareText: "Heritage sites · Gorée Island",
  },
];

const SPECIALTIES = [
  { label: 'Heritage sites', count: 18 },
  { label: 'Naming ceremony', count: 9 },
  { label: 'Genealogy', count: 12 },
  { label: 'Language', count: 14 },
  { label: 'Spiritual practice', count: 7 },
];

const COUNTRIES = ['Ghana', 'Nigeria', 'Ethiopia', 'Senegal'];
const LANGUAGES = ['Twi', 'Fante', 'Yoruba', 'Igbo', 'Amharic', 'Wolof', 'French'];

export default function CustodiansPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All countries');
  const [selectedLanguage, setSelectedLanguage] = useState('All languages');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);

  const filteredCustodians = useMemo(() => {
    return CUSTODIANS.filter(c => {
      const matchesSearch = searchTerm === '' || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === 'All countries' || c.country === selectedCountry;
      
      const matchesLanguage = selectedLanguage === 'All languages' || 
        c.tags.some(tag => tag.label.includes(selectedLanguage));
      
      const matchesSpecialty = selectedSpecialty === 'All specialties' || 
        c.specialty === selectedSpecialty;
      
      return matchesSearch && matchesCountry && matchesLanguage && matchesSpecialty;
    });
  }, [searchTerm, selectedCountry, selectedLanguage, selectedSpecialty]);

  const handleShare = (name: string, specialty: string, price: number) => {
    const text = `Check out ${name} on OurRoots.Africa - ${specialty}`;
    if (navigator.share) {
      navigator.share({ title: 'OurRoots.Africa', text });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  const handleBooking = (name: string) => {
    router.push(`/custodians/${name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleWaitlist = (name: string) => {
    alert(`Added to waitlist · ${name} will be notified`);
  };

  return (
    <>
     

      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow eyebrow-cream mb-3">Cultural Custodians · 47 vetted across 5 countries</div>
        <h1 className="display text-5xl font-light leading-tight mb-3">The human bridge to home.</h1>
        <p className="text-cream/70 max-w-3xl">
          Every Custodian is interviewed, background-checked, and onboarded by us before they appear here. Book a free 15-minute introduction directly. Continued sessions transact through the platform — no off-platform payments allowed, ever.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          className="field-dark flex-1 min-w-[260px]"
          placeholder="Search by name or specialty…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="relative">
          <button
            className="btn-ghost-dark"
            onClick={() => setCountryOpen(!countryOpen)}
          >
            {selectedCountry} ▾
          </button>
          {countryOpen && (
            <div className="absolute top-full mt-1 bg-forest-deep border border-brass/20 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                onClick={() => { setSelectedCountry('All countries'); setCountryOpen(false); }}
              >
                All countries
              </button>
              {COUNTRIES.map(country => (
                <button
                  key={country}
                  className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                  onClick={() => { setSelectedCountry(country); setCountryOpen(false); }}
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="btn-ghost-dark"
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            {selectedLanguage} ▾
          </button>
          {languageOpen && (
            <div className="absolute top-full mt-1 bg-forest-deep border border-brass/20 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                onClick={() => { setSelectedLanguage('All languages'); setLanguageOpen(false); }}
              >
                All languages
              </button>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                  onClick={() => { setSelectedLanguage(lang); setLanguageOpen(false); }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="btn-ghost-dark"
            onClick={() => setSpecialtyOpen(!specialtyOpen)}
          >
            {selectedSpecialty} ▾
          </button>
          {specialtyOpen && (
            <div className="absolute top-full mt-1 bg-forest-deep border border-brass/20 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                onClick={() => { setSelectedSpecialty('All specialties'); setSpecialtyOpen(false); }}
              >
                All specialties
              </button>
              {SPECIALTIES.map(spec => (
                <button
                  key={spec.label}
                  className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                  onClick={() => { setSelectedSpecialty(spec.label); setSpecialtyOpen(false); }}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SPECIALTIES.map(spec => (
          <span
            key={spec.label}
            className={`tag ${spec.label === (selectedSpecialty === 'All specialties' ? '' : selectedSpecialty) ? 'tag-brass' : 'tag-dark'} cursor-pointer`}
            onClick={() => setSelectedSpecialty(spec.label === (selectedSpecialty === 'All specialties' ? '' : selectedSpecialty) ? 'All specialties' : spec.label)}
          >
            {spec.label} · {spec.count}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustodians.map(custodian => (
          <div
            key={custodian.id}
            className="scard-dark cursor-pointer hover:border-brass/40 transition"
            style={{ overflow: 'hidden', padding: 0 }}
            onClick={() => handleBooking(custodian.name)}
          >
            {/* Photo Section */}
            <div
              style={{
                aspectRatio: '4/3',
                background: custodian.gradientBg,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top,rgba(10,24,16,0.9) 0%,transparent 55%)',
                }}
              />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className={`avatar avatar-lg ${custodian.avatarClass}`}
                  style={{
                    width: '52px',
                    height: '52px',
                    fontSize: '19px',
                    border: '2px solid rgba(201,161,74,0.4)',
                  }}
                >
                  {custodian.avatar}
                </div>
                <div>
                  <div className="display text-xl text-cream" style={{ lineHeight: 1.2 }}>
                    {custodian.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono',monospace",
                      color: 'rgba(243,237,224,0.55)',
                      marginTop: '2px',
                    }}
                  >
                    {custodian.location} · {custodian.country} · {custodian.years} yrs
                  </div>
                </div>
              </div>
              <span
                className={`tag ${custodian.availabilityStyle}`}
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                {custodian.availabilityText}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(custodian.name, custodian.shareText, custodian.priceFrom);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(10,24,16,0.7)',
                  border: '1px solid rgba(201,161,74,0.2)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(201,161,74,0.8)" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>

            {/* Content Section */}
            <div style={{ padding: '16px' }}>
              <p className="text-sm text-cream/70 leading-relaxed mb-4">{custodian.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {custodian.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`tag tag-${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))}
                {custodian.topCustodian && (
                  <span
                    className="tag tag-dark"
                    style={{
                      fontSize: '9px',
                      background: 'rgba(201,161,74,0.15)',
                      color: 'var(--brass-light)',
                      borderColor: 'rgba(201,161,74,0.3)',
                    }}
                  >
                    ⭐ Top Custodian
                  </span>
                )}
                {custodian.verified && !custodian.topCustodian && (
                  <span
                    className="tag tag-dark"
                    style={{
                      fontSize: '9px',
                      background: 'rgba(31,90,61,0.2)',
                      color: 'rgba(243,237,224,0.6)',
                      borderColor: 'rgba(31,90,61,0.3)',
                    }}
                  >
                    ✓ OurRoots Verified
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-brass/15">
                <div className="text-xs text-cream/50">
                  From <strong className="text-cream">${custodian.priceFrom}</strong>/session
                </div>
                <button
                  className={custodian.availability === 'Available' ? 'btn-primary text-xs' : 'btn-ghost-dark text-xs'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (custodian.availability === 'Available') {
                      handleBooking(custodian.name);
                    } else {
                      handleWaitlist(custodian.name);
                    }
                  }}
                >
                  {custodian.availability === 'Available'
                    ? 'Book free intro →'
                    : 'Join waitlist →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      
    </>
  );
}

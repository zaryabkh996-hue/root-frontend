'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface Custodian {
  id: number;
  name: string;
  location: string;
  country: string;
  years_experience: number;
  specialty: string;
  avatar_initials: string;
  avatar_class: string;
  gradient_bg: string;
  availability: 'Available' | 'Booked';
  availability_text: string;
  description: string;
  tags: string[] | object[];
  verified: boolean;
  top_custodian?: boolean;
  price_from: number;
  share_text: string;
}

export default function CustodiansPage() {
  const router = useRouter();
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All countries');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [countryOpen, setCountryOpen] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch custodians from backend
  useEffect(() => {
    const fetchCustodians = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const response = await fetch(
          `${backendUrl}/api/custodians?page=1&limit=100&country=${selectedCountry === 'All countries' ? '' : selectedCountry}&specialty=${selectedSpecialty === 'All specialties' ? '' : selectedSpecialty}&search=${searchTerm}`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        console.log('Fetch custodians response:', response);
        if (!response.ok) {
          throw new Error('Failed to fetch custodians');
        }

        const data = await response.json();
        setCustodians(data.custodians || []);
        setTotalCount(data.total || 0);

        // Extract unique countries and specialties
        const uniqueCountries = [...new Set(data.custodians.map((c: Custodian) => c.country))].sort();
        const uniqueSpecialties = [...new Set(data.custodians.map((c: Custodian) => c.specialty))].sort();

        setCountries(uniqueCountries as string[]);
        setSpecialties(uniqueSpecialties as string[]);
      } catch (error) {
        console.error('Error fetching custodians:', error);
        setCustodians([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustodians();
  }, [selectedCountry, selectedSpecialty, searchTerm]);

  const filteredCustodians = useMemo(() => {
    return custodians.filter((c) => {
      const matchesSearch =
        searchTerm === '' ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [custodians, searchTerm]);

  const handleShare = (name: string, specialty: string) => {
    const text = `Check out ${name} on OurRoots.Africa - ${specialty}`;
    if (navigator.share) {
      navigator.share({ title: 'OurRoots.Africa', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleBooking = (id: number) => {
    router.push(`/custodians/${id}`);
  };

  const handleWaitlist = (name: string) => {
    alert(`Added to waitlist · ${name} will be notified`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow eyebrow-cream mb-3">Cultural Custodians · {totalCount} vetted</div>
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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={() => {
                  setSelectedCountry('All countries');
                  setCountryOpen(false);
                }}
              >
                All countries
              </button>
              {countries.map((country) => (
                <button
                  key={country}
                  className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                  onClick={() => {
                    setSelectedCountry(country);
                    setCountryOpen(false);
                  }}
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
            onClick={() => setSpecialtyOpen(!specialtyOpen)}
          >
            {selectedSpecialty} ▾
          </button>
          {specialtyOpen && (
            <div className="absolute top-full mt-1 bg-forest-deep border border-brass/20 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                onClick={() => {
                  setSelectedSpecialty('All specialties');
                  setSpecialtyOpen(false);
                }}
              >
                All specialties
              </button>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  className="block w-full text-left px-4 py-2 hover:bg-brass/10"
                  onClick={() => {
                    setSelectedSpecialty(specialty);
                    setSpecialtyOpen(false);
                  }}
                >
                  {specialty}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Specialty Tags */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {specialties.map((spec) => (
            <span
              key={spec}
              className={`tag ${spec === selectedSpecialty ? 'tag-brass' : 'tag-dark'} cursor-pointer`}
              onClick={() =>
                setSelectedSpecialty(spec === selectedSpecialty ? 'All specialties' : spec)
              }
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(201,161,74,0.2)',
              borderTop: '3px solid #c9a14a',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading custodians...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : filteredCustodians.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(243,237,224,0.6)' }}>No custodians found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustodians.map((custodian) => (

            <div
              key={custodian.id}
              className="scard-dark cursor-pointer hover:border-brass/40 transition"
              style={{ overflow: 'hidden', padding: 0 }}
              onClick={() => handleBooking(custodian.id)}
            >
              {/* Photo Section */}
              <div
                style={{
                  aspectRatio: '4/3',
                  background: custodian.gradient_bg || 'linear-gradient(160deg,#3a1f0a 0%,#1a0f05 40%,#5c3a1a 100%)',
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
                    className={`avatar avatar-lg ${custodian.avatar_class}`}
                    style={{
                      width: '52px',
                      height: '52px',
                      fontSize: '19px',
                      border: '2px solid rgba(201,161,74,0.4)',
                    }}
                  >
                    {custodian.avatar_initials}
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
                      {custodian.location} · {custodian.country} · {custodian.years_experience} yrs
                    </div>
                  </div>
                </div>
                <span
                  className={`tag ${custodian.availability === 'Available' ? 'tag-emerald' : 'tag-rose'}`}
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                >
                  {custodian.availability_text}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(custodian.name, custodian.share_text || custodian.specialty);
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
                  {Array.isArray(custodian.tags) &&
                    custodian.tags.length > 0 &&
                    custodian.tags.map((tag: any, idx: number) => (
                      <span
                        key={idx}
                        className={`tag ${typeof tag === 'string'
                            ? 'tag-brass'
                            : tag.color === 'terra'
                              ? 'tag-terra'
                              : tag.color === 'brass'
                                ? 'tag-brass'
                                : 'tag-dark'
                          }`}
                      >
                        {typeof tag === 'string' ? tag : tag.label}
                      </span>
                    ))}
                  {custodian.top_custodian && (
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
                  {custodian.verified && !custodian.top_custodian && (
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
                    From <strong className="text-cream">${custodian.price_from}</strong>/session
                  </div>
                  <button
                    className={custodian.availability === 'Available' ? 'btn-primary text-xs' : 'btn-ghost-dark text-xs'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (custodian.availability === 'Available') {
                        handleBooking(custodian.id);
                      } else {
                        handleWaitlist(custodian.name);
                      }
                    }}
                  >
                    {custodian.availability === 'Available' ? 'Book free intro →' : 'Join waitlist →'}
                  </button>
                </div>
              </div>
            </div>


          ))}
        </div>
      )}
    </>
  );
}

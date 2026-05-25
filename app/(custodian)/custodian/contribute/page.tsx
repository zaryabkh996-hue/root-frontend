'use client';

import { useState } from 'react';

export default function CustodianContribute() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ceremony');
  const [consents, setConsents] = useState<Record<string, boolean>>({ c1: false, c2: false, c3: false, c4: false });
  const [esig, setEsig] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'ceremony', emoji: '🎭', label: 'Ceremony & Ritual' },
    { id: 'language', emoji: '🗣️', label: 'Proverbs & Language' },
    { id: 'food', emoji: '🍲', label: 'Food & Preparation' },
    { id: 'dress', emoji: '👗', label: 'Dress & Textiles' },
    { id: 'sites', emoji: '🏛️', label: 'Sacred Sites' },
    { id: 'music', emoji: '🎵', label: 'Music & Performance' },
  ];

  const allConsentsChecked = consents.c1 && consents.c2 && consents.c3 && consents.c4 && esig.trim().length > 0;

  const handleConsent = (key: string) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSubmitted(false);
    setConsents({ c1: false, c2: false, c3: false, c4: false });
    setEsig('');
  };

  if (submitted) {
    return (
      <>
        <div className="cust-eyebrow mb-2">Knowledge Bank</div>
        <h1 className="cust-page-title">Contribute Knowledge</h1>

        <div className="c-card c-card-pad" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2d6a4f', margin: '0 0 10px' }}>
            Submitted Successfully
          </h3>
          <p style={{ fontSize: '13px', color: '#6b6560', maxWidth: '360px', margin: '0 auto 24px' }}>
            Your submission is with the Knowledge Review Board. Once approved, Amen AI will attribute answers to you and citations will appear in your Earnings dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button style={{ background: '#c9a14a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              View Earnings →
            </button>
            <button onClick={handleReset} style={{ background: 'none', border: '1px solid #e8e3d9', padding: '10px 24px', borderRadius: '20px', fontSize: '13px', color: '#6b6560', cursor: 'pointer' }}>
              Submit Another
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cust-eyebrow mb-2">Knowledge Bank</div>
      <h1 className="cust-page-title">Contribute Knowledge</h1>
      <p style={{ fontSize: '13px', color: '#6b6560', margin: '-8px 0 28px' }}>
        Your verified cultural knowledge is embedded into Amen AI and attributed to you by name. You earn $0.35 per citation.
      </p>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '32px', background: '#f5f3ee', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8e3d9' }}>
        {[1, 2, 3, 4].map(step => (
          <div key={step} style={{ flex: 1 }}>
            <div
              onClick={() => setCurrentStep(step)}
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: step === currentStep ? '#ffffff' : 'transparent',
                borderBottom: step === currentStep ? '3px solid #c9a14a' : '3px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: step === currentStep ? '#8a6a1a' : '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Step {step}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: step === currentStep ? '#1a1a1a' : '#6b6560', marginTop: '4px' }}>
                {['Identity', 'Submission', 'Legal Consent', 'Review'][step - 1]}
              </div>
            </div>
            {step < 4 && <div style={{ width: '1px', background: '#e8e3d9', height: '100%' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Identity */}
      {currentStep === 1 && (
        <div className="c-card c-card-pad">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>Custodian Identity</h3>
          <p style={{ fontSize: '12px', color: '#8a7f72', margin: '0 0 22px' }}>
            Confirm your cultural authority for this knowledge. Your name appears as a citation in every Amen AI answer drawn from your submission.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Akosua Owusu-Ansah"
                readOnly
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#6b6560', background: '#f5f3ee', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Verified ID (Smile ID)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  defaultValue="GHA-NID-****7842"
                  readOnly
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#6b6560', background: '#f5f3ee', boxSizing: 'border-box' }}
                />
                <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Ethnic/Cultural Group
              </label>
              <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', background: '#fff', boxSizing: 'border-box' }}>
                <option>Akan (Asante)</option>
                <option>Akan (Fante)</option>
                <option>Ewe</option>
                <option>Ga-Adangbe</option>
                <option>Dagomba</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Region / Country
              </label>
              <input
                type="text"
                defaultValue="Ashanti Region, Ghana"
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Your role / authority for this knowledge
            </label>
            <input
              type="text"
              defaultValue="Master kente weaver · Bonwire Kente Village · 22 yrs"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ background: 'rgba(201,161,74,0.08)', border: '1px solid rgba(201,161,74,0.2)', borderRadius: '6px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '10px', fontSize: '12px', color: '#6b6560' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>Your identity is verified once via Smile ID (99.8% accuracy across African skin tones). Pre-filled from your Custodian Profile.</span>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button onClick={() => setCurrentStep(2)} style={{ background: '#c9a14a', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Next: Submission →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Submission */}
      {currentStep === 2 && (
        <div className="c-card c-card-pad">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>Knowledge Submission</h3>
          <p style={{ fontSize: '12px', color: '#8a7f72', margin: '0 0 22px' }}>
            What cultural knowledge are you sharing? Be specific — precise, contextual knowledge earns more citations.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Knowledge Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '12px',
                    border: selectedCategory === cat.id ? '2px solid #c9a14a' : '2px solid #e8e3d9',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: selectedCategory === cat.id ? '#fdf8ee' : '#fff',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{cat.emoji}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: selectedCategory === cat.id ? '#8a6a1a' : '#6b6560' }}>
                    {cat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Title of this submission
            </label>
            <input
              type="text"
              placeholder="e.g. Akan Funeral Cloth — Reading Adinkra Symbols"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Detailed description
            </label>
            <textarea
              rows={5}
              placeholder="Share your knowledge here. Include context, who it applies to, when/where it is used, and what diaspora visitors should know..."
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Upload media (optional but encouraged)
            </label>
            <div
              style={{
                border: '2px dashed #c9a14a',
                borderRadius: '8px',
                padding: '28px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#fdf8ee',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a14a" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Drop video, audio, or images here</div>
              <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '4px' }}>MP4, MOV, MP3, WAV, JPG, PNG · Max 500MB</div>
              <div style={{ fontSize: '11px', color: '#c9a14a', marginTop: '6px' }}>Audio & video auto-transcribed by Whisper AI</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '24px' }}>
            <button onClick={() => setCurrentStep(1)} style={{ background: 'none', border: '1px solid #e8e3d9', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', color: '#6b6560', cursor: 'pointer' }}>
              ← Back
            </button>
            <button onClick={() => setCurrentStep(3)} style={{ background: '#c9a14a', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Next: Legal Consent →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Legal Consent */}
      {currentStep === 3 && (
        <div className="c-card c-card-pad">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>Prior Informed Consent</h3>
          <p style={{ fontSize: '12px', color: '#8a7f72', margin: '0 0 22px' }}>
            Required under Kenya Traditional Knowledge Act 2016 and OurRoots.Africa IP policy. Auto-generates a signed PDF legal record.
          </p>

          <div style={{ background: '#fdf8ee', border: '1px solid rgba(201,161,74,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#8a6a1a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              OurRoots.Africa Cultural Knowledge Agreement
            </div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.7 }}>
              I, <strong>Akosua Owusu-Ansah</strong>, hereby grant OurRoots.Africa (3Men Pty Ltd) a non-exclusive, royalty-bearing licence to: (a) store my submitted cultural knowledge in the OurRoots Knowledge Bank (Pinecone vector database) and Sanity CMS; (b) use this knowledge to inform Amen AI responses, with my name attributed as source Custodian in every response; (c) receive micro-payments ($0.35 per verified AI citation) transferred monthly via M-Pesa, Paystack, or bank transfer. I confirm this knowledge originates from my cultural community and I hold authority to share it. I retain moral rights at all times and may request removal within 30 days.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consents.c1}
                onChange={() => handleConsent('c1')}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span>I confirm this knowledge comes from my own cultural community and I have authority to share it.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consents.c2}
                onChange={() => handleConsent('c2')}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span>I understand my full legal name and credentials will be attributed in every Amen AI response using my knowledge.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consents.c3}
                onChange={() => handleConsent('c3')}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span>I agree to the micro-payment model ($0.35/citation) and monthly payout schedule.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consents.c4}
                onChange={() => handleConsent('c4')}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span>I have read and agree to the OurRoots Cultural Knowledge Policy and Traditional Knowledge Act compliance terms.</span>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Electronic Signature
            </label>
            <input
              type="text"
              placeholder="Type your full name as your electronic signature"
              value={esig}
              onChange={e => setEsig(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e3d9', borderRadius: '5px', fontSize: '14px', color: '#1a1a1a', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '4px' }}>A signed PDF is generated automatically and emailed to you on submission.</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '24px' }}>
            <button onClick={() => setCurrentStep(2)} style={{ background: 'none', border: '1px solid #e8e3d9', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', color: '#6b6560', cursor: 'pointer' }}>
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!allConsentsChecked}
              style={{
                background: allConsentsChecked ? '#c9a14a' : '#ccc',
                color: '#fff',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: allConsentsChecked ? 'pointer' : 'not-allowed',
              }}
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review */}
      {currentStep === 4 && (
        <div className="c-card c-card-pad">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>Review & Submit</h3>
          <p style={{ fontSize: '12px', color: '#8a7f72', margin: '0 0 22px' }}>
            Your submission goes to the OurRoots Knowledge Review Board. 5 validators must approve before it enters Amen AI. Estimated review: 3–7 days.
          </p>

          <div style={{ background: '#f5f3ee', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <span style={{ color: '#8a7f72' }}>Custodian</span>
              <span style={{ fontWeight: 600 }}>Akosua Owusu-Ansah · Akan (Asante)</span>
              <span style={{ color: '#8a7f72' }}>Category</span>
              <span style={{ fontWeight: 600 }}>{categories.find(c => c.id === selectedCategory)?.label}</span>
              <span style={{ color: '#8a7f72' }}>Title</span>
              <span style={{ fontWeight: 600 }}>Akan Funeral Cloth — Reading Adinkra Symbols</span>
              <span style={{ color: '#8a7f72' }}>Media</span>
              <span>Video · 12 min · auto-transcribed ✓</span>
              <span style={{ color: '#8a7f72' }}>Consent</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Signed · PDF ready</span>
              <span style={{ color: '#8a7f72' }}>Payout</span>
              <span>$0.35/citation · M-Pesa monthly</span>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '10px', fontSize: '12px', color: '#14532d' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>After approval, your knowledge enters Pinecone (vector database) and Amen AI begins citing you within 24 hours.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '24px' }}>
            <button onClick={() => setCurrentStep(3)} style={{ background: 'none', border: '1px solid #e8e3d9', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', color: '#6b6560', cursor: 'pointer' }}>
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Submit to Knowledge Bank ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}

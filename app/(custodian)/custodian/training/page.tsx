'use client';

import { useState } from 'react';

export default function CustodianTraining() {
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [scenarioAnswers, setScenarioAnswers] = useState({});

  const toggleModule = (moduleNum: number) => {
    setExpandedModule(expandedModule === moduleNum ? null : moduleNum);
  };

  const handleScenarioAnswer = (scenario: string, isCorrect: boolean, feedback: string) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenario]: { isCorrect, feedback }
    }));
  };

  const handleMicClick = () => {
    console.log('Voice input started');
  };

  return (
    <>
      <div className="cust-eyebrow">Afrofeast Certification</div>
      <h1 className="cust-page-title">Heritage Training Programme</h1>

      {/* WhatsApp Channel Banner */}
      <div style={{ background: '#1b2e20', borderRadius: '8px', padding: '18px 22px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.41 1.26 4.84L2 22l5.31-1.23A10 10 0 1012 2zm0 18.16a8.12 8.12 0 01-4.14-1.14l-.3-.18-3.13.82.84-3.04-.2-.31A8.13 8.13 0 013.84 12c0-4.51 3.67-8.18 8.16-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.51-3.67 8.16-8.16 8.16z" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0ebe0' }}>
              Complete this training on WhatsApp — no data, no laptop needed
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(243,237,224,0.65)', lineHeight: '1.6' }}>
            Text <strong style={{ color: '#c9a14a' }}>START TRAINING</strong> to <strong style={{ color: '#c9a14a' }}>+233 XX XXX XXXX</strong> to begin. Each module arrives as a WhatsApp message. Answer the quiz to unlock the next one. Available in Twi, Fante, Ga, Amharic, Wolof, and French via AfriqueLLM.
          </div>
        </div>
        <button style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '5px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
          💬 Start on WhatsApp
        </button>
      </div>

      {/* Progress Section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ fontSize: '14px', color: '#6b6560', flex: 1 }}>
            Six modules · approximately 2 hours total · voice-first · card-based. Complete here or on WhatsApp — your progress syncs automatically.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="c-listen-btn">🔊 Twi</button>
            <button className="c-listen-btn">🔊 English</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>5 of 6 modules complete</div>
          <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#c9a14a', background: 'rgba(201,161,74,0.1)', border: '1px solid rgba(201,161,74,0.25)', padding: '3px 8px', borderRadius: '3px' }}>
            83% · Afrofeast Certification pending
          </div>
        </div>
        <div className="c-progress-track" style={{ marginBottom: '28px' }}>
          <div className="c-progress-fill" style={{ width: '83%' }}></div>
        </div>
      </div>

      {/* Module 1 */}
      <TrainingModule
        number={1}
        title="The Bridge, Not the Vendor"
        subtitle="Mindset + persona puzzle · 20 min · Completed 4 May"
        status="🌅 Ready"
        isExpanded={expandedModule === 1}
        onToggle={() => toggleModule(1)}
        proverb={`"Ɔhɔhoɔ ani akɛseɛ nanso ɔnhunu hwee."`}
        proverbs_en={`"The stranger has big eyes, but sees nothing." — Your role is to give sight to those eyes.`}
        language="Akan (Twi)"
      >
        <ConceptCard title="Meet Amara">
          <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
            <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 1/6</div>
            Meet Amara. She is 38, from Atlanta. She has saved for 3 years for this trip.<br /><br />
            She is not here for a vacation. 🌍<br />
            She is here for a <strong style={{ color: '#c9a14a' }}>pilgrimage</strong>.<br /><br />
            She is terrified she won't be accepted.<br />
            She is terrified of being treated like a "walking ATM." 💸<br /><br />
            Your job: You are not her vendor.<br />
            <strong style={{ color: '#25D366' }}>You are her bridge home. 🌉</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#6b6560', lineHeight: '1.6' }}>
            Amara represents the four diaspora personas OurRoots has identified: the Heritage Seeker, the Cultural Explorer, the Curious Traveller, and the Social Connector. Each needs a different approach — but all need to feel they belong.
          </div>
        </ConceptCard>

        <PuzzleCard title="Match the 4 Personas">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { label: 'Heritage Seeker', desc: '→ Ancestral grief, identity longing' },
              { label: 'Cultural Explorer', desc: '→ Intellectual curiosity, mastery' },
              { label: 'Curious Traveller', desc: '→ Practical comfort, confidence' },
              { label: 'Social Connector', desc: '→ Community, shared memory' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '4px', padding: '8px', fontSize: '12px' }}>
                <strong style={{ color: '#14532d' }}>{item.label}</strong> {item.desc}
              </div>
            ))}
          </div>
        </PuzzleCard>

        <SelfAssessmentButtons />
      </TrainingModule>

      {/* Module 2 */}
      <TrainingModule
        number={2}
        title="What OurRoots Already Taught Her"
        subtitle="Platform journey map + voice quiz · 15 min · Completed 5 May"
        status="🌿 Growing"
        isExpanded={expandedModule === 2}
        onToggle={() => toggleModule(2)}
        proverb={`"Nyansa nni onipa baako tirim."`}
        proverbs_en={`"Wisdom is not in the head of one person." — Amara prepared for 90 days. Meet her where she is.`}
        language="Akan (Twi)"
      >
        <ConceptCard title="She is prepared, not clueless">
          <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
            <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 2/6</div>
            Before Amara meets you, she spent 90 days on OurRoots. 📱<br /><br />
            ✓ She knows the right-hand rule<br />
            ✓ She knows Akan funeral colours<br />
            ✓ She has listened to stories about Cape Coast<br />
            ✓ She knows basic Twi greetings<br /><br />
            Do not treat her like she knows nothing.<br />
            <strong style={{ color: '#25D366' }}>Partner with her to practice what she learned.</strong>
          </div>
        </ConceptCard>

        <DoNot title="Gentle correction">
          {[
            { section: '❌ NEVER', items: ['Correct Amara in front of a crowd', 'Make her feel embarrassed for not knowing', 'Repeat the correction after she tries'] },
            { section: '✅ ALWAYS', items: ['Whisper corrections privately', 'Frame it as a secret between you', 'Celebrate when she gets it right'] }
          ].map((col, idx) => (
            <div key={idx} style={{ background: idx === 0 ? '#fff5f5' : '#f0fdf4', border: `1px solid ${idx === 0 ? '#fca5a5' : '#86efac'}`, borderRadius: '4px', padding: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: idx === 0 ? '#7f1d1d' : '#14532d', marginBottom: '6px' }}>
                {col.section}
              </div>
              <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>
                {col.items.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
          ))}
        </DoNot>

        <SelfAssessmentButtons />
      </TrainingModule>

      {/* Module 3 */}
      <TrainingModule
        number={3}
        title="The Sacred Silence — Cape Coast Protocol"
        subtitle="Trauma-informed scenarios · 20 min · Completed 5 May"
        status="🌅 Ready"
        isExpanded={expandedModule === 3}
        onToggle={() => toggleModule(3)}
        proverb={`"Nusu ne asuo a ɛde wo kɔ fie."`}
        proverbs_en={`"Tears are the river that takes you home." — Do not stop the river. Let it flow.`}
        language="Fante"
      >
        <ConceptCard title="Your Emotional First-Aid Kit">
          <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
            <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 3/6</div>
            Cape Coast Castle is the most intense day of Amara's life.<br /><br />
            Bring your Emotional First-Aid Kit:<br />
            💧 Water<br />
            🧻 Tissues<br />
            🤫 Silence (your most powerful tool)<br />
            ⏳ Time — Never, ever rush her
          </div>
          <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '4px', padding: '10px', fontSize: '13px', color: '#7f1d1d' }}>
            <strong>HARD RULE:</strong> Never say "Don't cry" or "It's okay." It is NOT okay. It is sacred. Your presence — without words — is the holding.
          </div>
        </ConceptCard>

        <SelfAssessmentButtons />
      </TrainingModule>

      {/* Module 4 */}
      <TrainingModule
        number={4}
        title="Radical Money Transparency"
        subtitle="Pricing quiz + platform rules · 15 min · Completed 6 May"
        status="🌿 Growing"
        isExpanded={expandedModule === 4}
        onToggle={() => toggleModule(4)}
        proverb={`"Din pa ye sen ahonya."`}
        proverbs_en={`"A good name is better than riches." — Your reputation travels further than any commission.`}
        language="Akan (Twi)"
      >
        <ConceptCard title='The "Walking ATM" fear'>
          <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
            <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 4/6</div>
            Diaspora visitors talk to each other. 💬<br />
            The #1 complaint about Ghana?<br /><br />
            <strong style={{ color: '#f87171' }}>"I felt like a walking ATM." 💸</strong><br /><br />
            If Amara feels scammed → she closes her heart.<br />
            If she trusts you → she tells 10 people. 📣<br /><br />
            Your transparency is your best marketing.
          </div>
        </ConceptCard>

        <SelfAssessmentButtons />
      </TrainingModule>

      {/* Module 5 */}
      <TrainingModule
        number={5}
        title="Crisis & Safety Protocols"
        subtitle="Crisis action card + safety scenario · 15 min · Completed 6 May"
        status="🌿 Growing"
        isExpanded={expandedModule === 5}
        onToggle={() => toggleModule(5)}
        proverb={`"When a person is falling, you don't wait to ask their name before catching them."`}
        proverbs_en={`"Act first. Assess later. Her safety is your only priority in a crisis."`}
        language="Universal West African"
      >
        <ConceptCard title="The 3 types of crisis">
          <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 5/6</div>
            1️⃣ <strong>Emotional:</strong> Panic attack or dissociation at a heritage site<br />
            2️⃣ <strong>Medical:</strong> Stomach illness (very common!), dehydration, fever<br />
            3️⃣ <strong>Safety:</strong> Aggressive vendor, unsafe transport, harassment
          </div>
        </ConceptCard>

        <SelfAssessmentButtons />
      </TrainingModule>

      {/* Module 6 - Certification */}
      <div className="t-card" style={{ borderColor: '#c9a14a', borderWidth: '2px' }}>
        <div
          className="t-card-head"
          onClick={() => toggleModule(6)}
          style={{ background: '#fffdf5', cursor: 'pointer' }}
        >
          <div className="t-step t-step-now">6</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
              Module 6 · Afrofeast Certification Assessment
            </div>
            <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#c9a14a', marginTop: '2px' }}>
              3 live voice scenarios · 10 min · Ready to begin
            </div>
          </div>
          <span className="a-badge-warn">Current</span>
        </div>
        {expandedModule === 6 && (
          <div className="t-card-body open" style={{ background: '#fffdf5' }}>
            <div style={{ background: 'linear-gradient(135deg,#1b2e20,#152618)', borderRadius: '6px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#c9a14a', marginBottom: '6px' }}>
                🏆 Upon completing this module:
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(243,237,224,0.8)', lineHeight: '1.7' }}>
                ✓ You receive the <strong style={{ color: '#c9a14a' }}>Afrofeast Certified Custodian</strong> badge on your OurRoots profile<br />
                ✓ A certificate image is sent to your WhatsApp to share on your Status<br />
                ✓ Clients can see your certification before they book you
              </div>
            </div>

            <button className="c-listen-btn" style={{ display: 'inline-flex', marginBottom: '16px' }}>
              🔊 Listen to instructions in Twi
            </button>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '18px' }}>
              Three voice scenarios — not a test with right or wrong answers. Your tone, patience, and cultural grounding are what matter. Respond by speaking or by tapping a choice.
            </p>

            {/* Scenario Cards */}
            {[
              {
                num: 1,
                prompt: '"Amara just said: I do not feel African enough to be here at Cape Coast. What do you say to her?"',
                options: [
                  { text: '"The land does not ask for a certificate of belonging. Your blood brought you here. That is enough."', correct: true },
                  { text: '"Don\'t say that — of course you are African. You came all this way!"', correct: false },
                  { text: '"Let me tell you some history about why all descendants belong here."', correct: false }
                ]
              },
              {
                num: 2,
                prompt: '"A client has been walking in complete silence for 20 minutes after leaving Cape Coast Castle. What do you do?"',
                options: [
                  { text: 'Begin explaining the history of the castle to give context.', correct: false },
                  { text: 'Ask "Are you okay?" to check in.', correct: false },
                  { text: 'Walk alongside her in silence. She will speak when she is ready.', correct: true }
                ]
              },
              {
                num: 3,
                prompt: '"At the end of the session, a client asks for your personal WhatsApp to contact you directly for future trips. What do you say?"',
                options: [
                  { text: 'Share your number — the session was meaningful and you want to stay connected.', correct: false },
                  { text: '"I would love to work with you again. Book me through OurRoots — it protects us both."', correct: true },
                  { text: 'Ignore the request and change the subject.', correct: false }
                ]
              }
            ].map(scenario => (
              <CertificationScenario
                key={scenario.num}
                scenario={scenario}
                onAnswer={(isCorrect, feedback) => handleScenarioAnswer(`s${scenario.num}`, isCorrect, feedback)}
              />
            ))}

            {/* Final Assessment */}
            <div style={{ background: '#fafaf8', border: '1px solid #e8e3d9', borderRadius: '6px', padding: '18px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                One last question — how do you feel about your readiness?
              </div>
              <div style={{ fontSize: '12px', color: '#8a7f72', marginBottom: '14px' }}>
                This is your reflection — not a grade. Honest answers help OurRoots support you better.
              </div>
              <SelfAssessmentButtons />
            </div>

            <button className="c-btn-primary">Submit and earn Afrofeast Certification →</button>
          </div>
        )}
      </div>
    </>
  );
}

// Helper Components
function TrainingModule({
  number,
  title,
  subtitle,
  status,
  isExpanded,
  onToggle,
  proverb,
  proverbs_en,
  language,
  children
}: any) {
  const statusIcon = { '🌅 Ready': '🌅', '🌿 Growing': '🌿' };
  const stepClass = number < 6 ? 't-step-done' : 't-step-now';
  const stepContent = number < 6 ? '✓' : number.toString();

  return (
    <div className="t-card" style={{ marginBottom: '12px' }}>
      <div className="t-card-head" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className={`t-step ${stepClass}`}>{stepContent}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{title}</div>
          <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', marginTop: '2px' }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="a-badge-gray">{status}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a7f72" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="t-card-body">
          <div style={{ background: 'linear-gradient(135deg,#f5f3ee,#ede8df)', borderLeft: '3px solid #c9a14a', padding: '12px 16px', borderRadius: '0 5px 5px 0', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Proverb anchor · {language}
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#1a1a1a', marginBottom: '4px' }}>
              {proverb}
            </div>
            <div style={{ fontSize: '12px', color: '#6b6560' }}>{proverbs_en}</div>
            <button className="c-listen-btn" style={{ marginTop: '8px', display: 'inline-flex' }}>
              🔊 Listen in {language.split('(')[1]?.replace(')', '') || language}
            </button>
          </div>

          {children}
        </div>
      )}
    </div>
  );
}

function ConceptCard({ title, children }: any) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ background: '#e0f2fe', color: '#075985', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
          CONCEPT
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function PuzzleCard({ title, children }: any) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ background: '#f5f3ee', color: '#8a7f72', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
          PUZZLE ✓
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function DoNot({ title, children }: any) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ background: '#fef3c7', color: '#78350f', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
          DO / DON'T
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SelfAssessmentButtons() {
  return (
    <div style={{ background: '#fffdf5', border: '1.5px solid #e8e3d9', borderRadius: '6px', padding: '16px', marginTop: '16px' }}>
      <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        How do you feel after this module?
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { emoji: '🌅', label: 'Ready' },
          { emoji: '🌿', label: 'Growing' },
          { emoji: '🤝', label: 'Need support' }
        ].map((item, idx) => (
          <button
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 14px',
              borderRadius: '5px',
              border: '1.5px solid #e8e3d9',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '80px',
              transition: 'all 0.15s'
            }}
          >
            <span style={{ fontSize: '22px' }}>{item.emoji}</span>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#1a1a1a', fontWeight: 600 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CertificationScenario({ scenario, onAnswer }: any) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="c-card c-card-pad" style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
        Scenario {scenario.num} of 3
      </div>
      <button className="c-listen-btn" style={{ display: 'inline-flex', marginBottom: '12px' }}>
        🔊 Listen to scenario
      </button>
      <p style={{ fontSize: '14px', color: '#1a1a1a', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '14px' }}>
        {scenario.prompt}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {scenario.options.map((option: any, idx: number) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedAnswer(idx);
              onAnswer(option.correct, option.text);
            }}
            style={{
              textAlign: 'left',
              padding: '10px 14px',
              borderRadius: '5px',
              border: selectedAnswer === idx ? `1.5px solid ${option.correct ? '#86efac' : '#fca5a5'}` : '1.5px solid #e8e3d9',
              background: selectedAnswer === idx ? (option.correct ? '#f0fdf4' : '#fff5f5') : '#ffffff',
              fontSize: '13px',
              color: '#1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <strong style={{ color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginRight: '6px' }}>
              {String.fromCharCode(65 + idx)})
            </strong>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

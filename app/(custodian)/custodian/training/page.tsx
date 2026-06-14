'use client';

import { useState, useEffect } from 'react';
import { fetchRemoteProgress, remoteCompleteModule, remoteSetFeedback } from '@/app/lib/progressApi';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';

export default function CustodianTraining() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<Record<string, string>>({});
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, { isCorrect: boolean; text: string }>>({});
  const [readinessRating, setReadinessRating] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isCertified, setIsCertified] = useState(false);
  const [viewMode, setViewMode] = useState<'certificate' | 'training'>('certificate');

  // Interactive Match Persona Puzzle state for Module 1
  const [puzzleSelections, setPuzzleSelections] = useState<Record<string, string>>({
    'Ancestral grief, identity longing': '',
    'Intellectual curiosity, mastery': '',
    'Practical comfort, confidence': '',
    'Community, shared memory': ''
  });
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // Interactive Kotoka Airport scenario state for Module 1
  const [airportScenarioAnswer, setAirportScenarioAnswer] = useState<string | null>(null);

  // Interactive incoming tour group scenario state for Module 3
  const [incomingTourGroupAnswer, setIncomingTourGroupAnswer] = useState<string | null>(null);

  // Interactive Makola Market scenario state for Module 4
  const [makolaScenarioAnswer, setMakolaScenarioAnswer] = useState<string | null>(null);

  // Interactive taxi driver scenario state for Module 5
  const [taxiScenarioAnswer, setTaxiScenarioAnswer] = useState<string | null>(null);

  // Simulated audio player state
  const [activeAudio, setActiveAudio] = useState<{ title: string; lang: string } | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        setUser(u);
        if (u.certification === 'Afrofeast Certified') {
          setIsCertified(true);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    const loadProgress = async () => {
      try {
        const remote = await fetchRemoteProgress();
        if (remote) {
          const completed = remote.completed_modules || [];
          setCompletedModules(completed);
          setFeedbackEntries(remote.feedback_entries || {});

          // Hydrate Module 1 puzzle and scenario answers from DB
          if (remote.feedback_entries?.m1_puzzle === 'solved') {
            setPuzzleSelections({
              'Ancestral grief, identity longing': 'Heritage Seeker',
              'Intellectual curiosity, mastery': 'Cultural Explorer',
              'Practical comfort, confidence': 'Curious Traveller',
              'Community, shared memory': 'Social Connector'
            });
            setPuzzleSolved(true);
          }
          if (remote.feedback_entries?.m1_scenario) {
            setAirportScenarioAnswer(remote.feedback_entries.m1_scenario);
          }

          // Hydrate Module 3 scenario answer from DB
          if (remote.feedback_entries?.m3_scenario) {
            setIncomingTourGroupAnswer(remote.feedback_entries.m3_scenario);
          }

          // Hydrate Module 4 scenario answer from DB
          if (remote.feedback_entries?.m4_scenario) {
            setMakolaScenarioAnswer(remote.feedback_entries.m4_scenario);
          }

          // Hydrate Module 5 scenario answer from DB
          if (remote.feedback_entries?.m5_scenario) {
            setTaxiScenarioAnswer(remote.feedback_entries.m5_scenario);
          }

          // Auto-expand the first incomplete module (1 to 5)
          let firstActive = 1;
          for (let i = 1; i <= 5; i++) {
            if (!completed.includes(String(i))) {
              firstActive = i;
              break;
            }
          }
          // If all 5 are completed, active is Module 6
          if (
            completed.includes('1') &&
            completed.includes('2') &&
            completed.includes('3') &&
            completed.includes('4') &&
            completed.includes('5')
          ) {
            firstActive = 6;
          }
          setExpandedModule(firstActive);
        } else {
          // If no progress, expand Module 1 by default
          setExpandedModule(1);
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
        showNotification('Failed to load training progress from server', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const toggleModule = (moduleNum: number) => {
    // If the module is locked, prevent expanding it
    if (moduleNum > 1 && !completedModules.includes(String(moduleNum - 1))) {
      showNotification(`Complete Module ${moduleNum - 1} first to unlock this section.`, 'info');
      return;
    }
    setExpandedModule(expandedModule === moduleNum ? null : moduleNum);
  };

  const handleScenarioAnswer = (scenario: string, isCorrect: boolean, text: string) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenario]: { isCorrect, text }
    }));
  };

  const handlePuzzleSelect = async (desc: string, persona: string) => {
    const updated = { ...puzzleSelections, [desc]: persona };
    setPuzzleSelections(updated);

    const allCorrect =
      updated['Ancestral grief, identity longing'] === 'Heritage Seeker' &&
      updated['Intellectual curiosity, mastery'] === 'Cultural Explorer' &&
      updated['Practical comfort, confidence'] === 'Curious Traveller' &&
      updated['Community, shared memory'] === 'Social Connector';

    if (allCorrect) {
      setPuzzleSolved(true);
      showNotification('✓ Persona puzzle solved correctly!', 'success');
      try {
        await remoteSetFeedback('m1_puzzle', 'solved');
      } catch (e) {
        console.error('Failed to save puzzle progress:', e);
      }
    }
  };

  const handleAirportScenarioAnswer = async (key: string) => {
    setAirportScenarioAnswer(key);
    try {
      await remoteSetFeedback('m1_scenario', key);
      if (key === 'B') {
        showNotification('✓ Kotoka Airport Scenario answered correctly!', 'success');
      } else {
        showNotification('Incorrect answer. Try again!', 'error');
      }
    } catch (e) {
      console.error('Failed to save scenario answer:', e);
    }
  };

  const handleIncomingTourGroupAnswer = async (key: string) => {
    setIncomingTourGroupAnswer(key);
    try {
      await remoteSetFeedback('m3_scenario', key);
      if (key === '2') {
        showNotification('✓ Door of No Return Scenario answered correctly!', 'success');
      } else {
        showNotification('Incorrect answer. Try again!', 'error');
      }
    } catch (e) {
      console.error('Failed to save scenario answer:', e);
    }
  };

  const handleMakolaScenarioAnswer = async (key: string) => {
    setMakolaScenarioAnswer(key);
    try {
      await remoteSetFeedback('m4_scenario', key);
      if (key === 'C') {
        showNotification('✓ Makola Market Scenario answered correctly!', 'success');
      } else {
        showNotification('Incorrect answer. Try again!', 'error');
      }
    } catch (e) {
      console.error('Failed to save scenario answer:', e);
    }
  };

  const handleTaxiScenarioAnswer = async (key: string) => {
    setTaxiScenarioAnswer(key);
    try {
      await remoteSetFeedback('m5_scenario', key);
      if (key === 'C') {
        showNotification('✓ Taxi Driver Scenario answered correctly!', 'success');
      } else {
        showNotification('Incorrect answer. Try again!', 'error');
      }
    } catch (e) {
      console.error('Failed to save scenario answer:', e);
    }
  };

  const handleSelectFeedback = async (moduleId: string, label: string) => {
    const isAlreadyCompleted = completedModules.includes(moduleId);
    const updatedFeedback = { ...feedbackEntries, [moduleId]: label };
    setFeedbackEntries(updatedFeedback);

    let updatedCompleted = [...completedModules];
    if (!isAlreadyCompleted) {
      updatedCompleted.push(moduleId);
      setCompletedModules(updatedCompleted);
    }

    const moduleNum = Number(moduleId);
    const nextModuleNum = moduleNum + 1;

    try {
      // Save feedback reaction to the backend
      const feedbackKey =
        label === 'Ready' ? 'sprout' : label === 'Growing' ? 'feather' : 'stone';
      await remoteSetFeedback(moduleId, feedbackKey);

      // Save module completion to backend
      const progressScore = Math.round((updatedCompleted.length / 6) * 100);
      await remoteCompleteModule({
        module_id: moduleId,
        next_module_id: String(nextModuleNum),
        unlocked_stages: [1, 2, 3, 4, 5, 6],
        completed_stages: updatedCompleted.map(Number),
        afro_score: progressScore,
      });

      showNotification(`Module ${moduleId} completed! Your progress has been synced.`, 'success');

      // Auto-collapse and expand the next module with transition delay
      setTimeout(() => {
        if (nextModuleNum <= 6) {
          setExpandedModule(nextModuleNum);
        } else {
          setExpandedModule(null);
        }
      }, 400);
    } catch (err) {
      console.error('Error saving progress:', err);
      showNotification('Progress saved locally (offline mode)', 'info');
    }
  };

  const handleSubmitAssessment = async () => {
    if (Object.keys(scenarioAnswers).length < 3) {
      showNotification('Please answer all 3 scenarios before submitting.', 'info');
      return;
    }

    try {
      setSubmitting(true);
      const updatedCompleted = [...completedModules];
      if (!updatedCompleted.includes('6')) {
        updatedCompleted.push('6');
        setCompletedModules(updatedCompleted);
      }

      // 1. Save final completed stages in UserProgress
      await remoteCompleteModule({
        module_id: '6',
        next_module_id: null,
        unlocked_stages: [1, 2, 3, 4, 5, 6],
        completed_stages: [1, 2, 3, 4, 5, 6],
        afro_score: 100,
      });

      // If we have reflective rating, save it as feedback for Module 6
      if (readinessRating) {
        await remoteSetFeedback('6', readinessRating === 'Ready' ? 'sprout' : readinessRating === 'Growing' ? 'feather' : 'stone');
      }

      // 2. Call admin/custodians/{id} API to set user.certification to 'Afrofeast Certified'
      if (user && user.id) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const response = await fetch(`${backendUrl}/user/profile`, {
          method: 'PUT',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            certification: 'Afrofeast Certified'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update certification status in database');
        }

        const result = await response.json();
        const updatedUser = result.data;

        // 3. Update localStorage and dispatch event for immediate sidebar update
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        setUser(updatedUser);
      }

      setIsCertified(true);
      setViewMode('certificate');
      showNotification('Congratulations! You are officially Afrofeast Certified!', 'success');
    } catch (err) {
      console.error('Certification error:', err);
      showNotification('Failed to process certification. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/certificates/download`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to generate certificate PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `OurRoots-Heritage-Readiness-Certificate-${user?.name?.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showNotification('Certificate downloaded successfully!');
    } catch (err) {
      console.error('Certificate download error:', err);
      showNotification('Failed to download certificate PDF. Ensure you have completed all stages.', 'error');
    }
  };

  const playAudioSimulation = (title: string, lang: string) => {
    setActiveAudio({ title, lang });
    setAudioPlaying(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '16px' }}>
        <div className="a-loader" style={{ borderTopColor: 'var(--c-amber)' }}></div>
        <div style={{ color: '#8a7f72', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>Loading training status...</div>
      </div>
    );
  }

  // Count modules completed dynamically
  const completedCount = completedModules.filter(id => ['1', '2', '3', '4', '5', '6'].includes(id)).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <>
      {/* Styles for Audio Simulation Waves */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 22px; }
        }
        .wave-bar {
          width: 3px;
          background: var(--c-amber);
          border-radius: 3px;
          transition: height 0.15s ease;
        }
        .wave-bar-1 { animation: soundWave 0.8s infinite 0.1s; }
        .wave-bar-2 { animation: soundWave 0.8s infinite 0.3s; }
        .wave-bar-3 { animation: soundWave 0.8s infinite 0.5s; }
        .wave-bar-4 { animation: soundWave 0.8s infinite 0.2s; }
        .wave-bar-5 { animation: soundWave 0.8s infinite 0.4s; }
      `}} />

      {isCertified && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'rgba(232,168,50,0.08)', border: '1px solid rgba(232,168,50,0.2)', borderRadius: '6px', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#d4af37' }}>You are Afrofeast Certified!</div>
              <div style={{ fontSize: '11px', color: 'var(--c-slate-dim)' }}>Completed successfully. You have earned your certificate and badge.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewMode(viewMode === 'certificate' ? 'training' : 'certificate')}
              className="c-btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {viewMode === 'certificate' ? '📚 Review Modules' : '🏆 View Certificate'}
            </button>
            <button 
              onClick={handleDownloadCertificate}
              className="c-btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      )}

      {isCertified && viewMode === 'certificate' ? (
        /* Premium Certificate Congratulations View */
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 40px' }}>
          <div 
            style={{ 
              maxWidth: '650px', 
              width: '100%', 
              background: 'linear-gradient(135deg, #0b1a12, #11261b)', 
              border: '6px double var(--c-amber)', 
              borderRadius: '12px', 
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)', 
              padding: '40px 32px', 
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Corner Decorative Borders */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--c-amber)', borderLeft: '2px solid var(--c-amber)' }}></div>
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--c-amber)', borderRight: '2px solid var(--c-amber)' }}></div>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--c-amber)', borderLeft: '2px solid var(--c-amber)' }}></div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--c-amber)', borderRight: '2px solid var(--c-amber)' }}></div>

            <div style={{ color: 'var(--c-amber)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.25em', marginBottom: '18px', fontWeight: 600 }}>
              OURROOTS AFRICA CUSTODIAN CERTIFICATE
            </div>

            {/* Gold Crest */}
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(232,168,50,0.1)', border: '2px dashed var(--c-amber)', marginBottom: '24px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-amber)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '32px', color: '#f0ebe0', fontWeight: 400, marginBottom: '8px' }}>
              Afrofeast Certified Custodian
            </h2>
            <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--c-slate-dim)', marginBottom: '28px' }}>
              This certifies that
            </div>

            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--c-amber-light)', borderBottom: '1.5px solid rgba(232,168,50,0.3)', display: 'inline-block', padding: '0 24px 6px', marginBottom: '28px', fontFamily: "'Fraunces', Georgia, serif" }}>
              {user?.name || 'Kofi Mensah'}
            </div>

            <p style={{ fontSize: '14px', color: 'var(--c-slate)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 32px' }}>
              has successfully completed all modules of the <strong>Heritage Training Programme</strong>. 
              Having demonstrated profound cultural grounding, emotional first-aid readiness, and radical transparency protocols, 
              they are officially certified as a premium heritage guardian.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(232,168,50,0.15)', paddingTop: '24px', maxWidth: '460px', margin: '0 auto 32px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--c-slate-dim)', fontFamily: "'JetBrains Mono', monospace" }}>ISSUED DATE</div>
                <div style={{ fontSize: '13px', color: 'var(--c-slate)', marginTop: '4px', fontWeight: 600 }}>
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--c-slate-dim)', fontFamily: "'JetBrains Mono', monospace" }}>CREDENTIAL STATUS</div>
                <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                  Active & Verified
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={handleDownloadCertificate} className="c-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF Certificate
              </button>
              <button 
                onClick={() => setViewMode('training')} 
                className="c-btn-ghost" 
                style={{ borderColor: 'rgba(232,168,50,0.3)', color: 'var(--c-slate)' }}
              >
                Review Modules
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Training Modules List View */
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
            <button 
              onClick={() => showNotification('WhatsApp integration is active. Send "START" to the number provided to begin.')}
              style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '5px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}
            >
              💬 Start on WhatsApp
            </button>
          </div>

          {/* Progress Section */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '14px', color: '#6b6560', flex: 1, marginRight: '16px' }}>
                Six modules · approximately 2 hours total · voice-first · card-based. Complete here or on WhatsApp — your progress syncs automatically.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => playAudioSimulation('Afrofeast Program Summary', 'Twi')} className="c-listen-btn">🔊 Twi</button>
                <button onClick={() => playAudioSimulation('Afrofeast Program Summary', 'English')} className="c-listen-btn">🔊 English</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>{completedCount} of 6 modules complete</div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#c9a14a', background: 'rgba(201,161,74,0.1)', border: '1px solid rgba(201,161,74,0.25)', padding: '3px 8px', borderRadius: '3px' }}>
                {progressPercent}% · {isCertified ? 'Afrofeast Certified' : 'Afrofeast Certification pending'}
              </div>
            </div>
            <div className="c-progress-track" style={{ marginBottom: '28px' }}>
              <div className="c-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Module 1 */}
          <TrainingModule
            number={1}
            title="The Bridge, Not the Vendor"
            subtitle="Mindset + persona puzzle · 20 min"
            isExpanded={expandedModule === 1}
            isCompleted={completedModules.includes('1')}
            isLocked={false}
            onToggle={() => toggleModule(1)}
            proverb={`"Ɔhɔhoɔ ani akɛseɛ nanso ɔnhunu hwee."`}
            proverbs_en={`"The stranger has big eyes, but sees nothing." — Your role is to give sight to those eyes.`}
            language="Akan (Twi)"
            onPlayAudio={() => playAudioSimulation('Module 1 Proverb', 'Twi')}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { desc: 'Ancestral grief, identity longing', correct: 'Heritage Seeker' },
                  { desc: 'Intellectual curiosity, mastery', correct: 'Cultural Explorer' },
                  { desc: 'Practical comfort, confidence', correct: 'Curious Traveller' },
                  { desc: 'Community, shared memory', correct: 'Social Connector' }
                ].map((item, idx) => {
                  const selectedPersona = puzzleSelections[item.desc] || '';
                  const isCorrect = selectedPersona === item.correct;
                  const border = puzzleSolved 
                    ? '1px solid #86efac' 
                    : (selectedPersona ? (isCorrect ? '1px solid #86efac' : '1px solid #fca5a5') : '1px solid #e8e3d9');
                  const background = puzzleSolved 
                    ? '#f0fdf4' 
                    : (selectedPersona ? (isCorrect ? '#f0fdf4' : '#fff5f5') : '#ffffff');
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        border: border, 
                        background: background, 
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ flex: 1, color: '#374151' }}>
                        {item.desc}
                      </div>
                      <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                        <select
                          value={selectedPersona}
                          disabled={puzzleSolved}
                          onChange={(e) => handlePuzzleSelect(item.desc, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e8e3d9',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: '#fff',
                            fontFamily: 'inherit',
                            color: '#1a1a1a',
                            cursor: puzzleSolved ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Select Persona...</option>
                          <option value="Heritage Seeker">Heritage Seeker</option>
                          <option value="Cultural Explorer">Cultural Explorer</option>
                          <option value="Curious Traveller">Curious Traveller</option>
                          <option value="Social Connector">Social Connector</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
                {puzzleSolved ? (
                  <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    <span>✓</span> Match Puzzle Correctly Solved!
                  </div>
                ) : (
                  Object.values(puzzleSelections).some(v => v !== '') && (
                    <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                      Some matches are incorrect or incomplete. Keep trying!
                    </div>
                  )
                )}
              </div>
            </PuzzleCard>

            {/* Kotoka Airport Audio Scenario */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ background: '#e0f2fe', color: '#075985', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  AUDIO SCENARIO {airportScenarioAnswer === 'B' ? '✓' : ''}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Kotoka Airport — Amara arrives</span>
              </div>
              
              <button 
                type="button"
                onClick={() => playAudioSimulation('Kotoka Airport Scenario', 'English')}
                className="c-listen-btn" 
                style={{ display: 'inline-flex', marginBottom: '12px' }}
              >
                🔊 Listen to scenario
              </button>
              
              <p style={{ fontSize: '14px', color: '#1a1a1a', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '14px' }}>
                Amara arrives at Kotoka. She looks overwhelmed. What do you say first?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'A', text: '"Do you need to change money?" — leads with transaction, not connection', correct: false },
                  { key: 'B', text: '"Akwaaba, Amara! Welcome home, sister." — family connection first, always', correct: true },
                  { key: 'C', text: '"The car is this way, let\'s go." — logistics before humanity', correct: false }
                ].map((option) => {
                  const isSelected = airportScenarioAnswer === option.key;
                  const borderStyle = isSelected 
                    ? `1.5px solid ${option.correct ? '#86efac' : '#fca5a5'}` 
                    : '1.5px solid #e8e3d9';
                  const bgStyle = isSelected 
                    ? (option.correct ? '#f0fdf4' : '#fff5f5') 
                    : '#ffffff';
                  
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleAirportScenarioAnswer(option.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '5px',
                        border: borderStyle,
                        background: bgStyle,
                        fontSize: '13px',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginRight: '6px' }}>
                        {option.correct && isSelected ? '✓ ' : (!option.correct && isSelected ? '✕ ' : '')}{option.key})
                      </strong>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Locked self assessment banner or active SelfAssessmentButtons */}
            {!(puzzleSolved && airportScenarioAnswer === 'B') ? (
              <div style={{ background: '#fffdf5', border: '1.5px dashed #e8e3d9', borderRadius: '6px', padding: '16px', marginTop: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔒 Self Assessment Locked
                </div>
                <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>
                  Solve the Matching Puzzle and Kotoka Airport Audio Scenario correctly to unlock this module's self assessment.
                </div>
              </div>
            ) : (
              <SelfAssessmentButtons 
                selected={feedbackEntries['1']} 
                onSelect={(label) => handleSelectFeedback('1', label)} 
              />
            )}
          </TrainingModule>

          {/* Module 2 */}
          <TrainingModule
            number={2}
            title="What OurRoots Already Taught Her"
            subtitle="Platform journey map + voice quiz · 15 min"
            isExpanded={expandedModule === 2}
            isCompleted={completedModules.includes('2')}
            isLocked={!completedModules.includes('1')}
            onToggle={() => toggleModule(2)}
            proverb={`"Nyansa nni onipa baako tirim."`}
            proverbs_en={`"Wisdom is not in the head of one person." — Amara prepared for 90 days. Meet her where she is.`}
            language="Akan (Twi)"
            onPlayAudio={() => playAudioSimulation('Module 2 Proverb', 'Twi')}
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

            <SelfAssessmentButtons 
              selected={feedbackEntries['2']} 
              onSelect={(label) => handleSelectFeedback('2', label)} 
            />
          </TrainingModule>

          {/* Module 3 */}
          <TrainingModule
            number={3}
            title="The Sacred Silence — Cape Coast Protocol"
            subtitle="Trauma-informed scenarios · 20 min"
            isExpanded={expandedModule === 3}
            isCompleted={completedModules.includes('3')}
            isLocked={!completedModules.includes('2')}
            onToggle={() => toggleModule(3)}
            proverb={`"Nusu ne asuo a ɛde wo kɔ fie."`}
            proverbs_en={`"Tears are the river that takes you home." — Do not stop the river. Let it flow.`}
            language="Fante"
            onPlayAudio={() => playAudioSimulation('Module 3 Proverb', 'Fante')}
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

            <DoNot title="The Door of No Return">
              {[
                {
                  section: '❌ NEVER',
                  items: [
                    'Say "Don\'t cry" or "It\'s okay"',
                    'Touch her unless she reaches for you',
                    'Ask to take a photo',
                    'Check your phone',
                    'Rush for the next tour group'
                  ]
                },
                {
                  section: '✅ ALWAYS',
                  items: [
                    'Offer a tissue silently',
                    'Step back, give her space',
                    'Say: "Take as much time as you need."',
                    'Stand between her and incoming groups',
                    'Be her protector in this sacred moment'
                  ]
                }
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

            <PuzzleCard title="The incoming tour group">
              <p style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', marginBottom: '14px' }}>
                Amara has been at the Door of No Return for 20 minutes. A second tour group is approaching. What do you do?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: '1', text: 'Tell her we need to move for the next group', correct: false },
                  { key: '2', text: 'Stand quietly between her and the incoming group — protect her space', correct: true },
                  { key: '3', text: 'Tap her shoulder and say it\'s time to go', correct: false }
                ].map((option) => {
                  const isSelected = incomingTourGroupAnswer === option.key;
                  const borderStyle = isSelected 
                    ? `1.5px solid ${option.correct ? '#86efac' : '#fca5a5'}` 
                    : '1.5px solid #e8e3d9';
                  const bgStyle = isSelected 
                    ? (option.correct ? '#f0fdf4' : '#fff5f5') 
                    : '#ffffff';
                  
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleIncomingTourGroupAnswer(option.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '5px',
                        border: borderStyle,
                        background: bgStyle,
                        fontSize: '13px',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginRight: '6px' }}>
                        {option.correct && isSelected ? '✓ ' : (!option.correct && isSelected ? '✕ ' : '')}{option.key})
                      </strong>
                      {option.text}
                    </button>
                  );
                })}
              </div>

              {incomingTourGroupAnswer === '2' && (
                <div style={{ marginTop: '12px', fontSize: '13px', fontStyle: 'italic', color: '#6b6560' }}>
                  In this sacred moment, you are not a tour guide. You are her protector.
                </div>
              )}
            </PuzzleCard>

            {/* Locked self assessment banner or active SelfAssessmentButtons */}
            {incomingTourGroupAnswer !== '2' ? (
              <div style={{ background: '#fffdf5', border: '1.5px dashed #e8e3d9', borderRadius: '6px', padding: '16px', marginTop: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔒 Self Assessment Locked
                </div>
                <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>
                  Solve the Door of No Return Scenario correctly to unlock this module's self assessment.
                </div>
              </div>
            ) : (
              <SelfAssessmentButtons 
                selected={feedbackEntries['3']} 
                onSelect={(label) => handleSelectFeedback('3', label)} 
              />
            )}
          </TrainingModule>

          {/* Module 4 */}
          <TrainingModule
            number={4}
            title="Radical Money Transparency"
            subtitle="Pricing quiz + platform rules · 15 min"
            isExpanded={expandedModule === 4}
            isCompleted={completedModules.includes('4')}
            isLocked={!completedModules.includes('3')}
            onToggle={() => toggleModule(4)}
            proverb={`"Din pa ye sen ahonya."`}
            proverbs_en={`"A good name is better than riches." — Your reputation travels further than any commission.`}
            language="Akan (Twi)"
            onPlayAudio={() => playAudioSimulation('Module 4 Proverb', 'Twi')}
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

            <DoNot title="The Transparency Rule">
              {[
                {
                  section: '❌ NEVER',
                  items: [
                    'Ask for tips mid-session',
                    "Take her to a friend's shop and pressure her",
                    'Keep a price difference secret',
                    "Add costs that weren't agreed upfront"
                  ]
                },
                {
                  section: '✅ ALWAYS',
                  items: [
                    'Explain all costs before the day begins',
                    'Tell her the difference between local and tourist pricing',
                    'Say: "Tips are appreciated but never expected."',
                    'All payments must go through OurRoots'
                  ]
                }
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

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: '#78350f', lineHeight: '1.6' }}>
              <strong>OurRoots Platform Rule:</strong> All payments for sessions booked through OurRoots must be processed on the platform. Requesting direct payment is a Code of Conduct violation. First breach = formal warning. Second = suspension.
            </div>

            <PuzzleCard title="Makola Market — the overcharge">
              <p style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', marginBottom: '14px' }}>
                A vendor tries to charge Amara 500 GHS for something that costs 100 GHS. What do you do?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'A', text: 'Let her pay it — the vendor needs the money', correct: false },
                  { key: 'B', text: 'Tell the vendor in Twi to lower it a little — keep some overcharge', correct: false },
                  { key: 'C', text: '"Auntie, she is my sister. Give us the proper price." — protect her wallet as you would your own sister\'s', correct: true }
                ].map((option) => {
                  const isSelected = makolaScenarioAnswer === option.key;
                  const borderStyle = isSelected 
                    ? `1.5px solid ${option.correct ? '#86efac' : '#fca5a5'}` 
                    : '1.5px solid #e8e3d9';
                  const bgStyle = isSelected 
                    ? (option.correct ? '#f0fdf4' : '#fff5f5') 
                    : '#ffffff';
                  
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleMakolaScenarioAnswer(option.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '5px',
                        border: borderStyle,
                        background: bgStyle,
                        fontSize: '13px',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginRight: '6px' }}>
                        {option.correct && isSelected ? '✓ ' : (!option.correct && isSelected ? '✕ ' : '')}{option.key})
                      </strong>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </PuzzleCard>

            {/* Locked self assessment banner or active SelfAssessmentButtons */}
            {makolaScenarioAnswer !== 'C' ? (
              <div style={{ background: '#fffdf5', border: '1.5px dashed #e8e3d9', borderRadius: '6px', padding: '16px', marginTop: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔒 Self Assessment Locked
                </div>
                <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>
                  Solve the Makola Market Scenario correctly to unlock this module's self assessment.
                </div>
              </div>
            ) : (
              <SelfAssessmentButtons 
                selected={feedbackEntries['4']} 
                onSelect={(label) => handleSelectFeedback('4', label)} 
              />
            )}
          </TrainingModule>

          {/* Module 5 */}
          <TrainingModule
            number={5}
            title="Crisis & Safety Protocols"
            subtitle="Crisis action card + safety scenario · 15 min"
            isExpanded={expandedModule === 5}
            isCompleted={completedModules.includes('5')}
            isLocked={!completedModules.includes('4')}
            onToggle={() => toggleModule(5)}
            proverb={`"When a person is falling, you don't wait to ask their name before catching them."`}
            proverbs_en={`"Act first. Assess later. Her safety is your only priority in a crisis."`}
            language="Universal West African"
            onPlayAudio={() => playAudioSimulation('Module 5 Proverb', 'English')}
          >
            <ConceptCard title="The 3 types of crisis">
              <div style={{ background: '#1b2e20', borderRadius: '6px', padding: '12px', fontSize: '13px', color: 'rgba(243,237,224,0.85)', lineHeight: '1.7', fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ color: '#c9a14a', fontSize: '10px', marginBottom: '6px' }}>📱 WHATSAPP MESSAGE · MODULE 5/6</div>
                1️⃣ <strong>Emotional:</strong> Panic attack or dissociation at a heritage site<br />
                2️⃣ <strong>Medical:</strong> Stomach illness (very common!), dehydration, fever<br />
                3️⃣ <strong>Safety:</strong> Aggressive vendor, unsafe transport, harassment
              </div>
            </ConceptCard>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ color: '#d97706', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span>⚠️</span> Grounding Technique — Emotional Crisis at the Castle
              </div>
              <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>1. Move her to a quiet spot away from the crowd</div>
                <div>2. Say: "Amara, look at me. You are safe. Breathe with me."</div>
                <div>3. Ask her to name 5 things she can see, 4 things she can touch</div>
                <div>4. Send "CRISIS - Cape Coast" to OurRoots Admin AI for immediate founder support</div>
              </div>
            </div>

            <PuzzleCard title="Aggressive taxi driver">
              <p style={{ fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', marginBottom: '14px' }}>
                A taxi driver is demanding extra money aggressively. Amara is in the car. What do you do?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'A', text: 'Argue loudly to defend Amara — escalates the situation', correct: false },
                  { key: 'B', text: 'Pay whatever he wants — rewards aggressive behaviour', correct: false },
                  { key: 'C', text: 'Tell him to pull over immediately. Get Amara out. Order a Bolt. De-escalate by leaving.', correct: true }
                ].map((option) => {
                  const isSelected = taxiScenarioAnswer === option.key;
                  const borderStyle = isSelected 
                    ? `1.5px solid ${option.correct ? '#86efac' : '#fca5a5'}` 
                    : '1.5px solid #e8e3d9';
                  const bgStyle = isSelected 
                    ? (option.correct ? '#f0fdf4' : '#fff5f5') 
                    : '#ffffff';
                  
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleTaxiScenarioAnswer(option.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '5px',
                        border: borderStyle,
                        background: bgStyle,
                        fontSize: '13px',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginRight: '6px' }}>
                        {option.correct && isSelected ? '✓ ' : (!option.correct && isSelected ? '✕ ' : '')}{option.key})
                      </strong>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </PuzzleCard>

            {/* Locked self assessment banner or active SelfAssessmentButtons */}
            {taxiScenarioAnswer !== 'C' ? (
              <div style={{ background: '#fffdf5', border: '1.5px dashed #e8e3d9', borderRadius: '6px', padding: '16px', marginTop: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔒 Self Assessment Locked
                </div>
                <div style={{ fontSize: '12px', color: '#6b6560', marginTop: '6px' }}>
                  Solve the Aggressive taxi driver Scenario correctly to unlock this module's self assessment.
                </div>
              </div>
            ) : (
              <SelfAssessmentButtons 
                selected={feedbackEntries['5']} 
                onSelect={(label) => handleSelectFeedback('5', label)} 
              />
            )}
          </TrainingModule>

          {/* Module 6 - Certification Assessment */}
          <div 
            className="t-card" 
            style={{ 
              borderColor: '#c9a14a', 
              borderWidth: '2px', 
              opacity: completedModules.includes('5') ? 1 : 0.6 
            }}
          >
            <div
              className="t-card-head"
              onClick={() => toggleModule(6)}
              style={{ background: '#fffdf5', cursor: completedModules.includes('5') ? 'pointer' : 'not-allowed' }}
            >
              <div className={`t-step ${completedModules.includes('6') ? 't-step-done' : (completedModules.includes('5') ? 't-step-now' : 't-step-lock')}`}>
                {completedModules.includes('6') ? '✓' : '6'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                  Module 6 · Afrofeast Certification Assessment
                </div>
                <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#c9a14a', marginTop: '2px' }}>
                  3 live voice scenarios · 10 min · {completedModules.includes('6') ? 'Completed' : 'Ready to begin'}
                </div>
              </div>
              <span className={completedModules.includes('6') ? 'status-ok' : 'a-badge-warn'}>
                {completedModules.includes('6') ? 'Certified' : 'Current'}
              </span>
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

                <button onClick={() => playAudioSimulation('Certification Instructions', 'Twi')} className="c-listen-btn" style={{ display: 'inline-flex', marginBottom: '16px' }}>
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
                    onAnswer={(isCorrect: boolean, feedback: string) => handleScenarioAnswer(`s${scenario.num}`, isCorrect, feedback)}
                    onPlayAudio={() => playAudioSimulation(`Scenario ${scenario.num}`, 'English')}
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
                  <SelfAssessmentButtons 
                    selected={readinessRating || undefined}
                    onSelect={(label) => setReadinessRating(label)}
                  />
                </div>

                <button 
                  onClick={handleSubmitAssessment}
                  disabled={submitting || Object.keys(scenarioAnswers).length < 3}
                  className="c-btn-primary"
                  style={{ width: '100%', padding: '12px', opacity: (submitting || Object.keys(scenarioAnswers).length < 3) ? 0.65 : 1 }}
                >
                  {submitting ? 'Submitting Assessment...' : 'Submit and earn Afrofeast Certification →'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Audio Simulator Bar */}
      {activeAudio && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            background: 'var(--c-navy-light)', 
            border: '1.5px solid var(--c-amber)', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)', 
            borderRadius: '10px', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            zIndex: 999,
            color: 'var(--c-slate)',
            minWidth: '280px',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Waveform Micro-animation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px', width: '25px', flexShrink: 0 }}>
            {audioPlaying ? (
              <>
                <div className="wave-bar wave-bar-1"></div>
                <div className="wave-bar wave-bar-2"></div>
                <div className="wave-bar wave-bar-3"></div>
                <div className="wave-bar wave-bar-4"></div>
                <div className="wave-bar wave-bar-5"></div>
              </>
            ) : (
              <>
                <div className="wave-bar" style={{ height: '4px' }}></div>
                <div className="wave-bar" style={{ height: '4px' }}></div>
                <div className="wave-bar" style={{ height: '4px' }}></div>
                <div className="wave-bar" style={{ height: '4px' }}></div>
                <div className="wave-bar" style={{ height: '4px' }}></div>
              </>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--c-amber)' }}>
              🎧 PLAYING SIMULATOR · {activeAudio.lang.toUpperCase()}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0ebe0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              {activeAudio.title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => setAudioPlaying(!audioPlaying)}
              style={{ background: 'none', border: 'none', color: 'var(--c-amber)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
            >
              {audioPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              onClick={() => {
                setActiveAudio(null);
                setAudioPlaying(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--c-slate-dim)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Helper Components
interface TrainingModuleProps {
  number: number;
  title: string;
  subtitle: string;
  isExpanded: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onToggle: () => void;
  proverb: string;
  proverbs_en: string;
  language: string;
  children: React.ReactNode;
  onPlayAudio: () => void;
}

function TrainingModule({
  number,
  title,
  subtitle,
  isExpanded,
  isCompleted,
  isLocked,
  onToggle,
  proverb,
  proverbs_en,
  language,
  children,
  onPlayAudio
}: TrainingModuleProps) {
  const stepClass = isCompleted ? 't-step-done' : (isLocked ? 't-step-lock' : 't-step-now');
  const stepContent = isCompleted ? '✓' : number.toString();
  const displayStatus = isCompleted ? '✓ Completed' : (isLocked ? '🔒 Locked' : '🌅 Active');

  return (
    <div 
      className="t-card" 
      style={{ 
        marginBottom: '12px', 
        opacity: isLocked ? 0.6 : 1,
        borderColor: !isLocked && !isCompleted ? 'rgba(232, 168, 50, 0.4)' : undefined,
        boxShadow: !isLocked && !isCompleted ? '0 0 10px rgba(232, 168, 50, 0.08)' : undefined
      }}
    >
      <div 
        className="t-card-head" 
        onClick={onToggle} 
        style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <div className={`t-step ${stepClass}`}>{stepContent}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{title}</div>
          <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', marginTop: '2px' }}>
            {subtitle} {isCompleted && <span style={{ color: 'var(--c-green)' }}>· Completed</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={isCompleted ? 'status-ok' : (isLocked ? 'a-badge-gray' : 'status-warn')}>
            {displayStatus}
          </span>
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#8a7f72" 
            strokeWidth="2"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {isExpanded && !isLocked && (
        <div className="t-card-body open">
          <div style={{ background: 'linear-gradient(135deg,#f5f3ee,#ede8df)', borderLeft: '3px solid #c9a14a', padding: '12px 16px', borderRadius: '0 5px 5px 0', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Proverb anchor · {language}
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#1a1a1a', marginBottom: '4px' }}>
              {proverb}
            </div>
            <div style={{ fontSize: '12px', color: '#6b6560' }}>{proverbs_en}</div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }} 
              className="c-listen-btn" 
              style={{ marginTop: '8px', display: 'inline-flex' }}
            >
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

function SelfAssessmentButtons({ selected, onSelect }: { selected?: string; onSelect?: (label: string) => void }) {
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
        ].map((item, idx) => {
          const isSelected = selected === item.label;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect?.(item.label)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 14px',
                borderRadius: '5px',
                border: isSelected ? '1.5px solid #2d6a3f' : '1.5px solid #e8e3d9',
                background: isSelected ? '#f0f7f2' : '#fff',
                cursor: 'pointer',
                minWidth: '80px',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '22px' }}>{item.emoji}</span>
              <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: isSelected ? '#2d6a3f' : '#1a1a1a', fontWeight: 600 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CertificationScenarioProps {
  scenario: {
    num: number;
    prompt: string;
    options: { text: string; correct: boolean }[];
  };
  onAnswer: (isCorrect: boolean, text: string) => void;
  onPlayAudio: () => void;
}

function CertificationScenario({ scenario, onAnswer, onPlayAudio }: CertificationScenarioProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="c-card c-card-pad" style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a7f72', fontFamily: "'JetBrains Mono', monospace", marginBottom: '10px' }}>
        Scenario {scenario.num} of 3
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onPlayAudio();
        }} 
        className="c-listen-btn" 
        style={{ display: 'inline-flex', marginBottom: '12px' }}
      >
        🔊 Listen to scenario
      </button>
      <p style={{ fontSize: '14px', color: '#1a1a1a', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '14px' }}>
        {scenario.prompt}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {scenario.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
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

// Quiz + Progress screens
// Globals: React, CL_DATA

const { useState: useStateQP, useEffect: useEffectQP } = React;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────── Quiz ───────
function QuizScreen() {
  const [quizzes, setQuizzes] = useStateQP(() => shuffleArray(window.CL_DATA.QUIZ || []));
  const [idx, setIdx]         = useStateQP(0);
  const [picked, setPicked]   = useStateQP(null);
  const [score, setScore]     = useStateQP(0);
  const [done, setDone]       = useStateQP(false);

  useEffectQP(() => {
    const handler = () => {
      setQuizzes(shuffleArray(window.CL_DATA.QUIZ || []));
      setIdx(0); setPicked(null); setScore(0); setDone(false);
    };
    window.addEventListener('cl-data-ready', handler);
    return () => window.removeEventListener('cl-data-ready', handler);
  }, []);

  const QUIZ = quizzes;

  if (!QUIZ || QUIZ.length === 0) {
    return (
      <div style={{ padding:'40px 16px', textAlign:'center', color:'var(--text-2)', fontSize:14 }}>
        Loading quiz questions...
      </div>
    );
  }

  const q = QUIZ[idx];
  const answered = picked !== null;
  const correct = answered && picked === q.correct;

  function pick(i) {
    if (answered) return;
    setPicked(i);
    if (i === q.correct) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 >= QUIZ.length) { setDone(true); return; }
    setIdx(idx + 1);
    setPicked(null);
  }

  function restart() {
    setQuizzes(shuffleArray(window.CL_DATA.QUIZ || []));
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  }

  if (done) {
    const pct = Math.round((score / QUIZ.length) * 100);
    return (
      <div style={{ padding: '20px 16px', textAlign: 'center' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '24px auto 18px',
          background: 'conic-gradient(from -90deg, #ff8a4c 0%, #ff5e87 ' + pct + '%, #1c2230 ' + pct + '%, #1c2230 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', background: 'var(--bg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{score}/{QUIZ.length}</div>
          </div>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>
          {pct >= 70 ? 'Nicely done.' : 'Worth another pass.'}
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, padding: '0 24px' }}>
          {pct >= 70
            ? "Streak counted. Tomorrow's quiz unlocks at 6am."
            : "No streak penalty for review rounds. Try again whenever."}
        </p>
        <button onClick={restart} style={{
          height: 44, borderRadius: 11, padding: '0 22px',
          background: 'var(--grad)', color: '#1a0d08',
          fontWeight: 700, fontSize: 14,
        }}>Try again</button>
      </div>
    );
  }

  const progressPct = ((idx + (answered ? 1 : 0)) / QUIZ.length) * 100;

  return (
    <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* progress */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
        }}>
          <span>Question {idx + 1} / {QUIZ.length}</span>
          <span>Score {score}</span>
        </div>
        <div style={{
          height: 6, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: progressPct + '%',
            background: 'var(--grad)', borderRadius: 99,
            transition: 'width 350ms ease',
          }}/>
        </div>
      </div>

      <h2 style={{
        margin: '4px 0 18px', fontSize: 20, fontWeight: 650,
        lineHeight: 1.35, letterSpacing: -0.2,
      }}>{q.q}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correct;
          let border = '1px solid var(--line-soft)';
          let bg = 'var(--bg-2)';
          let mark = null;
          if (answered) {
            if (isCorrect) { border = '1px solid rgba(80,200,140,0.5)'; bg = 'rgba(80,200,140,0.08)'; mark = <Check/>; }
            else if (isPicked) { border = '1px solid rgba(255,94,135,0.5)'; bg = 'rgba(255,94,135,0.08)'; mark = <Cross/>; }
          } else if (isPicked) {
            border = '1px solid rgba(255,138,76,0.5)';
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px', borderRadius: 12,
              border, background: bg, textAlign: 'left',
              transition: 'all 180ms ease',
              cursor: answered ? 'default' : 'pointer',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
                background: isPicked && !answered ? 'var(--grad)' : 'transparent',
              }}>
                {answered && (isCorrect || isPicked) ? mark : String.fromCharCode(65 + i)}
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--text)' }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{
          background: correct ? 'rgba(80,200,140,0.08)' : 'var(--bg-2)',
          border: '1px solid ' + (correct ? 'rgba(80,200,140,0.25)' : 'var(--line-soft)'),
          borderRadius: 12, padding: 14, marginBottom: 16,
        }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
            color: correct ? '#7ad9a8' : '#ffb38a', textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            {correct ? 'Right on.' : 'Not quite.'}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text)' }}>
            {q.explain}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}/>

      {answered && (
        <button onClick={next} style={{
          width: '100%', height: 48, borderRadius: 12,
          background: 'var(--grad)', color: '#1a0d08',
          fontWeight: 700, fontSize: 15,
        }}>
          {idx + 1 >= QUIZ.length ? 'See results' : 'Next question →'}
        </button>
      )}
    </div>
  );
}

function Check() { return <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3" stroke="#7ad9a8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function Cross() { return <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 2l7 7M9 2l-7 7" stroke="#ff9ab2" strokeWidth="2" strokeLinecap="round"/></svg>; }

// ─────── Progress ───────
function ProgressScreen() {
  const { PROGRESS } = window.CL_DATA;
  const dayLabels = ['M','T','W','T','F','S','S','M','T','W','T','F','S','S'];
  return (
    <div style={{ padding: '8px 16px 24px' }}>

      {/* Streak hero */}
      <div style={{
        position: 'relative', borderRadius: 18, padding: '20px 18px 18px',
        marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(160deg, #2a1a1f 0%, #1c1118 100%)',
        border: '1px solid rgba(255,138,76,0.22)',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -40, width: 180, height: 180,
          borderRadius: '50%', filter: 'blur(50px)',
          background: 'radial-gradient(circle, rgba(255,94,135,0.4), transparent 70%)',
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
            color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6,
          }}>Current streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{
              fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: -1,
              background: 'var(--grad)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{PROGRESS.streak}</span>
            <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 500 }}>days</span>
            <span style={{ fontSize: 18, marginLeft: 4 }}>🔥</span>
          </div>

          {/* Day dots */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
            {PROGRESS.days.map((on, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: on ? 'var(--grad)' : 'rgba(255,255,255,0.06)',
                  border: on ? 'none' : '1px solid var(--line)',
                  boxShadow: on ? '0 0 8px rgba(255,138,76,0.5)' : 'none',
                }}/>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{dayLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18,
      }}>
        <Stat label="Articles read"  value={PROGRESS.stats.read}/>
        <Stat label="Quiz accuracy"  value={PROGRESS.stats.accuracy + '%'}/>
        <Stat label="Best streak"    value={PROGRESS.stats.streakBest + 'd'}/>
        <Stat label="Topics touched" value={PROGRESS.stats.topics}/>
      </div>

      {/* Topic progress */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
        borderRadius: 14, padding: 16,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
          color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 14,
        }}>Topic mastery</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PROGRESS.topics.map(t => (
            <div key={t.name}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, marginBottom: 6,
              }}>
                <span style={{ color: 'var(--text)', fontWeight: 550 }}>{t.name}</span>
                <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{t.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: t.pct + '%',
                  background: 'var(--grad)', borderRadius: 99,
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
      borderRadius: 14, padding: '14px 14px',
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
        color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 700, letterSpacing: -0.5,
        background: 'var(--grad)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { QuizScreen, ProgressScreen });

// Claude Learner — main app shell
// Globals: React, ReactDOM, FeedScreen, ReadScreen, QuizScreen, ProgressScreen

const { useState: useStateApp, useEffect: useEffectApp } = React;

const TABS = [
  { id: 'feed',     label: 'Feed' },
  { id: 'read',     label: 'Read' },
  { id: 'quiz',     label: 'Quiz' },
  { id: 'progress', label: 'Progress' },
  { id: 'learn',    label: 'Learn' },
];

function TabIcon({ id, active }) {
  const stroke = active ? 'url(#grad)' : '#6b7280';
  const fill   = active ? 'url(#grad)' : 'none';
  const sw = 1.7;
  switch (id) {
    case 'feed':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}>
        <rect x="3" y="4" width="18" height="4" rx="1.5"/>
        <rect x="3" y="10" width="18" height="4" rx="1.5"/>
        <rect x="3" y="16" width="18" height="4" rx="1.5"/>
      </svg>;
    case 'read':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw}>
        <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v15l-4-2-4 2-4-2-4 2V5z"/>
      </svg>;
    case 'quiz':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 9.5a3 3 0 116 0c0 1.5-1.5 2-3 3"/>
        <circle cx="12" cy="17" r="0.6" fill={stroke}/>
      </svg>;
    case 'progress':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V11M10 19V5M16 19v-6M22 19H2"/>
      </svg>;
    case 'learn':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L2 8l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>;
  }
}

function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 24, paddingTop: 8,
      background: 'rgba(13,17,23,0.85)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderTop: '1px solid var(--line-soft)',
      zIndex: 30,
    }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a4c"/>
            <stop offset="100%" stopColor="#ff5e87"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '0 8px',
      }}>
        {TABS.map(t => {
          const active_ = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '6px 0',
            }}>
              <TabIcon id={t.id} active={active_}/>
              <span style={{
                fontSize: 10.5, fontWeight: active_ ? 700 : 550,
                color: active_ ? '#ff9a6e' : '#6b7280',
                letterSpacing: 0.2,
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppHeader({ tab }) {
  const titles = { feed: 'Feed', read: 'Read', quiz: 'Daily quiz', progress: 'Progress', learn: 'Learn' };
  return (
    <div style={{
      padding: '44px 16px 10px',
      background: 'var(--bg)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo/>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
            color: 'var(--text-2)', textTransform: 'uppercase',
          }}>Claude Learner</span>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 99,
          background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1a0d08', fontWeight: 700, fontSize: 13,
        }}>A</div>
      </div>
      <h1 style={{
        margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: -0.6,
        lineHeight: 1.15,
      }}>{titles[tab]}</h1>
    </div>
  );
}

function Logo() {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 7,
      background: 'var(--grad)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(255,138,76,0.35)',
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 13L6 3l1.5 5L9 5l1.5 3L12 3l1 10" stroke="#1a0d08" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  );
}

function App() {
  const [tab, setTab] = useStateApp(() => localStorage.getItem('cl-tab') || 'feed');
  const [article, setArticle] = useStateApp(null);

  useEffectApp(() => { localStorage.setItem('cl-tab', tab); }, [tab]);

  function openArticle(a) { setArticle(a); setTab('read'); }

  let body;
  switch (tab) {
    case 'feed':     body = <FeedScreen onRead={openArticle}/>; break;
    case 'read':     body = <ReadScreen article={article} onBack={() => setTab('feed')}/>; break;
    case 'quiz':     body = <QuizScreen/>; break;
    case 'progress': body = <ProgressScreen/>; break;
    case 'learn':    body = <LearnScreen/>; break;
  }

  return (
    <AndroidShell>
      <div data-screen-label={tab} style={{
        position: 'absolute', inset: 0, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        paddingBottom: 88, // tab bar
      }}>
        <AppHeader tab={tab}/>
        <div className="cl-scroll" style={{
          flex: 1, overflow: 'auto',
        }}>
          {body}
        </div>
      </div>
      <TabBar active={tab} onChange={(t) => { if (t !== 'read') setArticle(null); setTab(t); }}/>
    </AndroidShell>
  );
}

// ─────── Android device chrome (dark, edge-to-edge PWA) ───────
function AndroidShell({ children }) {
  return (
    <div style={{
      width: 390, height: 820, borderRadius: 44, overflow: 'hidden',
      position: 'relative', background: '#000',
      boxShadow: '0 40px 80px rgba(0,0,0,0.45), 0 0 0 10px #1a1a1a, 0 0 0 11px #2a2a2a',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* camera punch hole */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 12, height: 12, borderRadius: '50%', background: '#000',
        boxShadow: '0 0 0 2px #111, inset 0 0 2px rgba(80,120,180,0.6)',
        zIndex: 80,
      }}/>
      {/* status bar */}
      <AndroidStatusBarDark/>
      {/* app content */}
      {children}
      {/* gesture nav pill */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 70, pointerEvents: 'none',
      }}>
        <div style={{
          width: 120, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.55)',
        }}/>
      </div>
    </div>
  );
}

function AndroidStatusBarDark() {
  const c = '#fff';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 34,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', zIndex: 75, pointerEvents: 'none',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: c, letterSpacing: 0.2 }}>9:30</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* signal */}
        <svg width="14" height="11" viewBox="0 0 14 11">
          <rect x="0" y="8"  width="2.5" height="3"   rx="0.5" fill={c}/>
          <rect x="3.7" y="6"  width="2.5" height="5" rx="0.5" fill={c}/>
          <rect x="7.4" y="3.5"width="2.5" height="7.5"rx="0.5" fill={c}/>
          <rect x="11.1" y="0" width="2.5" height="11" rx="0.5" fill={c}/>
        </svg>
        {/* wifi */}
        <svg width="14" height="11" viewBox="0 0 14 11">
          <path d="M7 2.5C9.2 2.5 11.2 3.4 12.6 4.8L13.7 3.7C12 2 9.6 1 7 1S2 2 0.3 3.7L1.4 4.8C2.8 3.4 4.8 2.5 7 2.5z" fill={c}/>
          <path d="M7 5.6c1.4 0 2.6.5 3.5 1.4l1.1-1.1c-1.2-1.2-2.8-2-4.6-2s-3.4.8-4.6 2L3.5 7c.9-.9 2.1-1.4 3.5-1.4z" fill={c}/>
          <circle cx="7" cy="9.5" r="1.3" fill={c}/>
        </svg>
        {/* battery */}
        <svg width="22" height="11" viewBox="0 0 22 11">
          <rect x="0.5" y="0.5" width="19" height="10" rx="2.5" fill="none" stroke={c} strokeOpacity="0.5"/>
          <rect x="2" y="2" width="16" height="7" rx="1.5" fill={c}/>
          <rect x="20" y="3.5" width="1.5" height="4" rx="0.7" fill={c} fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function Mount() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0e14 0%, #06080c 50%, #000 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <App/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mount/>);

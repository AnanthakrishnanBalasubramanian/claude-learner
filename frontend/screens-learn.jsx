// Learning Paths screen — Phase 5 placeholder
// Globals: React, CL_DATA

const { useState: useStateLearn, useEffect: useEffectLearn } = React;

function LearnScreen() {
  return (
    <div style={{ padding:'8px 16px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60%' }}>
      <div style={{
        width:72, height:72, borderRadius:20, marginBottom:20, marginTop:40,
        background:'linear-gradient(135deg, rgba(255,138,76,0.15), rgba(255,94,135,0.15))',
        border:'1px solid rgba(255,138,76,0.25)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#learn-grad)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="learn-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff8a4c"/>
              <stop offset="100%" stopColor="#ff5e87"/>
            </linearGradient>
          </defs>
          <path d="M12 3L2 8l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 style={{ margin:'0 0 10px', fontSize:22, fontWeight:700, letterSpacing:-0.4, textAlign:'center' }}>
        Learning Paths
      </h2>
      <p style={{ margin:0, fontSize:14, color:'var(--text-2)', lineHeight:1.6, textAlign:'center', padding:'0 24px' }}>
        Curated sequences of articles to take you from beginner to confident on key Claude AI topics.
        <br/><br/>
        <span style={{ color:'var(--text-3)', fontSize:12 }}>Coming soon.</span>
      </p>
    </div>
  );
}

Object.assign(window, { LearnScreen });

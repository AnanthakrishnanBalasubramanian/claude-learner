// Shared UI primitives + Feed + Read screens
// Globals: React, CL_DATA

const { useState } = React;

// ─────── Source tag pill ───────
const SOURCE_COLORS = {
  Official:  { bg: 'rgba(255,138,76,0.16)',  fg: '#ffb38a', dot: '#ff8a4c' },
  Substack:  { bg: 'rgba(255,94,135,0.16)',  fg: '#ff9ab2', dot: '#ff5e87' },
  Community: { bg: 'rgba(120,160,255,0.14)', fg: '#9fb8ff', dot: '#7da0ff' },
  Video:     { bg: 'rgba(180,130,255,0.14)', fg: '#c5a8ff', dot: '#a47cff' },
};

function SourceTag({ kind }) {
  const c = SOURCE_COLORS[kind] || SOURCE_COLORS.Official;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c.bg, color: c.fg,
      padding: '4px 9px 4px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: c.dot }}/>
      {kind}
    </span>
  );
}

// ─────── Article card ───────
function ArticleCard({ article, onRead }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
      borderRadius: 14, padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <SourceTag kind={article.sourceType} />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{article.source}</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>
          {article.readTime} min
        </span>
      </div>

      <h3 style={{
        margin: '0 0 10px', fontSize: 17, fontWeight: 650,
        lineHeight: 1.3, color: 'var(--text)', letterSpacing: -0.2,
      }}>{article.title}</h3>

      <p style={{
        margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.55,
        color: 'var(--text-2)',
      }}>{article.excerpt}</p>

      {/* Why it matters */}
      <div style={{
        background: 'var(--grad-soft)',
        border: '1px solid rgba(255,138,76,0.25)',
        borderRadius: 10, padding: '10px 12px', marginBottom: 14,
      }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          color: '#ffb38a', marginBottom: 4, textTransform: 'uppercase',
        }}>Why it matters</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#ffd9c4' }}>
          {article.why}
        </div>
      </div>

      <button onClick={() => onRead(article)} style={{
        width: '100%', height: 40, borderRadius: 10,
        background: 'var(--grad)', color: '#1a0d08',
        fontWeight: 700, fontSize: 14, letterSpacing: -0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Read article
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h7m0 0L7 4m3 3L7 10" stroke="#1a0d08" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// ─────── Morning Brief ───────
function MorningBrief() {
  const { BRIEF } = window.CL_DATA;
  return (
    <div style={{
      position: 'relative', borderRadius: 18, padding: 18,
      marginBottom: 18, overflow: 'hidden',
      background: 'linear-gradient(135deg, #2a1a1f 0%, #2c1518 60%, #1c1118 100%)',
      border: '1px solid rgba(255,138,76,0.22)',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 180, height: 180,
        borderRadius: '50%', filter: 'blur(40px)',
        background: 'radial-gradient(circle, rgba(255,138,76,0.45), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -50, left: -30, width: 140, height: 140,
        borderRadius: '50%', filter: 'blur(40px)',
        background: 'radial-gradient(circle, rgba(255,94,135,0.35), transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
          color: '#ffb38a', textTransform: 'uppercase', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <SunIcon/>
          Morning brief · {BRIEF.date}
        </div>
        <h2 style={{
          margin: '0 0 6px', fontSize: 22, fontWeight: 700,
          letterSpacing: -0.4, lineHeight: 1.2,
          background: 'var(--grad)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{BRIEF.greeting}</h2>
        <p style={{
          margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.5,
          color: 'var(--text-2)',
        }}>{BRIEF.blurb}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BRIEF.stories.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'var(--grad)', color: '#1a0d08',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 550, color: 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}>{s.title}</div>
              </div>
              <SourceTag kind={s.tag}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="#ffb38a"/>
      <g stroke="#ffb38a" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </g>
    </svg>
  );
}

// ─────── Feed screen ───────
function FeedScreen({ onRead }) {
  const { ARTICLES } = window.CL_DATA;
  return (
    <div style={{ padding: '8px 16px 24px' }}>
      <MorningBrief/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 2px',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: 0.8,
          color: 'var(--text-2)', textTransform: 'uppercase',
        }}>Today's feed</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{ARTICLES.length} stories</div>
      </div>

      {ARTICLES.map(a => <ArticleCard key={a.id} article={a} onRead={onRead}/>)}
    </div>
  );
}

// ─────── Read screen (article reader) ───────
function ReadScreen({ article, onBack }) {
  if (!article) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-2)' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: '40px auto 18px',
          background: 'var(--grad-soft)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="#ffb38a" strokeWidth="1.6"/><path d="M13 3v5h5" stroke="#ffb38a" strokeWidth="1.6"/></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
          Pick something to read
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, padding: '0 24px' }}>
          Tap "Read article" on any feed card and it lands here, with a Feynman-style breakdown.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 16px 24px' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: 'var(--text-2)', fontSize: 14, marginBottom: 14,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>

      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <SourceTag kind={article.sourceType}/>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{article.source}</span>
      </div>

      <h1 style={{
        margin: '0 0 12px', fontSize: 24, fontWeight: 700,
        lineHeight: 1.2, letterSpacing: -0.4,
      }}>{article.title}</h1>

      <div style={{
        display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-3)',
        marginBottom: 18,
      }}>
        <span>{article.readTime} min read</span>
        <span>·</span>
        <span>{article.topic}</span>
      </div>

      {/* Feynman summary */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--line-soft)',
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8,
        }}>Explain it like I'm five</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
          {article.excerpt}
        </p>
      </div>

      {/* Why it matters */}
      <div style={{
        background: 'var(--grad-soft)',
        border: '1px solid rgba(255,138,76,0.25)',
        borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          color: '#ffb38a', marginBottom: 6, textTransform: 'uppercase',
        }}>Why it matters</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#ffd9c4' }}>
          {article.why}
        </p>
      </div>

      <div style={{ height: 1, background: 'var(--line-soft)', margin: '8px 0 18px' }}/>

      <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-2)', margin: '0 0 14px' }}>
        The full article opens in your browser. You'll get a quick recall question on this in tomorrow's quiz, so the bits above are what you actually need to remember.
      </p>

      <button style={{
        width: '100%', height: 44, borderRadius: 11,
        background: 'var(--grad)', color: '#1a0d08',
        fontWeight: 700, fontSize: 15,
      }}>
        Open original ↗
      </button>
    </div>
  );
}

Object.assign(window, { SourceTag, ArticleCard, MorningBrief, FeedScreen, ReadScreen });

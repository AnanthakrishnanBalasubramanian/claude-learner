// Feed + Read screens — with archive, YouTube, Podcast, Challenge
const { useState, useEffect } = React;

// ─── Open in new browser tab ──────────────────────────────
function openURL(url) {
  if (!url || url === '#') return;
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Source tag pill ──────────────────────────────────────
const SOURCE_COLORS = {
  Official:  { bg:'rgba(255,138,76,0.16)',  fg:'#ffb38a', dot:'#ff8a4c' },
  Substack:  { bg:'rgba(255,94,135,0.16)',  fg:'#ff9ab2', dot:'#ff5e87' },
  Community: { bg:'rgba(120,160,255,0.14)', fg:'#9fb8ff', dot:'#7da0ff' },
  Video:     { bg:'rgba(180,130,255,0.14)', fg:'#c5a8ff', dot:'#a47cff' },
  Newsletter:{ bg:'rgba(80,200,140,0.14)',  fg:'#7ad9a8', dot:'#50c88c' },
  Podcast:   { bg:'rgba(255,200,80,0.14)',  fg:'#ffd97a', dot:'#ffca28' },
  X:         { bg:'rgba(200,200,200,0.10)', fg:'#d4d4d4', dot:'#a8a8a8' },
};

function SourceTag({ kind }) {
  const c = SOURCE_COLORS[kind] || SOURCE_COLORS.Official;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background:c.bg, color:c.fg,
      padding:'4px 9px 4px 8px', borderRadius:6,
      fontSize:11, fontWeight:600, letterSpacing:0.2, flexShrink:0,
    }}>
      <span style={{ width:5, height:5, borderRadius:99, background:c.dot }}/>
      {kind}
    </span>
  );
}

// ─── Bookmark star button ─────────────────────────────────
function BookmarkBtn({ articleId, bookmarked, onToggle }) {
  return (
    <button onClick={() => onToggle(articleId)}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      style={{
        width:34, height:34, borderRadius:9, flexShrink:0,
        border: bookmarked ? '1px solid rgba(255,138,76,0.5)' : '1px solid var(--line-soft)',
        background: bookmarked ? 'rgba(255,138,76,0.12)' : 'var(--bg-2)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
      <svg width="14" height="14" viewBox="0 0 16 18" fill={bookmarked ? '#ff8a4c' : 'none'} stroke={bookmarked ? '#ff8a4c' : 'var(--text-3)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 17L8 12.5 2 17V2a1 1 0 011-1h10a1 1 0 011 1v15z"/>
      </svg>
    </button>
  );
}

// ─── YouTube card ─────────────────────────────────────────
function YouTubeCard({ article, isRead, onMarkRead, bookmarked, onBookmark }) {
  return (
    <div style={{
      background:'var(--bg-2)', border:'1px solid var(--line-soft)',
      borderRadius:14, marginBottom:12, overflow:'hidden',
      opacity: isRead ? 0.7 : 1,
    }}>
      {/* Thumbnail with play button overlay */}
      {article.thumbnail && (
        <div style={{ position:'relative', cursor:'pointer' }}
          onClick={() => { openURL(article.url); onMarkRead && onMarkRead(article.id, article.topic); }}>
          <img src={article.thumbnail} alt={article.title}
            style={{ width:'100%', height:180, objectFit:'cover', display:'block' }}/>
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(0,0,0,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{
              width:52, height:52, borderRadius:'50%',
              background:'rgba(255,138,76,0.9)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a0d08">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <SourceTag kind="Video"/>
          <span style={{ fontSize:12, color:'var(--text-2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{article.source}</span>
          <span style={{ fontSize:11, color:'var(--text-3)', flexShrink:0 }}>▶ Video</span>
        </div>
        <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:650, lineHeight:1.3, color:'var(--text)', letterSpacing:-0.2 }}>
          {article.title}
        </h3>
        <p style={{ margin:'0 0 12px', fontSize:13, lineHeight:1.5, color:'var(--text-2)' }}>
          {article.excerpt}
        </p>
        {article.why && (
          <div style={{
            background:'var(--grad-soft)', border:'1px solid rgba(255,138,76,0.25)',
            borderRadius:10, padding:'8px 12px', marginBottom:12,
          }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, color:'#ffb38a', marginBottom:3, textTransform:'uppercase' }}>Why watch</div>
            <div style={{ fontSize:12, lineHeight:1.5, color:'#ffd9c4' }}>{article.why}</div>
          </div>
        )}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { openURL(article.url); onMarkRead && onMarkRead(article.id, article.topic); }}
            style={{
              flex:1, height:38, borderRadius:10,
              background:'var(--grad)', color:'#1a0d08',
              fontWeight:700, fontSize:13,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
            ▶ Watch on YouTube
          </button>
          <BookmarkBtn articleId={article.id} bookmarked={bookmarked} onToggle={onBookmark}/>
          {!isRead && (
            <button onClick={() => onMarkRead && onMarkRead(article.id, article.topic)}
              style={{ width:38, height:38, borderRadius:10, border:'1px solid var(--line-soft)', background:'var(--bg-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8.5l3.5 3.5L14 4" stroke="#7ad9a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Podcast card ─────────────────────────────────────────
function PodcastCard({ article, isRead, onMarkRead, bookmarked, onBookmark }) {
  return (
    <div style={{
      background:'var(--bg-2)', border:'1px solid var(--line-soft)',
      borderRadius:14, padding:14, marginBottom:12,
      opacity: isRead ? 0.7 : 1,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <SourceTag kind="Podcast"/>
        <span style={{ fontSize:12, color:'var(--text-2)' }}>{article.source}</span>
        <span style={{ fontSize:11, color:'var(--text-3)', marginLeft:'auto' }}>🎙 Listen</span>
      </div>
      <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:650, lineHeight:1.3, color:'var(--text)' }}>
        {article.title}
      </h3>
      <p style={{ margin:'0 0 12px', fontSize:13, lineHeight:1.5, color:'var(--text-2)' }}>
        {article.excerpt}
      </p>
      {article.why && (
        <div style={{
          background:'rgba(255,200,80,0.08)', border:'1px solid rgba(255,200,80,0.2)',
          borderRadius:10, padding:'8px 12px', marginBottom:12,
        }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#ffd97a', marginBottom:3, textTransform:'uppercase', letterSpacing:1.2 }}>Why listen</div>
          <div style={{ fontSize:12, lineHeight:1.5, color:'#ffe9a0' }}>{article.why}</div>
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => { openURL(article.url); onMarkRead && onMarkRead(article.id, article.topic); }}
          style={{
            flex:1, height:38, borderRadius:10,
            background:'linear-gradient(135deg, #ffca28, #ff8a4c)',
            color:'#1a0d08', fontWeight:700, fontSize:13,
          }}>
          🎙 Listen to Episode
        </button>
        <BookmarkBtn articleId={article.id} bookmarked={bookmarked} onToggle={onBookmark}/>
      </div>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────
function ArticleCard({ article, onRead, isRead, onMarkRead, bookmarked, onBookmark }) {
  // Route to specialised cards
  if (article.type === 'video') return <YouTubeCard article={article} isRead={isRead} onMarkRead={onMarkRead} bookmarked={bookmarked} onBookmark={onBookmark}/>;
  if (article.type === 'podcast') return <PodcastCard article={article} isRead={isRead} onMarkRead={onMarkRead} bookmarked={bookmarked} onBookmark={onBookmark}/>;

  return (
    <div style={{
      background:'var(--bg-2)', border:'1px solid var(--line-soft)',
      borderRadius:14, padding:16, marginBottom:12,
      opacity: isRead ? 0.7 : 1, transition:'opacity 0.2s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <SourceTag kind={article.sourceType}/>
        <span style={{ fontSize:12, color:'var(--text-2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{article.source}</span>
        <span style={{ fontSize:12, color:'var(--text-3)', flexShrink:0 }}>{article.readTime} min</span>
      </div>
      <h3 style={{ margin:'0 0 10px', fontSize:17, fontWeight:650, lineHeight:1.3, color:'var(--text)', letterSpacing:-0.2 }}>
        {article.title}
      </h3>
      <p style={{ margin:'0 0 14px', fontSize:13.5, lineHeight:1.55, color:'var(--text-2)' }}>
        {article.excerpt}
      </p>
      <div style={{
        background:'var(--grad-soft)', border:'1px solid rgba(255,138,76,0.25)',
        borderRadius:10, padding:'10px 12px', marginBottom:article.analogy ? 10 : 14,
      }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#ffb38a', marginBottom:4, textTransform:'uppercase' }}>Why it matters</div>
        <div style={{ fontSize:12.5, lineHeight:1.5, color:'#ffd9c4' }}>{article.why}</div>
      </div>
      {article.analogy ? (
        <div style={{
          background:'rgba(120,160,255,0.06)', border:'1px solid rgba(120,160,255,0.15)',
          borderRadius:10, padding:'10px 12px', marginBottom:14,
        }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#9fb8ff', marginBottom:4, textTransform:'uppercase' }}>Think of it like this</div>
          <div style={{ fontSize:12.5, lineHeight:1.5, color:'#c5d8ff' }}>{article.analogy}</div>
        </div>
      ) : <div style={{ marginBottom:14 }}/>}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => { onRead(article); openURL(article.url); onMarkRead && onMarkRead(article.id, article.topic); }}
          style={{
            flex:1, height:40, borderRadius:10,
            background:'var(--grad)', color:'#1a0d08',
            fontWeight:700, fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
          Read article
          <svg width="13" height="13" viewBox="0 0 14 14"><path d="M3 7h7m0 0L7 4m3 3L7 10" stroke="#1a0d08" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <BookmarkBtn articleId={article.id} bookmarked={bookmarked} onToggle={onBookmark}/>
        {!isRead ? (
          <button onClick={() => onMarkRead && onMarkRead(article.id, article.topic)}
            style={{ width:40, height:40, borderRadius:10, border:'1px solid var(--line-soft)', background:'var(--bg-2)', display:'flex', alignItems:'center', justifyContent:'center' }}
            title="Mark as read">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8.5l3.5 3.5L14 4" stroke="#7ad9a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(80,200,140,0.12)', border:'1px solid rgba(80,200,140,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8.5l3.5 3.5L14 4" stroke="#7ad9a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Daily Challenge card ─────────────────────────────────
function ChallengeCard() {
  const ch = window.CL_DATA.CHALLENGE;
  const [ctaDone, setCtaDone]     = useState(false);
  const [answer, setAnswer]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]   = useState(null);
  const [showReflect, setShowReflect] = useState(false);
  if (!ch) return null;

  const isOpen = ch.type === 'openquestion';

  const typeColors = {
    prompt:       { bg:'rgba(255,94,135,0.10)', border:'rgba(255,94,135,0.25)', label:'#ff9ab2' },
    code:         { bg:'rgba(80,200,140,0.10)', border:'rgba(80,200,140,0.25)', label:'#7ad9a8' },
    openquestion: { bg:'rgba(120,160,255,0.10)', border:'rgba(120,160,255,0.25)', label:'#9fb8ff' },
  };
  const colors = typeColors[ch.type] || typeColors.prompt;

  async function submitAnswer() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        'https://us-central1-claude-learner.cloudfunctions.net/evaluateAnswer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: ch.content, answer: answer.trim() }),
        }
      );
      const data = await res.json();
      setFeedback(data.feedback || 'Great reflection! Keep thinking about this.');
    } catch {
      setFeedback('Great effort! Every reflection builds your understanding. Try discussing this with Claude for deeper feedback.');
    }
    setSubmitting(false);
  }

  return (
    <div style={{
      background: colors.bg, border:`1px solid ${colors.border}`,
      borderRadius:16, padding:16, marginBottom:18,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{ch.icon}</span>
        <div>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:colors.label, textTransform:'uppercase' }}>
            Today's Challenge
          </div>
          <div style={{ fontSize:15, fontWeight:650, color:'var(--text)', marginTop:1 }}>{ch.title}</div>
        </div>
      </div>
      <p style={{ margin:'0 0 8px', fontSize:12.5, color:'var(--text-2)', lineHeight:1.5 }}>
        {ch.instruction}
      </p>
      <div style={{
        background:'rgba(0,0,0,0.25)', borderRadius:10,
        padding:'10px 12px', marginBottom:14,
        border:'1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ margin:0, fontSize:13, color:'var(--text)', lineHeight:1.6, fontStyle:'italic' }}>
          "{ch.content}"
        </p>
      </div>

      {/* Answer area — always visible for openquestion, toggleable for others */}
      {!isOpen && !ctaDone && (
        <div style={{ display:'flex', gap:8, marginBottom:showReflect ? 10 : 0 }}>
          <button onClick={() => { openURL(ch.url); setCtaDone(true); setShowReflect(true); }}
            style={{
              flex:1, height:38, borderRadius:10,
              background:'var(--grad)', color:'#1a0d08',
              fontWeight:700, fontSize:13,
            }}>
            {ch.cta} ↗
          </button>
        </div>
      )}
      {ctaDone && !isOpen && (
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <div style={{ flex:1, height:38, borderRadius:10, background:'rgba(80,200,140,0.15)', border:'1px solid rgba(80,200,140,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#7ad9a8' }}>✓ Challenge opened!</span>
          </div>
          <button onClick={() => setShowReflect(r => !r)}
            style={{ padding:'0 12px', height:38, borderRadius:10, border:'1px solid var(--line-soft)', background:'var(--bg-2)', fontSize:12, color:'var(--text-2)', fontWeight:600 }}>
            {showReflect ? 'Hide' : 'Reflect'}
          </button>
        </div>
      )}

      {(isOpen || showReflect) && !feedback && (
        <div style={{ marginTop: isOpen ? 0 : 4 }}>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder={isOpen ? 'Type your answer here...' : 'How did it go? Write a quick reflection...'}
            style={{
              width:'100%', minHeight:80, borderRadius:10, padding:'10px 12px',
              background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)',
              color:'var(--text)', fontSize:13, lineHeight:1.5, resize:'vertical',
              boxSizing:'border-box', fontFamily:'inherit',
            }}
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || submitting}
            style={{
              marginTop:8, width:'100%', height:38, borderRadius:10,
              background: answer.trim() ? 'var(--grad)' : 'var(--bg-3)',
              color: answer.trim() ? '#1a0d08' : 'var(--text-3)',
              fontWeight:700, fontSize:13,
              transition:'all 200ms',
            }}>
            {submitting ? 'Evaluating...' : 'Get AI feedback ✦'}
          </button>
        </div>
      )}

      {feedback && (
        <div style={{
          marginTop:8, padding:'12px 14px', borderRadius:10,
          background:'rgba(120,160,255,0.12)', border:'1px solid rgba(120,160,255,0.25)',
        }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#9fb8ff', marginBottom:6, textTransform:'uppercase' }}>
            AI Feedback
          </div>
          <p style={{ margin:0, fontSize:13, lineHeight:1.6, color:'var(--text)' }}>{feedback}</p>
          <button onClick={() => { setFeedback(null); setAnswer(''); }}
            style={{ marginTop:10, fontSize:11, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            Try again →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Morning Brief ────────────────────────────────────────
function MorningBrief() {
  const { BRIEF } = window.CL_DATA;
  return (
    <div style={{
      position:'relative', borderRadius:18, padding:18, marginBottom:14, overflow:'hidden',
      background:'linear-gradient(135deg, #2a1a1f 0%, #2c1518 60%, #1c1118 100%)',
      border:'1px solid rgba(255,138,76,0.22)',
    }}>
      <div style={{ position:'absolute', top:-60, right:-40, width:180, height:180, borderRadius:'50%', filter:'blur(40px)', background:'radial-gradient(circle, rgba(255,138,76,0.45), transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-50, left:-30, width:140, height:140, borderRadius:'50%', filter:'blur(40px)', background:'radial-gradient(circle, rgba(255,94,135,0.35), transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'relative' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.4, color:'#ffb38a', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
          <SunIcon/> Morning brief · {BRIEF.date}
        </div>
        <h2 style={{ margin:'0 0 6px', fontSize:22, fontWeight:700, letterSpacing:-0.4, lineHeight:1.2, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          {BRIEF.greeting}
        </h2>
        <p style={{ margin:'0 0 14px', fontSize:13.5, lineHeight:1.5, color:'var(--text-2)' }}>{BRIEF.blurb}</p>
        {BRIEF.stories.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {BRIEF.stories.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width:22, height:22, borderRadius:6, background:'var(--grad)', color:'#1a0d08', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:550, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.3 }}>{s.title}</div>
                </div>
                <SourceTag kind={s.tag}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SunIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="#ffb38a"/><g stroke="#ffb38a" strokeWidth="2" strokeLinecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>;
}

// ─── Feed screen — with date archive tabs ─────────────────
function FeedScreen({ onRead }) {
  const [articles, setArticles]       = useState(window.CL_DATA.ARTICLES || []);
  const [brief, setBrief]             = useState(window.CL_DATA.BRIEF);
  const [readIds, setReadIds]         = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(window.CL_DATA.BOOKMARK_IDS || []);
  const [loading, setLoading]         = useState(window.CL_DATA.loading);
  const [selectedDay, setSelectedDay] = useState('today');
  const [filter, setFilter]           = useState('All');
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => {
    const onReady = () => {
      const arts = window.CL_DATA.ARTICLES || [];
      setArticles(arts);
      setBrief(window.CL_DATA.BRIEF);
      setBookmarkIds(window.CL_DATA.BOOKMARK_IDS || []);
      setLoading(false);
      setRefreshing(false);
      // Auto-switch to most recent day if today has no articles
      const todayStr = new Date().toISOString().split('T')[0];
      const todayArts = arts.filter(a => a.day === todayStr);
      if (todayArts.length === 0 && arts.length > 0) {
        const days = [...new Set(arts.map(a => a.day))].sort((a,b) => b.localeCompare(a));
        if (days.length > 0) setSelectedDay(days[0]);
      }
    };
    const onLoading = () => setLoading(true);
    window.addEventListener('cl-data-ready', onReady);
    window.addEventListener('cl-data-loading', onLoading);
    return () => {
      window.removeEventListener('cl-data-ready', onReady);
      window.removeEventListener('cl-data-loading', onLoading);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    if (window.CL_DATA.refreshData) await window.CL_DATA.refreshData();
  }

  async function handleMarkRead(articleId, topic) {
    if (readIds.includes(articleId)) return;
    setReadIds(prev => [...prev, articleId]);
    if (window.CL_DATA.markRead) await window.CL_DATA.markRead(articleId, topic);
  }

  async function handleBookmark(articleId) {
    // Optimistic update
    const next = bookmarkIds.includes(articleId)
      ? bookmarkIds.filter(id => id !== articleId)
      : [...bookmarkIds, articleId];
    setBookmarkIds(next);
    window.CL_DATA.BOOKMARK_IDS = next;
    if (window.CL_DATA.toggleBookmark) await window.CL_DATA.toggleBookmark(articleId);
  }

  // Get unique days from all articles
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yday      = yesterday.toISOString().split('T')[0];

  const allDays = [...new Set(articles.map(a => a.day))].sort((a,b) => b.localeCompare(a));

  function dayLabel(d) {
    if (d === today)   return 'Today';
    if (d === yday)    return 'Yesterday';
    return new Date(d).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
  }

  // Saved filter spans all days; others respect selected day
  const dayKey = selectedDay === 'today' ? today : selectedDay;
  let shown = filter === 'Saved'
    ? articles.filter(a => bookmarkIds.includes(a.id))
    : articles.filter(a => a.day === dayKey);

  // Filter by type
  const FILTERS = ['All','Articles','Videos','Community','Saved'];
  if (filter === 'Articles')  shown = shown.filter(a => a.type === 'article');
  if (filter === 'Videos')    shown = shown.filter(a => a.type === 'video');
  if (filter === 'Community') shown = shown.filter(a => a.type === 'community');

  return (
    <div style={{ padding:'8px 16px 24px' }}>
      <MorningBrief/>
      <ChallengeCard/>

      {/* Date archive tabs — hidden when viewing Saved */}
      {allDays.length > 1 && filter !== 'Saved' && (
        <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:4 }}
          className="cl-scroll">
          {allDays.map(d => (
            <button key={d}
              onClick={() => setSelectedDay(d === today ? 'today' : d)}
              style={{
                padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600,
                whiteSpace:'nowrap', flexShrink:0,
                background: (selectedDay === 'today' ? today : selectedDay) === d
                  ? 'var(--grad)' : 'var(--bg-2)',
                color: (selectedDay === 'today' ? today : selectedDay) === d
                  ? '#1a0d08' : 'var(--text-2)',
                border:'1px solid var(--line-soft)',
              }}>
              {dayLabel(d)}
            </button>
          ))}
        </div>
      )}

      {/* Type filters */}
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600,
              background: filter === f ? 'var(--bg-3)' : 'transparent',
              color: filter === f ? 'var(--text)' : 'var(--text-3)',
              border: filter === f ? '1px solid var(--line)' : '1px solid transparent',
            }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, padding:'0 2px' }}>
        <div style={{ fontSize:13, fontWeight:700, letterSpacing:0.8, color:'var(--text-2)', textTransform:'uppercase' }}>
          {dayLabel(dayKey === 'today' ? today : dayKey)}'s feed
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'var(--text-3)' }}>
            {loading ? 'Loading...' : `${shown.length} stories`}
          </span>
          <button onClick={handleRefresh} disabled={refreshing || loading}
            title="Refresh articles from server"
            style={{
              width:30, height:30, borderRadius:8, border:'1px solid var(--line-soft)',
              background:'var(--bg-2)', display:'flex', alignItems:'center', justifyContent:'center',
              opacity: (refreshing || loading) ? 0.5 : 1,
            }}>
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: refreshing ? 'transform 1s linear' : 'none' }}>
              <path d="M1 4v5h5"/><path d="M17 14v-5h-5"/>
              <path d="M15.5 7A7 7 0 0 0 3.5 5L1 9M2.5 11A7 7 0 0 0 14.5 13L17 9"/>
            </svg>
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-3)', fontSize:14 }}>
          Fetching articles...
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 16px', color:'var(--text-2)', fontSize:14, lineHeight:1.6 }}>
          {filter === 'Saved' ? (
            <>No bookmarks yet. Tap the 🔖 icon on any article to save it.</>
          ) : (
            <>
              No articles for this day yet.
              {dayKey === today && (
                <>
                  <br/>The daily fetch runs at 9:02 AM IST.
                  <br/>
                  <button onClick={() => openURL('https://us-central1-claude-learner.cloudfunctions.net/manualFetch?secret=learnclaude123')}
                    style={{ marginTop:14, padding:'10px 20px', borderRadius:10, background:'var(--grad)', color:'#1a0d08', fontWeight:700, fontSize:13 }}>
                    Fetch now manually ↗
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {shown.map(a => (
        <ArticleCard key={a.id} article={a} onRead={onRead}
          isRead={readIds.includes(a.id)} onMarkRead={handleMarkRead}
          bookmarked={bookmarkIds.includes(a.id)} onBookmark={handleBookmark}/>
      ))}
    </div>
  );
}

// ─── Read screen ──────────────────────────────────────────
function ReadScreen({ article, onBack }) {
  if (!article) {
    return (
      <div style={{ padding:24, textAlign:'center', color:'var(--text-2)' }}>
        <div style={{ width:56, height:56, borderRadius:14, margin:'40px auto 18px', background:'var(--grad-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="#ffb38a" strokeWidth="1.6"/><path d="M13 3v5h5" stroke="#ffb38a" strokeWidth="1.6"/></svg>
        </div>
        <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:6 }}>Pick something to read</div>
        <div style={{ fontSize:13, lineHeight:1.5, padding:'0 24px' }}>Tap "Read article" on any feed card and it opens here with a full Feynman breakdown.</div>
      </div>
    );
  }

  return (
    <div style={{ padding:'8px 16px 24px' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-2)', fontSize:14, marginBottom:14 }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to feed
      </button>
      <div style={{ marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
        <SourceTag kind={article.sourceType}/>
        <span style={{ fontSize:12, color:'var(--text-2)' }}>{article.source}</span>
      </div>
      <h1 style={{ margin:'0 0 12px', fontSize:24, fontWeight:700, lineHeight:1.2, letterSpacing:-0.4 }}>{article.title}</h1>
      <div style={{ display:'flex', gap:14, fontSize:12, color:'var(--text-3)', marginBottom:18 }}>
        <span>{article.type === 'video' ? '▶ Video' : `${article.readTime} min read`}</span>
        <span>·</span><span>{article.topic}</span>
      </div>
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--line-soft)', borderRadius:14, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'var(--text-2)', textTransform:'uppercase', marginBottom:8 }}>Explain it like I'm five</div>
        <p style={{ margin:0, fontSize:15, lineHeight:1.6, color:'var(--text)' }}>{article.excerpt}</p>
      </div>
      {article.why && (
        <div style={{ background:'var(--grad-soft)', border:'1px solid rgba(255,138,76,0.25)', borderRadius:14, padding:16, marginBottom:14 }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#ffb38a', marginBottom:6, textTransform:'uppercase' }}>Why it matters</div>
          <p style={{ margin:0, fontSize:14, lineHeight:1.55, color:'#ffd9c4' }}>{article.why}</p>
        </div>
      )}
      {article.analogy && (
        <div style={{ background:'rgba(120,160,255,0.06)', border:'1px solid rgba(120,160,255,0.15)', borderRadius:14, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#9fb8ff', marginBottom:6, textTransform:'uppercase' }}>Think of it like this</div>
          <p style={{ margin:0, fontSize:14, lineHeight:1.55, color:'#c5d8ff' }}>{article.analogy}</p>
        </div>
      )}
      <div style={{ height:1, background:'var(--line-soft)', margin:'8px 0 18px' }}/>
      <button onClick={() => openURL(article.url)}
        style={{ width:'100%', height:44, borderRadius:11, background:'var(--grad)', color:'#1a0d08', fontWeight:700, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        {article.type === 'video' ? '▶ Watch on YouTube ↗' : 'Open original article ↗'}
      </button>
    </div>
  );
}

Object.assign(window, { SourceTag, ArticleCard, YouTubeCard, PodcastCard, ChallengeCard, MorningBrief, FeedScreen, ReadScreen });

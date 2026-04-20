// Article + quiz data for Claude Learner

const ARTICLES = [
  {
    id: 'a1',
    sourceType: 'Official',
    source: 'Anthropic Engineering',
    title: 'Sub-agents and the new context-window economy',
    readTime: 6,
    excerpt: 'When you spawn a sub-agent, you are essentially renting a fresh brain that does one job and then disappears. The trick is knowing what to delegate.',
    why: 'Most teams overload the main agent with tool calls. Splitting work into sub-agents cuts cost ~40% and avoids context rot on long tasks.',
    topic: 'Agents',
  },
  {
    id: 'a2',
    sourceType: 'Substack',
    source: 'Latent Space',
    title: 'Why prompt caching changed our infra bill more than fine-tuning',
    readTime: 4,
    excerpt: 'Think of caching like leaving sticky notes on the fridge. The model does not re-read your 40-page system prompt every turn — it just picks up where it left off.',
    why: 'Caching is the lowest-effort, highest-impact optimization available right now. Anyone shipping repeated prompts is leaving money on the table.',
    topic: 'Performance',
  },
  {
    id: 'a3',
    sourceType: 'Community',
    source: 'r/ClaudeAI · u/devhaus',
    title: 'I gave Claude a CLI and it built itself a debugger',
    readTime: 3,
    excerpt: 'Once a model can read its own logs and re-run the program, it stops asking you for help and starts behaving like a junior engineer who never sleeps.',
    why: 'A glimpse at where dev tooling is going. Closed-loop, self-correcting agents are crossing the threshold from demo to daily-driver.',
    topic: 'Tooling',
  },
  {
    id: 'a4',
    sourceType: 'Video',
    source: 'YouTube · 22 min',
    title: 'Constitutional AI, explained without the math',
    readTime: 22,
    excerpt: 'Imagine teaching a kid manners by writing the rules on the fridge instead of slapping their hand each time. That is what Constitutional AI does for models.',
    why: 'Helps you reason about why Claude behaves the way it does, and how to write better system prompts that work with — not against — that training.',
    topic: 'Alignment',
  },
  {
    id: 'a5',
    sourceType: 'Official',
    source: 'Anthropic Docs',
    title: 'Tool use without making your model anxious',
    readTime: 5,
    excerpt: 'Models behave like a new hire with too many Slack channels. Give them five tools max, name them like verbs, and describe when NOT to use each one.',
    why: 'Tool selection is the #1 reason agent demos fall apart in production. The fix is mostly copywriting, not code.',
    topic: 'Agents',
  },
];

const BRIEF = {
  greeting: 'Good morning, Ak',
  date: 'Sunday · Apr 19',
  blurb: "Here's your 4-minute brief. Three stories caught the community's attention overnight.",
  stories: [
    { tag: 'Official', title: 'Sub-agents and the new context-window economy' },
    { tag: 'Substack', title: 'Prompt caching beat fine-tuning on our bill' },
    { tag: 'Video',    title: 'Constitutional AI, explained without the math' },
  ],
};

const QUIZ = [
  {
    q: 'What is the main reason to delegate work to a sub-agent instead of letting the main agent handle it?',
    options: [
      'Sub-agents run on cheaper models by default',
      'To keep the main context window focused and reduce token cost',
      'Sub-agents can call tools the main agent cannot',
      'It is required by the Anthropic API',
    ],
    correct: 1,
    explain: "Sub-agents act like specialists you spin up for one job. They keep the main agent's context tidy, which avoids the slow drift in quality that happens on long tasks — and yes, it usually costs less too.",
  },
  {
    q: 'Prompt caching helps most when…',
    options: [
      'Your prompts change drastically every call',
      'You are using a fine-tuned model',
      'You repeat the same long system prompt across many calls',
      'You only ever send one message at a time',
    ],
    correct: 2,
    explain: 'Caching shines when there is a stable, expensive prefix the model can reuse. Long system prompts, tool schemas, and reference docs are the textbook cases.',
  },
  {
    q: 'A common failure mode when giving a model many tools is…',
    options: [
      'The model forgets which tool to pick and stalls',
      'Tools cost extra per call',
      'The model refuses to use any of them',
      'Latency drops below useful thresholds',
    ],
    correct: 0,
    explain: 'Too many similarly-named tools is paralysis-by-choice. Naming them like verbs and adding a "when NOT to use this" line in the description fixes most cases.',
  },
];

const PROGRESS = {
  streak: 12,
  days: [true, true, true, true, true, true, true, true, true, true, true, true, false, false],
  stats: {
    read: 47,
    accuracy: 84,
    streakBest: 18,
    topics: 6,
  },
  topics: [
    { name: 'Agents',      pct: 78 },
    { name: 'Performance', pct: 64 },
    { name: 'Alignment',   pct: 41 },
    { name: 'Tooling',     pct: 55 },
    { name: 'Evals',       pct: 22 },
    { name: 'Safety',      pct: 12 },
  ],
};

window.CL_DATA = { ARTICLES, BRIEF, QUIZ, PROGRESS };

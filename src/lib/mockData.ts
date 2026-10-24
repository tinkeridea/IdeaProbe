/**
 * PREPARED DEMO DATA — Phase 3 Comprehensive Demo Fixtures
 *
 * ⚠️  ALL DATA ON THIS PAGE IS PREPARED DEMO CONTENT — NOT REAL RESEARCH OR CUSTOMER EVIDENCE.
 *
 * Provenance labeling policy (Decision D04):
 *  - SAMPLE  → market figures, competitor data, source excerpts prepared as illustrative fixtures.
 *  - SIMULATED → AI-generated persona dialogue. NEVER counts as proof of demand.
 *  - AI_INFERENCE → generated patterns, insights, plans derived from SAMPLE inputs.
 *  - USER_INPUT → fields the founder supplied in the intake form.
 *
 * See: IdeaProbe_Documentation_Kit/docs/research-evidence-policy.md
 */

import type {
  MockRunDetail,
  Project,
  Run,
  Stage,
  EvidenceItem,
  ClarifyingQuestion,
  Competitor,
  Persona,
  Interview,
  InterviewTurn,
  Insight,
  Assumption,
  Experiment,
  MVPFeature,
  ReportSnapshot,
  ICPProfile,
} from "@/types";

// ══════════════════════════════════════════════════════════════════════
// SECTION 1 — DEMO PROJECT: AI Study Planner
// ══════════════════════════════════════════════════════════════════════

export const DEMO_PROJECT: Project = {
  id: "proj-study-planner",
  title: "AI Adaptive Study Planner for College Students",
  ideaText:
    "An AI-powered adaptive study planner for undergraduate engineering and commerce students in India. It builds dynamic study schedules based on upcoming semester exams, past mock scores, and daily self-reported energy levels.",
  problem:
    "College students struggle with exam anxiety and inefficient cramming because existing calendar apps require manual rescheduling and generic study methods don't adapt to student fatigue or weak topics.",
  targetCustomer:
    "Undergraduate college students (Tier 1 & 2 cities in India) facing dense semester exam schedules with 5+ courses simultaneously.",
  solution:
    "A mobile-first web app that integrates exam timetables, diagnoses weak topics via short practice prompts, and automatically shifts study blocks when students miss sessions without punitive guilt.",
  geography: "India (Tier 1 & Tier 2 university hubs)",
  category: "EdTech",
  alternatives:
    "Notion templates (too manual), Google Calendar (rigid, no topic awareness), generic timers like Forest (no study plans), unorganized WhatsApp peer study groups.",
  stage: "Idea / Problem Validation",
  constraints: "Zero subscription budget per student; reliance on freemium or institutional sponsorship.",
  goals: "Achieve 40% 30-day retention on daily study schedule adherence among a pilot batch of 50 students.",
  provenance: "SAMPLE",
  status: "active",
  mode: "DEMO",
  createdAt: "2026-10-24T00:00:00Z",
  updatedAt: "2026-10-24T00:00:00Z",
};

export const DEMO_RUN: Run = {
  id: "demo-run-001",
  projectId: "proj-study-planner",
  status: "completed",
  mode: "demo_fixture",
  modelName: "qwen2.5:3b (Target — not yet running)",
  promptVersion: "phase3-demo-v1",
  startedAt: "2026-10-24T01:00:00Z",
  completedAt: "2026-10-24T01:04:30Z",
};

export const DEMO_STAGES: Stage[] = [
  { id: "s-research", runId: "demo-run-001", stageKey: "research", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:00:05Z", completedAt: "2026-10-24T01:00:45Z",
    outputJson: { provenance: "SAMPLE", summary: "Identified 4 industry reports on Indian EdTech post-exam prep trends and high smartphone adoption among undergrads.", itemCount: 4 }},
  { id: "s-competitors", runId: "demo-run-001", stageKey: "competitors", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:00:45Z", completedAt: "2026-10-24T01:01:15Z",
    outputJson: { provenance: "SAMPLE", summary: "Mapped 5 direct/indirect alternatives: Notion Study Templates, Exam Countdown, Forest, Quizlet, and Manual Notebooks.", itemCount: 5 }},
  { id: "s-icp", runId: "demo-run-001", stageKey: "icp", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:01:15Z", completedAt: "2026-10-24T01:01:45Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "High-priority ICP: 2nd/3rd year engineering students with backlogs or competitive exam prep (GATE, CAT)." }},
  { id: "s-personas", runId: "demo-run-001", stageKey: "personas", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:01:45Z", completedAt: "2026-10-24T01:02:15Z",
    outputJson: { provenance: "SIMULATED", summary: "Generated 2 simulated personas: 'Arjun' and 'Priya'.", caveat: "SIMULATED ARTIFACT — Not real customer evidence.", itemCount: 2 }},
  { id: "s-interviews", runId: "demo-run-001", stageKey: "interviews", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:02:15Z", completedAt: "2026-10-24T01:02:55Z",
    outputJson: { provenance: "SIMULATED", summary: "2 synthetic interviews surfacing key objection: 'I don't have time to configure an app when exams are 10 days away'.", caveat: "NEVER use synthetic interviews as proof of market demand.", itemCount: 2 }},
  { id: "s-insights", runId: "demo-run-001", stageKey: "insights", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:02:55Z", completedAt: "2026-10-24T01:03:25Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "Critical pattern: Onboarding must take < 60 seconds; syllabus upload via photo/PDF is required." }},
  { id: "s-risks", runId: "demo-run-001", stageKey: "risks", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:03:25Z", completedAt: "2026-10-24T01:03:50Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "4 critical assumptions ranked. Top risk: Students will not pay subscription fees." }},
  { id: "s-experiments", runId: "demo-run-001", stageKey: "experiments", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:03:50Z", completedAt: "2026-10-24T01:04:10Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "2 falsifiable experiments: WhatsApp concierge test + Landing page pre-signup." }},
  { id: "s-mvp", runId: "demo-run-001", stageKey: "mvp", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:04:10Z", completedAt: "2026-10-24T01:04:25Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "MVP defined: 3 core 'Now' features (Exam countdown, auto-reschedule, daily 3-task push)." }},
  { id: "s-report", runId: "demo-run-001", stageKey: "report", status: "completed", attempt: 1,
    startedAt: "2026-10-24T01:04:25Z", completedAt: "2026-10-24T01:04:30Z",
    outputJson: { provenance: "AI_INFERENCE", summary: "Unified Founder Validation Report generated with full provenance audit trail." }},
];

export const DEMO_RUN_DETAIL: MockRunDetail = {
  run: DEMO_RUN,
  project: DEMO_PROJECT,
  stages: DEMO_STAGES,
};

// ══════════════════════════════════════════════════════════════════════
// SECTION 2 — DASHBOARD PROJECT LIST (F02)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_PROJECTS_LIST: Project[] = [
  DEMO_PROJECT,
  {
    id: "proj-agri-iot",
    title: "AgriSense: Soil Moisture Alert for Smallholder Farmers",
    ideaText: "Affordable solar-powered IoT soil sensors connected via GSM to send WhatsApp/SMS irrigation alerts in regional vernacular languages.",
    problem: "Smallholder farmers over-irrigate or underwater crops due to lack of localized soil moisture data.",
    targetCustomer: "Smallholder tomato and onion farmers in Maharashtra.",
    solution: "Low-cost $15 sensor spike + vernacular WhatsApp alerts.",
    geography: "Rural Western India",
    category: "AgriTech",
    stage: "Idea",
    provenance: "SAMPLE",
    status: "draft",
    mode: "DEMO",
    createdAt: "2026-10-23T14:30:00Z",
    updatedAt: "2026-10-23T16:00:00Z",
  },
  {
    id: "proj-freelance-tax",
    title: "TaxPilot: Automated GST Filing for Indian Freelancers",
    ideaText: "One-click GST and advance tax compliance app connecting to bank feeds for digital creators and independent contractors.",
    problem: "Independent knowledge workers pay hefty penalties because quarterly GST compliance is convoluted.",
    targetCustomer: "Freelance designers, software developers, and content creators.",
    solution: "Automated invoice reconciler + CA-reviewed filing workflow.",
    geography: "India",
    category: "FinTech",
    stage: "Problem Validation",
    provenance: "SAMPLE",
    status: "draft",
    mode: "DEMO",
    createdAt: "2026-10-22T09:15:00Z",
    updatedAt: "2026-10-22T11:45:00Z",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 3 — CLARIFYING QUESTIONS (F01 / D12)
// ══════════════════════════════════════════════════════════════════════

export const SAMPLE_CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  {
    id: "q-1",
    category: "customer",
    question: "Are your initial users students studying for university semester exams, or standardized competitive tests (e.g. JEE, NEET, UPSC)?",
    assumptionIfBlank: "Assumed: Undergrad university semester exams with 5-6 concurrent subjects.",
  },
  {
    id: "q-2",
    category: "business_model",
    question: "Do you plan to monetize directly through student micro-subscriptions (₹99-199/month) or by licensing to colleges/coaching institutes?",
    assumptionIfBlank: "Assumed: Direct-to-student freemium model with monetization unvalidated.",
  },
  {
    id: "q-3",
    category: "distribution",
    question: "How will students discover the app during the critical 2-week pre-exam panic window?",
    assumptionIfBlank: "Assumed: Peer referrals, WhatsApp college groups, and campus ambassador outreach.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 4 — EVIDENCE LEDGER (F05 / F06)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev-01",
    runId: "demo-run-001",
    projectId: "proj-study-planner",
    url: "https://example.edu/research/indian-higher-ed-stress-2025",
    title: "State of Indian Higher Education & Student Mental Health 2025",
    publisher: "EdTech Research Journal India",
    retrievedAt: "2026-10-24T00:00:00Z",
    publishedAt: "2025-08-15T00:00:00Z",
    excerpt: "Over 68% of undergraduate engineering students surveyed reported feeling overwhelmed by concurrent assignment deadlines and semester exams, with 74% relying on last-minute 48-hour cramming sessions.",
    claim: "68% of undergrads report last-minute cramming",
    sourceType: "web",
    provenance: "SAMPLE",
    confidence: "Low",
    reviewerStatus: "ACCEPTED",
    status: "unverified",
    caveat: "Unverified sample — source is a placeholder (RFC 2606 example domain). For demonstration only.",
  },
  {
    id: "ev-02",
    runId: "demo-run-001",
    projectId: "proj-study-planner",
    url: "https://example.org/reports/mobile-learning-churn",
    title: "Mobile App Adherence in Higher Education Report",
    publisher: "Digital Learning Review",
    retrievedAt: "2026-10-24T00:00:00Z",
    publishedAt: "2025-11-01T00:00:00Z",
    excerpt: "Study timer and planner apps experience an average 82% 14-day abandonment rate if schedule adjustments require more than 3 user taps. Apps with auto-reschedule retain 3.1× more users at 30 days.",
    claim: "Planner apps with auto-reschedule retain 3.1× more users at 30 days",
    sourceType: "web",
    provenance: "SAMPLE",
    confidence: "Low",
    reviewerStatus: "ACCEPTED",
    status: "unverified",
    caveat: "Unverified sample — source is a placeholder (RFC 2606 example domain). For demonstration only.",
  },
  {
    id: "ev-03",
    runId: "demo-run-001",
    projectId: "proj-study-planner",
    url: "https://example.in/edtech-market-report-india-2026",
    title: "India EdTech Market Outlook 2026",
    publisher: "Blume Ventures Research",
    retrievedAt: "2026-10-24T00:00:00Z",
    publishedAt: "2026-01-10T00:00:00Z",
    excerpt: "K-12 focused apps dominate EdTech revenue; under-18 market is 6× more monetized than 18-25 college segment. College-focused tools face severe monetization headwinds due to free alternatives.",
    claim: "Counter-signal: College-focused EdTech tools face severe monetization challenges",
    sourceType: "web",
    provenance: "SAMPLE",
    confidence: "Low",
    reviewerStatus: "ACCEPTED",
    status: "unverified",
    caveat: "Unverified sample — source is a placeholder (RFC 2606 example domain). Counter-evidence to monetization assumption. For demonstration only.",
  },
  {
    id: "ev-04",
    runId: "demo-run-001",
    projectId: "proj-study-planner",
    title: "Founder Research: WhatsApp Study Group Survey (20 students)",
    publisher: "User (primary research)",
    retrievedAt: "2026-10-24T00:00:00Z",
    excerpt: "Founder manually asked 20 engineering students about exam study tools. 17 of 20 said they rely on peer chat groups; 12 of 20 said they have tried a planner app and abandoned it within a week.",
    claim: "60% of polled students abandoned planner apps within 1 week",
    sourceType: "user_input",
    provenance: "USER_INPUT",
    confidence: "Medium",
    reviewerStatus: "UNREVIEWED",
    status: "unverified",
    caveat: "Small non-random sample of 20 students. Cannot generalize. Useful for hypothesis formation only.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 5 — COMPETITORS (F07)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_COMPETITORS: Competitor[] = [
  {
    id: "comp-01",
    projectId: "proj-study-planner",
    name: "Notion Study Templates",
    category: "substitute",
    description: "Manual Kanban-style task lists and study calendars built by students in Notion. Popular in Tier 1 colleges.",
    differentiator: "IdeaProbe Study Planner auto-adapts; Notion requires full manual rescheduling every time a session is missed.",
    provenance: "SAMPLE",
  },
  {
    id: "comp-02",
    projectId: "proj-study-planner",
    name: "Forest — Focus & Productivity Timer",
    category: "indirect",
    description: "Gamified Pomodoro timer. Helps with focus blocks but has zero subject-awareness or exam scheduling.",
    differentiator: "Forest keeps you off your phone; our planner tells you what to study next. Different jobs.",
    provenance: "SAMPLE",
  },
  {
    id: "comp-03",
    projectId: "proj-study-planner",
    name: "Quizlet",
    category: "indirect",
    description: "Flashcard and MCQ learning tool. Strong on revision content, zero on scheduling or time management.",
    differentiator: "Quizlet is content; we are the calendar + motivation layer. Could integrate as a content source.",
    provenance: "SAMPLE",
  },
  {
    id: "comp-04",
    projectId: "proj-study-planner",
    name: "Google Calendar",
    category: "substitute",
    description: "Dominant calendar used by students for exam reminders. Has no study intelligence layer.",
    differentiator: "Google Calendar requires fully manual updates; ours auto-reschedules and sends adaptive nudges.",
    provenance: "SAMPLE",
  },
  {
    id: "comp-05",
    projectId: "proj-study-planner",
    name: "Manual Notebook + Timetable",
    category: "status_quo",
    description: "Physical paper timetable on the hostel room wall. The dominant behavior we displace.",
    differentiator: "Paper is tactile and trusted. We must be zero-setup and forgiving — not impose complexity on top of the existing habit.",
    provenance: "SAMPLE",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 6 — IDEAL CUSTOMER PROFILE (ICP)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_ICP: ICPProfile = {
  primarySegment: "2nd/3rd-year undergraduate engineering students with 5+ concurrent exam subjects",
  demographic: "Age 19-22, Tier 1 & 2 college cities (Pune, Bengaluru, Chennai, Hyderabad, Delhi-NCR). Android-first device. Monthly pocket money ₹2,000-5,000.",
  psychographic: "Academically anxious, motivated by peer comparison. Uses WhatsApp study groups. Feels guilty after missing sessions. Wants to 'get back on track' but not face punishment.",
  jobToBeDone: "Rebuild a study plan within 2 minutes after missing sessions — without manually adjusting every subject slot by hand.",
  painIntensity: "High",
  willingnessToPaySignal: "Uncertain — would use if free, ambiguous if ₹99/month. Institutional licensing to colleges more viable.",
  acquisitionChannel: "WhatsApp study groups, Instagram reels on exam anxiety, college campus ambassador program, college notice boards.",
  provenance: "AI_INFERENCE",
  caveat: "ICP is an AI_INFERENCE hypothesis derived from SAMPLE fixture data. Not validated with real customer interviews.",
};

// ══════════════════════════════════════════════════════════════════════
// SECTION 7 — PERSONAS (F08)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_PERSONAS: Persona[] = [
  {
    id: "persona-01",
    projectId: "proj-study-planner",
    name: "Arjun Sharma",
    segment: "Stressed 3rd-Year Engineering Student (Backlog Carrier)",
    age: "21",
    context: "B.Tech Computer Science, SRM Institute, Chennai. Has 2 active backlogs from last semester. Exams in 18 days. Studies in bursts of panic.",
    jobs: "Pass all 6 subjects. Clear backlogs without repeating the semester. Avoid parental disappointment.",
    pains: "Wakes up at 11am and feels the entire day is wasted. Cannot prioritize which subject to study first. Rescheduling a single slip cascades and he gives up the plan entirely.",
    goals: "Complete at least 4 hours of focused study by 10pm. Have a plan that forgives a missed morning session.",
    behaviors: "Uses Google Calendar for lecture reminders. Browses YouTube until he forces himself to open a textbook. Studies best at night 9pm-1am.",
    constraints: "Cannot afford ₹500+/month. Shares a cramped hostel room with 2 roommates. Phone is primary device.",
    objections: "\"I don't have time to configure another app right now — exams are in 18 days.\" \"I've tried Notion and it never stuck.\"",
    assumptions: "Assumes Arjun prefers mobile-first. Assumes late-night study preference is consistent. HYPOTHESIS only.",
    provenance: "SIMULATED",
    caveat: "⚠️ SIMULATED PERSONA — This is an AI-generated hypothesis, not a real person. Cannot be used as customer evidence.",
  },
  {
    id: "persona-02",
    projectId: "proj-study-planner",
    name: "Priya Nair",
    segment: "Self-Disciplined Commerce Student (No Backlogs, Targeting 80%+)",
    age: "20",
    context: "B.Com 2nd Year, Christ University, Bengaluru. No backlogs. Preparing for CA Foundation alongside. Uses multiple apps already.",
    jobs: "Score above 80% across all subjects. Maintain her CA Foundation prep without falling behind on B.Com. Keep stress levels manageable.",
    pains: "Current tools don't integrate B.Com timetable and CA prep. Every Sunday she rebuilds her weekly schedule from scratch. Feels overwhelmed by CA syllabus density.",
    goals: "One app that holds both academic tracks. Automatic warnings when CA prep time drops below a weekly minimum.",
    behaviors: "Highly organized. Uses Notion, Google Calendar, and a physical diary. Wakes at 6am. Studies 2 blocks — 7-9am and 8-11pm.",
    constraints: "Parents may buy a ₹99/month tool if it shows visible ROI (better marks). Privacy-conscious — doesn't want study data on cloud.",
    objections: "\"Why would I replace a system that already works for me?\" \"What happens to my data if I stop subscribing?\"",
    assumptions: "Assumes dual-track use case is relevant. Assumes privacy concern drives local-first preference. HYPOTHESIS only.",
    provenance: "SIMULATED",
    caveat: "⚠️ SIMULATED PERSONA — This is an AI-generated hypothesis, not a real person. Cannot be used as customer evidence.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 8 — SYNTHETIC INTERVIEWS (F09)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_INTERVIEWS: Interview[] = [
  {
    id: "interview-01",
    projectId: "proj-study-planner",
    personaId: "persona-01",
    personaName: "Arjun Sharma",
    scenario: "Founder cold-DMs Arjun on Instagram after he posts about exam stress. They do a 15-minute casual voice call.",
    provenance: "SIMULATED",
    model: "qwen2.5:3b (Target — not yet running)",
    caveat: "⚠️ SIMULATED INTERVIEW — This dialogue is entirely AI-generated. It explores hypothetical objections. It is NOT proof of market demand and must never be presented as real customer validation.",
    createdAt: "2026-10-24T01:02:20Z",
    turns: [
      { id: "t-01-1", role: "user", text: "Hey Arjun, I saw your story about exam stress. Quick question — how do you manage your study schedule currently?", timestamp: "2026-10-24T01:02:22Z", provenance: "SIMULATED" },
      { id: "t-01-2", role: "assistant", text: "Bro honestly I just open my WhatsApp group and see what others are doing. I made a Notion template once but stopped after 3 days. It's too much work to update when you miss sessions.", timestamp: "2026-10-24T01:02:35Z", provenance: "SIMULATED" },
      { id: "t-01-3", role: "user", text: "If an app auto-rescheduled for you when you miss a session — no manual work — would that be useful?", timestamp: "2026-10-24T01:02:48Z", provenance: "SIMULATED" },
      { id: "t-01-4", role: "assistant", text: "Sounds good but I've heard that before. The problem is setup takes forever and by the time I figure it out, exams are here. If it took less than 2 minutes I'd try it.", timestamp: "2026-10-24T01:03:05Z", provenance: "SIMULATED" },
      { id: "t-01-5", role: "user", text: "Would you pay ₹99/month if it actually helped you stop cramming?", timestamp: "2026-10-24T01:03:20Z", provenance: "SIMULATED" },
      { id: "t-01-6", role: "assistant", text: "Hmm. I'm not sure. If it genuinely reduced my anxiety maybe. But I'd want to try it free first. I've paid for apps before and stopped using them after a week.", timestamp: "2026-10-24T01:03:38Z", provenance: "SIMULATED" },
    ],
  },
  {
    id: "interview-02",
    projectId: "proj-study-planner",
    personaId: "persona-02",
    personaName: "Priya Nair",
    scenario: "Founder meets Priya at a college fest booth. She agrees to a 10-minute structured conversation.",
    provenance: "SIMULATED",
    model: "qwen2.5:3b (Target — not yet running)",
    caveat: "⚠️ SIMULATED INTERVIEW — This dialogue is entirely AI-generated. It explores hypothetical objections. It is NOT proof of market demand and must never be presented as real customer validation.",
    createdAt: "2026-10-24T01:02:55Z",
    turns: [
      { id: "t-02-1", role: "user", text: "Priya, you seem very organized. What does your study planning system look like?", timestamp: "2026-10-24T01:02:57Z", provenance: "SIMULATED" },
      { id: "t-02-2", role: "assistant", text: "I have Google Calendar for lectures and a Notion page for CA prep. Every Sunday I sit and rebuild the week because things always shift. It takes me about 45 minutes which is annoying.", timestamp: "2026-10-24T01:03:10Z", provenance: "SIMULATED" },
      { id: "t-02-3", role: "user", text: "What if your CA prep and B.Com timetable were in one app that auto-rebuilt when things shifted?", timestamp: "2026-10-24T01:03:22Z", provenance: "SIMULATED" },
      { id: "t-02-4", role: "assistant", text: "That would save me so much time on Sundays. But I'd need to trust it. I've been burned by apps that sync in weird ways. And I don't want my study data on some cloud server.", timestamp: "2026-10-24T01:03:40Z", provenance: "SIMULATED" },
      { id: "t-02-5", role: "user", text: "Data stays on your device only. Would ₹99/month be reasonable?", timestamp: "2026-10-24T01:03:55Z", provenance: "SIMULATED" },
      { id: "t-02-6", role: "assistant", text: "If it genuinely works, my parents would pay for it if I showed them improved grades. But I'd need at least a month free trial to see real results.", timestamp: "2026-10-24T01:04:08Z", provenance: "SIMULATED" },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 9 — INSIGHTS (F11)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_INSIGHTS: Insight[] = [
  {
    id: "ins-01",
    projectId: "proj-study-planner",
    statement: "The critical UX constraint is zero-configuration onboarding. Students will not invest more than 2 minutes in setup during exam season, regardless of promised benefits.",
    type: "theme",
    confidence: "High",
    evidenceForIds: ["ev-02", "ev-04"],
    provenance: "AI_INFERENCE",
  },
  {
    id: "ins-02",
    projectId: "proj-study-planner",
    statement: "Auto-reschedule when sessions are missed is the single differentiating feature worth testing. All other planner apps require manual updates — this is the stated abandonment trigger.",
    type: "theme",
    confidence: "High",
    evidenceForIds: ["ev-01", "ev-02"],
    provenance: "AI_INFERENCE",
  },
  {
    id: "ins-03",
    projectId: "proj-study-planner",
    statement: "Counter-signal: College-focused EdTech monetization is structurally weak. Students have very high price sensitivity and free alternatives dominate.",
    type: "contradiction",
    confidence: "High",
    evidenceForIds: ["ev-03"],
    evidenceAgainstIds: ["ev-04"],
    caveat: "This contradicts the direct-subscription revenue model. Institutional licensing to colleges should be primary revenue path.",
    provenance: "AI_INFERENCE",
  },
  {
    id: "ins-04",
    projectId: "proj-study-planner",
    statement: "Open question: Is the actual job-to-be-done 'study more efficiently' or 'feel less anxious about exams'? These may require different product interventions.",
    type: "open_question",
    confidence: "Medium",
    evidenceForIds: ["ev-01"],
    caveat: "Needs real user interviews to resolve. Do not assume.",
    provenance: "AI_INFERENCE",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 10 — ASSUMPTIONS & RISKS (F12)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_ASSUMPTIONS: Assumption[] = [
  {
    id: "asm-01",
    projectId: "proj-study-planner",
    statement: "Students will adopt a new tool during the exam season rather than before it.",
    category: "customer_behavior",
    impact: "High",
    uncertainty: "Critical",
    rationale: "Simulated interviews suggest students are most motivated close to exams, but also most time-constrained. This paradox is unresolved.",
    status: "unvalidated",
    provenance: "AI_INFERENCE",
  },
  {
    id: "asm-02",
    projectId: "proj-study-planner",
    statement: "Students will pay ₹99/month for a study planner app.",
    category: "business_model",
    impact: "High",
    uncertainty: "Critical",
    rationale: "Counter-evidence (ev-03) suggests college EdTech monetization is structurally weak. Freemium or institutional licensing may be required.",
    status: "unvalidated",
    evidenceIds: ["ev-03"],
    provenance: "AI_INFERENCE",
  },
  {
    id: "asm-03",
    projectId: "proj-study-planner",
    statement: "An auto-reschedule algorithm can produce schedules students trust and follow for 30+ days.",
    category: "technical",
    impact: "High",
    uncertainty: "High",
    rationale: "No evidence yet that algorithmic schedules outperform self-made ones in terms of adherence. Core technical hypothesis.",
    status: "unvalidated",
    provenance: "AI_INFERENCE",
  },
  {
    id: "asm-04",
    projectId: "proj-study-planner",
    statement: "Peer referral via WhatsApp college groups will be sufficient for initial user acquisition.",
    category: "distribution",
    impact: "Medium",
    uncertainty: "High",
    rationale: "No acquisition experiment run yet. Assumption based on observation that WhatsApp is the dominant communication channel in Indian college students.",
    status: "unvalidated",
    provenance: "AI_INFERENCE",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 11 — EXPERIMENTS (F13)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_EXPERIMENTS: Experiment[] = [
  {
    id: "exp-01",
    projectId: "proj-study-planner",
    assumptionId: "asm-01",
    hypothesis: "If we offer a zero-configuration WhatsApp-based concierge study planner (founder manually creates and sends a daily schedule to a WhatsApp group), then at least 30% of enrolled students will follow it for 7+ consecutive days before their exams.",
    method: "Manual concierge simulation (no code). Founder acts as the AI. Recruit 25 students via a college WhatsApp group 3 weeks before exams.",
    cohort: "25 B.Tech 3rd-year students, SRM Chennai, exam in 21 days",
    metric: "% of students who check-in on WhatsApp as 'session done' for 7+ consecutive days",
    threshold: "≥ 30% 7-day adherence rate",
    duration: "3 weeks (1 exam cycle)",
    costEstimate: "₹0 — founder time only",
    decisionRules: "≥30% → build lightweight MVP with auto-reschedule. <30% → pivot to anxiety-reduction angle and re-test.",
    status: "planned",
    provenance: "AI_INFERENCE",
  },
  {
    id: "exp-02",
    projectId: "proj-study-planner",
    assumptionId: "asm-02",
    hypothesis: "If we show a landing page describing the auto-reschedule feature and ask for ₹99 pre-payment to join a 'beta waitlist', then at least 5% of visitors will pay.",
    method: "Landing page with Razorpay payment link. Drive 500 visitors from Instagram ads (₹3,000 ad spend) and WhatsApp group shares.",
    cohort: "500 Instagram/WhatsApp sourced visitors",
    metric: "Conversion rate to ₹99 pre-payment",
    threshold: "≥ 5% conversion (25 paying users out of 500)",
    duration: "2 weeks",
    costEstimate: "₹3,000 (ads) + ₹500 (landing page domain/hosting)",
    decisionRules: "≥5% → pursue D2C subscription model. <5% → pivot to B2B institutional licensing. Full refund if product not built.",
    status: "planned",
    provenance: "AI_INFERENCE",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 12 — MVP FEATURES (F14)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_MVP_FEATURES: MVPFeature[] = [
  {
    id: "mvp-01",
    projectId: "proj-study-planner",
    name: "Exam Countdown Calendar",
    scope: "Student enters exam dates → app shows days remaining per subject with auto-computed priority order.",
    priority: "now",
    effort: "Low",
    rationale: "Zero-friction hook that shows immediate value. Creates urgency without requiring full schedule setup. Tests if students will engage with data input.",
    experimentIds: ["exp-01"],
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-02",
    projectId: "proj-study-planner",
    name: "Auto-Reschedule on Missed Session",
    scope: "Student marks a session as missed → app redistributes remaining hours across remaining days, flags time deficits, and sends WhatsApp nudge.",
    priority: "now",
    effort: "Medium",
    rationale: "The primary differentiator. Directly addresses stated abandonment trigger. Core hypothesis to validate in Experiment 1.",
    experimentIds: ["exp-01"],
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-03",
    projectId: "proj-study-planner",
    name: "Daily 3-Task Push Notification",
    scope: "Each morning, sends a WhatsApp/notification with exactly 3 study tasks for the day. No more, no less.",
    priority: "now",
    effort: "Low",
    rationale: "Decision fatigue reduction. Students report paralysis from long to-do lists. 3-task constraint is psychologically manageable.",
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-04",
    projectId: "proj-study-planner",
    name: "Syllabus Photo Upload (OCR Parsing)",
    scope: "Student photographs syllabus sheet → OCR extracts topics → topics loaded as study blocks.",
    priority: "later",
    effort: "High",
    rationale: "High demand signal from simulated interviews but technically complex. Defer until core adherence loop is validated.",
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-05",
    projectId: "proj-study-planner",
    name: "Peer Accountability Groups",
    scope: "2-5 students share progress on a shared dashboard. Peer visibility as motivation layer.",
    priority: "later",
    effort: "High",
    rationale: "WhatsApp study group behavior suggests peer accountability is a strong motivator, but adds social complexity. Phase 2 feature.",
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-06",
    projectId: "proj-study-planner",
    name: "CA Foundation / Dual-Track Mode",
    scope: "Separate simultaneous study track for competitive exam prep alongside college coursework.",
    priority: "later",
    effort: "Medium",
    rationale: "Validated by Priya persona scenario (dual-track user). But serves a different segment. Defer until primary segment validated.",
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
  {
    id: "mvp-07",
    projectId: "proj-study-planner",
    name: "Institutional College Licensing Dashboard",
    scope: "College admin view: aggregate student progress, batch scheduling, exam schedule import.",
    priority: "omit",
    effort: "High",
    rationale: "Required for B2B revenue model, but premature until D2C vs B2B pivot decision is made post-Experiment 2.",
    experimentIds: ["exp-02"],
    status: "candidate",
    provenance: "AI_INFERENCE",
  },
];

// ══════════════════════════════════════════════════════════════════════
// SECTION 13 — REPORT SNAPSHOT (F15)
// ══════════════════════════════════════════════════════════════════════

export const DEMO_REPORT: ReportSnapshot = {
  id: "report-snap-001",
  projectId: "proj-study-planner",
  runId: "demo-run-001",
  version: 1,
  generatedAt: "2026-10-24T01:04:30Z",
  containsSimulated: true,
  containsSample: true,
  provenanceManifest: {
    USER_INPUT: 1,
    SAMPLE: 4,
    AI_INFERENCE: 8,
    SIMULATED: 4,
    REAL_SOURCE: 0,
    REAL_EXPERIMENT_RESULT: 0,
  },
  sections: [
    {
      id: "r-exec",
      title: "Executive Summary",
      provenance: "AI_INFERENCE",
      content: "AI Adaptive Study Planner targets Indian undergraduate students who abandon exam prep tools due to setup friction and inability to recover from missed sessions. The core hypothesis is that auto-reschedule-on-miss reduces abandonment by 3×. Primary risks are monetization viability and onboarding complexity. Two experiments are planned before any code commitment.",
    },
    {
      id: "r-problem",
      title: "Problem Statement",
      provenance: "USER_INPUT",
      content: "College students struggle with exam anxiety and inefficient cramming because existing calendar apps require manual rescheduling and generic study methods don't adapt to student fatigue or weak topics.",
    },
    {
      id: "r-evidence",
      title: "Evidence Summary",
      provenance: "SAMPLE",
      content: "4 evidence items collected. 3 SAMPLE fixture items and 1 USER_INPUT primary research item. Key signals: 68% undergrad cramming rate (SAMPLE), 82% 14-day abandonment rate for planner apps (SAMPLE), counter-signal: weak college EdTech monetization (SAMPLE). 0 REAL_SOURCE items retrieved. No live research has been conducted.",
      caveat: "All numeric figures are SAMPLE fixture data prepared for demo purposes. No live web research was conducted in this run. See evidence ledger for individual provenance labels.",
    },
    {
      id: "r-competition",
      title: "Competitive Landscape",
      provenance: "SAMPLE",
      content: "5 alternatives mapped. Direct substitutes: Notion Study Templates, Google Calendar. Indirect: Forest (focus only), Quizlet (content only). Status quo: Manual notebook timetable. Primary differentiation: auto-reschedule on missed session + zero-setup onboarding.",
      caveat: "Competitor data is SAMPLE fixture. No live competitor research was conducted.",
    },
    {
      id: "r-personas",
      title: "Customer Personas",
      provenance: "SIMULATED",
      content: "2 simulated personas generated: (1) Arjun Sharma — backlog carrier, 21y, SRM Chennai, studies at night, high anxiety. (2) Priya Nair — dual-track student, 20y, Christ Bengaluru, organized, privacy-conscious. Both are AI-generated hypotheses only.",
      caveat: "⚠️ SIMULATED ARTIFACTS — These personas were generated by AI and represent hypothetical customer archetypes. They are NOT real people and cannot be used as market validation evidence.",
    },
    {
      id: "r-risks",
      title: "Critical Assumptions & Risks",
      provenance: "AI_INFERENCE",
      content: "4 critical assumptions identified. Top 2 by uncertainty × impact: (1) Students will adopt during exam season — Critical uncertainty, High impact. (2) Students will pay ₹99/month — Critical uncertainty, High impact. Counter-evidence (ev-03) suggests institutional licensing is a more viable path.",
    },
    {
      id: "r-experiments",
      title: "Proposed Experiments",
      provenance: "AI_INFERENCE",
      content: "2 experiments before code: (1) Manual WhatsApp concierge test — 25 students, 3 weeks, ≥30% 7-day adherence threshold, ₹0 cost. (2) Landing page pre-payment test — 500 visitors, 2 weeks, ≥5% ₹99 payment threshold, ₹3,500 budget. Results will determine D2C vs B2B pivot.",
    },
    {
      id: "r-mvp",
      title: "MVP Recommendation",
      provenance: "AI_INFERENCE",
      content: "3 'Now' features: Exam Countdown Calendar, Auto-Reschedule on Missed Session, Daily 3-Task Push. 3 'Later': Syllabus Photo Upload, Peer Groups, Dual-Track. 1 'Omit until pivot decision': Institutional Dashboard.",
    },
    {
      id: "r-verdict",
      title: "Validation Verdict",
      provenance: "AI_INFERENCE",
      content: "PROCEED TO EXPERIMENTS — Do not write application code before completing both planned experiments. The core problem is real (SAMPLE evidence supports cramming behavior). The solution differentiation (auto-reschedule) is plausible. Monetization is the primary unresolved risk. Institutional licensing should be explored in parallel.",
      caveat: "This verdict is AI_INFERENCE derived from SAMPLE fixture data and SIMULATED persona dialogues. It is a structured thinking aid — not a validated market assessment.",
    },
  ],
};

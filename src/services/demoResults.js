/**
 * Zenith India - Structured Sample Framework Generator
 * 
 * Used when the backend AI service is offline.
 * NOTE: This is clearly labeled as a sample/demo validation framework
 * and does NOT represent factual live AI research or fabricated market statistics.
 */

export function generateDemoValidation(formData) {
  const name = formData.startupName || formData.title || 'Your Startup';
  const desc = formData.ideaDescription || formData.description || 'Idea concept';
  const customers = formData.targetCustomers || 'Target Customers';
  const market = formData.targetMarket || 'Target Market';

  return {
    isDemo: true,
    backendStatus: 'offline',
    disclaimer: 'Backend service is offline. Displaying a structured demonstration framework. Connect the Zenith AI backend to generate real-time AI-evaluated metrics.',
    timestamp: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    startupOverview: {
      name,
      description: desc,
      customers,
      market,
      readinessScore: 78,
    },
    marketOpportunity: {
      category: 'Market Opportunity Framework',
      summary: `Opportunity assessment framework for ${market} focusing on ${customers}.`,
      indicators: [
        { label: 'Market Demand Indicators', value: 'High Need', status: 'positive', detail: `Pain point resonance is strongest when addressing manual bottlenecks for ${customers}.` },
        { label: 'Geography Focus', value: market, status: 'neutral', detail: `Go-to-market dynamics in ${market} depend heavily on localization and distribution channels.` },
        { label: 'Monetization Potential', value: 'B2B/B2C Recurring', status: 'positive', detail: 'High potential for tiered subscription or transactional commissions.' },
      ],
    },
    competitors: {
      category: 'Competitor & Moat Analysis',
      summary: 'Mapping direct alternatives and legacy behavioral habits.',
      landscape: [
        { name: 'Direct Competitors', type: 'Category Players', risk: 'Medium', notes: `Existing tech solutions attempting to service ${customers} in ${market}.` },
        { name: 'Indirect Competitors', type: 'Legacy Alternatives', risk: 'High', notes: 'Manual spreadsheets, WhatsApp groups, and traditional offline habits.' },
        { name: 'Potential Moat', type: 'Strategic Advantage', risk: 'Opportunity', notes: 'Speed of execution, workflow integration, and proprietary localized datasets.' },
      ],
    },
    risks: {
      category: 'Critical Risks & Mitigations',
      summary: 'Primary vulnerability vectors identified for this concept.',
      items: [
        {
          risk: 'Customer Inertia & Adoption',
          level: 'High',
          explanation: `${customers} often hesitate to switch from familiar habits unless time/money savings exceed 10x.`,
          mitigation: 'Implement frictionless onboarding and immediate time-to-value within 5 minutes.',
        },
        {
          risk: 'Unit Economics & CAC Escalation',
          level: 'Medium',
          explanation: `Customer Acquisition Cost (CAC) in ${market} can spike without organic referrals.`,
          mitigation: 'Focus on community-driven growth and founder-led sales before paid performance marketing.',
        },
        {
          risk: 'Platform Retention',
          level: 'Medium',
          explanation: 'Initial interest may drop if the workflow does not deliver ongoing, sticky value.',
          mitigation: 'Build daily/weekly triggers, notifications, or critical workflow automation.',
        },
      ],
    },
    customerPersonas: {
      category: 'Target Customer Personas & Simulator',
      summary: `3 key archetype profiles mapped for ${customers} in ${market}.`,
      personas: [
        {
          id: 'persona-operator',
          name: 'Ramesh Patel',
          role: `Independent Store Owner (${customers})`,
          archetype: 'Frontline Operator & Daily User',
          badge: 'Primary Champion',
          avatarInitials: 'RP',
          colorTheme: 'violet',
          goals: [
            'Eliminate 2+ hours of nightly handwritten ledger bookkeeping',
            'Prevent out-of-stock incidents on fast-moving daily staples',
            'Maintain personalized trust and credit records with regular neighbourhood buyers',
          ],
          painPoints: [
            'Lacks time to manually audit supplier deliveries during high-traffic store hours',
            'Frequent stockouts lead to customers shopping at nearby rival stores',
            'Fragmented distributor communication across multiple WhatsApp chats and phone calls',
          ],
          objections: [
            'Hesitant to adopt complex software that demands computer literacy or English fluency',
            'Deep skepticism of recurring software subscriptions eating into thin 6-8% gross margins',
            'Fears software downtime or slow speeds during rapid morning customer checkout rush',
          ],
          buyingMotivations: [
            'Frictionless mobile UI or WhatsApp-first workflow that requires zero staff training',
            'Immediate demonstrable ROI within the first 14 days (saving ₹3,000+ in waste)',
            'Reliable regional language support (Hindi / Gujarati / Hinglish) with voice input',
          ],
          willingnessToPay: '₹499 - ₹899 / month if it directly prevents stockouts',
          greeting: `Namaste! I have been running my retail store for 14 years. Every evening is chaotic with supplier deliveries and billing. I am interested if your tool actually saves me time, but I am very protective of my daily routine. What do you want to ask me?`,
          suggestedQuestions: [
            'What is your biggest daily headache when managing inventory?',
            'Why wouldn’t you just stick with pen-and-paper or WhatsApp?',
            'How much would you realistically pay monthly for this solution?',
            'What would make you stop using the app after 2 weeks?',
          ],
        },
        {
          id: 'persona-financial',
          name: 'Sunita Sharma',
          role: `Regional Distributor & Procurement Head (${market})`,
          archetype: 'Economic Buyer & Margin Guardian',
          badge: 'Financial Decision Maker',
          avatarInitials: 'SS',
          colorTheme: 'peach',
          goals: [
            'Shorten collection cycles and reconcile 15-day informal buyer credit lines',
            'Consolidate bulk orders 48 hours in advance for predictable route delivery',
            'Zero margin leakage on returns, damaged SKUs, and expired inventory',
          ],
          painPoints: [
            'Constant payment disputes over handwritten delivery challans and WhatsApp screenshots',
            'Unpredictable demand spikes leading to high emergency logistics overhead',
            'Slow cash turnover locking up working capital across 60+ retail retailer accounts',
          ],
          objections: [
            'Concerned about proprietary customer pricing and discount data leaking to rivals',
            'Reluctance to absorb additional payment gateway processing fees on razor-thin margins',
            'Demands enterprise-grade export integration with existing Tally or legacy ERP systems',
          ],
          buyingMotivations: [
            'Automated payment escrow, UPI settlement triggers, and dispute-free digital invoices',
            'Proven working capital velocity improvement and reduced days sales outstanding (DSO)',
            'Bulk order volume predictability enabling better supplier distributor rebates',
          ],
          willingnessToPay: '₹1,999 - ₹4,500 / month or 0.3% per reconciled transaction',
          greeting: `Hello. On the wholesale and financial side, we manage over 50 retail accounts across the region. My priority is cash flow predictability and dispute-free reconciliation. What specific operational numbers or workflows do you want to discuss?`,
          suggestedQuestions: [
            'How do you currently handle credit lines and payments with store owners?',
            'What is the primary reason you reject new digital platforms?',
            'What proof or pilot would convince you to test this with 5 stores?',
            'What integrations with existing accounting tools like Tally do you mandate?',
          ],
        },
        {
          id: 'persona-adopter',
          name: 'Amit Verma',
          role: `Multi-Outlet Modern Retailer & Tech Adopter (${customers})`,
          archetype: 'Growth-Oriented Early Adopter',
          badge: 'Tech-Forward Innovator',
          avatarInitials: 'AV',
          colorTheme: 'lavender',
          goals: [
            'Expand from 2 existing outlets to 5 locations within the next 18 months',
            'Automate predictive replenishment without relying on manual floor manager checks',
            'Increase average customer basket size by 15% through data-driven SKU placement',
          ],
          painPoints: [
            'Floor staff turnover is high; training new employees on legacy POS tools takes 3 weeks',
            'Lacks unified multi-store analytics to compare inventory velocity across different store locations',
            'Existing enterprise retail software is bloated, desktop-bound, and requires costly hardware',
          ],
          objections: [
            'Worried about data lock-in and whether order histories can be easily exported via API',
            'Expects 99.9% cloud uptime with automated offline cache during localized internet cuts',
            'Demands responsive, founder-level or dedicated account manager support rather than bot replies',
          ],
          buyingMotivations: [
            'Clean modern cloud dashboard accessible on phone and tablet simultaneously',
            'Sub-10 minute employee onboarding time with intuitive mobile-first UX',
            'Actionable predictive alerts (e.g., "Order 40kg wheat flour before the weekend rush")',
          ],
          willingnessToPay: '₹1,499 - ₹2,999 / month per outlet for multi-store visibility',
          greeting: `Hi! We run modern retail outlets and are actively testing digital workflows to scale our operations. We love modern software, but we have zero tolerance for clunky UI that confuses our floor staff. Fire away with your questions!`,
          suggestedQuestions: [
            'What tools have you tried before and why did you abandon them?',
            'What feature would make this a must-have for you on day one?',
            'How do you train new floor staff on your current store systems?',
            'How would you pitch this tool to your business partners?',
          ],
        },
      ],
    },
    suggestedExperiments: {
      category: 'Actionable Lean MVP Experiments',
      summary: 'Practical tests to validate demand before investing heavy engineering capital.',
      experiments: [
        {
          phase: 'Experiment 1',
          name: 'Landing Page & Smoke Test',
          duration: '3 - 5 Days',
          objective: 'Measure genuine intent and sign-up conversion rate on a simple value proposition page.',
        },
        {
          phase: 'Experiment 2',
          name: '15 Problem-Discovery Interviews',
          duration: '1 - 2 Weeks',
          objective: `Interview 15 individuals matching ${customers} to uncover unvarnished frustrations and willingness to pay.`,
        },
        {
          phase: 'Experiment 3',
          name: 'Concierge (Manual) Pilot',
          duration: '2 Weeks',
          objective: 'Deliver the core value manually behind the scenes for 3-5 users before writing scalable backend code.',
        },
      ],
    },
  };
}

export default generateDemoValidation;

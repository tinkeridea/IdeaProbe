/**
 * Zenith India - AI Customer Persona Simulator Service
 * 
 * Provides simulated customer interview dialogues based on structured customer archetypes.
 * 
 * NOTE: When backend AI is offline, responses are clearly marked as
 * [DEMO SIMULATION] based on customer archetype data. They never pretend to be real humans.
 */

import { api } from './api';

/**
 * Intelligent fallback generator for persona dialogue when AI backend is offline.
 * Analyzes the user's question, the persona's role, pain points, objections, and buying motivations.
 */
export function generateDemoPersonaReply(persona, question, startupContext = {}) {
  const q = (question || '').toLowerCase();
  const startupName = startupContext.startupName || 'your platform';

  // Topic 1: Pricing / Cost / Willingness to Pay
  if (q.includes('price') || q.includes('cost') || q.includes('pay') || q.includes('charge') || q.includes('expensive') || q.includes('budget') || q.includes('fee')) {
    if (persona.id === 'persona-operator') {
      return `Look, my margins are razor-thin (around 6-8% on FMCG goods). I can't afford a hefty upfront software license. But if ${startupName} saves me even ₹4,000 to ₹5,000 every month in inventory spoilage and billing leakages, paying ₹499 to ₹899 a month is a no-brainer. Give me a 14-day trial without asking for credit card details so I can test it during busy peak hours.`;
    }
    if (persona.id === 'persona-financial') {
      return `Our primary concern is ROI transparency and payback period. We don't sign off on SaaS tools without clear visibility on cost-per-store or transaction fees. If your pricing is predictable—say a transparent monthly tier or sub-1% transaction fee—we can approve a 5-unit pilot immediately. Hide any setup fees, and we'll decline.`;
    }
    return `We usually budget ₹1,500 to ₹3,000 per branch monthly for operational software if it replaces 2-3 fragmented tools. What matters to us is that the pricing scales predictably as we add more SKUs and staff logins. What tier structure do you have for multi-store setups?`;
  }

  // Topic 2: Objections / Skepticism / Trust / Why Not Pen & Paper or WhatsApp
  if (q.includes('why not') || q.includes('pen') || q.includes('paper') || q.includes('whatsapp') || q.includes('trust') || q.includes('alternative') || q.includes('switch') || q.includes('competitor')) {
    if (persona.id === 'persona-operator') {
      return `Pen and paper has zero downtime and never runs out of battery—that's why everyone defaults to it! But last month, my assistant wrote down the wrong wholesaler quantity, and we were out of edible oil for 3 days over Diwali weekend. That cost me ₹25,000 in lost sales. If ${startupName} feels as fast as WhatsApp and works even when our local internet disconnects, I will switch tomorrow.`;
    }
    if (persona.id === 'persona-financial') {
      return `WhatsApp groups are an absolute nightmare for invoice disputes. Store owners claim they ordered 20 bags when WhatsApp says 10, or payment screenshots get lost. We need a tamper-proof digital ledger. Our objection isn't digital tech—it's whether you'll still be around in 12 months, or will you pivot and abandon our data?`;
    }
    return `We've tried 2 different inventory apps in the last 18 months. Both failed because staff found data entry cumbersome during peak 7 PM rush hours. If your UI takes more than 3 taps to log an item or reorder, staff simply won't use it. Show me that your workflow is faster than a WhatsApp voice note.`;
  }

  // Topic 3: Daily Routine / Biggest Headache / Pain Points
  if (q.includes('headache') || q.includes('frustrat') || q.includes('problem') || q.includes('pain') || q.includes('daily') || q.includes('routine') || q.includes('hardest')) {
    if (persona.id === 'persona-operator') {
      return `My biggest daily headache is 9:30 PM closing time. After standing for 14 hours, I have to manually count shelf stock, tally supplier dues, and send voice notes to 6 different distributors. Half the time I forget an item, and customers get angry the next morning. If ${startupName} can automate reorder reminders by 6 PM, it gives me back 2 hours of sleep every night.`;
    }
    if (persona.id === 'persona-financial') {
      return `Reconciliation of supplier credit lines. In India, retail runs on informal 15-day credit. Chasing outstanding payments across 40 accounts without automated reminders is our biggest cash flow bottleneck. That's what keeps me up at night.`;
    }
    return `Inventory mismatch between what the system says and what's physically on the shelf. Pilferage and untracked sample packs erode our operating margins. We need real-time shrinkage alerts.`;
  }

  // Topic 4: Must-have Features / What will make you buy / Day One Value
  if (q.includes('feature') || q.includes('must have') || q.includes('day one') || q.includes('buy') || q.includes('need') || q.includes('important')) {
    if (persona.id === 'persona-operator') {
      return `Three things: 1) WhatsApp-based reorder prompts so I don't have to keep another app open all day. 2) Offline sync mode for when Wi-Fi drops. 3) Voice typing in Hindi/Hinglish because my fingers are busy packing dal and rice bags.`;
    }
    if (persona.id === 'persona-financial') {
      return `Consolidated GST billing export, automated payment reminder triggers, and a supplier dashboard showing order statuses at a glance. If it doesn't integrate with Tally or standard Excel exports, adoption will be zero.`;
    }
    return `Real-time multi-device sync, fast barcode scanning using regular phone cameras, and predictive demand alerts before festive weekends.`;
  }

  // Topic 5: Churn / Why would you stop using it / Cancel
  if (q.includes('stop') || q.includes('churn') || q.includes('cancel') || q.includes('leave') || q.includes('fail') || q.includes('bad')) {
    if (persona.id === 'persona-operator') {
      return `I will delete the app immediately if it freezes during customer checkout rush, or if customer support is just an unhelpful automated bot. If something breaks at 10 AM, I need a phone number to talk to a real person who speaks my language.`;
    }
    if (persona.id === 'persona-financial') {
      return `We will churn if data reconciliation has even a 1% error margin, or if your server experiences recurring downtime on month-end closing days. Reliability is paramount over shiny features.`;
    }
    return `If the software requires 20 hours of training for every new floor staff member we hire. High turnover in Indian retail means onboarding must take under 10 minutes.`;
  }

  // Default intelligent contextual response based on the persona
  return `As ${persona.name} (${persona.role}), my primary focus is: ${persona.goals[0].toLowerCase()}. Right now, our biggest friction is that ${persona.painPoints[0].toLowerCase()}. Before we commit to ${startupName}, we need reassurance regarding our core objection: "${persona.objections[0]}". If you can prove that ${persona.buyingMotivations[0].toLowerCase()}, we are ready to pilot this next week.`;
}

/**
 * Execute simulated persona chat via API with graceful transparent fallback
 */
export async function sendPersonaMessage({ persona, userMessage, history = [], startupContext = {} }) {
  // Enforce simulated realistic response latency (350 - 600ms) for human-like dialogue feel
  const startTime = Date.now();

  try {
    // Attempt live API request if backend is running
    const apiResponse = await api.request('/persona/chat', {
      method: 'POST',
      body: JSON.stringify({
        personaId: persona.id,
        userMessage,
        history,
        startupContext,
      }),
    });

    if (apiResponse && apiResponse.success && apiResponse.data?.reply) {
      return {
        reply: apiResponse.data.reply,
        isDemo: false,
        source: 'Live AI Backend',
      };
    }
  } catch {
    // Backend offline; continue to demo fallback
  }

  // Ensure minimum response delay for natural UI feel
  const elapsed = Date.now() - startTime;
  if (elapsed < 450) {
    await new Promise((resolve) => setTimeout(resolve, 450 - elapsed));
  }

  const demoReply = generateDemoPersonaReply(persona, userMessage, startupContext);

  return {
    reply: demoReply,
    isDemo: true,
    source: 'Demonstration Archetype Simulation (Backend Offline)',
    disclaimer: 'This is an AI customer archetype simulation based on market persona models, not a live human interview.',
  };
}

export default {
  generateDemoPersonaReply,
  sendPersonaMessage,
};

'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5-20251001';

// xFact capability profile — used in every scoring prompt
const CAPABILITY_PROFILE = `
xFact is a specialized HHS IT consulting firm with the following core competencies:
- IV&V (Independent Verification & Validation) for Medicaid MES/MMIS modernization
- NIST 800-53 security assessments and A&A (Authority to Authorize) support
- MARS-E 2.2 compliance reviews for ACA Marketplace and Medicaid eligibility systems
- HIPAA Security Risk Assessments (SRA) for state and federal health agencies
- ERM/GRC (Enterprise Risk Management / Governance, Risk, Compliance) program design
- IT audit and compliance reviews under CMS CISO and OIG frameworks
- Community Engagement (CE) / Work Requirements module testing and IV&V
- APD (Advance Planning Document) preparation and CMS review support
- COOP/DR (Continuity of Operations / Disaster Recovery) planning for HHS systems
- FHIR and interoperability assessment for CMS rule compliance (CMS-0057)
xFact is a small business; strong fit for set-aside and small business preference awards.
`.trim();

const URGENCY_ORDER = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, WATCH: 1 };

function buildPrompt(opp) {
  const urgencyScore = URGENCY_ORDER[opp.urgency] || 1;
  return `You are an expert government contracting analyst. Score the following HHS procurement opportunity for xFact.

## xFact Capability Profile
${CAPABILITY_PROFILE}

## Opportunity Details
- Title: ${opp.opportunity_title}
- State/Agency: ${opp.state} — ${opp.agency}
- Category: ${opp.category}
- Program: ${opp.program || 'N/A'}
- IT Type: ${opp.it_type || 'N/A'}
- Status: ${opp.status}
- Urgency: ${opp.urgency} (score: ${urgencyScore}/5)
- Win Probability: ${opp.win_probability}
- Est. Value: $${opp.est_value_m || 0}M
- Due Date: ${opp.due_date}
- APD Status: ${opp.apd_status || 'Unknown'}
- HR1 Readiness Score: ${opp.hr1_readiness_score || 'N/A'}/5
- Incumbent Expiry: ${opp.incumbent_expiry || 'Unknown'}
- Competitive Context: ${opp.competitive_context || 'N/A'}
- Notes: ${opp.notes || 'N/A'}
- Source: ${opp.source} (Tier ${opp.source_tier})

## Scoring Instructions
Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "score": <integer 1-10>,
  "recommendation": <"go" | "no-go" | "maybe">,
  "rationale": <string, 2-3 sentence summary>,
  "factors": [
    { "factor": <string>, "assessment": <string>, "impact": <"positive" | "negative" | "neutral"> }
  ],
  "risks": [<string>, ...],
  "strengths": [<string>, ...]
}

Scoring criteria — assess each and assign an impact of positive/negative/neutral:
- capability_fit: How well do xFact core competencies match this work?
- win_probability: State signals, incumbent presence, competitive landscape
- strategic_value: HR1 alignment, pipeline impact, recompete potential
- financial_attractiveness: Contract value, FMAP leverage, cost recovery potential
- execution_risk: Complexity, timeline, resource requirements (high risk = negative impact)

Recommendation thresholds: go ≥ 7, maybe 5-6, no-go ≤ 4.`;
}

async function scoreBidOpportunity(opportunity, { logger = console.log, apiKey } = {}) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY not set and no apiKey provided');
  }

  const client = new Anthropic({ apiKey: key });

  logger(`AI Scorer: scoring "${opportunity.opportunity_title.slice(0, 60)}" …`);

  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(opportunity) }]
  });

  const raw = message.content[0]?.text || '';

  let parsed;
  try {
    // Strip any accidental markdown code fences
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    logger(`AI Scorer: JSON parse error — ${e.message}`);
    throw new Error(`AI Scorer returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  // Validate required fields
  const { score, recommendation, rationale, factors, risks, strengths } = parsed;
  if (typeof score !== 'number' || score < 1 || score > 10) {
    throw new Error(`Invalid score value: ${score}`);
  }
  if (!['go', 'no-go', 'maybe'].includes(recommendation)) {
    throw new Error(`Invalid recommendation: ${recommendation}`);
  }

  return {
    score:          Math.round(score),
    recommendation: recommendation,
    rationale:      rationale || '',
    factors:        Array.isArray(factors) ? factors : [],
    risks:          Array.isArray(risks) ? risks : [],
    strengths:      Array.isArray(strengths) ? strengths : [],
    scored_at:      new Date().toISOString(),
    model:          MODEL,
    opportunity_id: opportunity.id
  };
}

module.exports = { scoreBidOpportunity };

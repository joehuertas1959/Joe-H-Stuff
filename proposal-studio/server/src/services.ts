import { nanoid } from 'nanoid';
import { callClaudeJSON, callClaudeText, documentToSource, type ContentSource } from './anthropic.js';
import type {
  ResponseTemplate,
  ProposalTracker,
  RiskAnalysis,
  SubmissionChecklist,
  GapAnalysis,
  Evaluation,
  Proposal,
  TemplateSection,
} from './types.js';

async function rfpSources(p: Proposal): Promise<ContentSource[]> {
  if (!p.rfp) throw new Error('No RFP/RFQ document has been added to this proposal yet.');
  return [await documentToSource(p.rfp)];
}

async function priorSources(p: Proposal): Promise<ContentSource[]> {
  return Promise.all(p.priorProposals.map((d) => documentToSource(d)));
}

const ANALYST_SYSTEM =
  'You are an expert government/commercial proposal manager and capture analyst. ' +
  'You read solicitation documents (RFPs, RFQs, RFIs) precisely and extract exactly what the ' +
  'issuing authority asks for. You never invent requirements that are not in the document.';

// 1. Response template -------------------------------------------------------
export async function generateTemplate(p: Proposal, apiKey?: string): Promise<ResponseTemplate> {
  const sources = await rfpSources(p);
  const data = await callClaudeJSON<{
    title: string;
    overview: string;
    sections: Array<{
      heading: string;
      instructions: string;
      requirements: string[];
      pageOrFormatLimits?: string;
    }>;
  }>({
    apiKey,
    system: ANALYST_SYSTEM,
    sources,
    instruction:
      'Analyze the attached solicitation and produce a RESPONSE TEMPLATE the offeror should follow. ' +
      'Derive the section structure from the solicitation\'s own instructions, evaluation factors, and ' +
      'submission requirements. For each section capture: heading, a concise "instructions" summary of ' +
      'what the issuer wants there, a "requirements" array of the discrete requirements/specs/directions ' +
      'that belong to that section (quote or tightly paraphrase the solicitation), and any page or format ' +
      'limits. Schema: {"title": string, "overview": string, "sections": [{"heading": string, ' +
      '"instructions": string, "requirements": string[], "pageOrFormatLimits": string}]}',
    maxTokens: 16000,
  });

  const sections: TemplateSection[] = data.sections.map((s) => ({
    id: nanoid(8),
    heading: s.heading,
    instructions: s.instructions,
    requirements: s.requirements || [],
    pageOrFormatLimits: s.pageOrFormatLimits,
    draft: '',
  }));

  return {
    title: data.title,
    overview: data.overview,
    sections,
    generatedAt: new Date().toISOString(),
  };
}

// 2. Proposal management tracker --------------------------------------------
export async function generateTracker(p: Proposal, apiKey?: string): Promise<ProposalTracker> {
  const sources = await rfpSources(p);
  const data = await callClaudeJSON<{
    steps: Array<{
      phase: string;
      name: string;
      description: string;
      owner: string;
      dueOffset?: string;
    }>;
  }>({
    apiKey,
    system: ANALYST_SYSTEM,
    sources,
    instruction:
      'Create a PROPOSAL MANAGEMENT TRACKER: the ordered list of steps in the approval and production ' +
      'process for responding to this solicitation, from capture/bid-decision through internal reviews ' +
      '(pink/red/gold team or equivalent), approvals, and final submission. Tie steps to anything the ' +
      'solicitation requires (e.g. questions deadline, intent to bid, registrations). For each step give ' +
      'a phase, a short name, a description, a suggested owner/role, and a relative due offset such as ' +
      '"RFP+3d" or "Due-2d". Schema: {"steps": [{"phase": string, "name": string, "description": string, ' +
      '"owner": string, "dueOffset": string}]}',
    maxTokens: 12000,
  });

  return {
    steps: data.steps.map((s) => ({
      id: nanoid(8),
      phase: s.phase,
      name: s.name,
      description: s.description,
      owner: s.owner,
      dueOffset: s.dueOffset,
      status: 'Not Started' as const,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// 3. Risk analysis -----------------------------------------------------------
export async function analyzeRisks(p: Proposal, apiKey?: string): Promise<RiskAnalysis> {
  const sources = await rfpSources(p);
  const data = await callClaudeJSON<{
    risks: Array<{
      category: string;
      title: string;
      description: string;
      likelihood: 'Low' | 'Medium' | 'High';
      impact: 'Low' | 'Medium' | 'High';
      recommendation: string;
    }>;
  }>({
    apiKey,
    system: ANALYST_SYSTEM,
    sources,
    instruction:
      'Perform a RISK ANALYSIS of pursuing and submitting a proposal for this solicitation. Identify the ' +
      'risks that may arise (technical, schedule, cost/pricing, compliance, legal/terms, staffing, ' +
      'past-performance, competitive, etc.). For each: category, short title, description, likelihood ' +
      '(Low/Medium/High), impact (Low/Medium/High), and a concrete recommendation to mitigate it. ' +
      'Schema: {"risks": [{"category": string, "title": string, "description": string, "likelihood": ' +
      '"Low"|"Medium"|"High", "impact": "Low"|"Medium"|"High", "recommendation": string}]}',
    maxTokens: 14000,
  });

  return {
    risks: data.risks.map((r) => ({
      id: nanoid(8),
      category: r.category,
      title: r.title,
      description: r.description,
      likelihood: r.likelihood,
      impact: r.impact,
      recommendation: r.recommendation,
      treatment: 'Unaddressed' as const,
      treatmentNotes: '',
    })),
    generatedAt: new Date().toISOString(),
  };
}

// 4. Draft from prior proposals ---------------------------------------------
export async function draftFromPrior(p: Proposal, apiKey?: string): Promise<Record<string, string>> {
  if (!p.template) throw new Error('Generate a response template first.');
  const sources = [...(await rfpSources(p)), ...(await priorSources(p))];

  const templateOutline = p.template.sections
    .map(
      (s) =>
        `[sectionId=${s.id}] ${s.heading}\n  Instructions: ${s.instructions}\n  Requirements: ${s.requirements.join('; ')}`,
    )
    .join('\n\n');

  const hasPrior = p.priorProposals.length > 0;

  const data = await callClaudeJSON<{ sections: Array<{ sectionId: string; draft: string }> }>({
    apiKey,
    system:
      ANALYST_SYSTEM +
      ' You also write strong, compliant proposal prose that directly answers each requirement.',
    sources,
    instruction:
      'Using the attached solicitation' +
      (hasPrior ? ' and the attached PRIOR PROPOSAL(S)' : '') +
      ', write a first-pass DRAFT for each section of the response template below. ' +
      (hasPrior
        ? 'Reuse and adapt relevant content from the prior proposals where it fits, tailoring it to this ' +
          'solicitation. '
        : '') +
      'Address the listed requirements directly. Where you do not have enough information to complete a ' +
      'point, write a clear placeholder in square brackets, e.g. "[NEEDS INPUT: specific staffing plan]". ' +
      'Do not fabricate facts, names, prices, or past-performance details. Return the draft text for each ' +
      'section keyed by its sectionId.\n\nTEMPLATE:\n' +
      templateOutline +
      '\n\nSchema: {"sections": [{"sectionId": string, "draft": string}]}',
    maxTokens: 20000,
  });

  const map: Record<string, string> = {};
  for (const s of data.sections) map[s.sectionId] = s.draft;
  return map;
}

// 6. Gap analysis ------------------------------------------------------------
export async function analyzeGaps(p: Proposal, apiKey?: string): Promise<GapAnalysis> {
  if (!p.template) throw new Error('Generate a response template first.');
  const sources = await rfpSources(p);

  const draftBlock = p.template.sections
    .map((s) => `[sectionId=${s.id}] ${s.heading}\n${s.draft || '(empty)'}`)
    .join('\n\n');

  const data = await callClaudeJSON<{
    summary: string;
    completenessScore: number;
    annotations: Array<{
      sectionId: string | null;
      type: 'gap' | 'inferred';
      excerpt: string;
      note: string;
      suggestedText?: string;
    }>;
  }>({
    apiKey,
    system: ANALYST_SYSTEM,
    sources,
    instruction:
      'Review the current DRAFT proposal below against the attached solicitation and identify GAPS — ' +
      'requirements that are unaddressed, incomplete, non-compliant, or marked with placeholders. Also, ' +
      'where reasonable, propose INFERRED/extrapolated content that could fill a gap based on the ' +
      'solicitation and draft context. For each annotation give: the relevant sectionId (or null), a type ' +
      'of "gap" or "inferred", a short "excerpt" the annotation refers to, a "note" explaining the gap or ' +
      'the inference rationale, and for "inferred" a "suggestedText" with the proposed content. Also give ' +
      'an overall "summary" and a "completenessScore" from 0-100. ' +
      'Schema: {"summary": string, "completenessScore": number, "annotations": [{"sectionId": string|null, ' +
      '"type": "gap"|"inferred", "excerpt": string, "note": string, "suggestedText": string}]}' +
      '\n\nDRAFT:\n' +
      draftBlock,
    maxTokens: 16000,
  });

  return {
    summary: data.summary,
    completenessScore: data.completenessScore,
    annotations: data.annotations || [],
    generatedAt: new Date().toISOString(),
  };
}

// 5. Submission checklist ----------------------------------------------------
export async function generateChecklist(p: Proposal, apiKey?: string): Promise<SubmissionChecklist> {
  const sources = await rfpSources(p);
  const data = await callClaudeJSON<{
    items: Array<{ category: string; label: string; detail: string; required: boolean }>;
  }>({
    apiKey,
    system: ANALYST_SYSTEM,
    sources,
    instruction:
      'Produce a PRE-SUBMISSION CHECKLIST for the proposal manager: every required step, form, ' +
      'certification, attachment, format rule, and submission mechanic the solicitation demands before ' +
      'the proposal can be submitted to the issuing authority. For each item: category (Forms, ' +
      'Attachments, Certifications, Formatting, Eligibility, Submission, etc.), a short label, a detail ' +
      'explaining what to verify, and whether it is required. ' +
      'Schema: {"items": [{"category": string, "label": string, "detail": string, "required": boolean}]}',
    maxTokens: 12000,
  });

  return {
    items: data.items.map((i) => ({
      id: nanoid(8),
      category: i.category,
      label: i.label,
      detail: i.detail,
      required: i.required,
      done: false,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// 7. Evaluation --------------------------------------------------------------
export async function evaluateProposal(p: Proposal, apiKey?: string): Promise<Evaluation> {
  if (!p.template) throw new Error('Generate a response template first.');
  const sources = await rfpSources(p);

  const draftBlock = p.template.sections
    .map((s) => `## ${s.heading}\n${s.draft || '(empty)'}`)
    .join('\n\n');

  const data = await callClaudeJSON<{
    totalScore: number;
    maxScore: number;
    summary: string;
    criteria: Array<{
      criterion: string;
      maxPoints: number;
      awardedPoints: number;
      rationale: string;
      improvements: string[];
    }>;
    topRecommendations: string[];
  }>({
    apiKey,
    system:
      'You are a member of the issuing authority\'s source-selection / evaluation team. You score ' +
      'proposals strictly against the evaluation criteria stated in the solicitation, as a real evaluator ' +
      'would. You are fair but rigorous and do not give credit for content that is not present.',
    sources,
    instruction:
      'Evaluate the DRAFT proposal below as if you were on the issuing authority\'s evaluation team. ' +
      'Use the evaluation criteria/factors stated in the attached solicitation. If explicit point values ' +
      'are given, use them; otherwise assign reasonable weights and state them. For each criterion give: ' +
      'criterion name, maxPoints, awardedPoints, a rationale, and specific improvements to raise the ' +
      'score. Then give a totalScore, maxScore, an overall summary, and topRecommendations. ' +
      'Schema: {"totalScore": number, "maxScore": number, "summary": string, "criteria": ' +
      '[{"criterion": string, "maxPoints": number, "awardedPoints": number, "rationale": string, ' +
      '"improvements": string[]}], "topRecommendations": string[]}' +
      '\n\nDRAFT:\n' +
      draftBlock,
    maxTokens: 16000,
  });

  return { ...data, generatedAt: new Date().toISOString() };
}

export { callClaudeText };

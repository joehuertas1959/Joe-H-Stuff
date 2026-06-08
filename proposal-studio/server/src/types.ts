// Shared domain types for Proposal Studio.
// NOTE: client/src/types.ts mirrors this file — keep them in sync.

export type RiskTreatment = 'Unaddressed' | 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';

export type TrackerStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Blocked';

export interface StoredDocument {
  id: string;
  name: string;
  kind: 'pdf' | 'text'; // pdf => file on disk; text => extracted text inline
  mediaType?: string; // e.g. application/pdf
  path?: string; // disk path for pdf
  text?: string; // extracted text for docx / plain text
  uploadedAt: string;
}

export interface TemplateSection {
  id: string;
  heading: string;
  instructions: string; // what the issuer asks for in this section
  requirements: string[]; // discrete requirements / specs extracted for this section
  pageOrFormatLimits?: string;
  draft: string; // the working draft text for this section
}

export interface ResponseTemplate {
  title: string;
  overview: string;
  sections: TemplateSection[];
  generatedAt: string;
}

export interface TrackerStep {
  id: string;
  phase: string; // e.g. "Capture", "Bid/No-Bid", "Drafting", "Review", "Submission"
  name: string;
  description: string;
  owner: string;
  dueOffset?: string; // e.g. "RFP+5d" or "Due-3d"
  status: TrackerStatus;
}

export interface ProposalTracker {
  steps: TrackerStep[];
  generatedAt: string;
}

export interface RiskItem {
  id: string;
  category: string; // e.g. Technical, Schedule, Cost, Compliance, Legal
  title: string;
  description: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  recommendation: string; // recommended mitigation/treatment
  treatment: RiskTreatment; // user's chosen disposition
  treatmentNotes: string;
}

export interface RiskAnalysis {
  risks: RiskItem[];
  generatedAt: string;
}

export interface ChecklistItem {
  id: string;
  category: string; // e.g. Forms, Attachments, Formatting, Eligibility, Submission
  label: string;
  detail: string;
  required: boolean;
  done: boolean;
}

export interface SubmissionChecklist {
  items: ChecklistItem[];
  generatedAt: string;
}

export interface GapAnnotation {
  sectionId: string | null; // which template section, if known
  type: 'gap' | 'inferred'; // gap => red, inferred => blue
  excerpt: string; // short snippet the annotation refers to
  note: string; // explanation of the gap / the inference rationale
  suggestedText?: string; // for inferred: the extrapolated content
}

export interface GapAnalysis {
  summary: string;
  completenessScore: number; // 0-100
  annotations: GapAnnotation[];
  generatedAt: string;
}

export interface EvaluationCriterionScore {
  criterion: string;
  maxPoints: number;
  awardedPoints: number;
  rationale: string;
  improvements: string[];
}

export interface Evaluation {
  totalScore: number;
  maxScore: number;
  summary: string;
  criteria: EvaluationCriterionScore[];
  topRecommendations: string[];
  generatedAt: string;
}

export interface Proposal {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rfp?: StoredDocument;
  priorProposals: StoredDocument[];
  template?: ResponseTemplate;
  tracker?: ProposalTracker;
  risks?: RiskAnalysis;
  checklist?: SubmissionChecklist;
  gapAnalysis?: GapAnalysis;
  evaluation?: Evaluation;
}

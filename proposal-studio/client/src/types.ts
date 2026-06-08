// Mirror of server/src/types.ts

export type RiskTreatment = 'Unaddressed' | 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';
export type TrackerStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Blocked';

export interface StoredDocument {
  id: string;
  name: string;
  kind: 'pdf' | 'text';
  mediaType?: string;
  text?: string;
  uploadedAt: string;
}

export interface TemplateSection {
  id: string;
  heading: string;
  instructions: string;
  requirements: string[];
  pageOrFormatLimits?: string;
  draft: string;
}

export interface ResponseTemplate {
  title: string;
  overview: string;
  sections: TemplateSection[];
  generatedAt: string;
}

export interface TrackerStep {
  id: string;
  phase: string;
  name: string;
  description: string;
  owner: string;
  dueOffset?: string;
  status: TrackerStatus;
}

export interface ProposalTracker {
  steps: TrackerStep[];
  generatedAt: string;
}

export interface RiskItem {
  id: string;
  category: string;
  title: string;
  description: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  recommendation: string;
  treatment: RiskTreatment;
  treatmentNotes: string;
}

export interface RiskAnalysis {
  risks: RiskItem[];
  generatedAt: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
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
  sectionId: string | null;
  type: 'gap' | 'inferred';
  excerpt: string;
  note: string;
  suggestedText?: string;
}

export interface GapAnalysis {
  summary: string;
  completenessScore: number;
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

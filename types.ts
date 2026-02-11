export enum RelevanceStatus {
  RELEVANT = 'relevant',
  IRRELEVANT = 'irrelevant',
  NEEDS_REVIEW = 'needs_review',
  PENDING = 'pending'
}

export enum PolicyCategory {
  OFF_TOPIC = 'Off-topic',
  MISLEADING = 'Misleading',
  NONE = 'None'
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  additionalCategories: string[];
  services: string[];
  location: string;
}

export interface AIAnalysisResult {
  relevance: 'relevant' | 'irrelevant';
  confidence: number;
  reason: string;
  policy_category: PolicyCategory;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  text: string;
  createTime: string;
  analysis?: AIAnalysisResult;
  status: RelevanceStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}
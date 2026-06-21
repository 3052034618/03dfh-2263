export interface DailyTask {
  id: string;
  title: string;
  type: 'challenge' | 'deduction' | 'scripts';
  description: string;
  duration: number;
  completed: boolean;
  score: number;
  totalScore: number;
}

export interface Recording {
  id: string;
  title: string;
  consultantName: string;
  customerName: string;
  duration: number;
  level: number;
  category: string;
  thumbnail: string;
  waveformData: number[];
  violations: Violation[];
  coreDemand: string;
  demandOptions: string[];
  correctDemandIndex: number;
  hasExaggeration: boolean;
  riskDisclosureComplete: boolean;
  unlocked: boolean;
}

export interface Violation {
  id: string;
  position: number;
  category: 'price_objection' | 'efficacy_promise' | 'postoperative_care' | 'risk_concealment';
  text: string;
  deductionPoints: number;
  standardAnswer: string;
}

export interface ChallengeLevel {
  id: string;
  level: number;
  title: string;
  recordingId: string;
  passed: boolean;
  score: number;
  totalScore: number;
  stars: number;
  maxStars: number;
  locked: boolean;
}

export interface DeductionItem {
  id: string;
  recordingId: string;
  violationId: string;
  category: 'price_objection' | 'efficacy_promise' | 'postoperative_care' | 'risk_concealment';
  categoryLabel: string;
  violationText: string;
  standardAnswer: string;
  deductionPoints: number;
  answered: boolean;
  correct: boolean;
}

export interface ScriptCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface ScriptItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  keyPoints: string[];
  commonMistakes: string[];
}

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  className: string;
  score: number;
  passRate: number;
  rank: number;
  completedTasks: number;
  totalTasks: number;
}

export interface MentorReview {
  id: string;
  mentorName: string;
  mentorAvatar: string;
  studentId: string;
  date: string;
  content: string;
  weakPoints: string[];
  excellentRecordingUnlocked: boolean;
  recordingId: string;
}

export interface MistakeRecord {
  id: string;
  category: 'price_objection' | 'efficacy_promise' | 'postoperative_care' | 'risk_concealment';
  question: string;
  userAnswer: string;
  correctAnswer: string;
  violationText: string;
  timestamp: number;
}

export interface WeaknessItem {
  category: 'price_objection' | 'efficacy_promise' | 'postoperative_care' | 'risk_concealment';
  categoryLabel: string;
  wrongCount: number;
  totalCount: number;
  accuracy: number;
  recentMistakes: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  className: string;
  joinDate: string;
  totalScore: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  passRate: number;
  qualificationMet: boolean;
  qualificationScore: number;
}

export const VIOLATION_CATEGORY_MAP: Record<string, string> = {
  price_objection: '价格异议',
  efficacy_promise: '效果承诺',
  postoperative_care: '术后护理',
  risk_concealment: '风险隐瞒'
};

export const VIOLATION_CATEGORY_COLOR: Record<string, string> = {
  price_objection: '#FEF3C7',
  efficacy_promise: '#FEE2E2',
  postoperative_care: '#D1FAE5',
  risk_concealment: '#DBEAFE'
};

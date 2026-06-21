import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  DailyTask,
  ChallengeLevel,
  DeductionItem,
  UserProfile,
  WeaknessItem,
  MistakeRecord,
  MentorReview,
  PracticeTask,
  RecordingPracticeRecord
} from '@/types';
import { VIOLATION_CATEGORY_MAP } from '@/types';
import { dailyTasks as mockDailyTasks } from '@/data/dailyTasks';
import { challengeLevels as mockChallengeLevels, recordings } from '@/data/recordings';
import { deductionItems as mockDeductionItems } from '@/data/deductions';
import { currentUser as mockUser } from '@/data/user';
import { mentorReviews as mockReviews } from '@/data/reviews';
import { weaknessItems as mockWeakness } from '@/data/reviews';

const STORAGE_KEY_QUALIFICATION = 'qualification_score';

const loadQualificationScore = (): number => {
  try {
    const stored = Taro.getStorageSync(STORAGE_KEY_QUALIFICATION);
    return stored ? Number(stored) : mockUser.qualificationScore;
  } catch {
    return mockUser.qualificationScore;
  }
};

const initialQualificationScore = loadQualificationScore();
const initialUser = {
  ...mockUser,
  qualificationScore: initialQualificationScore,
  qualificationMet: mockUser.passRate >= initialQualificationScore
};

const mockPracticeTasks: PracticeTask[] = [
  {
    id: 'pt-001',
    mentorName: '李老师',
    mentorAvatar: 'https://picsum.photos/id/64/200/200',
    recordingId: 'rec-004',
    recordingTitle: '吸脂咨询 - 风险告知检查',
    note: '重点关注风险告知话术，3处违规都要找出来，下周抽查',
    date: '2026-06-20',
    completed: false
  },
  {
    id: 'pt-002',
    mentorName: '王老师',
    mentorAvatar: 'https://picsum.photos/id/91/200/200',
    recordingId: 'rec-002',
    recordingTitle: '隆鼻咨询 - 效果承诺识别',
    note: '复习效果承诺类违规识别，特别是"保证"类话术',
    date: '2026-06-18',
    completed: true,
    lastScore: 85,
    completedDate: '2026-06-19'
  }
];

const computeWeaknessItems = (mistakes: MistakeRecord[], baseWeakness: WeaknessItem[]): WeaknessItem[] => {
  const categories = ['price_objection', 'efficacy_promise', 'postoperative_care', 'risk_concealment'] as const;
  const baseMap = new Map(baseWeakness.map((w) => [w.category, w]));

  return categories.map((cat) => {
    const catMistakes = mistakes.filter((m) => m.category === cat);
    const base = baseMap.get(cat);
    const baseWrong = base?.wrongCount || 0;
    const baseTotal = base?.totalCount || 0;
    const baseRecent = base?.recentMistakes || [];

    const totalWrong = baseWrong + catMistakes.length;
    const totalQuestions = baseTotal + catMistakes.length;
    const accuracy = totalQuestions > 0 ? Math.round(((totalQuestions - totalWrong) / totalQuestions) * 100) : 100;
    const recentMistakes = [
      ...catMistakes.slice(-3).map((m) => m.violationText),
      ...baseRecent
    ].slice(0, 5);

    return {
      category: cat,
      categoryLabel: VIOLATION_CATEGORY_MAP[cat],
      wrongCount: totalWrong,
      totalCount: totalQuestions,
      accuracy,
      recentMistakes
    };
  });
};

interface TrainingState {
  dailyTasks: DailyTask[];
  challengeLevels: ChallengeLevel[];
  deductionItems: DeductionItem[];
  userProfile: UserProfile;
  mistakes: MistakeRecord[];
  weaknessItems: WeaknessItem[];
  mentorReviews: MentorReview[];
  practiceTasks: PracticeTask[];
  selectedViolationCategory: string;

  completeDailyTask: (taskId: string, score: number) => void;
  completeChallengeLevel: (levelId: string, score: number, stars: number) => void;
  answerDeductionItem: (itemId: string, correct: boolean) => void;
  addMistake: (mistake: Omit<MistakeRecord, 'id' | 'timestamp'>) => void;
  addMentorReview: (review: Omit<MentorReview, 'id' | 'date'>) => void;
  addPracticeTask: (task: Omit<PracticeTask, 'id' | 'date' | 'completed'>) => void;
  completePracticeTask: (taskId: string, score: number) => void;
  recordPractice: (recordingId: string, score: number) => void;
  setQualificationScore: (score: number) => void;
  setViolationCategory: (category: string) => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  dailyTasks: mockDailyTasks,
  challengeLevels: mockChallengeLevels,
  deductionItems: mockDeductionItems,
  userProfile: initialUser,
  mistakes: [],
  weaknessItems: mockWeakness,
  mentorReviews: [...mockReviews],
  practiceTasks: [...mockPracticeTasks],
  selectedViolationCategory: 'all',

  completeDailyTask: (taskId, score) =>
    set((state) => ({
      dailyTasks: state.dailyTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true, score } : task
      )
    })),

  completeChallengeLevel: (levelId, score, stars) =>
    set((state) => ({
      challengeLevels: state.challengeLevels.map((level, idx) => {
        if (level.id === levelId) {
          return { ...level, passed: score >= 60, score, stars };
        }
        if (idx === state.challengeLevels.findIndex((l) => l.id === levelId) + 1) {
          return { ...level, locked: false };
        }
        return level;
      })
    })),

  answerDeductionItem: (itemId, correct) =>
    set((state) => ({
      deductionItems: state.deductionItems.map((item) =>
        item.id === itemId ? { ...item, answered: true, correct } : item
      )
    })),

  addMistake: (mistake) => {
    const newMistake: MistakeRecord = {
      ...mistake,
      id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now()
    };
    set((state) => {
      const updatedMistakes = [...state.mistakes, newMistake];
      const updatedWeakness = computeWeaknessItems(updatedMistakes, mockWeakness);
      return { mistakes: updatedMistakes, weaknessItems: updatedWeakness };
    });
    console.info('[Store] Mistake added', newMistake);
  },

  addMentorReview: (review) => {
    const newReview: MentorReview = {
      ...review,
      id: `review-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    set((state) => ({
      mentorReviews: [newReview, ...state.mentorReviews]
    }));
    console.info('[Store] Review added', newReview);
  },

  addPracticeTask: (task) => {
    const newTask: PracticeTask = {
      ...task,
      id: `pt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completed: false
    };
    set((state) => ({
      practiceTasks: [newTask, ...state.practiceTasks]
    }));
    console.info('[Store] Practice task added', newTask);
  },

  completePracticeTask: (taskId, score) => {
    set((state) => ({
      practiceTasks: state.practiceTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: true,
              lastScore: score,
              completedDate: new Date().toISOString().split('T')[0]
            }
          : t
      )
    }));
  },

  recordPractice: (recordingId, score) => {
    const state = get();
    const rec = recordings.find((r) => r.id === recordingId);
    if (!rec) return;

    const pendingTask = state.practiceTasks.find(
      (t) => t.recordingId === recordingId && !t.completed
    );
    if (pendingTask) {
      get().completePracticeTask(pendingTask.id, score);
    }

    console.info('[Store] Practice recorded', { recordingId, score });
  },

  setQualificationScore: (score) => {
    try {
      Taro.setStorageSync(STORAGE_KEY_QUALIFICATION, String(score));
    } catch (e) {
      console.error('[Store] Failed to persist qualification score', e);
    }
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        qualificationScore: score,
        qualificationMet: state.userProfile.passRate >= score
      }
    }));
  },

  setViolationCategory: (category) =>
    set({ selectedViolationCategory: category })
}));

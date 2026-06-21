import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { DailyTask, ChallengeLevel, DeductionItem, UserProfile, WeaknessItem, MistakeRecord, MentorReview } from '@/types';
import { VIOLATION_CATEGORY_MAP } from '@/types';
import { dailyTasks as mockDailyTasks } from '@/data/dailyTasks';
import { challengeLevels as mockChallengeLevels } from '@/data/recordings';
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
  selectedViolationCategory: string;

  completeDailyTask: (taskId: string, score: number) => void;
  completeChallengeLevel: (levelId: string, score: number, stars: number) => void;
  answerDeductionItem: (itemId: string, correct: boolean) => void;
  addMistake: (mistake: Omit<MistakeRecord, 'id' | 'timestamp'>) => void;
  addMentorReview: (review: Omit<MentorReview, 'id' | 'date'>) => void;
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

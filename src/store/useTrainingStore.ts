import { create } from 'zustand';
import type { DailyTask, ChallengeLevel, DeductionItem, UserProfile, WeaknessItem } from '@/types';
import { dailyTasks as mockDailyTasks } from '@/data/dailyTasks';
import { challengeLevels as mockChallengeLevels } from '@/data/recordings';
import { deductionItems as mockDeductionItems } from '@/data/deductions';
import { currentUser as mockUser } from '@/data/user';
import { weaknessItems as mockWeakness } from '@/data/reviews';

interface TrainingState {
  dailyTasks: DailyTask[];
  challengeLevels: ChallengeLevel[];
  deductionItems: DeductionItem[];
  userProfile: UserProfile;
  weaknessItems: WeaknessItem[];
  selectedViolationCategory: string;
  currentPlayingRecording: string;
  playbackProgress: number;

  completeDailyTask: (taskId: string, score: number) => void;
  completeChallengeLevel: (levelId: string, score: number, stars: number) => void;
  answerDeductionItem: (itemId: string, correct: boolean) => void;
  setViolationCategory: (category: string) => void;
  setPlaybackProgress: (progress: number) => void;
  setCurrentPlayingRecording: (recordingId: string) => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  dailyTasks: mockDailyTasks,
  challengeLevels: mockChallengeLevels,
  deductionItems: mockDeductionItems,
  userProfile: mockUser,
  weaknessItems: mockWeakness,
  selectedViolationCategory: 'all',
  currentPlayingRecording: '',
  playbackProgress: 0,

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

  setViolationCategory: (category) =>
    set({ selectedViolationCategory: category }),

  setPlaybackProgress: (progress) =>
    set({ playbackProgress: progress }),

  setCurrentPlayingRecording: (recordingId) =>
    set({ currentPlayingRecording: recordingId, playbackProgress: 0 })
}));

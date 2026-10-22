// LocalStorage 기반 학습 기록 영구 저장 유틸리티

export interface NumberProgress {
  practicedCount: number;
  bestScore: number;
  lastPracticedAt: string;
  isBookmarked: boolean;
}

export interface QuizRecord {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  mode: string;
}

export interface UserLearningState {
  progress: Record<number, NumberProgress>;
  quizHistory: QuizRecord[];
  totalPracticeTimeSeconds: number;
  bestStreak: number;
}

const STORAGE_KEY = 'chinese_number_writer_v1';

const defaultState: UserLearningState = {
  progress: {},
  quizHistory: [],
  totalPracticeTimeSeconds: 0,
  bestStreak: 0,
};

export function loadLearningState(): UserLearningState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveLearningState(state: UserLearningState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded 등 안전 처리
  }
}

export function recordNumberPractice(numberId: number, score: number): UserLearningState {
  const current = loadLearningState();
  const prev = current.progress[numberId] || {
    practicedCount: 0,
    bestScore: 0,
    lastPracticedAt: new Date().toISOString(),
    isBookmarked: false,
  };

  current.progress[numberId] = {
    ...prev,
    practicedCount: prev.practicedCount + 1,
    bestScore: Math.max(prev.bestScore, score),
    lastPracticedAt: new Date().toISOString(),
  };

  saveLearningState(current);
  return current;
}

export function toggleBookmarkNumber(numberId: number): UserLearningState {
  const current = loadLearningState();
  const prev = current.progress[numberId] || {
    practicedCount: 0,
    bestScore: 0,
    lastPracticedAt: new Date().toISOString(),
    isBookmarked: false,
  };

  current.progress[numberId] = {
    ...prev,
    isBookmarked: !prev.isBookmarked,
  };

  saveLearningState(current);
  return current;
}

export function addQuizRecord(record: Omit<QuizRecord, 'id' | 'date'>): UserLearningState {
  const current = loadLearningState();
  const newRecord: QuizRecord = {
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  current.quizHistory = [newRecord, ...current.quizHistory].slice(0, 30); // 최근 30개 보관
  saveLearningState(current);
  return current;
}

import React, { useState, useEffect } from 'react';
import { CHINESE_NUMBERS } from './data/chineseNumbers';
import type { ChineseNumberData } from './data/chineseNumbers';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { StrokeOrderGuide } from './components/StrokeOrderGuide';
import { PronunciationCard } from './components/PronunciationCard';
import { NumberSelector } from './components/NumberSelector';
import { QuizMode } from './components/QuizMode';
import {
  loadLearningState,
  recordNumberPractice,
  toggleBookmarkNumber,
} from './utils/storage';
import type { UserLearningState } from './utils/storage';
import { initVoices, playChineseAudio } from './utils/speech';
import {
  PenTool,
  Brain,
  BarChart3,
  Volume2,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'practice' | 'quiz' | 'stats'>('practice');
  const [currentNumber, setCurrentNumber] = useState<ChineseNumberData>(CHINESE_NUMBERS[1]); // '一' (1) 기본
  const [learningState, setLearningState] = useState<UserLearningState>(loadLearningState());
  const [filterOnlyBookmarked, setFilterOnlyBookmarked] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    initVoices();
  }, []);

  const handleSelectNumber = (num: ChineseNumberData) => {
    setCurrentNumber(num);
    // 숫자 선택 시 자동으로 해당 숫자 표준 발음 한번 들려주기
    playChineseAudio(num.char, 0.85);
  };

  const handleScoreRecorded = (score: number) => {
    const nextState = recordNumberPractice(currentNumber.id, score);
    setLearningState(nextState);
  };

  const handleToggleBookmark = () => {
    const nextState = toggleBookmarkNumber(currentNumber.id);
    setLearningState(nextState);
  };

  // 0~10 연속 발음 듣기 기능
  const handlePlaySequence = async () => {
    if (isPlayingAll) return;
    setIsPlayingAll(true);
    for (let i = 0; i <= 10; i++) {
      const item = CHINESE_NUMBERS[i];
      if (item) {
        setCurrentNumber(item);
        await playChineseAudio(item.char, 0.8);
        await new Promise((res) => setTimeout(res, 400));
      }
    }
    setIsPlayingAll(false);
  };

  const currentProgress = learningState.progress[currentNumber.id] || {
    practicedCount: 0,
    bestScore: 0,
    lastPracticedAt: '',
    isBookmarked: false,
  };

  // 통계 계산
  const totalNumbersCount = CHINESE_NUMBERS.length;
  const practicedNumbersCount = Object.values(learningState.progress).filter(
    (p) => p.practicedCount > 0
  ).length;
  const completionRate = Math.round((practicedNumbersCount / totalNumbersCount) * 100);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col">
      {/* 최상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <span className="font-chinese font-black text-2xl">数</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                중국어 숫자 손글씨 마스터
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 hidden sm:inline-block">
                  간화자 & 발음
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                획순 손글씨 연습 · 성조 병음 발음 · 실시간 평가 퀴즈
              </p>
            </div>
          </div>

          {/* 모드 전환 탭 버튼 */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setCurrentTab('practice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'practice'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>손글씨 & 발음</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('quiz')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'quiz'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>퀴즈 평가</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'stats'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>학습 현황</span>
            </button>
          </div>
        </div>
      </header>

      {/* 서브 액션 배너 */}
      <section className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white py-2.5 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-medium">
              오늘의 중국어 숫자 완전 정복: <strong>0(零)부터 10(十)</strong> 및 큰 수의 간화자와 4성 발음을 연습하세요!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlaySequence}
              disabled={isPlayingAll}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAll ? 'animate-bounce' : ''}`} />
              {isPlayingAll ? '0~10 연속 재생 중...' : '0~10 연속 듣기'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-amber-200 font-semibold transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              성조 & 필순 도움말
            </button>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6">
        {/* TAB 1: 손글씨 & 발음 연습 모드 */}
        {currentTab === 'practice' && (
          <div className="flex flex-col gap-6">
            {/* 숫자 빠른 선택기 */}
            <NumberSelector
              currentNumber={currentNumber}
              onSelectNumber={handleSelectNumber}
              progressMap={learningState.progress}
              filterOnlyBookmarked={filterOnlyBookmarked}
              onToggleFilterBookmarked={() => setFilterOnlyBookmarked(!filterOnlyBookmarked)}
            />

            {/* 학습 메인 그리드 (좌: 발음/성조 카드 & 획순, 우: 손글씨 캔버스) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 좌측 컬럼 (발음 카드 & 획순 가이드) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <PronunciationCard
                  numberData={currentNumber}
                  isBookmarked={currentProgress.isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  bestScore={currentProgress.bestScore}
                  practicedCount={currentProgress.practicedCount}
                />

                <StrokeOrderGuide numberData={currentNumber} />
              </div>

              {/* 우측 컬럼 (손글씨 캔버스 & 채점) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-5 rounded-full bg-red-600 inline-block" />
                      <h3 className="text-base font-bold text-stone-900">
                        손글씨 쓰기 연습
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      米자 격자 훈련
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mb-4 text-center leading-relaxed">
                    마우스나 펜, 손가락으로 격자 안에 직접 써보세요.<br />
                    작성 후 <strong>[채점하기]</strong>를 누르면 획의 균형과 정확도를 평가합니다.
                  </p>

                  <HandwritingCanvas
                    key={currentNumber.id}
                    numberData={currentNumber}
                    onScoreRecorded={handleScoreRecorded}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 퀴즈 평가 모드 */}
        {currentTab === 'quiz' && (
          <div className="flex flex-col gap-4">
            <QuizMode />
          </div>
        )}

        {/* TAB 3: 학습 통계 및 현황 대시보드 */}
        {currentTab === 'stats' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                내 중국어 숫자 학습 성취 현황
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                연습한 글자 수, 손글씨 최고 점수, 퀴즈 이력을 한눈에 확인합니다.
              </p>

              {/* 요약 카드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
                  <div className="text-xs font-semibold text-red-700">전체 학습 달성률</div>
                  <div className="text-3xl font-black text-red-800 mt-1">
                    {completionRate}%
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {practicedNumbersCount} / {totalNumbersCount}개 글자 연습 완료
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="text-xs font-semibold text-amber-800">풀이한 퀴즈 수</div>
                  <div className="text-3xl font-black text-amber-900 mt-1">
                    {learningState.quizHistory.length}회
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    누적 퀴즈 도전 횟수
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-800">평균 퀴즈 정답률</div>
                  <div className="text-3xl font-black text-emerald-900 mt-1">
                    {learningState.quizHistory.length > 0
                      ? Math.round(
                          learningState.quizHistory.reduce((acc, q) => acc + q.scorePercentage, 0) /
                            learningState.quizHistory.length
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    최근 퀴즈 평균 점수
                  </div>
                </div>
              </div>

              {/* 각 숫자별 상세 연습 현황 그리드 */}
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-red-600" />
                글자별 손글씨 달성 현황
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-8">
                {CHINESE_NUMBERS.map((n) => {
                  const p = learningState.progress[n.id];
                  const hasDone = p && p.practicedCount > 0;
                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        hasDone
                          ? 'bg-stone-50 border-stone-200'
                          : 'bg-stone-50/40 border-dashed border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="font-chinese font-bold text-2xl text-stone-900">
                        {n.char}
                      </div>
                      <div className="text-[11px] font-mono text-red-600">{n.pinyin}</div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {hasDone ? `최고 ${p.bestScore}점` : '미연습'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 최근 퀴즈 기록 테이블 */}
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                최근 퀴즈 기록
              </h3>
              {learningState.quizHistory.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs bg-stone-50 rounded-2xl border border-stone-200">
                  아직 풀이한 퀴즈가 없습니다. [퀴즈 평가] 탭에서 테스트에 도전해보세요!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-600 border border-stone-200 rounded-2xl overflow-hidden">
                    <thead className="bg-stone-100 text-stone-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">모드</th>
                        <th className="p-3">일시</th>
                        <th className="p-3 text-center">정답 / 문항</th>
                        <th className="p-3 text-right">점수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {learningState.quizHistory.slice(0, 10).map((record) => (
                        <tr key={record.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-3 font-medium text-stone-900">{record.mode}</td>
                          <td className="p-3 text-stone-400">
                            {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 text-center">
                            {record.correctAnswers} / {record.totalQuestions}
                          </td>
                          <td className="p-3 text-right font-bold text-red-600">
                            {record.scorePercentage}점
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 도움말 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-600" />
                중국어 성조 & 손글씨 필순 가이드
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-xl px-2"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-stone-600 leading-relaxed max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-stone-900 mb-1 text-sm text-red-700">
                  1. 중국어 4대 성조(四声)의 비밀
                </h4>
                <ul className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <li><strong>제1성 (—):</strong> 솔(Sol) 음높이로 높고 길게 평평하게 유지 (예: yī, sān, bā)</li>
                  <li><strong>제2성 (/):</strong> 놀랄 때 "응?" 하듯이 중간에서 높은 음으로 올리기 (예: líng, shí)</li>
                  <li><strong>제3성 (∨):</strong> 낮게 내려갔다가 부드럽게 올리기 (예: wǔ, jiǔ, bǎi)</li>
                  <li><strong>제4성 (\):</strong> 단호하게 아래로 뚝 떨어뜨려 발음 (예: èr, sì, liù)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1 text-sm text-red-700">
                  2. 한자 획순 5대 기본 원칙
                </h4>
                <ol className="list-decimal list-inside space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <li>위에서 아래로 씁니다 (예: 二, 三)</li>
                  <li>왼쪽에서 오른쪽으로 씁니다 (예: 川)</li>
                  <li>가로획을 먼저 긋고 세로획을 관통합니다 (예: 十)</li>
                  <li>바깥 틀을 세우고 안쪽을 채운 뒤 맨 마지막에 닫습니다 (예: 四, 百)</li>
                  <li>좌우 대칭 글자는 가운데 중심을 먼저 씁니다 (예: 小, 水)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1 text-sm text-red-700">
                  3. 중국 현지 한 손 숫자 제스처
                </h4>
                <p className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  중국에서는 1부터 10까지를 한 손으로 모두 표현할 수 있습니다! 특히 <strong>6(🤙 전화기), 7(🤌 모으기), 8(👉 권총), 9(☝️ 갈고리), 10(✊ 주먹)</strong>은 시장이나 상점에서 매우 유용하게 쓰입니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="mt-auto py-5 bg-stone-100 border-t border-stone-200/80 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            중국어 숫자 손글씨 쓰기 & 발음 마스터 (Chinese Number Handwriting & Pronunciation Master)
          </span>
          <span className="text-stone-400">
            HTML5 Canvas · Web Speech API · LocalStorage
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;

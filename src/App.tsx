import React, { useState, useEffect } from 'react';
import { CHINESE_NUMBERS } from './data/chineseNumbers';
import type { ChineseNumberData } from './data/chineseNumbers';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { StrokeOrderGuide } from './components/StrokeOrderGuide';
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
  Lightbulb,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { TONE_COLORS } from './data/chineseNumbers';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'practice' | 'quiz' | 'stats'>('practice');
  const [currentNumber, setCurrentNumber] = useState<ChineseNumberData>(CHINESE_NUMBERS[1]); // '一' (1) 기본
  const [learningState, setLearningState] = useState<UserLearningState>(loadLearningState());
  const [filterOnlyBookmarked, setFilterOnlyBookmarked] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  useEffect(() => {
    initVoices();
  }, []);

  const currentIndex = CHINESE_NUMBERS.findIndex((n) => n.id === currentNumber.id);

  const handleSelectNumber = (num: ChineseNumberData) => {
    setCurrentNumber(num);
    playChineseAudio(num.char, 0.85);
  };

  const handlePrevNumber = () => {
    if (currentIndex > 0) {
      handleSelectNumber(CHINESE_NUMBERS[currentIndex - 1]);
    } else {
      handleSelectNumber(CHINESE_NUMBERS[CHINESE_NUMBERS.length - 1]);
    }
  };

  const handleNextNumber = () => {
    if (currentIndex < CHINESE_NUMBERS.length - 1) {
      handleSelectNumber(CHINESE_NUMBERS[currentIndex + 1]);
    } else {
      handleSelectNumber(CHINESE_NUMBERS[0]);
    }
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
    for (let i = 0; i < CHINESE_NUMBERS.length; i++) {
      const item = CHINESE_NUMBERS[i];
      if (item) {
        setCurrentNumber(item);
        await playChineseAudio(item.char, 0.8);
        await new Promise((res) => setTimeout(res, 400));
      }
    }
    setIsPlayingAll(false);
  };

  const handlePlayWord = async (chinese: string) => {
    setPlayingWord(chinese);
    await playChineseAudio(chinese, 0.85);
    setPlayingWord(null);
  };

  const currentProgress = learningState.progress[currentNumber.id] || {
    practicedCount: 0,
    bestScore: 0,
    lastPracticedAt: '',
    isBookmarked: false,
  };

  const toneConfig = TONE_COLORS[currentNumber.tone as keyof typeof TONE_COLORS] || TONE_COLORS[1];

  // 통계 계산
  const totalNumbersCount = CHINESE_NUMBERS.length; // 11개 (0~10)
  const practicedNumbersCount = Object.values(learningState.progress).filter(
    (p) => p.practicedCount > 0
  ).length;
  const completionRate = Math.round((practicedNumbersCount / totalNumbersCount) * 100);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col">
      {/* 최상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <span className="font-chinese font-black text-2xl">写</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                중국어 숫자 손글씨 마스터
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 hidden sm:inline-block">
                  0~10 간화자
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                米자 격자 손글씨 쓰기 · 4성 발음 듣기 · 스마트 퀴즈 평가
              </p>
            </div>
          </div>

          {/* 모드 전환 탭 버튼 */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setCurrentTab('practice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'practice'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>손글씨 쓰기</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('quiz')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
      <section className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white py-2 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-medium">
              중국어 기초 완성: <strong>0(零)부터 10(十)까지</strong> 손글씨를 직접 쓰고 발음을 들어보세요!
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
              {isPlayingAll ? '0~10 연속 재생 중...' : '0~10 음성 듣기'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-amber-200 font-semibold transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              성조 & 필순 안내
            </button>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6">
        {/* TAB 1: 손글씨 쓰기 메인 스튜디오 */}
        {currentTab === 'practice' && (
          <div className="flex flex-col gap-6">
            {/* 1. 숫자 빠른 선택 바 (0부터 10) */}
            <NumberSelector
              currentNumber={currentNumber}
              onSelectNumber={handleSelectNumber}
              progressMap={learningState.progress}
              filterOnlyBookmarked={filterOnlyBookmarked}
              onToggleFilterBookmarked={() => setFilterOnlyBookmarked(!filterOnlyBookmarked)}
            />

            {/* 2. 대형 손글씨 쓰기 스튜디오 (화면의 메인 주인공) */}
            <HandwritingCanvas
              key={currentNumber.id}
              numberData={currentNumber}
              onScoreRecorded={handleScoreRecorded}
              onPrevNumber={handlePrevNumber}
              onNextNumber={handleNextNumber}
              hasPrev={true}
              hasNext={true}
            />

            {/* 3. 손글씨 아래 보조 학습 정보 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto w-full">
              {/* 카드 A: 발음 성조 꿀팁 & 중국 고유 한 손 숫자 제스처 */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 rounded-full bg-red-600" />
                    <h4 className="text-xs font-bold text-stone-800">
                      성조 & 손동작 팁
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className="text-stone-400 hover:text-amber-500 transition-colors p-1"
                    title={currentProgress.isBookmarked ? '복습함에서 제거' : '복습함에 저장'}
                  >
                    {currentProgress.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 성조 팁 */}
                <div className={`p-3 rounded-2xl ${toneConfig.light} border ${toneConfig.border} text-xs leading-relaxed text-stone-700`}>
                  <span className={`font-bold ${toneConfig.text}`}>{currentNumber.toneName}: </span>
                  {currentNumber.toneTip}
                </div>

                {/* 중국 한 손 숫자 손동작 */}
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-stone-200">
                    {currentNumber.handGesture.symbol}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {currentNumber.handGesture.title}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                      {currentNumber.handGesture.description}
                    </div>
                  </div>
                </div>

                {/* 연상 암기 팁 */}
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-stone-700 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">암기 비법: </span>
                    {currentNumber.mnemonic}
                  </div>
                </div>
              </div>

              {/* 카드 B: 실생활 활용 단어 & 표현 */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-bold text-stone-800">
                      실생활 활용 단어
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">터치하여 발음 듣기</span>
                </div>

                <div className="flex flex-col gap-2">
                  {currentNumber.sampleWords.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePlayWord(word.chinese)}
                      className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center justify-between text-left group"
                    >
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-chinese font-bold text-lg text-stone-900 group-hover:text-red-600">
                            {word.chinese}
                          </span>
                          <span className="text-xs font-mono text-red-600 font-semibold">
                            {word.pinyin}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          {word.korean}
                        </div>
                      </div>
                      <Volume2 className={`w-4 h-4 text-stone-400 group-hover:text-red-500 flex-shrink-0 ${playingWord === word.chinese ? 'text-red-600 animate-pulse' : ''}`} />
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-2 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>누적 연습 {currentProgress.practicedCount}회</span>
                  <span>최고 점수: <strong className="text-red-600">{currentProgress.bestScore > 0 ? `${currentProgress.bestScore}점` : '미기록'}</strong></span>
                </div>
              </div>
            </div>

            {/* 4. 획순 상세 설명 가이드 */}
            <div className="max-w-xl mx-auto w-full">
              <StrokeOrderGuide numberData={currentNumber} />
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
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                중국어 숫자(0~10) 학습 성취 현황
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                기초 숫자 0부터 10까지 손글씨 연습 현황과 퀴즈 이력을 확인합니다.
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

              {/* 각 숫자별 상세 연습 현황 그리드 (0부터 10까지 11개) */}
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-red-600" />
                숫자(0~10) 손글씨 달성 현황
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-11 gap-2 mb-8">
                {CHINESE_NUMBERS.map((n) => {
                  const p = learningState.progress[n.id];
                  const hasDone = p && p.practicedCount > 0;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        handleSelectNumber(n);
                        setCurrentTab('practice');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all hover:scale-105 ${
                        hasDone
                          ? 'bg-red-50/50 border-red-200'
                          : 'bg-stone-50/50 border-dashed border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="font-chinese font-bold text-2xl text-stone-900">
                        {n.char}
                      </div>
                      <div className="text-[11px] font-mono text-red-600 font-semibold">{n.pinyin}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{n.value}</div>
                      <div className="text-[10px] font-bold text-amber-700 mt-1">
                        {hasDone ? `${p.bestScore}점` : '미연습'}
                      </div>
                    </button>
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
                  <li><strong>제1성 (—):</strong> 솔(Sol) 음높이로 높고 길게 평평하게 유지 (예: yī 一, sān 三, bā 八)</li>
                  <li><strong>제2성 (/):</strong> 질문할 때 "응?" 하듯이 중간에서 높은 음으로 올리기 (예: líng 零, shí 十)</li>
                  <li><strong>제3성 (∨):</strong> 낮게 내려갔다가 부드럽게 올리기 (예: wǔ 五, jiǔ 九)</li>
                  <li><strong>제4성 (\):</strong> 단호하게 아래로 뚝 떨어뜨려 발음 (예: èr 二, sì 四, liù 六)</li>
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
                  <li>바깥 틀을 세우고 안쪽을 채운 뒤 맨 마지막에 닫습니다 (예: 四)</li>
                  <li>좌우 대칭 글자는 가운데 중심을 먼저 씁니다 (예: 六)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1 text-sm text-red-700">
                  3. 중국 현지 한 손 숫자 제스처 (1~10)
                </h4>
                <p className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  중국에서는 1부터 10까지를 한 손으로 모두 표현합니다! <strong>6(🤙 전화기), 7(🤌 모으기), 8(👉 권총), 9(☝️ 갈고리), 10(✊ 주먹)</strong> 손동작을 활용해보세요.
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
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            중국어 숫자(0~10) 손글씨 마스터 (Chinese Number Handwriting Master)
          </span>
          <span className="text-stone-400">
            米字格 Canvas · Web Speech API · LocalStorage
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHINESE_NUMBERS } from '../data/chineseNumbers';
import type { ChineseNumberData } from '../data/chineseNumbers';
import { playChineseAudio } from '../utils/speech';
import { addQuizRecord } from '../utils/storage';
import { HandwritingCanvas } from './HandwritingCanvas';

type QuizType = 'audio' | 'reading' | 'writing' | 'math';

interface Question {
  type: QuizType;
  prompt: string;
  targetNumber: ChineseNumberData;
  options: {
    label: string;
    isCorrect: boolean;
    subLabel?: string;
  }[];
  audioText?: string;
  mathFormula?: string;
}

export const QuizMode: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<QuizType | 'all'>('all');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [writingScore, setWritingScore] = useState<number | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: Question; userPick: string }[]>([]);

  // 문제 생성기
  const generateQuestions = useCallback((category: QuizType | 'all', count: number = 10): Question[] => {
    const list: Question[] = [];
    const availableNumbers = [...CHINESE_NUMBERS];
    const types: QuizType[] = category === 'all' ? ['audio', 'reading', 'writing', 'math'] : [category];

    // 무작위 셔플
    const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const qType = types[i % types.length];
      const target = shuffled[i % shuffled.length];

      if (qType === 'audio') {
        // 소리 듣고 간화자 맞히기
        const wrongs = availableNumbers
          .filter((n) => n.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: target.char, isCorrect: true, subLabel: `${target.koreanMeaning}` },
          ...wrongs.map((w) => ({ label: w.char, isCorrect: false, subLabel: `${w.koreanMeaning}` })),
        ].sort(() => Math.random() - 0.5);

        list.push({
          type: 'audio',
          prompt: '발음을 잘 듣고, 알맞은 중국어 간화자를 고르세요.',
          targetNumber: target,
          audioText: target.char,
          options,
        });
      } else if (qType === 'reading') {
        // 간화자 보고 병음/뜻 맞히기
        const wrongs = availableNumbers
          .filter((n) => n.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: `${target.pinyin}`, isCorrect: true, subLabel: `${target.koreanSound} (${target.koreanMeaning})` },
          ...wrongs.map((w) => ({
            label: `${w.pinyin}`,
            isCorrect: false,
            subLabel: `${w.koreanSound} (${w.koreanMeaning})`,
          })),
        ].sort(() => Math.random() - 0.5);

        list.push({
          type: 'reading',
          prompt: `간화자 [ ${target.char} ]의 올바른 병음과 의미는 무엇일까요?`,
          targetNumber: target,
          options,
        });
      } else if (qType === 'math') {
        // 중국어 숫자 연산 퀴즈 (1~9 범위)
        const n1 = Math.floor(Math.random() * 5) + 1; // 1~5
        const n2 = Math.floor(Math.random() * 5) + 1; // 1~5
        const sum = n1 + n2;
        const targetObj = availableNumbers.find((n) => n.value === sum) || target;
        const c1 = availableNumbers.find((n) => n.value === n1)?.char || '一';
        const c2 = availableNumbers.find((n) => n.value === n2)?.char || '一';

        const wrongs = availableNumbers
          .filter((n) => n.id !== targetObj.id && typeof n.value === 'number')
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: targetObj.char, isCorrect: true, subLabel: `${targetObj.pinyin} (${targetObj.value})` },
          ...wrongs.map((w) => ({
            label: w.char,
            isCorrect: false,
            subLabel: `${w.pinyin} (${w.value})`,
          })),
        ].sort(() => Math.random() - 0.5);

        list.push({
          type: 'math',
          prompt: `중국어 숫자 덧셈 문제입니다: [ ${c1} + ${c2} = ? ]`,
          targetNumber: targetObj,
          mathFormula: `${c1} + ${c2}`,
          options,
        });
      } else {
        // 직접 손글씨 쓰기 퀴즈
        list.push({
          type: 'writing',
          prompt: `아라비아 숫자 [ ${target.value} ]에 해당하는 중국어 간화자를 직접 써보세요!`,
          targetNumber: target,
          options: [],
        });
      }
    }

    return list;
  }, []);

  const startQuiz = (category: QuizType | 'all') => {
    setSelectedCategory(category);
    const questions = generateQuestions(category, 10);
    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
    setWritingScore(null);
    setWrongAnswers([]);

    // 첫 문제 오디오 타입이면 자동 재생
    if (questions[0]?.type === 'audio' && questions[0]?.audioText) {
      setTimeout(() => playChineseAudio(questions[0].audioText!, 0.85), 400);
    }
  };

  useEffect(() => {
    startQuiz('all');
  }, [generateQuestions]);

  const currentQ = currentQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        { question: currentQ, userPick: currentQ.options[idx].label },
      ]);
    }
  };

  const handleWritingScoreRecorded = (wScore: number) => {
    setWritingScore(wScore);
    setIsAnswerSubmitted(true);
    if (wScore >= 65) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        { question: currentQ, userPick: `정확도 ${wScore}점 (기준 미달)` },
      ]);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setWritingScore(null);

      const nextQ = currentQuestions[nextIdx];
      if (nextQ.type === 'audio' && nextQ.audioText) {
        setTimeout(() => playChineseAudio(nextQ.audioText!, 0.85), 300);
      }
    } else {
      // 퀴즈 종료
      setIsQuizComplete(true);
      const percentage = Math.round((score / currentQuestions.length) * 100);
      addQuizRecord({
        totalQuestions: currentQuestions.length,
        correctAnswers: score,
        scorePercentage: percentage,
        mode: selectedCategory === 'all' ? '종합 마스터 퀴즈' : `${selectedCategory} 모드`,
      });

      if (percentage >= 80) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    }
  };

  if (isQuizComplete) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    let gradeTitle = '🥉 시작하는 초보자 (新手)';
    let gradeDesc = '기초를 다지며 간화자와 병음을 조금 더 연습해 보세요!';
    if (percentage === 100) {
      gradeTitle = '🏆 중국어 숫자 신선 (神仙)';
      gradeDesc = '만점입니다! 중국어 숫자 간화자와 발음을 완벽하게 마스터하셨습니다!';
    } else if (percentage >= 80) {
      gradeTitle = '🥇 중국어 숫자 달인 (高手)';
      gradeDesc = '대단해요! 중국 현지 시장에서도 능숙하게 숫자를 쓰실 수 있습니다.';
    } else if (percentage >= 60) {
      gradeTitle = '🥈 성실한 견습생 (学徒)';
      gradeDesc = '좋은 성적입니다. 틀린 문제를 복습하면 곧 달인이 될 수 있습니다!';
    }

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md max-w-xl mx-auto flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-red-500 flex items-center justify-center text-white shadow-lg mb-4">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-1">
          퀴즈 완료 보고서
        </span>
        <h2 className="text-2xl font-black text-stone-900 mb-1">{gradeTitle}</h2>
        <p className="text-xs text-stone-600 max-w-sm mb-6">{gradeDesc}</p>

        {/* 점수 요약 박스 */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-500">총 문항</div>
            <div className="text-xl font-bold text-stone-800">{currentQuestions.length}문제</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="text-xs text-emerald-700">맞힌 개수</div>
            <div className="text-xl font-bold text-emerald-700">{score}개</div>
          </div>
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
            <div className="text-xs text-red-700">성취도</div>
            <div className="text-xl font-black text-red-700">{percentage}%</div>
          </div>
        </div>

        {/* 오답 노트 */}
        {wrongAnswers.length > 0 && (
          <div className="w-full text-left bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6">
            <h4 className="text-xs font-bold text-stone-800 mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-red-600 rounded-sm" />
              오답 복습 노트 ({wrongAnswers.length}문제)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {wrongAnswers.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs">
                  <div className="text-stone-700 font-medium">{item.question.prompt}</div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-100">
                    <span className="text-stone-500">
                      내 답: <span className="text-red-600 font-semibold">{item.userPick}</span>
                    </span>
                    <span className="text-stone-800 font-bold">
                      정답: <span className="text-emerald-700 font-chinese font-black text-sm">{item.question.targetNumber.char}</span> ({item.question.targetNumber.pinyin})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 다시 풀기 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-sm">
          <button
            type="button"
            onClick={() => startQuiz(selectedCategory)}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            같은 퀴즈 다시 풀기
          </button>
          <button
            type="button"
            onClick={() => startQuiz('all')}
            className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            종합 퀴즈 도전
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-md max-w-2xl mx-auto flex flex-col">
      {/* 퀴즈 상단 바: 카테고리 탭 & 진도 게이지 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600 w-full sm:w-auto justify-center">
          {[
            { id: 'all', label: '종합' },
            { id: 'audio', label: '듣기' },
            { id: 'reading', label: '독음' },
            { id: 'writing', label: '쓰기' },
            { id: 'math', label: '연산' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => startQuiz(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-stone-500">
          <span>
            문제 <strong className="text-red-600 text-sm">{currentIndex + 1}</strong> / {currentQuestions.length}
          </span>
          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
            {score}점
          </span>
        </div>
      </div>

      {/* 문제 프롬프트 헤더 */}
      <div className="my-5 text-center flex flex-col items-center">
        <span className="text-[11px] font-bold tracking-wider text-red-600 uppercase bg-red-50 px-2.5 py-0.5 rounded-full mb-2">
          {currentQ.type === 'audio' && '🎧 발음 듣기 퀴즈'}
          {currentQ.type === 'reading' && '📖 독음 & 병음 퀴즈'}
          {currentQ.type === 'writing' && '✍️ 손글씨 쓰기 도전'}
          {currentQ.type === 'math' && '🧮 중국어 숫자 연산'}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug max-w-md">
          {currentQ.prompt}
        </h3>

        {/* 오디오 퀴즈일 경우 재생 버튼 */}
        {currentQ.type === 'audio' && currentQ.audioText && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => playChineseAudio(currentQ.audioText!, 0.85)}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              발음 다시 듣기
            </button>
          </div>
        )}

        {/* 연산 퀴즈 수식 강조 */}
        {currentQ.type === 'math' && currentQ.mathFormula && (
          <div className="mt-3 text-3xl font-chinese font-black text-red-700 bg-red-50/70 px-6 py-2 rounded-2xl border border-red-200">
            {currentQ.mathFormula} = ?
          </div>
        )}
      </div>

      {/* 답안 선택 영역 (선택형 or 손글씨형) */}
      {currentQ.type === 'writing' ? (
        <div className="w-full flex flex-col items-center">
          <HandwritingCanvas
            key={currentQ.targetNumber.id}
            numberData={currentQ.targetNumber}
            onScoreRecorded={handleWritingScoreRecorded}
            showAudioButton={false}
          />
          {writingScore !== null && (
            <div className="mt-3 text-center">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  writingScore >= 65
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {writingScore >= 65 ? '통과! (65점 이상)' : '재도전이 필요합니다 (65점 미만)'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full my-2">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800';
            if (isAnswerSubmitted) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500';
              } else if (selectedOption === idx) {
                btnStyle = 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500';
              } else {
                btnStyle = 'bg-stone-50 border-stone-200 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerSubmitted}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${btnStyle}`}
              >
                <div>
                  <div className="font-chinese font-bold text-2xl group-hover:scale-105 transition-transform">
                    {opt.label}
                  </div>
                  {opt.subLabel && (
                    <div className="text-xs text-stone-500 mt-0.5">{opt.subLabel}</div>
                  )}
                </div>
                {isAnswerSubmitted && opt.isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                )}
                {isAnswerSubmitted && !opt.isCorrect && selectedOption === idx && (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 정답 해설 및 다음 문제 버튼 */}
      {isAnswerSubmitted && (
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="text-xs text-stone-600">
            정답: <strong className="font-chinese text-base text-stone-900">{currentQ.targetNumber.char}</strong> ({currentQ.targetNumber.pinyin}, {currentQ.targetNumber.koreanMeaning})
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            {currentIndex < currentQuestions.length - 1 ? '다음 문제' : '결과 확인'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

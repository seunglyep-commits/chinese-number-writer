import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import type { ChineseNumberData } from '../data/chineseNumbers';

interface StrokeOrderGuideProps {
  numberData: ChineseNumberData;
}

export const StrokeOrderGuide: React.FC<StrokeOrderGuideProps> = ({ numberData }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const totalSteps = numberData.strokePaths.length;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [numberData.char]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  const togglePlay = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-5 rounded-full bg-red-600 inline-block" />
          <h3 className="text-base font-bold text-stone-900">획순(笔顺) 애니메이션 & 가이드</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {totalSteps > 0 ? `${currentStep + 1} / ${totalSteps} 단계` : '완성형'}
          </span>
        </div>
      </div>

      {/* SVG 획순 시각화 디스플레이 */}
      <div className="relative w-48 h-48 mx-auto rounded-xl bg-amber-50/40 border-2 border-dashed border-red-300 flex items-center justify-center overflow-hidden">
        {/* 미쯔거 보조선 */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#dc2626" strokeDasharray="3 3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#dc2626" strokeDasharray="3 3" />
          <line x1="0" y1="0" x2="100" y2="100" stroke="#dc2626" strokeDasharray="3 3" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#dc2626" strokeDasharray="3 3" />
        </svg>

        {/* 획순 SVG 패스들 */}
        {numberData.strokePaths && numberData.strokePaths.length > 0 ? (
          <svg viewBox="0 0 100 100" className="w-full h-full p-4">
            {numberData.strokePaths.map((path, idx) => {
              const isCurrent = idx === currentStep;
              const isFuture = idx > currentStep;

              if (isFuture) return null;

              return (
                <path
                  key={idx}
                  d={path}
                  fill="none"
                  stroke={isCurrent ? '#dc2626' : '#292524'}
                  strokeWidth={isCurrent ? 7 : 6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isCurrent ? 'animate-pulse' : 'transition-all'}
                />
              );
            })}
          </svg>
        ) : (
          <div className="text-6xl font-chinese font-bold text-stone-800">
            {numberData.char}
          </div>
        )}

        {/* 현재 그리는 획 뱃지 */}
        <div className="absolute bottom-2 right-2 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shadow">
          {currentStep + 1}획 진행 중
        </div>
      </div>

      {/* 획순 컨트롤러 버튼 */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="p-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          title="처음으로"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          처음으로
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? '일시정지' : currentStep >= totalSteps - 1 ? '다시 보기' : '획순 재생'}
        </button>
      </div>

      {/* 획순 상세 단계 설명 목록 */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
          <Info className="w-3.5 h-3.5 text-red-600" />
          필순 규칙 & 작성 순서
        </div>
        <ul className="space-y-1.5 text-xs text-stone-600">
          {numberData.strokeSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
              <span className="font-bold text-red-600 flex-shrink-0 mt-0.5">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

import React from 'react';
import { CHINESE_NUMBERS } from '../data/chineseNumbers';
import type { ChineseNumberData } from '../data/chineseNumbers';
import type { NumberProgress } from '../utils/storage';
import { Bookmark, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface NumberSelectorProps {
  currentNumber: ChineseNumberData;
  onSelectNumber: (num: ChineseNumberData) => void;
  progressMap: Record<number, NumberProgress>;
  filterOnlyBookmarked: boolean;
  onToggleFilterBookmarked: () => void;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  currentNumber,
  onSelectNumber,
  progressMap,
  filterOnlyBookmarked,
  onToggleFilterBookmarked,
}) => {
  const currentIndex = CHINESE_NUMBERS.findIndex((n) => n.id === currentNumber.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectNumber(CHINESE_NUMBERS[currentIndex - 1]);
    } else {
      onSelectNumber(CHINESE_NUMBERS[CHINESE_NUMBERS.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < CHINESE_NUMBERS.length - 1) {
      onSelectNumber(CHINESE_NUMBERS[currentIndex + 1]);
    } else {
      onSelectNumber(CHINESE_NUMBERS[0]);
    }
  };

  const displayedList = filterOnlyBookmarked
    ? CHINESE_NUMBERS.filter((n) => progressMap[n.id]?.isBookmarked)
    : CHINESE_NUMBERS;

  return (
    <div className="w-full bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse" />
          <span className="text-xs font-bold text-stone-800">
            숫자 선택 (0 ~ 10)
          </span>
          <span className="text-[11px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {CHINESE_NUMBERS.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 이전 / 다음 빠른 전환 버튼 */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            title="이전 숫자"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            title="다음 숫자"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFilterBookmarked}
            className={`ml-1 px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
              filterOnlyBookmarked
                ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {filterOnlyBookmarked ? '전체 보기' : '복습 보관함'}
          </button>
        </div>
      </div>

      {/* 0부터 10까지 11개 숫자 버튼 그리드 */}
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
        {displayedList.map((num) => {
          const isSelected = num.id === currentNumber.id;
          const prog = progressMap[num.id];
          const bestScore = prog?.bestScore || 0;
          const isBookmarked = prog?.isBookmarked || false;

          return (
            <button
              key={num.id}
              type="button"
              onClick={() => onSelectNumber(num)}
              className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-gradient-to-b from-red-600 to-rose-700 border-red-700 text-white shadow-md scale-105 z-10'
                  : 'bg-white border-stone-200 hover:border-red-300 text-stone-800 hover:bg-red-50/40'
              }`}
            >
              {/* 북마크 표시 */}
              {isBookmarked && (
                <div className="absolute top-1 right-1">
                  <Bookmark className={`w-3 h-3 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
                </div>
              )}

              {/* 간화자 */}
              <span className="font-chinese font-bold text-2xl sm:text-3xl leading-none mt-0.5">
                {num.char}
              </span>

              {/* 병음 */}
              <span className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-red-100 font-bold' : 'text-red-600 font-semibold'}`}>
                {num.pinyin}
              </span>

              {/* 숫자 번호 */}
              <span className={`text-[10px] ${isSelected ? 'text-stone-200' : 'text-stone-400'}`}>
                {num.value}
              </span>

              {/* 최고 점수 뱃지 */}
              {bestScore > 0 && (
                <div className={`mt-0.5 flex items-center gap-0.5 text-[9px] px-1 rounded font-semibold ${
                  isSelected ? 'bg-black/20 text-amber-200' : 'bg-amber-50 text-amber-800'
                }`}>
                  <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                  {bestScore}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

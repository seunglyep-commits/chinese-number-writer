import React from 'react';
import { CHINESE_NUMBERS } from '../data/chineseNumbers';
import type { ChineseNumberData } from '../data/chineseNumbers';
import type { NumberProgress } from '../utils/storage';
import { Bookmark, Star } from 'lucide-react';

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
  const basicNumbers = CHINESE_NUMBERS.filter((n) => typeof n.value === 'number' && n.value <= 10);
  const largeNumbers = CHINESE_NUMBERS.filter((n) => typeof n.value === 'string' || (typeof n.value === 'number' && n.value > 10) || n.char === '两');

  const filterList = (list: ChineseNumberData[]) => {
    if (!filterOnlyBookmarked) return list;
    return list.filter((n) => progressMap[n.id]?.isBookmarked);
  };

  const renderNumberButton = (num: ChineseNumberData) => {
    const isSelected = num.id === currentNumber.id;
    const prog = progressMap[num.id];
    const bestScore = prog?.bestScore || 0;
    const isBookmarked = prog?.isBookmarked || false;

    return (
      <button
        key={num.id}
        type="button"
        onClick={() => onSelectNumber(num)}
        className={`relative p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] ${
          isSelected
            ? 'bg-red-600 border-red-700 text-white shadow-md scale-105 z-10'
            : 'bg-white border-stone-200 hover:border-red-300 text-stone-800 hover:bg-stone-50'
        }`}
      >
        {/* 북마크 표시 */}
        {isBookmarked && (
          <div className="absolute top-1 right-1">
            <Bookmark className={`w-3 h-3 ${isSelected ? 'text-amber-200 fill-amber-200' : 'text-amber-500 fill-amber-500'}`} />
          </div>
        )}

        {/* 간화자 */}
        <span className="font-chinese font-bold text-2xl sm:text-3xl leading-none mt-1">
          {num.char}
        </span>

        {/* 병음 */}
        <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-red-100' : 'text-red-600 font-semibold'}`}>
          {num.pinyin}
        </span>

        {/* 숫자 / 한글 */}
        <span className={`text-[10px] ${isSelected ? 'text-stone-200' : 'text-stone-400'}`}>
          {num.value}
        </span>

        {/* 최고 점수 뱃지 */}
        {bestScore > 0 && (
          <div className={`mt-1 flex items-center gap-0.5 text-[9px] px-1 rounded ${
            isSelected ? 'bg-red-800/80 text-amber-200' : 'bg-amber-50 text-amber-800'
          }`}>
            <Star className="w-2.5 h-2.5 fill-current" />
            {bestScore}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700">숫자 학습 목록</span>
          <span className="text-[11px] text-stone-400">
            (총 {CHINESE_NUMBERS.length}개)
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleFilterBookmarked}
          className={`px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
            filterOnlyBookmarked
              ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-sm'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          {filterOnlyBookmarked ? '전체 보기' : '복습 보관함만'}
        </button>
      </div>

      {/* 기본 숫자 (0 ~ 10) */}
      <div>
        <div className="text-[11px] font-semibold text-stone-400 mb-1.5">
          기초 숫자 (0 ~ 10)
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
          {filterList(basicNumbers).map(renderNumberButton)}
        </div>
      </div>

      {/* 큰 수 및 단위 (百, 千, 万, 亿, 两) */}
      <div>
        <div className="text-[11px] font-semibold text-stone-400 mb-1.5">
          큰 수 & 단위 (백, 천, 만, 억, 량)
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {filterList(largeNumbers).map(renderNumberButton)}
        </div>
      </div>
    </div>
  );
};

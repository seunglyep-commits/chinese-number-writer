import React, { useState } from 'react';
import { Volume2, Volume1, Bookmark, BookmarkCheck, Lightbulb, Sparkles } from 'lucide-react';
import { TONE_COLORS } from '../data/chineseNumbers';
import type { ChineseNumberData } from '../data/chineseNumbers';
import { playChineseAudio } from '../utils/speech';

interface PronunciationCardProps {
  numberData: ChineseNumberData;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  bestScore?: number;
  practicedCount?: number;
}

export const PronunciationCard: React.FC<PronunciationCardProps> = ({
  numberData,
  isBookmarked,
  onToggleBookmark,
  bestScore = 0,
  practicedCount = 0,
}) => {
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const toneConfig = TONE_COLORS[numberData.tone as keyof typeof TONE_COLORS] || TONE_COLORS[1];

  const handlePlayNormal = async () => {
    setIsPlayingNormal(true);
    await playChineseAudio(numberData.char, 0.9);
    setIsPlayingNormal(false);
  };

  const handlePlaySlow = async () => {
    setIsPlayingSlow(true);
    await playChineseAudio(numberData.char, 0.65);
    setIsPlayingSlow(false);
  };

  const handlePlayWord = async (chinese: string) => {
    setPlayingWord(chinese);
    await playChineseAudio(chinese, 0.85);
    setPlayingWord(null);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col gap-4">
      {/* 상단 헤더: 숫자 정보 및 북마크 */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
            숫자 {numberData.value}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toneConfig.light} ${toneConfig.text} border ${toneConfig.border}`}>
            {numberData.toneName}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg hover:bg-stone-50 transition-colors"
          title={isBookmarked ? '복습 목록에서 제거' : '복습 목록에 저장'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 중앙 메인 발음 디스플레이 */}
      <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-200 flex items-center justify-center shadow-inner">
            <span className="font-chinese font-black text-6xl text-stone-900 tracking-tight">
              {numberData.char}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${toneConfig.text} font-mono tracking-wide`}>
                {numberData.pinyin}
              </span>
              <span className="text-sm font-semibold text-stone-400">
                ({numberData.pinyinToneNumber})
              </span>
            </div>
            <div className="text-lg font-bold text-stone-800 mt-0.5">
              {numberData.koreanSound} <span className="text-sm font-normal text-stone-500">[{numberData.koreanMeaning}]</span>
            </div>
            {numberData.traditional && (
              <div className="text-xs text-stone-500 mt-0.5">
                번체자: <span className="font-chinese font-bold text-stone-700">{numberData.traditional}</span>
              </div>
            )}
          </div>
        </div>

        {/* 음성 듣기 버튼들 */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePlayNormal}
            disabled={isPlayingNormal}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingNormal ? 'animate-bounce' : ''}`} />
            표준 발음 듣기
          </button>
          <button
            type="button"
            onClick={handlePlaySlow}
            disabled={isPlayingSlow}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Volume1 className={`w-4 h-4 ${isPlayingSlow ? 'animate-spin' : ''}`} />
            느리게(0.65x)
          </button>
        </div>
      </div>

      {/* 성조 팁 배너 */}
      <div className={`p-3 rounded-xl ${toneConfig.light} border ${toneConfig.border} flex items-start gap-2.5`}>
        <div className={`mt-0.5 p-1 rounded-md ${toneConfig.bg} text-white`}>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs leading-relaxed text-stone-700">
          <span className={`font-bold ${toneConfig.text}`}>{numberData.toneName} 발음 꿀팁: </span>
          {numberData.toneTip}
        </div>
      </div>

      {/* 중국 고유 한 손 숫자 제스처 카드 */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-3">
        <div className="text-3xl p-2 bg-white rounded-lg shadow-sm border border-stone-200">
          {numberData.handGesture.symbol}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-stone-900">
            {numberData.handGesture.title}
          </div>
          <div className="text-xs text-stone-600 mt-0.5 leading-snug">
            {numberData.handGesture.description}
          </div>
        </div>
      </div>

      {/* 연상 암기 비법 */}
      <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/80 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <span className="font-bold text-amber-900">암기 비법: </span>
          {numberData.mnemonic}
        </div>
      </div>

      {/* 실생활 활용 단어 / 예문 목록 */}
      <div className="mt-1">
        <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
          <span>실생활 활용 단어 & 표현</span>
          <span className="text-[10px] text-stone-400 font-normal">(스피커를 눌러 들어보세요)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {numberData.sampleWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePlayWord(word.chinese)}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-chinese font-bold text-base text-stone-900 group-hover:text-red-600">
                  {word.chinese}
                </span>
                <Volume2 className={`w-3.5 h-3.5 text-stone-400 group-hover:text-red-500 ${playingWord === word.chinese ? 'text-red-600 animate-pulse' : ''}`} />
              </div>
              <div className="text-[11px] text-red-600 font-mono mt-0.5">
                {word.pinyin}
              </div>
              <div className="text-xs text-stone-600 mt-1">
                {word.korean}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 연습 통계 뱃지 */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
        <div>
          누적 손글씨 연습: <span className="font-semibold text-stone-800">{practicedCount}회</span>
        </div>
        <div>
          최고 정확도: <span className="font-bold text-red-600">{bestScore > 0 ? `${bestScore}점` : '미기록'}</span>
        </div>
      </div>
    </div>
  );
};

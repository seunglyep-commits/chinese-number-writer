import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Volume2,
  Volume1,
  Award,
  Eraser,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ChineseNumberData } from '../data/chineseNumbers';
import { TONE_COLORS } from '../data/chineseNumbers';
import { playChineseAudio } from '../utils/speech';

interface HandwritingCanvasProps {
  numberData: ChineseNumberData;
  onScoreRecorded?: (score: number) => void;
  onPrevNumber?: () => void;
  onNextNumber?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  numberData,
  onScoreRecorded,
  onPrevNumber,
  onNextNumber,
  hasPrev = true,
  hasNext = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [gridType, setGridType] = useState<'mizige' | 'tianzige'>('mizige');
  const [brushColor, setBrushColor] = useState('#1c1917'); // 묵색(먹물)
  const [brushWidth, setBrushWidth] = useState(14);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; message: string; stars: number } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [strokesHistory, setStrokesHistory] = useState<ImageData[]>([]);

  // 획순 가이드 오버레이 상태
  const [showStrokeOverlay, setShowStrokeOverlay] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [isAnimPlaying, setIsAnimPlaying] = useState(false);

  const totalSteps = numberData.strokePaths?.length || 0;
  const toneConfig = TONE_COLORS[numberData.tone as keyof typeof TONE_COLORS] || TONE_COLORS[1];

  // 캔버스 크기 맞춤 및 초기화
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;

    setStrokesHistory([]);
    setHasDrawn(false);
    setScoreResult(null);
  }, [brushColor, brushWidth]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [numberData.char, initCanvas]);

  // 획순 애니메이션 타이머
  useEffect(() => {
    setAnimStep(0);
    setIsAnimPlaying(false);
  }, [numberData.char]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isAnimPlaying) {
      timer = setInterval(() => {
        setAnimStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsAnimPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isAnimPlaying, totalSteps]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokesHistory((prev) => [...prev.slice(-10), imgData]);
    } catch {
      // ignore
    }
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
    setScoreResult(null);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokesHistory([]);
    setHasDrawn(false);
    setScoreResult(null);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokesHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = strokesHistory[strokesHistory.length - 1];
    setStrokesHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
    if (strokesHistory.length <= 1) {
      setHasDrawn(false);
    }
  };

  // 손글씨 정확도 채점 알고리즘
  const evaluateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const size = 120; // 정규화 해상도

    // 1. 사용자 그림 다운샘플링
    const userCanvas = document.createElement('canvas');
    userCanvas.width = size;
    userCanvas.height = size;
    const uCtx = userCanvas.getContext('2d');
    if (!uCtx) return;
    uCtx.drawImage(canvas, 0, 0, size, size);
    const uData = uCtx.getImageData(0, 0, size, size).data;

    // 2. 정답 간화자 오프스크린 렌더링
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = size;
    targetCanvas.height = size;
    const tCtx = targetCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.fillStyle = '#000000';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.font = `900 ${Math.floor(size * 0.72)}px "Noto Serif SC", "Source Han Serif CN", "Songti SC", serif`;
    tCtx.fillText(numberData.char, size / 2, size / 2);
    const tData = tCtx.getImageData(0, 0, size, size).data;

    // 3. 픽셀 오버랩 비교
    let targetFilled = 0;
    let userFilled = 0;
    let intersection = 0;

    for (let i = 3; i < uData.length; i += 4) {
      const uAlpha = uData[i] > 30 ? 1 : 0;
      const tAlpha = tData[i] > 30 ? 1 : 0;

      if (tAlpha) targetFilled++;
      if (uAlpha) userFilled++;
      if (tAlpha && uAlpha) intersection++;
    }

    if (targetFilled === 0 || userFilled === 0) {
      setScoreResult({
        score: 30,
        message: '조금 더 글씨를 채워보세요!',
        stars: 1,
      });
      return;
    }

    const recall = intersection / targetFilled;
    const precision = intersection / userFilled;
    const f1 = (2 * recall * precision) / (recall + precision || 1);

    let calculated = Math.round(f1 * 110);
    if (recall > 0.45 && precision > 0.3) {
      calculated = Math.min(98, Math.max(70, calculated + 15));
    } else {
      calculated = Math.max(35, Math.min(85, calculated + 10));
    }

    let message = '';
    let stars = 1;

    if (calculated >= 85) {
      message = '🎉 완벽해요! 붓의 기운이 살아있는 멋진 글씨입니다!';
      stars = 3;
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else if (calculated >= 70) {
      message = '👍 훌륭해요! 획의 위치와 형태가 아주 안정적입니다.';
      stars = 2;
    } else {
      message = '💪 조금 더 가이드 선을 따라 바르게 써보세요!';
      stars = 1;
    }

    setScoreResult({ score: calculated, message, stars });
    if (onScoreRecorded) {
      onScoreRecorded(calculated);
    }
  };

  const handlePlayNormal = async () => {
    setIsPlayingAudio(true);
    await playChineseAudio(numberData.char, 0.9);
    setIsPlayingAudio(false);
  };

  const handlePlaySlow = async () => {
    setIsPlayingSlow(true);
    await playChineseAudio(numberData.char, 0.65);
    setIsPlayingSlow(false);
  };

  const toggleStrokeAnim = () => {
    if (animStep >= totalSteps - 1) {
      setAnimStep(0);
      setIsAnimPlaying(true);
    } else {
      setIsAnimPlaying(!isAnimPlaying);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. 상단 메인 캐릭터 & 발음 바 (손글씨와 직결된 핵심 정보) */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 간화자 & 병음 & 훈음 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-200 flex items-center justify-center shadow-inner relative group">
              <span className="font-chinese font-black text-5xl sm:text-6xl text-stone-900 tracking-tight">
                {numberData.char}
              </span>
              <span className="absolute -bottom-2 text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full shadow">
                {numberData.strokeCount}획
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-3xl sm:text-4xl font-black ${toneConfig.text} font-mono tracking-wide`}>
                  {numberData.pinyin}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${toneConfig.light} ${toneConfig.text} border ${toneConfig.border}`}>
                  {numberData.toneName}
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-stone-800 mt-1">
                숫자 {numberData.value} · {numberData.koreanSound} ({numberData.koreanMeaning})
              </div>
              <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                <span>손동작: {numberData.handGesture.symbol} {numberData.handGesture.title}</span>
              </div>
            </div>
          </div>

          {/* 원어민 발음 듣기 & 획순 보기 버튼군 */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePlayNormal}
              disabled={isPlayingAudio}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              발음 듣기
            </button>
            <button
              type="button"
              onClick={handlePlaySlow}
              disabled={isPlayingSlow}
              className="flex-1 sm:flex-initial px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Volume1 className={`w-4 h-4 ${isPlayingSlow ? 'animate-spin' : ''}`} />
              느리게 (0.65x)
            </button>
            <button
              type="button"
              onClick={() => setShowStrokeOverlay(!showStrokeOverlay)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                showStrokeOverlay
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              {showStrokeOverlay ? '획순 닫기' : '획순 보기'}
            </button>
          </div>
        </div>

        {/* 획순 가이드 오버레이 (열었을 때) */}
        {showStrokeOverlay && (
          <div className="mt-4 pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              {/* 미니 획순 애니메이션 창 */}
              <div className="relative w-28 h-28 bg-white rounded-xl border border-red-200 flex items-center justify-center shadow-xs flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                  {numberData.strokePaths?.map((path, idx) => {
                    const isCurrent = idx === animStep;
                    const isFuture = idx > animStep;
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
                        className={isCurrent ? 'animate-pulse' : ''}
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-1 right-1 text-[9px] bg-red-600 text-white font-bold px-1 rounded">
                  {animStep + 1}/{totalSteps}획
                </div>
              </div>

              {/* 획순 컨트롤 및 텍스트 */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800">
                    획순(笔顺) 단계별 가이드
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnimPlaying(false);
                        setAnimStep(0);
                      }}
                      className="px-2 py-1 text-[11px] bg-white border border-stone-200 rounded text-stone-600 hover:bg-stone-50"
                    >
                      처음으로
                    </button>
                    <button
                      type="button"
                      onClick={toggleStrokeAnim}
                      className="px-2.5 py-1 text-[11px] bg-stone-900 text-white font-bold rounded flex items-center gap-1 shadow-xs"
                    >
                      {isAnimPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {isAnimPlaying ? '일시정지' : '재생'}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  {numberData.strokeSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. 대형 손글씨 연습 캔버스 컨테이너 (화면의 메인 주인공) */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-4 sm:p-6 border-2 border-stone-200 shadow-md flex flex-col items-center">
        {/* 캔버스 상단 미니 툴바 */}
        <div className="flex items-center justify-between w-full mb-3 px-1 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setGridType(gridType === 'mizige' ? 'tianzige' : 'mizige')}
              className="px-3 py-1.5 font-medium rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors shadow-xs"
            >
              {gridType === 'mizige' ? '米자 격자' : '田자 격자'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className={`px-3 py-1.5 font-medium rounded-lg border transition-colors shadow-xs flex items-center gap-1 ${
                showGuide
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-stone-200 text-stone-600'
              }`}
            >
              {showGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showGuide ? '가이드 글씨 ON' : '가이드 OFF'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 붓 색상 선택 */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full">
              {[
                { color: '#1c1917', label: '먹물' },
                { color: '#dc2626', label: '주홍' },
                { color: '#2563eb', label: '남색' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setBrushColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    brushColor === c.color ? 'ring-2 ring-stone-900 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>

            {/* 붓 굵기 */}
            <select
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 shadow-xs"
            >
              <option value={10}>가는 붓</option>
              <option value={14}>보통 붓</option>
              <option value={20}>굵은 붓</option>
            </select>
          </div>
        </div>

        {/* 캔버스 본체: 시원하게 확대된 대형 정방형 캔버스 */}
        <div
          ref={containerRef}
          className={`relative w-full aspect-square max-w-[420px] sm:max-w-[460px] rounded-3xl border-4 border-red-700 shadow-xl overflow-hidden select-none touch-none ${
            gridType === 'mizige' ? 'mizige-bg' : 'tianzige-bg'
          }`}
        >
          {/* 중앙 십자 가이드 점선 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full border-t border-dashed border-red-400/35" />
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="h-full border-l border-dashed border-red-400/35" />
          </div>

          {/* 은은한 배경 가이드 간화자 */}
          {showGuide && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-red-700/[0.18] font-chinese font-black text-[230px] sm:text-[270px] leading-none transform translate-y-1"
              style={{
                textShadow: '0 0 1px rgba(220, 38, 38, 0.1)',
              }}
            >
              {numberData.char}
            </div>
          )}

          {/* 실제 드로잉 캔버스 */}
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          />

          {/* 획수 뱃지 */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            총 {numberData.strokeCount}획
          </div>
        </div>

        {/* 캔버스 하단 컨트롤 버튼 바 */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 gap-2.5">
          {/* 편집 도구: 되돌리기 & 지우기 */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={undoLastStroke}
              disabled={strokesHistory.length === 0}
              className="p-2.5 text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center gap-1 text-xs font-semibold"
              title="마지막 획 되돌리기"
            >
              <RotateCcw className="w-4 h-4" />
              <span>되돌리기</span>
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3.5 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-red-50 hover:text-red-600 border border-stone-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Eraser className="w-4 h-4" />
              <span>새로 쓰기</span>
            </button>
          </div>

          {/* 채점하기 메인 액션 버튼 */}
          <button
            type="button"
            onClick={evaluateHandwriting}
            disabled={!hasDrawn}
            className="w-full sm:w-auto px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>손글씨 채점하기</span>
          </button>
        </div>

        {/* 채점 결과 피드백 배너 */}
        {scoreResult && (
          <div className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-300 shadow-md animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-black text-stone-900">
                    정확도 {scoreResult.score}점
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    {scoreResult.message}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-amber-500 text-lg">
                {'⭐'.repeat(scoreResult.stars)}
              </div>
            </div>

            {/* 다음 글자 바로가기 추천 버튼 */}
            {onNextNumber && hasNext && (
              <div className="mt-3 pt-3 border-t border-amber-200/80 flex justify-end">
                <button
                  type="button"
                  onClick={onNextNumber}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <span>다음 숫자로 계속 쓰기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 이전 / 다음 숫자 빠른 넘기기 바 */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-stone-100 text-xs">
          <button
            type="button"
            onClick={onPrevNumber}
            disabled={!hasPrev}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 숫자</span>
          </button>

          <span className="text-stone-400 font-medium">
            현재: <strong className="text-stone-800 font-chinese text-sm">{numberData.char}</strong> ({numberData.pinyin})
          </span>

          <button
            type="button"
            onClick={onNextNumber}
            disabled={!hasNext}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <span>다음 숫자</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

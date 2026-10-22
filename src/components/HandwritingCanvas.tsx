import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Eye, EyeOff, Sparkles, Volume2, Award, Eraser } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ChineseNumberData } from '../data/chineseNumbers';
import { playChineseAudio } from '../utils/speech';

interface HandwritingCanvasProps {
  numberData: ChineseNumberData;
  onScoreRecorded?: (score: number) => void;
  showAudioButton?: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  numberData,
  onScoreRecorded,
  showAudioButton = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [gridType, setGridType] = useState<'mizige' | 'tianzige'>('mizige');
  const [brushColor, setBrushColor] = useState('#1c1917'); // 묵색(먹물)
  const [brushWidth, setBrushWidth] = useState(12);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; message: string; stars: number } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [strokesHistory, setStrokesHistory] = useState<ImageData[]>([]);

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

    // 히스토리 초기화
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

  // 손글씨 정확도 채점 알고리즘 (오프스크린 정답 비트맵과 사용자 입력 비트맵 비교)
  const evaluateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const size = 120; // 다운샘플링하여 비교

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

    // 포괄률(Recall) 및 정밀도(Precision) 가중 결합
    const recall = intersection / targetFilled;
    const precision = intersection / userFilled;
    const f1 = (2 * recall * precision) / (recall + precision || 1);

    // 기본 점수 계산 (30 ~ 98점 범위로 자연스럽게 정규화)
    let calculated = Math.round(f1 * 110);
    // 최소 획수 및 과도한 빈칸 보정
    if (recall > 0.45 && precision > 0.3) {
      calculated = Math.min(98, Math.max(70, calculated + 15));
    } else {
      calculated = Math.max(35, Math.min(85, calculated + 10));
    }

    let message = '';
    let stars = 1;

    if (calculated >= 85) {
      message = '🎉 완벽해요! 서예가처럼 멋진 획입니다!';
      stars = 3;
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else if (calculated >= 70) {
      message = '👍 훌륭해요! 획의 위치와 균형이 아주 좋습니다.';
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

  const handleAudio = async () => {
    setIsPlayingAudio(true);
    await playChineseAudio(numberData.char, 0.85);
    setIsPlayingAudio(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* 캔버스 상단 툴바 */}
      <div className="flex items-center justify-between w-full mb-2 px-1 text-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGridType(gridType === 'mizige' ? 'tianzige' : 'mizige')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-sm"
            title="격자 스타일 변경"
          >
            {gridType === 'mizige' ? '米자 격자' : '田자 격자'}
          </button>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shadow-sm flex items-center gap-1 ${
              showGuide
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-stone-300 text-stone-600'
            }`}
          >
            {showGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showGuide ? '가이드 켬' : '가이드 끔'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* 브러시 색상 선택 */}
          <div className="flex items-center gap-1">
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
                  brushColor === c.color ? 'ring-2 ring-offset-2 ring-stone-800 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* 붓 굵기 */}
          <select
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number(e.target.value))}
            className="text-xs bg-white border border-stone-300 rounded px-1.5 py-1 text-stone-700 shadow-sm"
          >
            <option value={8}>가는 붓</option>
            <option value={12}>보통 붓</option>
            <option value={18}>굵은 붓</option>
          </select>
        </div>
      </div>

      {/* 손글씨 캔버스 영역 */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-square max-w-[340px] sm:max-w-[380px] rounded-2xl border-4 border-red-700/80 shadow-lg overflow-hidden select-none ${
          gridType === 'mizige' ? 'mizige-bg' : 'tianzige-bg'
        }`}
      >
        {/* 중앙 십자 가이드 점선 라벨 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full border-t border-dashed border-red-400/30" />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-full border-l border-dashed border-red-400/30" />
        </div>

        {/* 은은한 배경 가이드 간화자 */}
        {showGuide && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-red-700/[0.16] font-chinese font-black text-[180px] sm:text-[210px] leading-none transform translate-y-1"
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

        {/* 획수 안내 뱃지 */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none bg-red-100/90 text-red-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200">
          총 {numberData.strokeCount}획
        </div>
      </div>

      {/* 캔버스 하단 컨트롤 버튼 */}
      <div className="flex items-center justify-between w-full mt-3 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undoLastStroke}
            disabled={strokesHistory.length === 0}
            className="p-2 text-stone-600 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
            title="마지막 획 되돌리기"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-red-50 hover:text-red-600 border border-stone-300 rounded-lg shadow-sm transition-colors flex items-center gap-1"
          >
            <Eraser className="w-3.5 h-3.5" />
            지우기
          </button>
          {showAudioButton && (
            <button
              type="button"
              onClick={handleAudio}
              disabled={isPlayingAudio}
              className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-red-600' : ''}`} />
              발음 듣기
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={evaluateHandwriting}
          disabled={!hasDrawn}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          채점하기
        </button>
      </div>

      {/* 채점 결과 피드백 배너 */}
      {scoreResult && (
        <div className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-base font-bold text-stone-900">
                정확도 {scoreResult.score}점
              </span>
            </div>
            <div className="flex items-center text-amber-500 text-sm">
              {'⭐'.repeat(scoreResult.stars)}
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-1 font-medium">{scoreResult.message}</p>
        </div>
      )}
    </div>
  );
};

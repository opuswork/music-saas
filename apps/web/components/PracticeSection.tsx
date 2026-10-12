'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Check, X, ChevronRight, ChevronLeft, RotateCcw, Eye } from 'lucide-react';
import practiceDataJson from '../data/practiceData.json';

type PracticeProblem = {
  id: number | string;
  groupId: string;
  type: 'input' | 'choice' | 'drag-matching' | 'circle-matching';
  /** 없거나 빈 문자열이면 이미지 영역을 렌더하지 않음 */
  image?: string;
  question: string;
  answer: string;
  options?: string[];
  items?: { id: string; correct: string }[];
};

const practiceData: PracticeProblem[] = practiceDataJson as any[];

type ProblemSnapshot = {
  userInput: string;
  selectedOption: string | null;
  placedItems: Record<string, string>;
};

export default function PracticeSection({
  practiceId,
  inlineProblems,
}: {
  practiceId?: string;
  /** When set (non-empty), these problems are shown instead of filtering `practiceData.json`. */
  inlineProblems?: PracticeProblem[] | null;
}) {
  const normalizedPracticeId = practiceId?.trim() || '';
  const currentData = useMemo(() => {
    if (inlineProblems && inlineProblems.length > 0) {
      return inlineProblems;
    }
    return normalizedPracticeId
      ? practiceData.filter((p) => p.groupId === normalizedPracticeId)
      : [];
  }, [normalizedPracticeId, inlineProblems]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'checked'>('idle');
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({});
  const [selectedDragValue, setSelectedDragValue] = useState<string | null>(null);
  const [selectedSourceSlotId, setSelectedSourceSlotId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [solutionSnapshots, setSolutionSnapshots] = useState<
    Record<number, ProblemSnapshot>
  >({});

  const totalProblems = currentData.length;

  const currentProblem = currentData[currentIdx];

  const scoreForProblem = (prob: PracticeProblem, snap: ProblemSnapshot) => {
    if ((prob.type === 'drag-matching' || prob.type === 'circle-matching') && prob.items) {
      return prob.items.filter((item) => snap.placedItems[item.id] === item.correct).length;
    }
    if (prob.type === 'choice') {
      return snap.selectedOption?.toLowerCase() === prob.answer.toLowerCase() ? 1 : 0;
    }
    if (prob.type === 'input') {
      return snap.userInput.trim().toLowerCase() === prob.answer.toLowerCase() ? 1 : 0;
    }
    return 0;
  };

  const saveCurrentSnapshot = () => {
    setSolutionSnapshots((prev) => ({
      ...prev,
      [currentIdx]: {
        userInput,
        selectedOption,
        placedItems: { ...placedItems },
      },
    }));
  };

  // 🌟 점수 계산 로직
  const calculateScore = () => {
    if (currentProblem.type === 'drag-matching' || currentProblem.type === 'circle-matching') {
      if (!currentProblem.items) return 0;
      return currentProblem.items.filter(item => placedItems[item.id] === item.correct).length;
    }
    if (currentProblem.type === 'choice') {
      return selectedOption?.toLowerCase() === currentProblem.answer.toLowerCase() ? 1 : 0;
    }
    if (currentProblem.type === 'input') {
      return userInput.trim().toLowerCase() === currentProblem.answer.toLowerCase() ? 1 : 0;
    }
    return 0;
  };

  const totalPossible = currentProblem.type === 'drag-matching' 
    ? (currentProblem.items?.length || 0) 
    : currentProblem.type === 'circle-matching'
      ? (currentProblem.items?.length || 0)
      : 1;

  const handleReset = () => {
    setUserInput('');
    setSelectedOption(null);
    setPlacedItems({});
    setSelectedDragValue(null);
    setSelectedSourceSlotId(null);
    setStatus('idle');
    setCurrentScore(0);
  };

  const handleFullRetry = () => {
    setCurrentIdx(0);
    setShowResult(false);
    setReviewMode(false);
    setSolutionSnapshots({});
    handleReset();
  };

  useEffect(() => {
    handleFullRetry();
  }, [normalizedPracticeId, inlineProblems]);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const handleCheck = () => {
    const score = calculateScore();
    setCurrentScore(score);
    setStatus('checked');
  };

  const handleNext = () => {
    if (currentIdx < currentData.length - 1) {
      saveCurrentSnapshot();
      setCurrentIdx((prev) => prev + 1);
      handleReset();
    }
  };

  const handleFinish = () => {
    saveCurrentSnapshot();
    setShowResult(true);
  };

  const handleShowSolution = () => {
    setShowResult(false);
    setReviewMode(true);
    setCurrentIdx(0);
  };

  useEffect(() => {
    if (!reviewMode) return;
    const snap = solutionSnapshots[currentIdx];
    if (!snap) return;
    const prob = currentData[currentIdx];
    if (!prob) return;
    setUserInput(snap.userInput);
    setSelectedOption(snap.selectedOption);
    setPlacedItems(snap.placedItems);
    setStatus('checked');
    setCurrentScore(scoreForProblem(prob, snap));
  }, [reviewMode, currentIdx, solutionSnapshots, currentData]);

  const goReviewPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const goReviewNext = () => {
    if (currentIdx < totalProblems - 1) setCurrentIdx((i) => i + 1);
  };

  const handleExitReview = () => {
    setReviewMode(false);
    setShowResult(true);
  };

  const onOptionDragStart = (e: React.DragEvent, val: string) => {
    if (reviewMode || status === 'checked') return;
    e.dataTransfer.setData('value', val);
    e.dataTransfer.setData('sourceSlotId', '');
    e.dataTransfer.effectAllowed = 'move';
  };

  const onSlotDragStart = (e: React.DragEvent, slotId: string, val: string) => {
    if (reviewMode || status === 'checked') return;
    e.dataTransfer.setData('value', val);
    e.dataTransfer.setData('sourceSlotId', slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const placeValueToSlot = (value: string, slotId: string, sourceSlotId: string | null) => {
    if (!value) return;
    setPlacedItems((prev) => {
      const next: Record<string, string> = { ...prev };
      const targetPrevVal = next[slotId];

      // 유일성 보장: 같은 값이 다른 슬롯에 있으면 제거
      for (const [k, v] of Object.entries(next)) {
        if (k !== slotId && v === value) {
          delete next[k];
        }
      }

      // 슬롯에서 이동 시 swap 지원
      if (sourceSlotId && sourceSlotId !== slotId) {
        if (targetPrevVal) {
          next[sourceSlotId] = targetPrevVal;
        } else {
          delete next[sourceSlotId];
        }
      }

      next[slotId] = value;
      return next;
    });
  };

  const onDrop = (e: React.DragEvent, slotId: string) => {
    if (reviewMode) return;
    e.preventDefault();
    const val = e.dataTransfer.getData('value');
    const sourceSlotIdRaw = e.dataTransfer.getData('sourceSlotId');
    const sourceSlotId = sourceSlotIdRaw?.trim() ? sourceSlotIdRaw.trim() : null;

    if (!val) return;
    placeValueToSlot(val, slotId, sourceSlotId);
  };

  const onOptionTap = (val: string) => {
    if (readOnly || status !== 'idle') return;
    if (Object.values(placedItems).includes(val)) return;
    setSelectedDragValue((prev) => (prev === val ? null : val));
    setSelectedSourceSlotId(null);
  };

  const onSlotTap = (slotId: string) => {
    if (readOnly || status !== 'idle') return;
    const placedVal = placedItems[slotId];

    // 탭으로 슬롯 값 선택(이동 준비)
    if (placedVal && !selectedDragValue) {
      setSelectedDragValue(placedVal);
      setSelectedSourceSlotId(slotId);
      return;
    }

    // 이미 선택된 값이 있으면 해당 슬롯에 배치/이동
    if (selectedDragValue) {
      placeValueToSlot(selectedDragValue, slotId, selectedSourceSlotId);
      setSelectedDragValue(null);
      setSelectedSourceSlotId(null);
      return;
    }
  };

  if (!normalizedPracticeId) {
    return <div className="p-10 text-center text-amber-700">Practice block is missing a practiceId.</div>;
  }

  if (!currentProblem) {
    return (
      <div className="p-10 text-center text-amber-700">
        Practice data not found for <code>{normalizedPracticeId}</code>.
      </div>
    );
  }

  const allCorrect = currentScore === totalPossible;
  const readOnly = reviewMode;

  return (
    <div className="max-w-4xl mx-auto my-10 bg-[#7c7c94] rounded-sm shadow-2xl overflow-hidden font-sans p-1">
      <div className="bg-[#4a4a6a] p-3 text-white font-bold tracking-wider text-sm px-4">Practice Question</div>

      <div className="bg-[#f0f0f7] p-4 relative min-h-[600px] flex flex-col">
        <div className="bg-white rounded-sm p-8 shadow-sm flex-1 flex flex-col relative">
          
          {showResult ? (
            /* 🌟 최종 결과 화면 */
            <div className="text-center animate-fadeIn py-12 flex-1 flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-gray-600 mb-10">잘 하셨습니다!</h1>
              <div className="flex items-center justify-center gap-6 mb-12">
                <div className="flex items-center gap-3">
                  <span className="text-5xl text-yellow-400">★</span>
                  <span className="text-5xl font-bold text-[#374151] tabular-nums">
                    {totalProblems} / {totalProblems}
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm mb-8">
                완료한 문제 {totalProblems}개를 모두 맞혔습니다.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleFullRetry}
                  className="inline-flex items-center gap-2 bg-[#1e74fd] hover:bg-blue-700 text-white px-10 py-3 rounded-full font-bold shadow-md transition active:scale-95"
                >
                  <RotateCcw size={20} /> Retry
                </button>
                <button
                  type="button"
                  onClick={handleShowSolution}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-10 py-3 rounded-full font-bold shadow-md transition active:scale-95"
                >
                  <Eye size={20} /> Show Solution
                </button>
              </div>
            </div>
          ) : (
            <>
              {reviewMode && (
                <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-900 font-medium text-center">
                  복습 모드 — 맞힌 풀이를 확인합니다. 이전·다음으로 이동할 수 있습니다.
                </div>
              )}
              {currentProblem.image?.trim() ? (
                <div className="flex justify-center mb-8 pb-4 border-b border-gray-100 min-h-[160px]">
                  <Image
                    src={currentProblem.image.trim()}
                    alt="Practice"
                    width={700}
                    height={180}
                    className="object-contain"
                    priority
                  />
                </div>
              ) : null}

              <div className="flex-1">
                <p className="text-[1.1rem] font-medium text-gray-800 mb-10">{currentProblem.question}</p>

                {/* 1. 드래그 매칭 UI */}
                {currentProblem.type === 'drag-matching' && (
                  <div className="flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                      {currentProblem.items?.map((item) => {
                        const placedVal = placedItems[item.id];
                        const isSlotCorrect = placedVal === item.correct;
                        
                        return (
                          <div key={item.id} className="relative">
                            <div 
                              onDragOver={(e) => !readOnly && e.preventDefault()}
                              onDrop={(e) => onDrop(e, item.id)}
                              className={`w-14 h-14 border-2 border-black rounded-xl flex items-center justify-center transition-all ${!placedVal ? 'bg-transparent' : 'bg-gray-50 shadow-inner'}`}
                            >
                              {placedVal && (
                                <span className={`text-lg font-bold ${status === 'checked' ? (isSlotCorrect ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
                                  {placedVal}
                                </span>
                              )}
                            </div>
                            
                            {/* 🌟 개별 피드백 아이콘 및 +1/-1 표시 */}
                            {status === 'checked' && (
                              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                {isSlotCorrect ? (
                                  <>
                                    <Check size={18} className="text-green-600 font-bold" />
                                    <span className="absolute -top-14 -right-2 bg-green-100 text-green-700 text-[10px] px-1 rounded border border-green-200 font-bold">+1</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={18} className="text-red-600 font-bold" />
                                    <span className="absolute -top-14 -right-2 bg-red-100 text-red-700 text-[10px] px-1 rounded border border-red-200 font-bold">-1</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 선택지 버튼들 */}
                    <div className="flex flex-wrap justify-center gap-3 max-w-xl">
                      {currentProblem.options?.map((opt, idx) => {
                        const isUsed = Object.values(placedItems).includes(opt);
                        return (
                          <div 
                            key={idx} 
                            draggable={!readOnly && status === 'idle'} 
                            onDragStart={(e) => onOptionDragStart(e, opt)} 
                            className={`px-4 py-2 bg-[#eeeeee] border border-gray-300 rounded shadow-sm text-sm font-bold transition-all ${!readOnly && status === 'idle' ? 'cursor-grab active:cursor-grabbing hover:bg-gray-200' : 'cursor-default'} ${isUsed ? 'opacity-20 grayscale' : 'opacity-100'}`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1-b. Circle of Fifths 매칭 UI */}
                {currentProblem.type === 'circle-matching' && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-full max-w-[720px] aspect-square rounded-md border border-gray-200 shadow-sm overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/40" />

                      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
                        <Image
                          src="/images/lesson-data/background-65cc00889a6f6.png"
                          alt="Circle of Fifths"
                          width={530}
                          height={530}
                          className="object-contain drop-shadow-sm translate-y-[24px] sm:translate-y-[50px]"
                          priority
                        />
                      </div>

                      {(() => {
                        const desktopPositions = [
                          { top: '10%', left: '50%' }, // C
                          { top: '17%', left: '71%' }, // G
                          { top: '30%', left: '83%' }, // D
                          { top: '47%', left: '86%' }, // A
                          { top: '62%', left: '84%' }, // E
                          { top: '76%', left: '72%' }, // B/Cb
                          { top: '81%', left: '50%' }, // F#/Gb
                          { top: '76%', left: '30%' }, // Db/C#
                          { top: '61%', left: '17%' }, // Ab
                          { top: '47%', left: '14%' }, // Eb
                          { top: '30%', left: '17%' }, // Bb
                          { top: '17%', left: '29%' }, // F
                        ];
                        const mobilePositions = [
                          { top: '2%', left: '50%' }, // C
                          { top: '10%', left: '76%' }, // G
                          { top: '29%', left: '91%' }, // D
                          { top: '48%', left: '94%' }, // A
                          { top: '67%', left: '90%' }, // E
                          { top: '82%', left: '76%' }, // B/Cb
                          { top: '88%', left: '50%' }, // F#/Gb
                          { top: '82%', left: '24%' }, // Db/C#
                          { top: '67%', left: '10%' }, // Ab
                          { top: '48%', left: '6%' }, // Eb
                          { top: '29%', left: '9%' }, // Bb
                          { top: '10%', left: '22%' }, // F
                        ];
                        const tabletPositions = [
                          { top: '5%', left: '50%' }, // C
                          { top: '12%', left: '74%' }, // G
                          { top: '28%', left: '89%' }, // D
                          { top: '48%', left: '92%' }, // A
                          { top: '66%', left: '88%' }, // E
                          { top: '80%', left: '73%' }, // B/Cb
                          { top: '86%', left: '50%' }, // F#/Gb
                          { top: '80%', left: '27%' }, // Db/C#
                          { top: '66%', left: '12%' }, // Ab
                          { top: '48%', left: '8%' }, // Eb
                          { top: '28%', left: '11%' }, // Bb
                          { top: '12%', left: '26%' }, // F
                        ];
                        const positions = isMobile
                          ? mobilePositions
                          : isTablet
                            ? tabletPositions
                            : desktopPositions;

                        return (
                          <>
                            {currentProblem.items?.map((item, idx) => {
                              const pos = positions[idx] ?? { top: '50%', left: '50%' };
                              const placedVal = placedItems[item.id];
                              const isSlotCorrect = placedVal === item.correct;

                              const showFeedback = status === 'checked';
                              const isTapSelected =
                                status === 'idle' &&
                                !!selectedDragValue &&
                                selectedSourceSlotId === item.id &&
                                selectedDragValue === placedVal;
                              const base =
                                'absolute -translate-x-1/2 -translate-y-1/2 w-[46px] h-[34px] sm:w-[64px] sm:h-[44px] rounded-sm border flex items-center justify-center text-[11px] sm:text-sm font-extrabold tracking-wide shadow-sm';
                              const idleCls = 'bg-white/75 border-gray-300';
                              const okCls = 'bg-emerald-100/90 border-emerald-400 text-emerald-800';
                              const badCls = 'bg-rose-100/90 border-rose-400 text-rose-800';
                              const selectedCls = 'ring-2 ring-blue-400 bg-blue-50/90 border-blue-400';

                              const cls = `${base} ${
                                !placedVal ? idleCls : showFeedback ? (isSlotCorrect ? okCls : badCls) : 'bg-white/90 border-gray-400'
                              } ${isTapSelected ? selectedCls : ''}`;

                              return (
                                <button
                                  type="button"
                                  key={item.id}
                                  onDragOver={(e) => !readOnly && e.preventDefault()}
                                  onDrop={(e) => onDrop(e, item.id)}
                                  onClick={() => onSlotTap(item.id)}
                                  className={cls}
                                  style={{ top: pos.top, left: pos.left }}
                                >
                                  {placedVal ? (
                                    <div
                                      draggable={!readOnly && status === 'idle'}
                                      onDragStart={(e) => onSlotDragStart(e, item.id, placedVal)}
                                      className={`px-1.5 py-0.5 rounded ${
                                        !readOnly && status === 'idle' ? 'cursor-grab active:cursor-grabbing' : ''
                                      }`}
                                      title="Drag to move"
                                    >
                                      {placedVal}
                                    </div>
                                  ) : (
                                    ''
                                  )}
                                  {showFeedback && placedVal ? (
                                    <span className="absolute -top-2.5 -right-2.5">
                                      {isSlotCorrect ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow">
                                          <Check size={12} />
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white shadow">
                                          <X size={12} />
                                        </span>
                                      )}
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-2xl mt-6 sm:mt-8">
                      {currentProblem.options?.map((opt, idx) => {
                        const isUsed = Object.values(placedItems).includes(opt);
                        const isTapSelected =
                          status === 'idle' && !isUsed && selectedDragValue === opt && !selectedSourceSlotId;
                        return (
                          <button
                            type="button"
                            key={idx}
                            draggable={!readOnly && status === 'idle' && !isUsed}
                            onDragStart={(e) => !isUsed && onOptionDragStart(e, opt)}
                            onClick={() => onOptionTap(opt)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-[#eeeeee] border border-gray-300 rounded shadow-sm text-[12px] sm:text-sm font-bold transition-all ${
                              !readOnly && status === 'idle' && !isUsed
                                ? 'cursor-grab active:cursor-grabbing hover:bg-gray-200'
                                : 'cursor-default'
                            } ${isUsed ? 'opacity-20 grayscale' : 'opacity-100'} ${isTapSelected ? 'ring-2 ring-blue-400' : ''}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {status === 'idle' && (
                      <p className="mt-3 text-xs text-gray-500 text-center sm:hidden">
                        스마트폰: 버튼을 탭한 뒤, 원안의 매칭되는 임시표의 갯수를 박스에 배치하세요.
                      </p>
                    )}
                  </div>
                )}

                {/* 2. 객관식 UI */}
                {currentProblem.type === 'choice' && (
                  <div className="space-y-3 mb-10">
                    {currentProblem.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option.toLowerCase() === currentProblem.answer.toLowerCase();
                      let btnClass = "w-full flex items-center gap-4 p-3.5 rounded-md border transition-all text-left ";
                      if (status === 'idle' && !readOnly) btnClass += isSelected ? "bg-[#dcdcdc] border-gray-400 shadow-inner" : "bg-[#eeeeee] border-gray-300 hover:bg-[#e5e5e5]";
                      else btnClass += (isCorrect) ? "bg-[#e8f5e9] border-green-500 text-green-800 font-bold" : (isSelected ? "bg-[#ffebee] border-red-400 text-red-700 opacity-80" : "bg-gray-50 border-gray-200 opacity-50");
                      return (
                        <button key={idx} type="button" onClick={() => !readOnly && status === 'idle' && setSelectedOption(option)} disabled={readOnly || status !== 'idle'} className={btnClass}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-gray-600 bg-gray-600' : 'border-gray-400 bg-white'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                          <span className="flex-1">{option}</span>
                          {status === 'checked' && isSelected && (isCorrect ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-red-500" />)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. 주관식 UI */}
                {currentProblem.type === 'input' && (
                  <div className="flex flex-wrap items-center gap-3 text-lg mb-12 py-4">
                    <span>The following interval is a</span>
                    <div className="relative flex items-center">
                      {status === 'checked' && (userInput.trim().toLowerCase() === currentProblem.answer.toLowerCase()) ? (
                        <div className="flex items-center bg-green-50 border-2 border-green-200 rounded px-3 py-1.5 gap-2"><span className="text-green-700 font-bold">{userInput}</span><Check size={18} className="text-green-600" /></div>
                      ) : status === 'checked' ? (
                        <div className="flex items-center bg-red-50 border-2 border-red-200 rounded px-3 py-1.5 gap-2 animate-shake"><span className="text-red-600 line-through">{userInput}</span><X size={18} className="text-red-600" /></div>
                      ) : (
                        <input type="text" value={userInput} placeholder="answer" readOnly={readOnly} onChange={(e) => !readOnly && setUserInput(e.target.value)} onKeyDown={(e) => !readOnly && e.key === 'Enter' && handleCheck()} className="border-b-2 border-gray-300 outline-none focus:border-blue-500 px-2 w-40 text-center bg-transparent" />
                      )}
                    </div>
                    <span>step.</span>
                  </div>
                )}
              </div>

              {/* 하단 컨트롤 영역 */}
              <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3">
                {reviewMode ? (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goReviewPrev}
                        disabled={currentIdx === 0}
                        className="p-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                        aria-label="Previous problem"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 tabular-nums min-w-[4.5rem] text-center">
                        {currentIdx + 1} / {totalProblems}
                      </span>
                      <button
                        type="button"
                        onClick={goReviewNext}
                        disabled={currentIdx >= totalProblems - 1}
                        className="p-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                        aria-label="Next problem"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleExitReview}
                      className="ml-auto bg-slate-600 hover:bg-slate-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
                    >
                      결과로 돌아가기
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 flex-wrap">
                      {status === 'idle' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCheck}
                            className="flex items-center gap-2 bg-[#2575e6] hover:bg-blue-700 text-white px-7 py-2.5 rounded-full font-bold shadow-md transition active:scale-95"
                          >
                            <div className="bg-white rounded-full p-0.5">
                              <Check size={14} className="text-[#2575e6]" />
                            </div>
                            Check
                          </button>
                          <span className="text-sm font-semibold text-gray-600 tabular-nums">
                            {currentIdx + 1} / {totalProblems}
                          </span>
                        </>
                      ) : (
                        !allCorrect && (
                          <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 bg-[#2575e6] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition active:scale-95"
                          >
                            <RotateCcw size={18} /> Retry
                          </button>
                        )
                      )}
                      {status === 'checked' && (
                        <>
                          <span className="text-sm font-semibold text-gray-500 tabular-nums">
                            {currentIdx + 1} / {totalProblems}
                          </span>
                          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm">
                            Score: {currentScore} / {totalPossible}
                          </div>
                        </>
                      )}
                    </div>

                    {status === 'checked' && allCorrect && (
                      currentIdx === currentData.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleFinish}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-full font-bold shadow-lg animate-fadeIn"
                        >
                          Finish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="p-3 bg-[#2575e6] hover:bg-blue-700 text-white rounded-full shadow-lg transition active:scale-90"
                          aria-label="Next problem"
                        >
                          <ChevronRight size={28} />
                        </button>
                      )
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <style jsx>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } } .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } .animate-shake { animation: shake 0.2s ease-in-out 0s 2; } `}</style>
    </div>
  );
}
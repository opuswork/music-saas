'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Repeat, Timer } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
}

/** 1. 헬퍼 함수: 경로 정규화 및 시간 포맷팅 */
function normalizeAudioSrc(raw: string | undefined | null): string {
  // 1. 데이터가 아예 없는 경우 빈 문자열 반환
  if (!raw) return ""; 

  const s = raw.trim();
  if (!s || /^https?:\/\//i.test(s)) return s;

  // 2. 특정 경로 패턴 처리
  const idx = s.search(/@?apps\/web\/public\//i);
  if (idx !== -1) {
    const after = s.slice(idx).replace(/^@?apps\/web\/public\//i, '');
    return `/${after.replace(/^\/+/, '')}`;
  }

  // 3. 이미 슬래시로 시작하면 그대로, 아니면 붙여주기
  return s.startsWith('/') ? s : `/${s}`;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const resolvedSrc = useMemo(() => normalizeAudioSrc(src), [src]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- 상태 관리 ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  /** 2. 핵심 헬퍼: 유효한 오디오 길이(duration) 계산 */
  const getEffectiveDuration = (audio: HTMLAudioElement): number => {
    let total = audio.duration;
    // Infinity나 NaN인 경우 seekable 범위를 확인
    if (!Number.isFinite(total) || total <= 0) {
      if (audio.seekable && audio.seekable.length > 0) {
        const end = audio.seekable.end(audio.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) total = end;
      }
    }
    // 그래도 안되면 상태값에 저장된 duration 사용
    return (Number.isFinite(total) && total > 0) ? total : duration;
  };

  const syncDurationFromElement = (el: HTMLAudioElement) => {
    const d = getEffectiveDuration(el);
    if (Number.isFinite(d) && d > 0) setDuration(d);
  };

  // --- Side Effects ---
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    // 소스가 바뀔 때 초기화
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    setMediaError(null);
    if (audioRef.current) audioRef.current.load();
  }, [resolvedSrc]);

  // --- 핸들러 함수 ---
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const current = audio.currentTime;
    const total = getEffectiveDuration(audio);

    if (Number.isFinite(total) && total > 0) {
      setProgress(Math.min(100, (current / total) * 100));
    }

    // A-B 구간 반복 로직
    if (loopA !== null && loopB !== null && isLooping) {
      if (current >= loopB) {
        audio.currentTime = loopA;
      }
    }
  };

  /** 🌟 문제의 에러를 해결한 철벽 방어 프로그레스 변경 함수 */
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const total = getEffectiveDuration(audio);
    const newPercent = Number(e.target.value);

    if (Number.isFinite(total) && total > 0) {
      const newTime = (newPercent / 100) * total;
      // 계산된 newTime이 유효할 때만 할당 (중요!)
      if (Number.isFinite(newTime)) {
        audio.currentTime = newTime;
        setProgress(newPercent);
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  };

  const setPointA = () => setLoopA(audioRef.current?.currentTime || 0);
  const setPointB = () => setLoopB(audioRef.current?.currentTime || 0);
  const resetLoop = () => {
    setLoopA(null);
    setLoopB(null);
    setIsLooping(false);
  };

  const handleMediaError = () => {
    const code = audioRef.current?.error?.code;
    const labels: Record<number, string> = {
      1: 'ABORTED', 2: 'NETWORK', 3: 'DECODE', 4: 'SRC_NOT_SUPPORTED',
    };
    setMediaError(labels[code ?? -1] ?? `Unknown (${code})`);
  };

  return (
    <div className="my-6 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto font-sans">
      {title && (
        <p className="text-sm font-bold text-gray-700 mb-4 ml-1 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> {title}
        </p>
      )}
      
      {mediaError && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          Audio error: {mediaError}. URL을 확인해 주세요.
        </p>
      )}
      
      <audio 
        key={resolvedSrc}
        ref={audioRef}
        src={resolvedSrc}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && syncDurationFromElement(audioRef.current)}
        onDurationChange={() => audioRef.current && syncDurationFromElement(audioRef.current)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={handleMediaError}
      />

      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-90 shadow-lg"
        >
          {isPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} className="ml-1" />}
        </button>

        <div className="flex-1">
          <input 
            type="range" min="0" max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-1"
          />
          <div className="flex justify-between text-xs text-gray-400 font-mono">
             <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
             <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
          <Timer size={16} className="text-gray-400" />
          {[0.5, 0.75, 1, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`text-xs font-bold px-2 py-1 rounded transition ${
                playbackRate === rate ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-lg gap-1">
            <button onClick={setPointA} className={`text-[10px] font-bold px-2 py-1 rounded ${loopA !== null ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
              {loopA !== null ? `A: ${formatTime(loopA)}` : 'Set A'}
            </button>
            <button onClick={setPointB} className={`text-[10px] font-bold px-2 py-1 rounded ${loopB !== null ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
              {loopB !== null ? `B: ${formatTime(loopB)}` : 'Set B'}
            </button>
          </div>
          <button 
            onClick={() => setIsLooping(!isLooping)}
            disabled={loopA === null || loopB === null}
            className={`p-2 rounded-full transition ${isLooping ? 'bg-green-100 text-green-600' : 'text-gray-300 hover:bg-gray-100'} disabled:opacity-30`}
          >
            <Repeat size={18} />
          </button>
          {(loopA !== null || loopB !== null) && (
            <button onClick={resetLoop} className="p-2 text-gray-400 hover:text-red-500 transition"><RotateCcw size={16} /></button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 group">
          <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-blue-600 transition">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" min="0" max="1" step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
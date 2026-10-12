'use client';

import { useState, useRef, useCallback } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import OSMDAudioPlayer from 'osmd-audio-player';
import { PlaybackEvent, PlaybackState } from 'osmd-audio-player/dist/PlaybackEngine';

export function useMusicScore() {
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const playerRef = useRef<any>(null);

  const isFinishingRef = useRef(false);
  const lastTimestampRef = useRef<number>(-1);
  const lastIterationKeyRef = useRef<string>('');

  const isInitializing = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initOSMD = useCallback(
    async (
      container: HTMLDivElement,
      urlOrXml: string,
      opts?: { asRawXml?: boolean },
    ) => {
    if (!container || !urlOrXml?.trim()) return;

    // 🔥 이미 초기화 중이면 방지
    if (isInitializing.current) return;
    isInitializing.current = true;

    setIsLoaded(false);

    // 🔥 기존 player 완전 제거 (핵심)
    if (playerRef.current) {
      try {
        playerRef.current.stop();
        playerRef.current.off(PlaybackEvent.ITERATION);
        playerRef.current.off(PlaybackEvent.STATE_CHANGE);
      } catch {}
      playerRef.current = null;
    }

    // 🔥 상태 초기화
    lastTimestampRef.current = -1;
    lastIterationKeyRef.current = '';
    isFinishingRef.current = false;

    container.innerHTML = "";

    try {
      const osmd = new OpenSheetMusicDisplay(container, {
        autoResize: true,
        drawingParameters: "default",
        /** 악보 왼쪽의 파트명(예: Piano) 비표시 */
        drawPartNames: false,
        drawPartAbbreviations: false,
        /**
         * VexFlow softmax. 기본 5보다 크게 하면 음표 간 가로 간격이 넓어짐(문서: 100에 가까울수록 여유 레이아웃).
         * @see OSMD spacingFactorSoftmax
         */
        spacingFactorSoftmax: 24,
        /** 한 시스템만 있을 때 마지막 줄을 컨테이너 너비까지 늘려 간격 확보 */
        stretchLastSystemLine: true,
        /** XML에 제목이 없을 때 OSMD가 그리는 "Untitled Score" 등 상단 제목 비표시(캡션은 MusicScore caption 사용) */
        drawTitle: false,
        drawSubtitle: false,
      });

      osmdRef.current = osmd;

      const xml = opts?.asRawXml
        ? urlOrXml
        : await (await fetch(urlOrXml)).text();

      await osmd.load(xml);
      osmd.render();

      const player = new OSMDAudioPlayer();
      await player.loadScore(osmd as any);
      playerRef.current = player;

      // 🎵 ITERATION (안정 버전)
      player.on(PlaybackEvent.ITERATION, (notes: any[]) => {
        const cursor = osmd.cursor;
        if (!cursor || !notes?.length) return;
      
        if (isFinishingRef.current) return;

        const n0 = notes[0];
        const currentTimestamp =
          n0?.sourceTimestamp?.RealValue ??
          n0?.timestamp?.RealValue ??
          n0?.timestamp ??
          n0?.note?.sourceTimestamp?.RealValue ??
          n0?.note?.timestamp?.RealValue ??
          n0?.note?.timestamp ??
          undefined;

        const noteId =
          n0?.sourceNote?.NoteId ??
          n0?.note?.NoteId ??
          n0?.sourceNote?.noteId ??
          n0?.note?.noteId ??
          '';

        const iterationKey = `${currentTimestamp ?? 'na'}|${noteId}|${notes.length}`;

        // 🔥 timestamp가 없거나 항상 같은 값으로 들어오는 환경 대비: key 중복만 방지
        if (iterationKey === lastIterationKeyRef.current) return;
      
        // 🔥 종료 감지
        if (
          lastTimestampRef.current > 0 &&
          typeof currentTimestamp === 'number' &&
          currentTimestamp < lastTimestampRef.current &&
          cursor.iterator?.EndReached
        ) {
          isFinishingRef.current = true;
      
          cursor.reset();
          cursor.update();
      
          player.stop();
          return;
        }
      
        // 🎵 정상 진행
        if (lastTimestampRef.current === -1) {
          cursor.reset();
        } else {
          cursor.next();
        }
      
        if (typeof currentTimestamp === 'number') {
          lastTimestampRef.current = currentTimestamp;
        }
        lastIterationKeyRef.current = iterationKey;
        cursor.update();
      });

      // 🎯 STOPPED
      player.on(PlaybackEvent.STATE_CHANGE, (state: PlaybackState) => {
        if (state === PlaybackState.STOPPED) {
          setIsPlaying(false);

          const cursor = osmd.cursor;
          if (cursor) {
            cursor.reset();
            cursor.update();
          }

          isFinishingRef.current = false;
          lastTimestampRef.current = -1;
          lastIterationKeyRef.current = '';
        }
      });

      // 🎯 초기 커서
      if (osmd.cursor) {
        osmd.cursor.show();
        osmd.cursor.reset();
        osmd.cursor.update();
      }

      setIsLoaded(true);

    } catch (e) {
      console.error("OSMD Error:", e);
      setIsLoaded(true);
    } finally {
      isInitializing.current = false;
    }
  }, []);

  // 🎯 재생 전 초기화
  const resetPlaybackState = () => {
    lastTimestampRef.current = -1;
    lastIterationKeyRef.current = '';
    isFinishingRef.current = false;

    const cursor = osmdRef.current?.cursor;
    if (cursor) {
      cursor.reset();
      cursor.update();
    }
  };

  return {
    osmdRef,
    playerRef,
    isPlaying,
    setIsPlaying,
    isLoaded,
    initOSMD,
    resetPlaybackState,
  };
}
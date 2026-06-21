import { useState, useRef, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  isFullyPlayed: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (position: number) => void;
  markReset: () => void;
}

export const useAudioPlayer = (audioUrl?: string): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullyPlayed, setIsFullyPlayed] = useState(false);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullyPlayedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (audioRef.current) {
        const ct = audioRef.current.currentTime;
        const d = audioRef.current.duration || duration;
        setCurrentTime(ct);
        if (d > 0) {
          setProgress(ct / d);
          if (!fullyPlayedRef.current && ct / d >= 0.98) {
            fullyPlayedRef.current = true;
            setIsFullyPlayed(true);
          }
        }
      }
    }, 200);
  }, [clearTimer, duration]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (audioRef.current) {
        audioRef.current.destroy();
        audioRef.current = null;
      }
    };
  }, [clearTimer]);

  const initAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.destroy();
    }
    clearTimer();
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    setIsFullyPlayed(false);
    fullyPlayedRef.current = false;

    const audio = Taro.createInnerAudioContext();
    audio.src = url;
    audio.obeyMuteSwitch = false;

    audio.onCanplay(() => {
      setDuration(audio.duration);
    });

    audio.onPlay(() => {
      setIsPlaying(true);
      startTimer();
    });

    audio.onPause(() => {
      setIsPlaying(false);
      clearTimer();
    });

    audio.onStop(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      clearTimer();
    });

    audio.onEnded(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      clearTimer();
      fullyPlayedRef.current = true;
      setIsFullyPlayed(true);
    });

    audio.onError((err) => {
      console.error('[AudioPlayer] Error', err);
      setIsPlaying(false);
      clearTimer();
    });

    audioRef.current = audio;
  }, [clearTimer, startTimer]);

  useEffect(() => {
    if (audioUrl) {
      initAudio(audioUrl);
    }
  }, [audioUrl, initAudio]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stop();
    }
  }, []);

  const seek = useCallback((position: number) => {
    if (audioRef.current && duration > 0) {
      const target = Math.max(0, Math.min(1, position));
      const targetTime = target * duration;
      audioRef.current.seek(targetTime);
      setCurrentTime(targetTime);
      setProgress(target);
    }
  }, [duration]);

  const markReset = useCallback(() => {
    setIsFullyPlayed(false);
    fullyPlayedRef.current = false;
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    isFullyPlayed,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    markReset
  };
};

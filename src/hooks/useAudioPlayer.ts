import { useState, useRef, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (position: number) => void;
}

export const useAudioPlayer = (audioUrl?: string): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<Taro.InnerAudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        const d = audioRef.current.duration;
        setCurrentTime(ct);
        if (d > 0) {
          setProgress(ct / d);
        }
      }
    }, 200);
  }, [clearTimer]);

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
      audioRef.current.seek(position * duration);
      setCurrentTime(position * duration);
      setProgress(position);
    }
  }, [duration]);

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    play,
    pause,
    togglePlay,
    stop,
    seek
  };
};

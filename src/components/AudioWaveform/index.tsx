import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface AudioWaveformProps {
  waveformData: number[];
  progress: number;
  duration?: number;
  currentTime?: number;
  isPlaying?: boolean;
  violationPositions?: number[];
  selectedPositions?: number[];
  onWaveformClick?: (position: number) => void;
  onTogglePlay?: () => void;
  allowMultiSelect?: boolean;
  showPlayControl?: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveformData,
  progress,
  duration = 0,
  currentTime = 0,
  isPlaying = false,
  violationPositions = [],
  selectedPositions = [],
  onWaveformClick,
  onTogglePlay,
  allowMultiSelect = false,
  showPlayControl = false
}) => {
  const handleClick = (index: number) => {
    onWaveformClick?.(index);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View className={styles.container}>
      {showPlayControl && (
        <View className={styles.controlRow}>
          <View className={styles.playBtn} onClick={onTogglePlay}>
            <Text className={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
          </View>
          <View className={styles.timeInfo}>
            <Text className={styles.currentTimeText}>{formatTime(currentTime)}</Text>
            <Text className={styles.durationText}> / {formatTime(duration)}</Text>
          </View>
        </View>
      )}
      <View className={styles.waveformWrap}>
        {waveformData.map((height, index) => {
          const isViolated = violationPositions.includes(index);
          const isSelected = selectedPositions.includes(index);
          const isPast = index < Math.floor(progress * waveformData.length);
          return (
            <View
              key={index}
              className={classnames(
                styles.bar,
                isPast && styles.barPast,
                isViolated && styles.barViolation,
                isSelected && styles.barSelected
              )}
              style={{ height: `${height}%` }}
              onClick={() => handleClick(index)}
            />
          );
        })}
      </View>
      <View className={styles.progressLine} style={{ left: `${progress * 100}%` }} />
      {!showPlayControl && (
        <View className={styles.timeRow}>
          <Text className={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text className={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      )}
    </View>
  );
};

export default AudioWaveform;

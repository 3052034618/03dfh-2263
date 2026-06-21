import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface AudioWaveformProps {
  waveformData: number[];
  progress: number;
  violationPositions?: number[];
  onWaveformClick?: (position: number) => void;
  selectedPosition?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveformData,
  progress,
  violationPositions = [],
  onWaveformClick,
  selectedPosition
}) => {
  const handleClick = (index: number) => {
    onWaveformClick?.(index);
  };

  return (
    <View className={styles.container}>
      <View className={styles.waveformWrap}>
        {waveformData.map((height, index) => {
          const isViolated = violationPositions.includes(index);
          const isSelected = selectedPosition === index;
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
      <View className={styles.timeRow}>
        <Text className={styles.timeText}>00:00</Text>
        <Text className={styles.timeText}>{`0${Math.floor(progress * 3)}:${String(Math.floor((progress * 180) % 60)).padStart(2, '0')}`}</Text>
      </View>
    </View>
  );
};

export default AudioWaveform;

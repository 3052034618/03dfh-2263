import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercent?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  showPercent = true
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (progress >= 80) return '#10B981';
    if (progress >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View className={styles.container}>
      <View
        className={styles.ring}
        style={{ width: `${size}rpx`, height: `${size}rpx` }}
      >
        <View className={styles.svgWrap} style={{ width: `${size}rpx`, height: `${size}rpx` }}>
          <View
            className={styles.ringBg}
            style={{
              width: `${size}rpx`,
              height: `${size}rpx`,
              borderRadius: '50%',
              border: `${strokeWidth}rpx solid #E0E7FF`
            }}
          />
          <View
            className={styles.ringProgress}
            style={{
              width: `${size}rpx`,
              height: `${size}rpx`,
              borderRadius: '50%',
              border: `${strokeWidth}rpx solid ${getColor()}`,
              clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)`
            }}
          />
        </View>
        <View className={styles.centerText}>
          {showPercent && (
            <Text className={styles.percent} style={{ color: getColor() }}>{progress}%</Text>
          )}
        </View>
      </View>
      {label && <Text className={styles.label}>{label}</Text>}
    </View>
  );
};

export default ProgressRing;

import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TaskCardProps {
  title: string;
  type: 'challenge' | 'deduction' | 'scripts';
  description: string;
  duration: number;
  completed: boolean;
  score: number;
  totalScore: number;
  onClick?: () => void;
}

const typeConfig = {
  challenge: { label: '闯关', color: '#6366F1', bg: '#EEF2FF' },
  deduction: { label: '找茬', color: '#EF4444', bg: '#FEE2E2' },
  scripts: { label: '话术', color: '#10B981', bg: '#D1FAE5' }
};

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  type,
  description,
  duration,
  completed,
  score,
  totalScore,
  onClick
}) => {
  const config = typeConfig[type];

  return (
    <View className={classnames(styles.card, completed && styles.cardCompleted)} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.typeTag} style={{ background: config.bg, color: config.color }}>
          <Text className={styles.typeTagText}>{config.label}</Text>
        </View>
        <Text className={styles.duration}>{duration}min</Text>
      </View>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.desc}>{description}</Text>
      <View className={styles.footer}>
        {completed ? (
          <View className={styles.scoreWrap}>
            <Text className={styles.scoreLabel}>得分</Text>
            <Text className={styles.scoreValue} style={{ color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444' }}>
              {score}/{totalScore}
            </Text>
          </View>
        ) : (
          <View className={styles.startBtn}>
            <Text className={styles.startBtnText}>开始练习</Text>
          </View>
        )}
        {completed && (
          <Text className={styles.completedBadge}>✓</Text>
        )}
      </View>
    </View>
  );
};

export default TaskCard;

import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface RankingItemProps {
  rank: number;
  name: string;
  avatar: string;
  className: string;
  score: number;
  passRate: number;
  isCurrentUser?: boolean;
}

const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  name,
  avatar,
  className,
  score,
  passRate,
  isCurrentUser
}) => {
  const getRankBadge = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <View className={classnames(styles.item, isCurrentUser && styles.itemHighlight)}>
      <View className={styles.rankWrap}>
        {getRankBadge() ? (
          <Text className={styles.rankBadge}>{getRankBadge()}</Text>
        ) : (
          <Text className={styles.rankNumber}>{rank}</Text>
        )}
      </View>
      <Image className={styles.avatar} src={avatar} mode="aspectFill" />
      <View className={styles.info}>
        <Text className={styles.name}>{name}</Text>
        <Text className={styles.className}>{className}</Text>
      </View>
      <View className={styles.scoreWrap}>
        <Text className={styles.score}>{score}</Text>
        <Text className={styles.passRate}>{passRate}%通过</Text>
      </View>
    </View>
  );
};

export default RankingItem;

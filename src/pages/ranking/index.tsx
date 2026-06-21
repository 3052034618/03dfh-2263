import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import RankingItem from '@/components/RankingItem';
import { rankingUsers, classStats } from '@/data/rankings';
import { useTrainingStore } from '@/store/useTrainingStore';
import styles from './index.module.scss';

const RankingPage: React.FC = () => {
  const { userProfile } = useTrainingStore();
  const [selectedClass, setSelectedClass] = useState(userProfile.className);
  const [isEditingQualification, setIsEditingQualification] = useState(false);

  const currentClassUsers = rankingUsers
    .filter((u) => u.className === selectedClass)
    .sort((a, b) => b.score - a.score)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const currentClassStats = classStats.find((c) => c.className === selectedClass);

  const top3 = currentClassUsers.slice(0, 3);
  const rest = currentClassUsers.slice(3);

  const qualificationProgress = Math.min(
    100,
    Math.round((userProfile.passRate / userProfile.qualificationScore) * 100)
  );

  const handleAdjustQualification = (delta: number) => {
    const newScore = Math.max(50, Math.min(100, userProfile.qualificationScore + delta));
    useTrainingStore.getState().setQualificationScore(newScore);
  };

  const handleSaveQualification = () => {
    setIsEditingQualification(false);
    Taro.showToast({ title: '合格线已更新', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.classTabs}>
        {classStats.map((cls) => (
          <View
            key={cls.className}
            className={classnames(
              styles.classTab,
              selectedClass === cls.className && styles.classTabActive
            )}
            onClick={() => setSelectedClass(cls.className)}
          >
            <Text style={{ fontSize: '24rpx' }}>{cls.className}</Text>
          </View>
        ))}
      </View>

      {currentClassStats && (
        <View className={styles.classStats}>
          <View className={styles.classStatItem}>
            <Text className={styles.classStatValue}>{currentClassStats.totalStudents}</Text>
            <Text className={styles.classStatLabel}>学员数</Text>
          </View>
          <View className={styles.classStatItem}>
            <Text className={styles.classStatValue}>{currentClassStats.avgPassRate}%</Text>
            <Text className={styles.classStatLabel}>平均通过率</Text>
          </View>
          <View className={styles.classStatItem}>
            <Text className={styles.classStatValue}>{currentClassStats.completedRate}%</Text>
            <Text className={styles.classStatLabel}>完成率</Text>
          </View>
        </View>
      )}

      {top3.length >= 3 && (
        <View className={styles.topPodium}>
          <View className={styles.podiumItem}>
            <Text className={styles.podiumRank}>🥈</Text>
            <Image
              className={styles.podiumAvatar}
              src={top3[1].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{top3[1].name}</Text>
            <Text className={styles.podiumScore}>{top3[1].score}分</Text>
            <View className={classnames(styles.podiumBar, styles.podiumBarSecond)} />
          </View>
          <View className={styles.podiumItem}>
            <Text className={styles.podiumRank}>🥇</Text>
            <Image
              className={classnames(styles.podiumAvatar, styles.podiumAvatarFirst)}
              src={top3[0].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{top3[0].name}</Text>
            <Text className={styles.podiumScore}>{top3[0].score}分</Text>
            <View className={classnames(styles.podiumBar, styles.podiumBarFirst)} />
          </View>
          <View className={styles.podiumItem}>
            <Text className={styles.podiumRank}>🥉</Text>
            <Image
              className={styles.podiumAvatar}
              src={top3[2].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{top3[2].name}</Text>
            <Text className={styles.podiumScore}>{top3[2].score}分</Text>
            <View className={classnames(styles.podiumBar, styles.podiumBarThird)} />
          </View>
        </View>
      )}

      <View className={styles.rankList}>
        {rest.map((user) => (
          <RankingItem
            key={user.id}
            rank={user.rank}
            name={user.name}
            avatar={user.avatar}
            className={user.className}
            score={user.score}
            passRate={user.passRate}
            isCurrentUser={user.id === userProfile.id}
          />
        ))}
      </View>

      <View className={styles.qualificationBanner}>
        <View className={styles.bannerText}>
          <Text className={styles.bannerTitle}>上岗合格线</Text>
          <Text className={styles.bannerDesc}>新人必须达到的通过率标准</Text>
        </View>
        <Text className={styles.bannerValue}>{userProfile.qualificationScore}%</Text>
      </View>

      <View className={styles.qualificationSection}>
        <View className={styles.qualificationCard}>
          <View className={styles.qualificationHeader}>
            <Text className={styles.qualificationTitle}>达标状态</Text>
            <View
              className={classnames(
                styles.qualificationStatus,
                userProfile.qualificationMet
                  ? styles.qualificationStatusMet
                  : styles.qualificationStatusNotMet
              )}
            >
              <Text style={{ fontSize: '22rpx' }}>
                {userProfile.qualificationMet ? '✓ 已达标' : '未达标'}
              </Text>
            </View>
          </View>
          <View className={styles.qualificationBarBg}>
            <View
              className={styles.qualificationBarFill}
              style={{
                width: `${qualificationProgress}%`,
                background: userProfile.qualificationMet
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #F59E0B, #FBBF24)'
              }}
            />
          </View>
          <Text className={styles.qualificationDesc}>
            当前通过率{userProfile.passRate}%，合格线{userProfile.qualificationScore}%
          </Text>

          {isEditingQualification ? (
            <View className={styles.qualificationEditor}>
              <View className={styles.editorRow}>
                <View
                  className={styles.editorBtn}
                  onClick={() => handleAdjustQualification(-5)}
                >
                  <Text style={{ fontSize: '28rpx', color: '#6366F1' }}>-5</Text>
                </View>
                <Text className={styles.editorValue}>{userProfile.qualificationScore}%</Text>
                <View
                  className={styles.editorBtn}
                  onClick={() => handleAdjustQualification(5)}
                >
                  <Text style={{ fontSize: '28rpx', color: '#6366F1' }}>+5</Text>
                </View>
              </View>
              <View className={styles.editorActions}>
                <View
                  className={styles.editorSaveBtn}
                  onClick={handleSaveQualification}
                >
                  <Text style={{ color: '#fff', fontSize: '24rpx' }}>确认</Text>
                </View>
                <View
                  className={styles.editorCancelBtn}
                  onClick={() => setIsEditingQualification(false)}
                >
                  <Text style={{ fontSize: '24rpx' }}>取消</Text>
                </View>
              </View>
            </View>
          ) : (
            <View
              className={styles.editBtn}
              onClick={() => setIsEditingQualification(true)}
            >
              <Text style={{ fontSize: '24rpx', color: '#6366F1' }}>✏️ 调整合格线</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RankingPage;

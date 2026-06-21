import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { useTrainingStore } from '@/store/useTrainingStore';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { userProfile, dailyTasks, challengeLevels } = useTrainingStore();
  const [isEditingQualification, setIsEditingQualification] = useState(false);

  const completedTasks = dailyTasks.filter((t) => t.completed).length;
  const passedLevels = challengeLevels.filter((l) => l.passed).length;

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
      <View className={styles.profileHeader}>
        <View className={styles.profileInfo}>
          <Image className={styles.avatar} src={userProfile.avatar} mode="aspectFill" />
          <View className={styles.profileText}>
            <Text className={styles.userName}>{userProfile.name}</Text>
            <Text className={styles.userClass}>{userProfile.className}</Text>
          </View>
          <View
            className={classnames(
              styles.qualificationBadge,
              userProfile.qualificationMet ? styles.qualificationMet : styles.qualificationNotMet
            )}
          >
            <Text style={{ fontSize: '22rpx' }}>
              {userProfile.qualificationMet ? '✓ 已达标' : '未达标'}
            </Text>
          </View>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{userProfile.totalScore}</Text>
            <Text className={styles.statLabel}>总积分</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{userProfile.currentStreak}</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{userProfile.passRate}%</Text>
            <Text className={styles.statLabel}>通过率</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>快捷功能</Text>
      <View className={styles.featureGrid}>
        <View
          className={styles.featureCard}
          onClick={() => Taro.navigateTo({ url: '/pages/ranking/index' })}
        >
          <Text className={styles.featureIcon}>🏆</Text>
          <View className={styles.featureInfo}>
            <Text className={styles.featureName}>班级排行</Text>
            <Text className={styles.featureDesc}>查看班级通过率</Text>
          </View>
        </View>
        <View
          className={styles.featureCard}
          onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}
        >
          <Text className={styles.featureIcon}>📝</Text>
          <View className={styles.featureInfo}>
            <Text className={styles.featureName}>带教点评</Text>
            <Text className={styles.featureDesc}>查看导师反馈</Text>
          </View>
        </View>
        <View
          className={styles.featureCard}
          onClick={() => Taro.switchTab({ url: '/pages/scripts/index' })}
        >
          <Text className={styles.featureIcon}>📋</Text>
          <View className={styles.featureInfo}>
            <Text className={styles.featureName}>薄弱项</Text>
            <Text className={styles.featureDesc}>查看薄弱清单</Text>
          </View>
        </View>
        <View
          className={styles.featureCard}
          onClick={() => Taro.navigateTo({ url: '/pages/mistakes/index' })}
        >
          <Text className={styles.featureIcon}>�</Text>
          <View className={styles.featureInfo}>
            <Text className={styles.featureName}>错题本</Text>
            <Text className={styles.featureDesc}>查看个人错题</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>学习数据</Text>
      <View className={styles.scoreSection}>
        <View className={styles.scoreCard}>
          <View className={styles.scoreRow}>
            <Text className={styles.scoreLabel}>完成任务</Text>
            <Text className={styles.scoreValue}>{completedTasks}/{dailyTasks.length}</Text>
          </View>
          <View className={styles.scoreRow}>
            <Text className={styles.scoreLabel}>闯关进度</Text>
            <Text className={styles.scoreValue}>{passedLevels}/{challengeLevels.length}</Text>
          </View>
          <View className={styles.scoreRow}>
            <Text className={styles.scoreLabel}>累计打卡</Text>
            <Text className={styles.scoreValue}>{userProfile.completedDays}天</Text>
          </View>
          <View className={styles.scoreRow}>
            <Text className={styles.scoreLabel}>最长连续</Text>
            <Text className={styles.scoreValue}>{userProfile.longestStreak}天</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>上岗合格线</Text>
      <View className={styles.qualificationSection}>
        <View className={styles.qualificationCard}>
          <View className={styles.qualificationHeader}>
            <Text className={styles.qualificationTitle}>新人上岗标准</Text>
            <View
              className={classnames(
                styles.qualificationStatus,
                userProfile.qualificationMet
                  ? styles.qualificationStatusMet
                  : styles.qualificationStatusNotMet
              )}
            >
              <Text style={{ fontSize: '22rpx' }}>
                {userProfile.qualificationMet ? '已达标' : `需${userProfile.qualificationScore}%`}
              </Text>
            </View>
          </View>
          <View className={styles.qualificationProgress}>
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

export default MinePage;

import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import TaskCard from '@/components/TaskCard';
import { useTrainingStore } from '@/store/useTrainingStore';
import styles from './index.module.scss';

const DailyPage: React.FC = () => {
  const { dailyTasks, userProfile } = useTrainingStore();

  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const totalCount = dailyTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleTaskClick = (type: string) => {
    const tabMap: Record<string, string> = {
      challenge: '/pages/challenge/index',
      deduction: '/pages/deduction/index',
      scripts: '/pages/scripts/index'
    };
    if (tabMap[type]) {
      Taro.switchTab({ url: tabMap[type] });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>今日训练 ✨</Text>
        <Text className={styles.subtitle}>每天10分钟，轻松攻克质检难关</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{userProfile.currentStreak}</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{completedCount}/{totalCount}</Text>
            <Text className={styles.statLabel}>今日完成</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{userProfile.passRate}%</Text>
            <Text className={styles.statLabel}>通过率</Text>
          </View>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressCard}>
          <View className={styles.progressInfo}>
            <Text className={styles.progressTitle}>今日训练进度</Text>
            <Text className={styles.progressDesc}>
              已完成{completedCount}项，还剩{totalCount - completedCount}项
            </Text>
            <View className={styles.progressBarBg}>
              <View
                className={styles.progressBarFill}
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.quickEntry}>
        <View
          className={styles.entryCard}
          onClick={() => Taro.switchTab({ url: '/pages/challenge/index' })}
        >
          <Text className={styles.entryIcon}>🎯</Text>
          <Text className={styles.entryTitle}>录音闯关</Text>
          <Text className={styles.entryDesc}>判断+识别</Text>
        </View>
        <View
          className={styles.entryCard}
          onClick={() => Taro.switchTab({ url: '/pages/deduction/index' })}
        >
          <Text className={styles.entryIcon}>🔍</Text>
          <Text className={styles.entryTitle}>扣分找茬</Text>
          <Text className={styles.entryDesc}>点选+判断</Text>
        </View>
        <View
          className={styles.entryCard}
          onClick={() => Taro.switchTab({ url: '/pages/scripts/index' })}
        >
          <Text className={styles.entryIcon}>📋</Text>
          <Text className={styles.entryTitle}>标准话术</Text>
          <Text className={styles.entryDesc}>学习+对照</Text>
        </View>
      </View>

      <View className={styles.taskSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日任务</Text>
          <Text className={styles.sectionAction}>查看全部</Text>
        </View>
        <View className={styles.taskList}>
          {dailyTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              type={task.type}
              description={task.description}
              duration={task.duration}
              completed={task.completed}
              score={task.score}
              totalScore={task.totalScore}
              onClick={() => handleTaskClick(task.type)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default DailyPage;

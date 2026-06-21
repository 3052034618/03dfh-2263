import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useTrainingStore } from '@/store/useTrainingStore';
import {
  VIOLATION_CATEGORY_MAP,
  VIOLATION_CATEGORY_COLOR,
  VIOLATION_CATEGORY_TEXT_COLOR,
} from '@/types';
import type { ViolationCategory, MistakeRecord } from '@/types';
import { recordings } from '@/data/recordings';
import styles from './index.module.scss';

const CATEGORIES: Array<'all' | ViolationCategory> = [
  'all',
  'price_objection',
  'efficacy_promise',
  'postoperative_care',
  'risk_concealment',
];

const getRecordingTitle = (recordingId: string): string => {
  const rec = recordings.find((r) => r.id === recordingId);
  return rec ? rec.title : '未知录音';
};

const MistakesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | ViolationCategory>('all');
  const mistakes = useTrainingStore((s) => s.mistakes);
  const markMistakeMastered = useTrainingStore((s) => s.markMistakeMastered);

  const filteredMistakes = useMemo(() => {
    if (activeCategory === 'all') return mistakes;
    return mistakes.filter((m) => m.category === activeCategory);
  }, [mistakes, activeCategory]);

  const groupedMistakes = useMemo(() => {
    const groups: Record<string, MistakeRecord[]> = {
      price_objection: [],
      efficacy_promise: [],
      postoperative_care: [],
      risk_concealment: [],
    };
    filteredMistakes.forEach((m) => {
      groups[m.category].push(m);
    });
    return groups;
  }, [filteredMistakes]);

  const handleMarkMastered = (id: string) => {
    markMistakeMastered(id);
    Taro.showToast({ title: '已标记为掌握', icon: 'success' });
  };

  const handleGoPractice = (recordingId: string) => {
    Taro.navigateTo({ url: `/pages/challenge/index?recordingId=${recordingId}` });
  };

  const renderMistakeCard = (mistake: MistakeRecord) => {
    const catColor = VIOLATION_CATEGORY_COLOR[mistake.category];
    const catTextColor = VIOLATION_CATEGORY_TEXT_COLOR[mistake.category];
    const catLabel = VIOLATION_CATEGORY_MAP[mistake.category];
    const recordingTitle = getRecordingTitle(mistake.recordingId);

    return (
      <View key={mistake.id} className={styles.mistakeCard}>
        <View className={styles.cardHeader}>
          <View
            className={styles.categoryTag}
            style={{ background: catColor, color: catTextColor }}
          >
            <Text className={styles.categoryTagText}>{catLabel}</Text>
          </View>
          {mistake.mastered && (
            <View className={styles.masteredBadge}>
              <Text className={styles.masteredBadgeText}>已掌握</Text>
            </View>
          )}
        </View>

        <Text className={styles.recordingTitle}>{recordingTitle}</Text>

        <View className={styles.answerSection}>
          <View className={styles.wrongAnswer}>
            <Text className={styles.answerLabel}>你的回答</Text>
            <Text className={styles.wrongAnswerText}>{mistake.userAnswer}</Text>
          </View>
          <View className={styles.correctAnswer}>
            <Text className={styles.answerLabel}>正确答案</Text>
            <Text className={styles.correctAnswerText}>{mistake.correctAnswer}</Text>
          </View>
        </View>

        <View className={styles.violationSection}>
          <Text className={styles.violationLabel}>违规内容</Text>
          <Text className={styles.violationText}>{mistake.violationText}</Text>
        </View>

        {(mistake.lastPracticeScore != null || mistake.lastPracticeDate) && (
          <View className={styles.practiceInfo}>
            {mistake.lastPracticeScore != null && (
              <Text className={styles.practiceScore}>
                最近得分: {mistake.lastPracticeScore}分
              </Text>
            )}
            {mistake.lastPracticeDate && (
              <Text className={styles.practiceDate}>
                练习时间: {mistake.lastPracticeDate}
              </Text>
            )}
          </View>
        )}

        <View className={styles.cardActions}>
          {!mistake.mastered && (
            <View
              className={classnames(styles.actionBtn, styles.markBtn)}
              onClick={() => handleMarkMastered(mistake.id)}
            >
              <Text className={styles.markBtnText}>标记已掌握</Text>
            </View>
          )}
          <View
            className={classnames(styles.actionBtn, styles.practiceBtn)}
            onClick={() => handleGoPractice(mistake.recordingId)}
          >
            <Text className={styles.practiceBtnText}>去练录音</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryGroup = (category: ViolationCategory) => {
    const items = groupedMistakes[category];
    const catColor = VIOLATION_CATEGORY_COLOR[category];
    const catTextColor = VIOLATION_CATEGORY_TEXT_COLOR[category];
    const catLabel = VIOLATION_CATEGORY_MAP[category];

    return (
      <View key={category} className={styles.categoryGroup}>
        <View className={styles.categoryGroupHeader}>
          <View
            className={styles.categoryGroupTag}
            style={{ background: catColor, color: catTextColor }}
          >
            <Text className={styles.categoryGroupTagText}>{catLabel}</Text>
          </View>
          <Text className={styles.categoryGroupCount}>{items.length}条错题</Text>
        </View>
        {items.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>
              该分类暂无错题，继续保持！
            </Text>
          </View>
        ) : (
          <View className={styles.mistakeList}>
            {items.map(renderMistakeCard)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>错题本</Text>
        <Text className={styles.headerDesc}>
          共{mistakes.length}道错题，{mistakes.filter((m) => m.mastered).length}道已掌握
        </Text>
      </View>

      <View className={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <View
            key={cat}
            className={classnames(
              styles.tab,
              activeCategory === cat && styles.tabActive
            )}
            onClick={() => setActiveCategory(cat)}
          >
            <Text
              className={classnames(
                styles.tabText,
                activeCategory === cat && styles.tabTextActive
              )}
            >
              {cat === 'all' ? '全部' : VIOLATION_CATEGORY_MAP[cat]}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {filteredMistakes.length === 0 ? (
          <View className={styles.emptyPage}>
            <Text className={styles.emptyPageIcon}>🎉</Text>
            <Text className={styles.emptyPageText}>
              {activeCategory === 'all' ? '暂无错题记录，继续保持！' : '该分类暂无错题'}
            </Text>
          </View>
        ) : activeCategory === 'all' ? (
          (['price_objection', 'efficacy_promise', 'postoperative_care', 'risk_concealment'] as ViolationCategory[])
            .filter((cat) => groupedMistakes[cat].length > 0)
            .map(renderCategoryGroup)
        ) : (
          <View className={styles.mistakeList}>
            {filteredMistakes.map(renderMistakeCard)}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MistakesPage;

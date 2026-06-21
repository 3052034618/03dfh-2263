import React, { useState, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useTrainingStore } from '@/store/useTrainingStore';
import { scriptCategories, scriptItems } from '@/data/scripts';
import { challengeLevels, recordings } from '@/data/recordings';
import { VIOLATION_CATEGORY_COLOR } from '@/types';
import type { ViolationCategory, MistakeRecord } from '@/types';
import styles from './index.module.scss';

const STORAGE_KEY_TARGET_RECORDING = 'target_recording_id';
const STORAGE_KEY_TARGET_SEEK = 'target_seek_position';

const CATEGORY_TO_SCRIPT_MAP: Record<ViolationCategory, string> = {
  price_objection: 'sc-001',
  efficacy_promise: 'sc-002',
  postoperative_care: 'sc-003',
  risk_concealment: 'sc-004'
};

const getRecordingMode = (recordingId: string): 'challenge' | 'deduction' | null => {
  if (challengeLevels.some((l) => l.recordingId === recordingId)) return 'challenge';
  const rec = recordings.find((r) => r.id === recordingId);
  if (rec && rec.unlocked) return 'deduction';
  return null;
};

const getViolationPositionForMistake = (mistake: MistakeRecord): number | null => {
  const rec = recordings.find((r) => r.id === mistake.recordingId);
  if (!rec) return null;
  const violation = rec.violations.find(
    (v) => v.text === mistake.violationText || v.category === mistake.category
  );
  return violation ? violation.position : null;
};

const ScriptsPage: React.FC = () => {
  const { weaknessItems, mistakes } = useTrainingStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [expandedWeakness, setExpandedWeakness] = useState<string | null>(null);
  const scriptListRef = useRef<any>(null);

  const filteredScripts =
    selectedCategory === 'all'
      ? scriptItems
      : scriptItems.filter((s) => s.categoryId === selectedCategory);

  const getCategoryById = (id: string) => scriptCategories.find((c) => c.id === id);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#10B981';
    if (accuracy >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getMistakesByCategory = (category: string) => {
    return mistakes.filter((m) => m.category === category && !m.mastered).slice(0, 10);
  };

  const handleListenRecording = (recordingId: string, mistake?: MistakeRecord) => {
    if (!recordingId) return;
    const mode = getRecordingMode(recordingId);
    if (!mode) {
      Taro.showToast({ title: '该录音暂未开放', icon: 'none' });
      return;
    }
    try {
      Taro.setStorageSync(STORAGE_KEY_TARGET_RECORDING, recordingId);
      if (mistake) {
        const position = getViolationPositionForMistake(mistake);
        if (position !== null) {
          const rec = recordings.find((r) => r.id === recordingId);
          const seekSeconds = rec
            ? Math.round((position / 60) * rec.duration)
            : 0;
          Taro.setStorageSync(STORAGE_KEY_TARGET_SEEK, String(seekSeconds));
        }
      }
    } catch (e) {
      console.error('[Scripts] Save target failed', e);
    }
    if (mode === 'deduction') {
      Taro.switchTab({ url: '/pages/deduction/index' });
    } else {
      Taro.switchTab({ url: '/pages/challenge/index' });
    }
  };

  const handleViewScript = (category: string) => {
    const scriptCategoryId = CATEGORY_TO_SCRIPT_MAP[category as ViolationCategory];
    if (!scriptCategoryId) return;
    setSelectedCategory(scriptCategoryId);
    setExpandedScript(null);
    setTimeout(() => {
      setExpandedScript(scriptItems.find((s) => s.categoryId === scriptCategoryId)?.id || null);
    }, 100);
  };

  const getRecordingTitle = (recordingId: string) => {
    const rec = recordings.find((r) => r.id === recordingId);
    return rec?.title || '未知录音';
  };

  const getRecordingModeLabel = (recordingId: string) => {
    const mode = getRecordingMode(recordingId);
    return mode === 'deduction' ? '找茬' : mode === 'challenge' ? '闯关' : '';
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.searchBar}>
          <Text className={styles.searchPlaceholder}>🔍 搜索话术关键词...</Text>
        </View>

        <View className={styles.categoryGrid}>
          <View
            className={classnames(
              styles.categoryCard,
              selectedCategory === 'all' && styles.categoryCardActive
            )}
            onClick={() => setSelectedCategory('all')}
          >
            <Text className={styles.categoryIcon}>📚</Text>
            <Text className={styles.categoryName}>全部</Text>
            <Text className={styles.categoryCount}>{scriptItems.length}条</Text>
          </View>
          {scriptCategories.map((cat) => (
            <View
              key={cat.id}
              className={classnames(
                styles.categoryCard,
                selectedCategory === cat.id && styles.categoryCardActive
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Text className={styles.categoryIcon}>{cat.icon}</Text>
              <Text className={styles.categoryName}>{cat.name}</Text>
              <Text className={styles.categoryCount}>{cat.count}条</Text>
            </View>
          ))}
        </View>

        {weaknessItems && weaknessItems.length > 0 && (
          <View className={styles.weaknessSection}>
            <Text className={styles.weaknessTitle}>💪 薄弱项清单（点击展开错题）</Text>
            {weaknessItems.map((w) => {
              const isExpanded = expandedWeakness === w.category;
              const catMistakes = getMistakesByCategory(w.category);
              return (
                <View key={w.category} className={styles.weaknessCard}>
                  <View
                    className={styles.weaknessHeader}
                    onClick={() => setExpandedWeakness(isExpanded ? null : w.category)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text className={styles.weaknessCategory}>{w.categoryLabel}</Text>
                      <Text className={styles.weaknessCount}>
                        答错{w.wrongCount}题 / 共{w.totalCount}题
                      </Text>
                    </View>
                    <Text
                      className={styles.weaknessAccuracy}
                      style={{ color: getAccuracyColor(w.accuracy) }}
                    >
                      {w.accuracy}%
                    </Text>
                    <Text className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                  <View className={styles.weaknessBarBg}>
                    <View
                      className={styles.weaknessBarFill}
                      style={{
                        width: `${w.accuracy}%`,
                        background: getAccuracyColor(w.accuracy)
                      }}
                    />
                  </View>

                  {isExpanded && (
                    <View className={styles.weaknessDetail}>
                      {catMistakes.length > 0 ? (
                        <View className={styles.mistakeList}>
                          <Text className={styles.mistakeListTitle}>
                            📝 错题来源（{catMistakes.length}条）
                          </Text>
                          {catMistakes.map((m) => {
                            const modeLabel = getRecordingModeLabel(m.recordingId || '');
                            return (
                              <View key={m.id} className={styles.mistakeItem}>
                                <View className={styles.mistakeItemHeader}>
                                  <Text className={styles.mistakeRecording}>
                                    🎙 {getRecordingTitle(m.recordingId || '')}
                                  </Text>
                                  {modeLabel && (
                                    <View className={styles.mistakeModeTag}>
                                      <Text className={styles.mistakeModeTagText}>{modeLabel}</Text>
                                    </View>
                                  )}
                                </View>
                                <Text className={styles.mistakeItemText}>
                                  ❌ {m.violationText}
                                </Text>
                                <View className={styles.mistakeItemActions}>
                                  <View
                                    className={styles.actionBtn}
                                    onClick={() => handleListenRecording(m.recordingId || '', m)}
                                  >
                                    <Text className={styles.actionBtnText}>去听录音</Text>
                                  </View>
                                  <View
                                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                                    onClick={() => handleViewScript(m.category)}
                                  >
                                    <Text className={styles.actionBtnPrimaryText}>查看话术</Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text className={styles.noMistakeText}>暂无错题记录，继续保持！</Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View className={styles.scriptList} ref={scriptListRef}>
          <Text className={styles.scriptListTitle}>📖 标准话术</Text>
          {filteredScripts.map((script) => {
            const category = getCategoryById(script.categoryId);
            const isExpanded = expandedScript === script.id;
            return (
              <View
                key={script.id}
                className={styles.scriptCard}
                onClick={() => setExpandedScript(isExpanded ? null : script.id)}
              >
                <View className={styles.scriptHeader}>
                  <Text className={styles.scriptTitle}>{script.title}</Text>
                  <View
                    className={styles.scriptTag}
                    style={{ background: category?.color || '#EDE9FE' }}
                  >
                    <Text className={styles.scriptTagText}>
                      {category?.name || ''}
                    </Text>
                  </View>
                </View>
                <Text className={styles.scriptContent}>{script.content}</Text>

                {isExpanded && (
                  <View className={styles.scriptDetail}>
                    <View className={styles.detailSection}>
                      <Text className={styles.detailLabel}>✅ 关键要点</Text>
                      {script.keyPoints.map((point, idx) => (
                        <Text key={idx} className={styles.detailItem}>{point}</Text>
                      ))}
                    </View>
                    <View className={styles.mistakeSection}>
                      <Text className={styles.mistakeLabel}>❌ 常见错误</Text>
                      {script.commonMistakes.map((mistake, idx) => (
                        <Text key={idx} className={styles.mistakeItem}>{mistake}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View className={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default ScriptsPage;

import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { useTrainingStore } from '@/store/useTrainingStore';
import { scriptCategories, scriptItems } from '@/data/scripts';
import { VIOLATION_CATEGORY_COLOR } from '@/types';
import styles from './index.module.scss';

const ScriptsPage: React.FC = () => {
  const { weaknessItems } = useTrainingStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

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

  return (
    <View className={styles.page}>
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
          <Text className={styles.weaknessTitle}>💪 薄弱项清单</Text>
          {weaknessItems.map((w) => (
            <View key={w.category} className={styles.weaknessCard}>
              <View className={styles.weaknessHeader}>
                <Text className={styles.weaknessCategory}>{w.categoryLabel}</Text>
                <Text
                  className={styles.weaknessAccuracy}
                  style={{ color: getAccuracyColor(w.accuracy) }}
                >
                  {w.accuracy}%
                </Text>
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
              <Text className={styles.weaknessCount}>
                答错{w.wrongCount}题 / 共{w.totalCount}题
              </Text>
              <View className={styles.weaknessMistakes}>
                {w.recentMistakes.map((m, idx) => (
                  <Text key={idx} className={styles.weaknessMistake}>{m}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.scriptList}>
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
    </View>
  );
};

export default ScriptsPage;

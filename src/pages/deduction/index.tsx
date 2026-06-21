import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import AudioWaveform from '@/components/AudioWaveform';
import { useTrainingStore } from '@/store/useTrainingStore';
import { recordings } from '@/data/recordings';
import { VIOLATION_CATEGORY_MAP, VIOLATION_CATEGORY_COLOR } from '@/types';
import type { Violation } from '@/types';
import styles from './index.module.scss';

const DeductionPage: React.FC = () => {
  const { deductionItems } = useTrainingStore();
  const [selectedRecordingIdx, setSelectedRecordingIdx] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [riskAnswer, setRiskAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'price_objection', 'efficacy_promise', 'postoperative_care', 'risk_concealment'];

  const availableRecordings = recordings.filter((r) => r.unlocked);

  const currentRecording = availableRecordings[selectedRecordingIdx] || availableRecordings[0];

  const filteredDeductions = useMemo(() => {
    let items = deductionItems.filter((d) => d.recordingId === currentRecording?.id);
    if (categoryFilter !== 'all') {
      items = items.filter((d) => d.category === categoryFilter);
    }
    return items;
  }, [deductionItems, currentRecording, categoryFilter]);

  const handleWaveformClick = (position: number) => {
    if (submitted) return;
    setSelectedPosition(position);
  };

  const handleSubmit = () => {
    if (selectedPosition === null && riskAnswer === null) return;
    setSubmitted(true);
    console.info('[Deduction] Submit', { selectedPosition, riskAnswer, recordingId: currentRecording?.id });
  };

  const handleReset = () => {
    setSelectedPosition(null);
    setRiskAnswer(null);
    setSubmitted(false);
  };

  const isPositionCorrect = currentRecording?.violations.some(
    (v) => Math.abs(v.position - (selectedPosition ?? -1)) <= 2
  );

  const matchedViolation: Violation | undefined = currentRecording?.violations.find(
    (v) => Math.abs(v.position - (selectedPosition ?? -1)) <= 2
  );

  const isRiskAnswerCorrect = riskAnswer === currentRecording?.riskDisclosureComplete;

  return (
    <View className={styles.page}>
      <View className={styles.introCard}>
        <Text className={styles.introTitle}>🔍 扣分找茬</Text>
        <Text className={styles.introDesc}>在波形上点选违规话术位置，判断风险告知是否完整</Text>
      </View>

      <View className={styles.categoryFilters}>
        {categories.map((cat) => (
          <View
            key={cat}
            className={classnames(
              styles.filterTag,
              categoryFilter === cat && styles.filterTagActive
            )}
            onClick={() => setCategoryFilter(cat)}
          >
            <Text style={{ fontSize: '24rpx' }}>
              {cat === 'all' ? '全部' : VIOLATION_CATEGORY_MAP[cat]}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.recordingSection}>
        <View className={styles.recordingCard}>
          <View className={styles.recordingHeader}>
            <Text className={styles.recordingTitle}>{currentRecording?.title}</Text>
            <View className={styles.recordingTag}>
              <Text className={styles.recordingTagText}>
                {currentRecording?.category}
              </Text>
            </View>
          </View>

          <View className={styles.waveformSection}>
            <Text className={styles.waveformLabel}>点击波形标记违规话术位置</Text>
            <AudioWaveform
              waveformData={currentRecording?.waveformData || []}
              progress={0.5}
              violationPositions={
                submitted
                  ? currentRecording?.violations.map((v) => v.position) || []
                  : []
              }
              onWaveformClick={handleWaveformClick}
              selectedPosition={selectedPosition ?? undefined}
            />
            {!submitted && (
              <Text className={styles.clickHint}>
                👆 点击波形上的违规位置
              </Text>
            )}
          </View>

          <View className={styles.questionSection}>
            <View className={styles.questionCard}>
              <Text className={styles.questionLabel}>项目风险告知是否完整？</Text>
              <View className={styles.judgeRow}>
                <View
                  className={classnames(
                    styles.judgeBtn,
                    styles.judgeBtnComplete,
                    riskAnswer === true && styles.judgeBtnSelected
                  )}
                  onClick={() => !submitted && setRiskAnswer(true)}
                >
                  <Text style={{ color: '#fff', fontSize: '28rpx' }}>完整</Text>
                </View>
                <View
                  className={classnames(
                    styles.judgeBtn,
                    styles.judgeBtnIncomplete,
                    riskAnswer === false && styles.judgeBtnSelected
                  )}
                  onClick={() => !submitted && setRiskAnswer(false)}
                >
                  <Text style={{ fontSize: '28rpx' }}>不完整</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.submitRow}>
        {submitted ? (
          <View className={classnames(styles.submitBtn)} onClick={handleReset}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>下一题</Text>
          </View>
        ) : (
          <View
            className={classnames(
              styles.submitBtn,
              (selectedPosition === null && riskAnswer === null) && styles.submitBtnDisabled
            )}
            onClick={handleSubmit}
          >
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>提交判断</Text>
          </View>
        )}
      </View>

      {submitted && (
        <View className={styles.resultSection}>
          <View className={styles.scoreCard}>
            <Text
              className={classnames(
                styles.scoreValue,
                (isPositionCorrect || isRiskAnswerCorrect) ? styles.scorePass : styles.scoreFail
              )}
            >
              {(isPositionCorrect ? 50 : 0) + (isRiskAnswerCorrect ? 50 : 0)}
            </Text>
            <Text className={styles.scoreLabel}>总分</Text>
          </View>

          {matchedViolation && (
            <View className={styles.resultCard}>
              <View className={styles.resultHeader}>
                <Text className={styles.resultIcon}>
                  {isPositionCorrect ? '✅' : '❌'}
                </Text>
                <Text
                  className={classnames(
                    styles.resultTitle,
                    isPositionCorrect ? styles.resultTitleCorrect : styles.resultTitleWrong
                  )}
                >
                  {isPositionCorrect ? '位置正确' : '位置偏差'}
                </Text>
              </View>
              <View
                className={styles.violationCategory}
                style={{ background: VIOLATION_CATEGORY_COLOR[matchedViolation.category] }}
              >
                <Text style={{ fontSize: '22rpx' }}>
                  {VIOLATION_CATEGORY_MAP[matchedViolation.category]}
                </Text>
              </View>
              <Text className={styles.violationText}>{matchedViolation.text}</Text>
              <View className={styles.standardAnswer}>
                <Text className={styles.standardLabel}>标准答案</Text>
                <Text className={styles.standardText}>{matchedViolation.standardAnswer}</Text>
              </View>
            </View>
          )}

          {currentRecording?.violations
            .filter((v) => v.id !== matchedViolation?.id)
            .map((v) => (
              <View key={v.id} className={styles.resultCard}>
                <View className={styles.resultHeader}>
                  <Text className={styles.resultIcon}>📍</Text>
                  <Text className={classnames(styles.resultTitle, styles.resultTitleWrong)}>
                    漏选违规
                  </Text>
                </View>
                <View
                  className={styles.violationCategory}
                  style={{ background: VIOLATION_CATEGORY_COLOR[v.category] }}
                >
                  <Text style={{ fontSize: '22rpx' }}>
                    {VIOLATION_CATEGORY_MAP[v.category]}
                  </Text>
                </View>
                <Text className={styles.violationText}>{v.text}</Text>
                <View className={styles.standardAnswer}>
                  <Text className={styles.standardLabel}>标准答案</Text>
                  <Text className={styles.standardText}>{v.standardAnswer}</Text>
                </View>
              </View>
            ))}
        </View>
      )}
    </View>
  );
};

export default DeductionPage;

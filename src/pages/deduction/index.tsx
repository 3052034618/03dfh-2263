import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import AudioWaveform from '@/components/AudioWaveform';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTrainingStore } from '@/store/useTrainingStore';
import { recordings } from '@/data/recordings';
import { VIOLATION_CATEGORY_MAP, VIOLATION_CATEGORY_COLOR } from '@/types';
import type { Violation } from '@/types';
import styles from './index.module.scss';

interface HitResult {
  violation: Violation;
  hit: boolean;
  points: number;
}

const DeductionPage: React.FC = () => {
  const [selectedRecordingIdx, setSelectedRecordingIdx] = useState(0);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [riskAnswer, setRiskAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audioUrl, setAudioUrl] = useState('');
  const audio = useAudioPlayer(audioUrl);

  const categories = ['all', 'price_objection', 'efficacy_promise', 'postoperative_care', 'risk_concealment'];
  const allRecordings = recordings.filter((r) => r.unlocked);
  const filteredRecordings =
    categoryFilter === 'all'
      ? allRecordings
      : allRecordings.filter((r) =>
          r.violations.some((v) => v.category === categoryFilter)
        );

  const currentRecording = filteredRecordings[selectedRecordingIdx] || filteredRecordings[0];

  useEffect(() => {
    setSelectedRecordingIdx(0);
    setSelectedPositions([]);
    setRiskAnswer(null);
    setSubmitted(false);
  }, [categoryFilter]);

  useEffect(() => {
    if (currentRecording) {
      setAudioUrl(currentRecording.audioUrl);
    }
  }, [currentRecording]);

  useEffect(() => {
    audio.markReset();
  }, [currentRecording?.id]);

  const canAnswer = audio.isFullyPlayed;

  const handleRecordingChange = (idx: number) => {
    if (idx === selectedRecordingIdx) return;
    audio.stop();
    audio.markReset();
    setSelectedRecordingIdx(idx);
    setSelectedPositions([]);
    setRiskAnswer(null);
    setSubmitted(false);
  };

  const handleWaveformClick = (position: number) => {
    if (submitted) return;
    if (!canAnswer) {
      Taro.showToast({ title: '请先完整听完录音', icon: 'none' });
      return;
    }
    setSelectedPositions((prev) => {
      if (prev.includes(position)) {
        return prev.filter((p) => p !== position);
      }
      return [...prev, position];
    });
  };

  const handleSubmit = () => {
    if (selectedPositions.length === 0 && riskAnswer === null) return;
    if (!canAnswer) {
      Taro.showToast({ title: '请先完整听完录音', icon: 'none' });
      return;
    }
    setSubmitted(true);
    audio.pause();

    if (currentRecording) {
      currentRecording.violations.forEach((v) => {
        const wasHit = selectedPositions.some((p) => Math.abs(p - v.position) <= 2);
        if (!wasHit) {
          useTrainingStore.getState().addMistake({
            category: v.category,
            question: currentRecording.title,
            userAnswer: '未标中该违规点',
            correctAnswer: v.text,
            violationText: v.text,
            recordingId: currentRecording.id
          });
        }
      });
      if (riskAnswer !== null && riskAnswer !== currentRecording.riskDisclosureComplete) {
        useTrainingStore.getState().addMistake({
          category: 'risk_concealment',
          question: currentRecording.title,
          userAnswer: riskAnswer ? '风险告知完整' : '风险告知不完整',
          correctAnswer: currentRecording.riskDisclosureComplete ? '风险告知完整' : '风险告知不完整',
          violationText: '风险告知完整性判断错误',
          recordingId: currentRecording.id
        });
      }
      useTrainingStore.getState().recordPractice(currentRecording.id, totalScore);
    }

    console.info('[Deduction] Submit', { selectedPositions, riskAnswer, recordingId: currentRecording?.id });
  };

  const handleReset = () => {
    audio.stop();
    audio.markReset();
    setSelectedPositions([]);
    setRiskAnswer(null);
    setSubmitted(false);
  };

  const getHitResults = (): HitResult[] => {
    if (!currentRecording) return [];
    return currentRecording.violations.map((v) => {
      const hit = selectedPositions.some((p) => Math.abs(p - v.position) <= 2);
      return { violation: v, hit, points: hit ? v.deductionPoints : 0 };
    });
  };

  const isRiskAnswerCorrect = riskAnswer === currentRecording?.riskDisclosureComplete;
  const hitResults = submitted ? getHitResults() : [];
  const hitCount = hitResults.filter((r) => r.hit).length;
  const totalViolations = currentRecording?.violations.length || 0;
  const maxPoints = (currentRecording?.violations.reduce((s, v) => s + v.deductionPoints, 0) || 0) + 30;
  const earnedPoints = hitResults.reduce((s, r) => s + r.points, 0) + (isRiskAnswerCorrect ? 30 : 0);
  const totalScore = Math.round((earnedPoints / maxPoints) * 100);

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

      <View className={styles.recordingSelectors}>
        {filteredRecordings.map((rec, idx) => (
          <View
            key={rec.id}
            className={classnames(
              styles.recordingSelector,
              selectedRecordingIdx === idx && styles.recordingSelectorActive,
              rec.violations.length >= 3 && styles.recordingSelectorHot
            )}
            onClick={() => handleRecordingChange(idx)}
          >
            <Text className={styles.recordingSelectorTitle}>{rec.title}</Text>
            <Text className={styles.recordingSelectorMeta}>
              {rec.violations.length}处违规 · {Math.round(rec.duration / 60)}分
            </Text>
          </View>
        ))}
      </View>

      {currentRecording && (
        <View className={styles.recordingSection}>
          <View className={styles.recordingCard}>
            <View className={styles.recordingHeader}>
              <Text className={styles.recordingTitle}>{currentRecording.title}</Text>
              <View className={styles.recordingTag}>
                <Text className={styles.recordingTagText}>
                  {currentRecording.category}
                </Text>
              </View>
            </View>

            <View className={styles.waveformSection}>
              <Text className={styles.waveformLabel}>
                {canAnswer ? '点击波形标记违规位置（可标记多个）' : '🎧 听录音，注意违规话术出现的位置'}
              </Text>
              {!canAnswer && !submitted && (
                <Text className={styles.listenHint}>
                  ⏳ 请先完整听完录音再标记（{Math.round(audio.progress * 100)}%）
                </Text>
              )}
              {canAnswer && !submitted && (
                <Text className={styles.listenDoneHint}>
                  ✅ 录音已听完，可以标记违规位置
                </Text>
              )}
              <AudioWaveform
                waveformData={currentRecording.waveformData}
                progress={audio.progress}
                duration={currentRecording.duration}
                currentTime={audio.currentTime}
                isPlaying={audio.isPlaying}
                violationPositions={
                  submitted
                    ? currentRecording.violations.map((v) => v.position)
                    : []
                }
                selectedPositions={canAnswer ? selectedPositions : []}
                onWaveformClick={handleWaveformClick}
                onTogglePlay={audio.togglePlay}
                showPlayControl
                allowMultiSelect
              />
            </View>

            <View
              className={classnames(
                styles.answerSection,
                canAnswer && styles.answerSectionExpanded
              )}
            >
              {!submitted && (
                <Text className={styles.clickHint}>
                  👆 点击波形上的违规位置（已选{selectedPositions.length}处）
                </Text>
              )}

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
      )}

      {canAnswer && (
        <View className={styles.submitRow}>
          {submitted ? (
            <View className={classnames(styles.submitBtn)} onClick={handleReset}>
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>下一题</Text>
            </View>
          ) : (
            <View
              className={classnames(
                styles.submitBtn,
                (selectedPositions.length === 0 && riskAnswer === null) && styles.submitBtnDisabled
              )}
              onClick={handleSubmit}
            >
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>提交判断</Text>
            </View>
          )}
        </View>
      )}

      {!canAnswer && !submitted && (
        <View className={styles.listenTipBar}>
          <Text className={styles.listenTipText}>
            🎧 请先完整听完录音再作答
          </Text>
        </View>
      )}

      {submitted && currentRecording && (
        <View className={styles.resultSection}>
          <View className={styles.reviewHeader}>
            <Text className={styles.reviewTitle}>📊 本次练习复盘</Text>
            <Text className={styles.reviewSubtitle}>{currentRecording.title}</Text>
          </View>

          <View className={styles.scoreCard}>
            <Text
              className={classnames(
                styles.scoreValue,
                totalScore >= 60 ? styles.scorePass : styles.scoreFail
              )}
            >
              {totalScore}
            </Text>
            <Text className={styles.scoreLabel}>
              命中{hitCount}/{totalViolations}处违规 · 风险判断{isRiskAnswerCorrect ? '✓' : '✗'}
            </Text>
          </View>

          <View className={styles.reviewSection}>
            <Text className={styles.reviewSectionTitle}>📈 错题分类统计</Text>
            {(() => {
              const catMap = new Map<string, { wrong: number; total: number; label: string }>();
              currentRecording.violations.forEach((v) => {
                if (!catMap.has(v.category)) {
                  catMap.set(v.category, {
                    wrong: 0,
                    total: 0,
                    label: VIOLATION_CATEGORY_MAP[v.category]
                  });
                }
                const cat = catMap.get(v.category)!;
                cat.total += 1;
                const wasHit = selectedPositions.some((p) => Math.abs(p - v.position) <= 2);
                if (!wasHit) cat.wrong += 1;
              });
              if (!isRiskAnswerCorrect) {
                if (!catMap.has('risk_concealment')) {
                  catMap.set('risk_concealment', {
                    wrong: 0,
                    total: 0,
                    label: VIOLATION_CATEGORY_MAP.risk_concealment
                  });
                }
                const cat = catMap.get('risk_concealment')!;
                cat.total += 1;
                cat.wrong += 1;
              }
              return Array.from(catMap.entries()).map(([cat, data]) => (
                <View key={cat} className={styles.categoryStatItem}>
                  <View
                    className={styles.categoryStatTag}
                    style={{ background: VIOLATION_CATEGORY_COLOR[cat as keyof typeof VIOLATION_CATEGORY_COLOR] }}
                  >
                    <Text style={{ fontSize: '22rpx' }}>{data.label}</Text>
                  </View>
                  <Text className={styles.categoryStatText}>
                    错{data.wrong} / 共{data.total}
                  </Text>
                  <View className={styles.categoryStatBarBg}>
                    <View
                      className={styles.categoryStatBarFill}
                      style={{
                        width: `${data.total > 0 ? ((data.total - data.wrong) / data.total) * 100 : 100}%`,
                        background: data.wrong === 0 ? '#10B981' : data.wrong === data.total ? '#EF4444' : '#F59E0B'
                      }}
                    />
                  </View>
                </View>
              ));
            })()}
          </View>

          <View className={styles.reviewSection}>
            <Text className={styles.reviewSectionTitle}>💡 建议复听时间点</Text>
            <View className={styles.reviewTimestamps}>
              {currentRecording.violations
                .filter((v) => !selectedPositions.some((p) => Math.abs(p - v.position) <= 2))
                .slice(0, 4)
                .map((v) => (
                  <View key={v.id} className={styles.timestampChip}>
                    <Text className={styles.timestampChipText}>
                      {Math.floor((v.position / 60) * currentRecording.duration / 60)}:{Math.floor(((v.position / 60) * currentRecording.duration) % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text className={styles.timestampChipLabel}>
                      {VIOLATION_CATEGORY_MAP[v.category]}
                    </Text>
                  </View>
                ))}
              {currentRecording.violations.filter((v) =>
                !selectedPositions.some((p) => Math.abs(p - v.position) <= 2)
              ).length === 0 && (
                <Text className={styles.reviewEmpty}>全部命中！没有需要复听的内容🎉</Text>
              )}
            </View>
          </View>

          <View className={styles.reviewSection}>
            <Text className={styles.reviewSectionTitle}>🎯 命中与漏选详情</Text>
            {hitResults.map((result, idx) => (
              <View key={result.violation.id} className={styles.resultCard}>
                <View className={styles.resultHeader}>
                  <Text className={styles.resultIcon}>
                    {result.hit ? '✅' : '❌'}
                  </Text>
                  <Text
                    className={classnames(
                      styles.resultTitle,
                      result.hit ? styles.resultTitleCorrect : styles.resultTitleWrong
                    )}
                  >
                    {result.hit ? `命中违规 #${idx + 1}` : `漏选违规 #${idx + 1}`}
                  </Text>
                  <Text className={styles.resultPoints}>
                    {result.hit ? `+${result.violation.deductionPoints}分` : `-${result.violation.deductionPoints}分`}
                  </Text>
                </View>
                <View
                  className={styles.violationCategory}
                  style={{ background: VIOLATION_CATEGORY_COLOR[result.violation.category] }}
                >
                  <Text style={{ fontSize: '22rpx' }}>
                    {VIOLATION_CATEGORY_MAP[result.violation.category]}
                  </Text>
                </View>
                <Text className={styles.violationText}>{result.violation.text}</Text>
                <View className={styles.standardAnswer}>
                  <Text className={styles.standardLabel}>标准答案</Text>
                  <Text className={styles.standardText}>{result.violation.standardAnswer}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className={styles.reviewActions}>
            <View
              className={classnames(styles.reviewBtn, styles.reviewBtnSecondary)}
              onClick={handleReset}
            >
              <Text style={{ fontSize: '28rpx' }}>下一题</Text>
            </View>
            <View
              className={classnames(styles.reviewBtn, styles.reviewBtnPrimary)}
              onClick={() => {
                audio.stop();
                audio.markReset();
                setSelectedPositions([]);
                setRiskAnswer(null);
                setSubmitted(false);
              }}
            >
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>再练一次</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DeductionPage;

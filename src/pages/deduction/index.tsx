import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import AudioWaveform from '@/components/AudioWaveform';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTrainingStore } from '@/store/useTrainingStore';
import { recordings } from '@/data/recordings';
import { VIOLATION_CATEGORY_MAP, VIOLATION_CATEGORY_COLOR } from '@/types';
import type { Violation } from '@/types';
import styles from './index.module.scss';

const SAMPLE_AUDIO_URL = 'https://cdn.pixabay.com/audio/2024/11/01/audio_071f2db7a2.mp3';

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
  const availableRecordings = recordings.filter((r) => r.unlocked);
  const currentRecording = availableRecordings[selectedRecordingIdx] || availableRecordings[0];

  useEffect(() => {
    if (currentRecording) {
      setAudioUrl(SAMPLE_AUDIO_URL);
    }
  }, [currentRecording]);

  const handleWaveformClick = (position: number) => {
    if (submitted) return;
    setSelectedPositions((prev) => {
      if (prev.includes(position)) {
        return prev.filter((p) => p !== position);
      }
      return [...prev, position];
    });
  };

  const handleSubmit = () => {
    if (selectedPositions.length === 0 && riskAnswer === null) return;
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
            violationText: v.text
          });
        }
      });
      if (riskAnswer !== null && riskAnswer !== currentRecording.riskDisclosureComplete) {
        useTrainingStore.getState().addMistake({
          category: 'risk_concealment',
          question: currentRecording.title,
          userAnswer: riskAnswer ? '风险告知完整' : '风险告知不完整',
          correctAnswer: currentRecording.riskDisclosureComplete ? '风险告知完整' : '风险告知不完整',
          violationText: '风险告知完整性判断错误'
        });
      }
    }

    console.info('[Deduction] Submit', { selectedPositions, riskAnswer, recordingId: currentRecording?.id });
  };

  const handleReset = () => {
    audio.stop();
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
            <Text className={styles.waveformLabel}>
              点击波形标记违规位置（可标记多个）
            </Text>
            <AudioWaveform
              waveformData={currentRecording?.waveformData || []}
              progress={audio.progress}
              duration={currentRecording?.duration || 0}
              currentTime={audio.currentTime}
              isPlaying={audio.isPlaying}
              violationPositions={
                submitted
                  ? currentRecording?.violations.map((v) => v.position) || []
                  : []
              }
              selectedPositions={selectedPositions}
              onWaveformClick={handleWaveformClick}
              onTogglePlay={audio.togglePlay}
              showPlayControl
              allowMultiSelect
            />
            {!submitted && (
              <Text className={styles.clickHint}>
                👆 点击波形上的违规位置（已选{selectedPositions.length}处）
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
              (selectedPositions.length === 0 && riskAnswer === null) && styles.submitBtnDisabled
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
                totalScore >= 60 ? styles.scorePass : styles.scoreFail
              )}
            >
              {totalScore}
            </Text>
            <Text className={styles.scoreLabel}>
              命中{hitCount}/{totalViolations}处违规 · 风险判断{isRiskAnswerCorrect ? '✓' : '✗'}
            </Text>
          </View>

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
      )}
    </View>
  );
};

export default DeductionPage;

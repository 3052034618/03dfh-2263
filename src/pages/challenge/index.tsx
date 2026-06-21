import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import AudioWaveform from '@/components/AudioWaveform';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTrainingStore } from '@/store/useTrainingStore';
import { recordings, challengeLevels } from '@/data/recordings';
import styles from './index.module.scss';

const STORAGE_KEY_TARGET_RECORDING = 'target_recording_id';

const ChallengePage: React.FC = () => {
  const router = useRouter();
  const storeLevels = useTrainingStore((s) => s.challengeLevels);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [selectedDemand, setSelectedDemand] = useState<number | null>(null);
  const [exaggerationAnswer, setExaggerationAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audio = useAudioPlayer(audioUrl);

  const openLevelByRecordingId = (recordingId: string) => {
    const level = challengeLevels.find((l) => l.recordingId === recordingId);
    if (level) {
      const storeLevel = storeLevels.find((s) => s.id === level.id);
      if (!storeLevel || !storeLevel.locked) {
        setTimeout(() => {
          audio.stop();
          audio.markReset();
          setActiveLevel(level.id);
          setSelectedDemand(null);
          setExaggerationAnswer(null);
          setShowResult(false);
          setSubmitted(false);
        }, 80);
      } else {
        Taro.showToast({ title: '该关卡尚未解锁', icon: 'none' });
      }
    }
  };

  useEffect(() => {
    const autoRecordingId = router.params.recordingId;
    if (autoRecordingId) {
      openLevelByRecordingId(autoRecordingId);
    }
  }, []);

  useDidShow(() => {
    try {
      const targetId = Taro.getStorageSync(STORAGE_KEY_TARGET_RECORDING);
      if (targetId) {
        Taro.removeStorageSync(STORAGE_KEY_TARGET_RECORDING);
        openLevelByRecordingId(targetId);
      }
    } catch (e) {
      console.error('[Challenge] Read target failed', e);
    }
  });

  const activeLevelData = activeLevel
    ? storeLevels.find((l) => l.id === activeLevel)
    : null;
  const activeRecording = activeLevelData
    ? recordings.find((r) => r.id === activeLevelData.recordingId)
    : null;

  useEffect(() => {
    if (activeRecording) {
      setAudioUrl(activeRecording.audioUrl);
    } else {
      setAudioUrl('');
    }
  }, [activeRecording]);

  const canAnswer = audio.isFullyPlayed;

  const handleLevelClick = (levelId: string, locked: boolean) => {
    if (locked) return;
    audio.stop();
    audio.markReset();
    setActiveLevel(levelId);
    setSelectedDemand(null);
    setExaggerationAnswer(null);
    setShowResult(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (selectedDemand === null || exaggerationAnswer === null) return;
    if (!canAnswer) {
      Taro.showToast({ title: '请先完整听完录音', icon: 'none' });
      return;
    }
    setSubmitted(true);
    audio.pause();

    const demandCorrect = selectedDemand === activeRecording?.correctDemandIndex;
    const exaggerationCorrect = exaggerationAnswer === activeRecording?.hasExaggeration;
    let score = 0;
    if (demandCorrect) score += 50;
    if (exaggerationCorrect) score += 50;
    setShowResult(true);

    if (!demandCorrect && activeRecording) {
      useTrainingStore.getState().addMistake({
        category: 'efficacy_promise',
        question: activeRecording.title,
        userAnswer: activeRecording.demandOptions[selectedDemand!],
        correctAnswer: activeRecording.demandOptions[activeRecording.correctDemandIndex],
        violationText: `顾客核心诉求判断错误：${activeRecording.demandOptions[selectedDemand!]}`,
        recordingId: activeRecording.id
      });
    }
    if (!exaggerationCorrect && activeRecording) {
      useTrainingStore.getState().addMistake({
        category: 'efficacy_promise',
        question: activeRecording.title,
        userAnswer: exaggerationAnswer ? '存在夸大' : '不存在夸大',
        correctAnswer: activeRecording.hasExaggeration ? '存在夸大' : '不存在夸大',
        violationText: '咨询师夸大疗效判断错误',
        recordingId: activeRecording.id
      });
    }

    if (activeLevel) {
      const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 60 ? 1 : 0;
      useTrainingStore.getState().completeChallengeLevel(activeLevel, score, stars);
    }

    if (activeRecording) {
      useTrainingStore.getState().recordPractice(activeRecording.id, score);
    }

    console.info('[Challenge] Submit answer', { demandCorrect, exaggerationCorrect, score });
  };

  const handleCloseModal = () => {
    audio.stop();
    audio.markReset();
    setActiveLevel(null);
    setSelectedDemand(null);
    setExaggerationAnswer(null);
    setShowResult(false);
    setSubmitted(false);
  };

  const demandCorrect = submitted && activeRecording
    ? selectedDemand === activeRecording.correctDemandIndex
    : false;
  const exaggerationCorrect = submitted && activeRecording
    ? exaggerationAnswer === activeRecording.hasExaggeration
    : false;

  const currentScore = (() => {
    if (!activeRecording || !submitted) return 0;
    let score = 0;
    if (demandCorrect) score += 50;
    if (exaggerationCorrect) score += 50;
    return score;
  })();

  const currentStars = currentScore >= 90 ? 3 : currentScore >= 70 ? 2 : currentScore >= 60 ? 1 : 0;

  return (
    <View className={styles.page}>
      <View className={styles.practiceSection}>
        <View className={styles.practiceCard}>
          <Text className={styles.practiceTitle}>🎯 录音闯关</Text>
          <Text className={styles.practiceDesc}>
            听取真实脱敏录音，判断顾客诉求与咨询师合规性
          </Text>
          <View className={styles.practiceBtn}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>选择关卡开始</Text>
          </View>
        </View>
      </View>

      <View className={styles.levelList}>
        {storeLevels.map((level) => (
          <View
            key={level.id}
            className={classnames(
              styles.levelCard,
              level.locked && styles.levelCardLocked
            )}
            onClick={() => handleLevelClick(level.id, level.locked)}
          >
            <View
              className={classnames(
                styles.levelBadge,
                level.passed && styles.levelBadgePassed,
                !level.passed && !level.locked && styles.levelBadgeCurrent,
                level.locked && styles.levelBadgeLocked
              )}
            >
              {level.locked ? '🔒' : `${level.level}`}
            </View>
            <View className={styles.levelInfo}>
              <Text className={styles.levelTitle}>{level.title}</Text>
              <Text className={styles.levelDesc}>
                {level.locked ? '通过上一关解锁' : level.passed ? '已通过' : '待挑战'}
              </Text>
              <View className={styles.levelStars}>
                {Array.from({ length: level.maxStars }).map((_, i) => (
                  <Text
                    key={i}
                    className={classnames(
                      styles.star,
                      i < level.stars ? styles.starFilled : styles.starEmpty
                    )}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>
            <View className={styles.levelScore}>
              <Text className={styles.levelScoreValue}>
                {level.passed ? `${level.score}` : '-'}
              </Text>
              <Text className={styles.levelScoreLabel}>分</Text>
            </View>
          </View>
        ))}
      </View>

      {activeLevel && activeRecording && (
        <View className={styles.modal} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {!showResult ? (
              <>
                <Text className={styles.modalTitle}>{activeRecording.title}</Text>

                <View className={styles.questionCard}>
                  <Text className={styles.questionLabel}>🎧 听录音后作答</Text>
                  {!canAnswer && (
                    <Text className={styles.listenHint}>
                      ⏳ 请先完整听完录音再答题
                      （{Math.round(audio.progress * 100)}%）
                    </Text>
                  )}
                  {canAnswer && (
                    <Text className={styles.listenDoneHint}>✅ 录音已听完，可以答题</Text>
                  )}
                  <AudioWaveform
                    waveformData={activeRecording.waveformData}
                    progress={audio.progress}
                    duration={activeRecording.duration}
                    currentTime={audio.currentTime}
                    isPlaying={audio.isPlaying}
                    violationPositions={submitted ? activeRecording.violations.map((v) => v.position) : []}
                    onTogglePlay={audio.togglePlay}
                    showPlayControl
                  />
                </View>

                <View
                  className={classnames(
                    styles.answerSection,
                    canAnswer && styles.answerSectionExpanded
                  )}
                >
                  <View className={styles.questionCard}>
                    <Text className={styles.questionLabel}>1. 顾客的核心诉求是什么？</Text>
                    <View className={styles.optionsGrid}>
                      {activeRecording.demandOptions.map((option, idx) => (
                        <View
                          key={idx}
                          className={classnames(
                            styles.optionBtn,
                            selectedDemand === idx && styles.optionBtnSelected,
                            submitted && idx === activeRecording.correctDemandIndex && styles.optionBtnCorrect,
                            submitted && selectedDemand === idx && idx !== activeRecording.correctDemandIndex && styles.optionBtnWrong
                          )}
                          onClick={() => canAnswer && !submitted && setSelectedDemand(idx)}
                        >
                          <Text style={{ fontSize: '24rpx' }}>{option}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className={styles.questionCard}>
                    <Text className={styles.questionLabel}>2. 咨询师是否存在夸大疗效？</Text>
                    <View className={styles.judgeRow}>
                      <View
                        className={classnames(
                          styles.judgeBtn,
                          styles.judgeBtnYes,
                          exaggerationAnswer === true && styles.optionBtnSelected,
                          !canAnswer && styles.judgeBtnDisabled
                        )}
                        onClick={() => canAnswer && !submitted && setExaggerationAnswer(true)}
                      >
                        <Text style={{ color: '#fff', fontSize: '28rpx' }}>存在夸大</Text>
                      </View>
                      <View
                        className={classnames(
                          styles.judgeBtn,
                          styles.judgeBtnNo,
                          exaggerationAnswer === false && styles.optionBtnSelected,
                          !canAnswer && styles.judgeBtnDisabled
                        )}
                        onClick={() => canAnswer && !submitted && setExaggerationAnswer(false)}
                      >
                        <Text style={{ fontSize: '28rpx' }}>不存在</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.modalActions}>
                    <View className={classnames(styles.modalBtn, styles.modalBtnSecondary)} onClick={handleCloseModal}>
                      <Text style={{ fontSize: '28rpx' }}>取消</Text>
                    </View>
                    <View
                      className={classnames(
                        styles.modalBtn,
                        styles.modalBtnPrimary,
                        (selectedDemand === null || exaggerationAnswer === null) && { opacity: 0.5 }
                      )}
                      onClick={handleSubmit}
                    >
                      <Text style={{ color: '#fff', fontSize: '28rpx' }}>提交答案</Text>
                    </View>
                  </View>
                </View>

                {!canAnswer && (
                  <View className={styles.listenTipBar}>
                    <Text className={styles.listenTipText}>
                      🎧 请先完整听完录音再作答
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text className={styles.reviewTitle}>📊 本次练习复盘</Text>
                <View className={styles.reviewSubtitle}>
                  <Text style={{ fontSize: '24rpx', color: '#6B7280' }}>{activeRecording.title}</Text>
                </View>

                <View className={styles.resultCard}>
                  <Text
                    className={classnames(
                      styles.resultScore,
                      currentScore >= 60 ? styles.resultScorePass : styles.resultScoreFail
                    )}
                  >
                    {currentScore}
                  </Text>
                  <Text className={styles.resultLabel}>
                    {currentScore >= 60 ? '恭喜通过！' : '继续加油！'}
                  </Text>
                  <View className={styles.resultStars}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text key={i} className={styles.resultStarIcon}>
                        {i < currentStars ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>

                <View className={styles.reviewSection}>
                  <Text className={styles.reviewSectionTitle}>❌ 错题汇总</Text>
                  {demandCorrect && exaggerationCorrect ? (
                    <Text className={styles.reviewEmpty}>太棒了！全部答对🎉</Text>
                  ) : (
                    <>
                      {!demandCorrect && (
                        <View className={styles.reviewItem}>
                          <View className={styles.reviewItemHeader}>
                            <Text className={styles.reviewItemIcon}>❌</Text>
                            <Text className={styles.reviewItemTitle}>顾客核心诉求判断错误</Text>
                          </View>
                          <View className={styles.reviewItemBody}>
                            <Text className={styles.reviewItemLabel}>你的答案</Text>
                            <Text className={styles.reviewItemWrong}>
                              {activeRecording.demandOptions[selectedDemand!]}
                            </Text>
                            <Text className={styles.reviewItemLabel}>正确答案</Text>
                            <Text className={styles.reviewItemCorrect}>
                              {activeRecording.demandOptions[activeRecording.correctDemandIndex]}
                            </Text>
                          </View>
                        </View>
                      )}
                      {!exaggerationCorrect && (
                        <View className={styles.reviewItem}>
                          <View className={styles.reviewItemHeader}>
                            <Text className={styles.reviewItemIcon}>❌</Text>
                            <Text className={styles.reviewItemTitle}>夸大疗效判断错误</Text>
                          </View>
                          <View className={styles.reviewItemBody}>
                            <Text className={styles.reviewItemLabel}>你的答案</Text>
                            <Text className={styles.reviewItemWrong}>
                              {exaggerationAnswer ? '存在夸大' : '不存在夸大'}
                            </Text>
                            <Text className={styles.reviewItemLabel}>正确答案</Text>
                            <Text className={styles.reviewItemCorrect}>
                              {activeRecording.hasExaggeration ? '存在夸大' : '不存在夸大'}
                            </Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </View>

                <View className={styles.reviewSection}>
                  <Text className={styles.reviewSectionTitle}>🎯 录音违规点梳理</Text>
                  {activeRecording.violations.length === 0 ? (
                    <Text className={styles.reviewEmpty}>这段录音无违规话术</Text>
                  ) : (
                    activeRecording.violations.map((v, idx) => (
                      <View key={v.id} className={styles.violationReviewItem}>
                        <View className={styles.violationReviewHeader}>
                          <Text className={styles.violationReviewIndex}>违规 #{idx + 1}</Text>
                          <View
                            className={styles.violationReviewTag}
                            style={{ background: VIOLATION_CATEGORY_COLOR[v.category] }}
                          >
                            <Text style={{ fontSize: '20rpx' }}>
                              {VIOLATION_CATEGORY_MAP[v.category]}
                            </Text>
                          </View>
                        </View>
                        <Text className={styles.violationReviewText}>{v.text}</Text>
                        <View className={styles.violationReviewTime}>
                          <Text style={{ fontSize: '22rpx', color: '#6B7280' }}>
                            🕒 出现时间：约 {Math.round((v.position / 60) * activeRecording.duration / 60)}分{Math.round((v.position / 60) * activeRecording.duration % 60).toString().padStart(2, '0')}秒
                          </Text>
                        </View>
                        <View className={styles.standardAnswer}>
                          <Text className={styles.standardLabel}>标准话术</Text>
                          <Text className={styles.standardText}>{v.standardAnswer}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                <View className={styles.reviewSection}>
                  <Text className={styles.reviewSectionTitle}>💡 建议复听时间点</Text>
                  <View className={styles.reviewTimestamps}>
                    {activeRecording.violations.slice(0, 3).map((v, idx) => (
                      <View key={v.id} className={styles.timestampChip}>
                        <Text className={styles.timestampChipText}>
                          {Math.floor((v.position / 60) * activeRecording.duration / 60)}:{Math.floor(((v.position / 60) * activeRecording.duration) % 60).toString().padStart(2, '0')}
                        </Text>
                        <Text className={styles.timestampChipLabel}>
                          {VIOLATION_CATEGORY_MAP[v.category]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.reviewActions}>
                  <View
                    className={classnames(styles.reviewBtn, styles.reviewBtnSecondary)}
                    onClick={handleCloseModal}
                  >
                    <Text style={{ fontSize: '28rpx' }}>完成</Text>
                  </View>
                  <View
                    className={classnames(styles.reviewBtn, styles.reviewBtnPrimary)}
                    onClick={() => {
                      audio.stop();
                      audio.markReset();
                      setShowResult(false);
                      setSubmitted(false);
                      setSelectedDemand(null);
                      setExaggerationAnswer(null);
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: '28rpx' }}>再练一次</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ChallengePage;

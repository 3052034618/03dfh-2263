import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import AudioWaveform from '@/components/AudioWaveform';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useTrainingStore } from '@/store/useTrainingStore';
import { recordings } from '@/data/recordings';
import styles from './index.module.scss';

const SAMPLE_AUDIO_URL = 'https://cdn.pixabay.com/audio/2024/11/01/audio_071f2db7a2.mp3';

const ChallengePage: React.FC = () => {
  const { challengeLevels } = useTrainingStore();
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [selectedDemand, setSelectedDemand] = useState<number | null>(null);
  const [exaggerationAnswer, setExaggerationAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audio = useAudioPlayer(audioUrl);

  const activeRecording = activeLevel
    ? recordings.find((r) => r.id === challengeLevels.find((l) => l.id === activeLevel)?.recordingId)
    : null;

  useEffect(() => {
    if (activeRecording) {
      setAudioUrl(SAMPLE_AUDIO_URL);
    } else {
      setAudioUrl('');
    }
  }, [activeRecording]);

  const handleLevelClick = (levelId: string, locked: boolean) => {
    if (locked) return;
    audio.stop();
    setActiveLevel(levelId);
    setSelectedDemand(null);
    setExaggerationAnswer(null);
    setShowResult(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (selectedDemand === null || exaggerationAnswer === null) return;
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
        userAnswer: activeRecording.demandOptions[selectedDemand],
        correctAnswer: activeRecording.demandOptions[activeRecording.correctDemandIndex],
        violationText: `顾客核心诉求判断错误：${activeRecording.demandOptions[selectedDemand]}`
      });
    }
    if (!exaggerationCorrect && activeRecording) {
      useTrainingStore.getState().addMistake({
        category: 'efficacy_promise',
        question: activeRecording.title,
        userAnswer: exaggerationAnswer ? '存在夸大' : '不存在夸大',
        correctAnswer: activeRecording.hasExaggeration ? '存在夸大' : '不存在夸大',
        violationText: '咨询师夸大疗效判断错误'
      });
    }

    if (activeLevel) {
      const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 60 ? 1 : 0;
      useTrainingStore.getState().completeChallengeLevel(activeLevel, score, stars);
    }

    console.info('[Challenge] Submit answer', { demandCorrect, exaggerationCorrect, score });
  };

  const handleCloseModal = () => {
    audio.stop();
    setActiveLevel(null);
    setSelectedDemand(null);
    setExaggerationAnswer(null);
    setShowResult(false);
    setSubmitted(false);
  };

  const currentScore = (() => {
    if (!activeRecording || !submitted) return 0;
    const demandCorrect = selectedDemand === activeRecording.correctDemandIndex;
    const exaggerationCorrect = exaggerationAnswer === activeRecording.hasExaggeration;
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
        {challengeLevels.map((level) => (
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
                        onClick={() => !submitted && setSelectedDemand(idx)}
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
                        exaggerationAnswer === true && styles.optionBtnSelected
                      )}
                      onClick={() => !submitted && setExaggerationAnswer(true)}
                    >
                      <Text style={{ color: '#fff', fontSize: '28rpx' }}>存在夸大</Text>
                    </View>
                    <View
                      className={classnames(
                        styles.judgeBtn,
                        styles.judgeBtnNo,
                        exaggerationAnswer === false && styles.optionBtnSelected
                      )}
                      onClick={() => !submitted && setExaggerationAnswer(false)}
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
              </>
            ) : (
              <>
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
                <View className={styles.modalActions}>
                  <View className={classnames(styles.modalBtn, styles.modalBtnPrimary)} onClick={handleCloseModal}>
                    <Text style={{ color: '#fff', fontSize: '28rpx' }}>完成</Text>
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

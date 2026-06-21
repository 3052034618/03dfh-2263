import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTrainingStore } from '@/store/useTrainingStore';
import { VIOLATION_CATEGORY_MAP, VIOLATION_CATEGORY_COLOR } from '@/types';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const { weaknessItems, mentorReviews, userProfile } = useTrainingStore();
  const [reviewText, setReviewText] = useState('');

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#10B981';
    if (accuracy >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      Taro.showToast({ title: '请输入点评内容', icon: 'none' });
      return;
    }
    useTrainingStore.getState().addMentorReview({
      mentorName: '我（带教老师）',
      mentorAvatar: 'https://picsum.photos/id/1027/200/200',
      studentId: userProfile.id,
      content: reviewText.trim(),
      weakPoints: weaknessItems.filter((w) => w.accuracy < 60).map((w) => w.category),
      excellentRecordingUnlocked: false,
      recordingId: ''
    });
    Taro.showToast({ title: '点评已提交', icon: 'success' });
    setReviewText('');
  };

  const handleListenRecording = (recordingId: string) => {
    if (!recordingId) return;
    Taro.switchTab({ url: '/pages/challenge/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📝 带教点评</Text>
        <Text className={styles.headerDesc}>导师反馈与个人薄弱项清单</Text>
      </View>

      <View className={styles.reviewList}>
        {mentorReviews.map((review) => (
          <View key={review.id} className={styles.reviewCard}>
            <View className={styles.reviewHeader}>
              <Image
                className={styles.mentorAvatar}
                src={review.mentorAvatar}
                mode="aspectFill"
              />
              <View className={styles.mentorInfo}>
                <Text className={styles.mentorName}>{review.mentorName}</Text>
                <Text className={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            <Text className={styles.reviewContent}>{review.content}</Text>
            <View className={styles.weakPoints}>
              {review.weakPoints.map((wp) => (
                <View
                  key={wp}
                  className={styles.weakPointTag}
                  style={{ background: VIOLATION_CATEGORY_COLOR[wp] }}
                >
                  <Text style={{ fontSize: '22rpx' }}>{VIOLATION_CATEGORY_MAP[wp]}</Text>
                </View>
              ))}
            </View>
            {review.excellentRecordingUnlocked && (
              <View className={styles.unlockBanner}>
                <Text className={styles.unlockText}>🎉 已解锁优秀成交录音</Text>
                <View
                  className={styles.unlockBtn}
                  onClick={() => handleListenRecording(review.recordingId)}
                >
                  <Text style={{ fontSize: '24rpx', color: '#fff' }}>去听</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.weaknessSection}>
        <Text className={styles.weaknessTitle}>💪 个人薄弱项清单</Text>
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

      <View className={styles.inputSection}>
        <View className={styles.inputCard}>
          <Text className={styles.inputTitle}>录入点评（带教老师）</Text>
          <Textarea
            className={styles.inputArea}
            placeholder="输入对学员的点评内容..."
            value={reviewText}
            onInput={(e) => setReviewText(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.submitBtn} onClick={handleSubmitReview}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>提交点评</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ReviewPage;

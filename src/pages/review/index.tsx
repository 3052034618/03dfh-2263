import React, { useState } from 'react';
import { View, Text, Image, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTrainingStore } from '@/store/useTrainingStore';
import { VIOLATION_CATEGORY_MAP, VIOLATION_CATEGORY_COLOR } from '@/types';
import { challengeLevels, recordings } from '@/data/recordings';
import styles from './index.module.scss';

const STORAGE_KEY_TARGET_RECORDING = 'target_recording_id';

const ReviewPage: React.FC = () => {
  const { weaknessItems, mentorReviews, userProfile, practiceTasks, addPracticeTask } = useTrainingStore();
  const [reviewText, setReviewText] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [selectedRecordingIndex, setSelectedRecordingIndex] = useState(0);
  const [taskTab, setTaskTab] = useState<'pending' | 'done'>('pending');

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

  const handleAssignTask = () => {
    if (!taskNote.trim()) {
      Taro.showToast({ title: '请输入任务要求', icon: 'none' });
      return;
    }
    const rec = recordings[selectedRecordingIndex];
    if (!rec) return;
    addPracticeTask({
      mentorName: '我（带教老师）',
      mentorAvatar: 'https://picsum.photos/id/1027/200/200',
      recordingId: rec.id,
      recordingTitle: rec.title,
      note: taskNote.trim()
    });
    Taro.showToast({ title: '任务已布置', icon: 'success' });
    setTaskNote('');
  };

  const handleListenRecording = (recordingId: string) => {
    if (!recordingId) return;
    const level = challengeLevels.find((l) => l.recordingId === recordingId);
    if (!level) {
      Taro.showToast({ title: '录音未关联关卡', icon: 'none' });
      return;
    }
    try {
      Taro.setStorageSync(STORAGE_KEY_TARGET_RECORDING, recordingId);
    } catch (e) {
      console.error('[Review] Save target failed', e);
    }
    Taro.switchTab({ url: '/pages/challenge/index' });
  };

  const pendingTasks = practiceTasks.filter((t) => !t.completed);
  const completedTasks = practiceTasks.filter((t) => t.completed);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📝 带教点评</Text>
        <Text className={styles.headerDesc}>导师反馈与个人薄弱项清单</Text>
      </View>

      <View className={styles.taskSection}>
        <Text className={styles.sectionTitle}>🎯 带教重练任务</Text>
        <View className={styles.taskTabs}>
          <View
            className={`${styles.taskTab} ${taskTab === 'pending' ? styles.taskTabActive : ''}`}
            onClick={() => setTaskTab('pending')}
          >
            <Text className={styles.taskTabText}>待完成 ({pendingTasks.length})</Text>
          </View>
          <View
            className={`${styles.taskTab} ${taskTab === 'done' ? styles.taskTabActive : ''}`}
            onClick={() => setTaskTab('done')}
          >
            <Text className={styles.taskTabText}>已完成 ({completedTasks.length})</Text>
          </View>
        </View>

        <View className={styles.taskList}>
          {(taskTab === 'pending' ? pendingTasks : completedTasks).map((task) => (
            <View key={task.id} className={styles.taskCard}>
              <View className={styles.taskHeader}>
                <Image
                  className={styles.taskAvatar}
                  src={task.mentorAvatar}
                  mode="aspectFill"
                />
                <View className={styles.taskInfo}>
                  <Text className={styles.taskMentor}>{task.mentorName}</Text>
                  <Text className={styles.taskDate}>{task.date}布置</Text>
                </View>
                {task.completed && task.lastScore !== undefined && (
                  <View className={styles.taskScoreBadge}>
                    <Text className={styles.taskScoreText}>{task.lastScore}分</Text>
                  </View>
                )}
              </View>
              <Text className={styles.taskRecording}>🎙 {task.recordingTitle}</Text>
              <Text className={styles.taskNote}>{task.note}</Text>
              <View className={styles.taskActions}>
                {!task.completed ? (
                  <View
                    className={styles.taskGoBtn}
                    onClick={() => handleListenRecording(task.recordingId)}
                  >
                    <Text style={{ color: '#fff', fontSize: '24rpx' }}>开始练习 →</Text>
                  </View>
                ) : (
                  <>
                    <Text className={styles.taskDoneText}>
                      ✓ {task.completedDate} 已完成
                    </Text>
                    <View
                      className={styles.taskRetryBtn}
                      onClick={() => handleListenRecording(task.recordingId)}
                    >
                      <Text style={{ color: '#6366F1', fontSize: '24rpx' }}>再练一次</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))}
          {(taskTab === 'pending' ? pendingTasks : completedTasks).length === 0 && (
            <View className={styles.taskEmpty}>
              <Text className={styles.taskEmptyText}>
                {taskTab === 'pending' ? '暂无待完成任务 🎉' : '暂无已完成任务'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.assignSection}>
        <View className={styles.assignCard}>
          <Text className={styles.assignTitle}>📋 布置重练任务（带教老师）</Text>
          <View className={styles.assignField}>
            <Text className={styles.assignLabel}>选择录音</Text>
            <Picker
              mode="selector"
              range={recordings.map((r) => r.title)}
              value={selectedRecordingIndex}
              onChange={(e) => setSelectedRecordingIndex(Number(e.detail.value))}
            >
              <View className={styles.assignPicker}>
                <Text className={styles.assignPickerText}>
                  {recordings[selectedRecordingIndex]?.title || '请选择录音'}
                </Text>
                <Text className={styles.assignPickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
          <Textarea
            className={styles.assignArea}
            placeholder="输入练习要求和要点，比如：重点关注风险告知话术..."
            value={taskNote}
            onInput={(e) => setTaskNote(e.detail.value)}
            maxlength={300}
          />
          <View className={styles.assignBtn} onClick={handleAssignTask}>
            <Text style={{ color: '#fff', fontSize: '28rpx' }}>布置任务</Text>
          </View>
        </View>
      </View>

      <View className={styles.reviewList}>
        <Text className={styles.sectionTitle}>💬 带教点评记录</Text>
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

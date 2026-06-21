import type { MentorReview, WeaknessItem } from '@/types';

export const mentorReviews: MentorReview[] = [
  {
    id: 'mr-001',
    mentorName: '李老师',
    mentorAvatar: 'https://picsum.photos/id/64/200/200',
    studentId: 'u-005',
    date: '2026-06-20',
    content: '小刘在价格异议处理方面进步明显，但在效果承诺合规表述上还需加强。建议多练习"效果承诺规范"模块的话术，避免使用绝对性承诺词汇。最近一次录音闯关中，对"保证效果"类违规识别还不够敏锐，需要多听优秀成交录音来提升敏感度。',
    weakPoints: ['efficacy_promise', 'risk_concealment'],
    excellentRecordingUnlocked: true,
    recordingId: 'rec-005'
  },
  {
    id: 'mr-002',
    mentorName: '李老师',
    mentorAvatar: 'https://picsum.photos/id/64/200/200',
    studentId: 'u-005',
    date: '2026-06-15',
    content: '术后护理话术有了提升，上次提到的"拆线即可化妆"的错误已经能识别了。但风险告知的完整性判断仍有欠缺，特别是对假体类项目特殊风险的识别。继续保持每日10分钟的训练节奏，效果很好。',
    weakPoints: ['risk_concealment', 'postoperative_care'],
    excellentRecordingUnlocked: false,
    recordingId: ''
  },
  {
    id: 'mr-003',
    mentorName: '王老师',
    mentorAvatar: 'https://picsum.photos/id/91/200/200',
    studentId: 'u-005',
    date: '2026-06-10',
    content: '价格异议处理的准确率达到了85%，比上周提升了10个百分点。不过在风险隐瞒类场景中，对"基本没有风险"这类模糊表述的敏感度不够。建议重点关注风险告知模块，下周我们做一次模拟演练。',
    weakPoints: ['risk_concealment', 'price_objection'],
    excellentRecordingUnlocked: false,
    recordingId: ''
  },
  {
    id: 'mr-004',
    mentorName: '王老师',
    mentorAvatar: 'https://picsum.photos/id/91/200/200',
    studentId: 'u-005',
    date: '2026-06-05',
    content: '第一周训练总结：基础较好，学习态度积极。在顾客核心诉求判断方面表现不错，但在违规话术识别上还需多练习。特别是效果承诺和风险隐瞒两类，准确率低于合格线。建议增加这两类的专项练习。',
    weakPoints: ['efficacy_promise', 'risk_concealment'],
    excellentRecordingUnlocked: false,
    recordingId: ''
  }
];

export const weaknessItems: WeaknessItem[] = [
  {
    category: 'efficacy_promise',
    categoryLabel: '效果承诺',
    wrongCount: 8,
    totalCount: 15,
    accuracy: 47,
    recentMistakes: ['"保证做完之后鼻子会非常自然"', '"做完立刻就能看到V脸效果"']
  },
  {
    category: 'risk_concealment',
    categoryLabel: '风险隐瞒',
    wrongCount: 6,
    totalCount: 12,
    accuracy: 50,
    recentMistakes: ['"这个手术很安全，基本没有风险"', '"吸脂手术很成熟，不会有什么问题"']
  },
  {
    category: 'price_objection',
    categoryLabel: '价格异议',
    wrongCount: 3,
    totalCount: 10,
    accuracy: 70,
    recentMistakes: ['"这个价格我们绝对不会再收任何费用"']
  },
  {
    category: 'postoperative_care',
    categoryLabel: '术后护理',
    wrongCount: 2,
    totalCount: 8,
    accuracy: 75,
    recentMistakes: ['"拆完线就能化妆了"']
  }
];

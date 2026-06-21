import type { DailyTask } from '@/types';

export const dailyTasks: DailyTask[] = [
  {
    id: 'dt-001',
    title: '判断顾客核心诉求',
    type: 'challenge',
    description: '听取双下巴咨询录音，判断顾客的真实诉求',
    duration: 3,
    completed: true,
    score: 80,
    totalScore: 100
  },
  {
    id: 'dt-002',
    title: '识别夸大疗效话术',
    type: 'challenge',
    description: '在隆鼻咨询中找出咨询师夸大效果的表述',
    duration: 5,
    completed: true,
    score: 90,
    totalScore: 100
  },
  {
    id: 'dt-003',
    title: '点选违规话术位置',
    type: 'deduction',
    description: '在热玛吉录音波形上标记价格承诺违规点',
    duration: 4,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-004',
    title: '判断风险告知完整性',
    type: 'deduction',
    description: '检查吸脂项目术前告知是否覆盖全部风险点',
    duration: 3,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-005',
    title: '术后护理话术练习',
    type: 'scripts',
    description: '学习并掌握双眼皮术后标准护理话术',
    duration: 2,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-006',
    title: '效果承诺红线测试',
    type: 'challenge',
    description: '判断咨询师是否越过了效果承诺的合规红线',
    duration: 4,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-007',
    title: '价格异议处理话术',
    type: 'scripts',
    description: '掌握应对价格异议的标准应答流程',
    duration: 3,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-008',
    title: '综合录音质检闯关',
    type: 'challenge',
    description: '完成一段完整咨询录音的全流程质检判断',
    duration: 8,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-009',
    title: '风险隐瞒场景识别',
    type: 'deduction',
    description: '在隆胸咨询中识别咨询师是否隐瞒术后风险',
    duration: 5,
    completed: false,
    score: 0,
    totalScore: 100
  },
  {
    id: 'dt-010',
    title: '术后回访标准话术',
    type: 'scripts',
    description: '学习术后3天/7天/30天回访话术要点',
    duration: 2,
    completed: false,
    score: 0,
    totalScore: 100
  }
];

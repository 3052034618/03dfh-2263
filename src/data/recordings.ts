import type { Recording, ChallengeLevel } from '@/types';

const generateWaveform = (length: number): number[] => {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    data.push(Math.round(Math.random() * 80 + 20));
  }
  return data;
};

export const recordings: Recording[] = [
  {
    id: 'rec-001',
    title: '双下巴咨询 - 顾客诉求分析',
    consultantName: '张咨询师',
    customerName: '顾客A',
    duration: 180,
    level: 1,
    category: '面部轮廓',
    thumbnail: 'https://picsum.photos/id/64/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-001',
        position: 15,
        category: 'efficacy_promise',
        text: '"做完立刻就能看到V脸效果"',
        deductionPoints: 10,
        standardAnswer: '应告知术后会有肿胀期，最终效果需1-3个月逐渐呈现'
      },
      {
        id: 'v-002',
        position: 35,
        category: 'price_objection',
        text: '"这个价格我们绝对不会再收任何费用"',
        deductionPoints: 8,
        standardAnswer: '应说明可能产生的复诊、术后维护等后续费用'
      }
    ],
    coreDemand: '改善下颌线条',
    demandOptions: ['改善下颌线条', '瘦脸整体', '消除双下巴脂肪', '提升皮肤紧致度'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: true
  },
  {
    id: 'rec-002',
    title: '隆鼻咨询 - 效果承诺识别',
    consultantName: '李咨询师',
    customerName: '顾客B',
    duration: 240,
    level: 2,
    category: '鼻部整形',
    thumbnail: 'https://picsum.photos/id/91/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-003',
        position: 22,
        category: 'efficacy_promise',
        text: '"保证做完之后鼻子会非常自然"',
        deductionPoints: 12,
        standardAnswer: '应说明个体差异，无法保证绝对自然，需配合术后护理'
      },
      {
        id: 'v-004',
        position: 40,
        category: 'risk_concealment',
        text: '"这个手术很安全，基本没有风险"',
        deductionPoints: 15,
        standardAnswer: '必须告知感染、假体移位、排异等可能风险'
      }
    ],
    coreDemand: '改善鼻梁高度',
    demandOptions: ['改善鼻梁高度', '缩小鼻翼', '改善鼻尖形态', '修复之前手术'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: true
  },
  {
    id: 'rec-003',
    title: '热玛吉咨询 - 价格承诺违规',
    consultantName: '王咨询师',
    customerName: '顾客C',
    duration: 200,
    level: 2,
    category: '皮肤管理',
    thumbnail: 'https://picsum.photos/id/338/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-005',
        position: 18,
        category: 'price_objection',
        text: '"今天做的话可以给你内部价，比外面便宜一半"',
        deductionPoints: 10,
        standardAnswer: '应明码标价，不得以虚假折扣诱导消费'
      },
      {
        id: 'v-006',
        position: 45,
        category: 'efficacy_promise',
        text: '"做一次就能维持3-5年"',
        deductionPoints: 10,
        standardAnswer: '应说明效果因人而异，一般维持1-2年需加强'
      }
    ],
    coreDemand: '紧致面部皮肤',
    demandOptions: ['紧致面部皮肤', '消除皱纹', '改善肤质', '缩小毛孔'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: true,
    unlocked: true
  },
  {
    id: 'rec-004',
    title: '吸脂咨询 - 风险告知检查',
    consultantName: '赵咨询师',
    customerName: '顾客D',
    duration: 300,
    level: 3,
    category: '身体塑形',
    thumbnail: 'https://picsum.photos/id/1027/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-007',
        position: 12,
        category: 'risk_concealment',
        text: '"吸脂手术很成熟，不会有什么问题"',
        deductionPoints: 15,
        standardAnswer: '须告知脂肪栓塞、皮肤凹凸不平等严重风险'
      },
      {
        id: 'v-008',
        position: 30,
        category: 'postoperative_care',
        text: '"术后随便吃就行，不用特别忌口"',
        deductionPoints: 8,
        standardAnswer: '应详细告知术后饮食忌口、塑身衣佩戴等注意事项'
      },
      {
        id: 'v-009',
        position: 50,
        category: 'efficacy_promise',
        text: '"吸完就能瘦20斤"',
        deductionPoints: 12,
        standardAnswer: '吸脂主要塑形而非减重，应合理预期管理'
      }
    ],
    coreDemand: '腰腹塑形',
    demandOptions: ['腰腹塑形', '全身减重', '大腿减脂', '手臂塑形'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: true
  },
  {
    id: 'rec-005',
    title: '双眼皮咨询 - 术后护理话术',
    consultantName: '孙咨询师',
    customerName: '顾客E',
    duration: 160,
    level: 1,
    category: '眼部整形',
    thumbnail: 'https://picsum.photos/id/177/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-010',
        position: 25,
        category: 'postoperative_care',
        text: '"拆完线就能化妆了"',
        deductionPoints: 8,
        standardAnswer: '拆线后至少1-2周才可淡妆，需避免眼部拉扯'
      }
    ],
    coreDemand: '改善单眼皮',
    demandOptions: ['改善单眼皮', '放大眼睛', '改善眼部松弛', '修复双眼皮'],
    correctDemandIndex: 0,
    hasExaggeration: false,
    riskDisclosureComplete: true,
    unlocked: true
  },
  {
    id: 'rec-006',
    title: '隆胸咨询 - 综合质检',
    consultantName: '周咨询师',
    customerName: '顾客F',
    duration: 360,
    level: 3,
    category: '胸部整形',
    thumbnail: 'https://picsum.photos/id/1/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-011',
        position: 10,
        category: 'efficacy_promise',
        text: '"做完手感完全自然，和真的一模一样"',
        deductionPoints: 12,
        standardAnswer: '应说明假体与自体组织手感存在差异，需恢复期'
      },
      {
        id: 'v-012',
        position: 28,
        category: 'risk_concealment',
        text: '"包膜挛缩的发生率非常低，不用担心"',
        deductionPoints: 15,
        standardAnswer: '须详细告知包膜挛缩等风险及发生概率'
      },
      {
        id: 'v-013',
        position: 42,
        category: 'price_objection',
        text: '"你现在交定金我帮你锁住这个优惠价"',
        deductionPoints: 8,
        standardAnswer: '不得以限时优惠施压促成交易'
      },
      {
        id: 'v-014',
        position: 55,
        category: 'postoperative_care',
        text: '"术后一周就能正常上班"',
        deductionPoints: 8,
        standardAnswer: '需告知至少2-4周恢复期，避免上肢剧烈活动'
      }
    ],
    coreDemand: '增大胸部体积',
    demandOptions: ['增大胸部体积', '改善胸部形态', '改善乳房下垂', '修复之前手术'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: false
  },
  {
    id: 'rec-007',
    title: '玻尿酸咨询 - 效果承诺红线',
    consultantName: '吴咨询师',
    customerName: '顾客G',
    duration: 150,
    level: 2,
    category: '注射美容',
    thumbnail: 'https://picsum.photos/id/8/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-015',
        position: 20,
        category: 'efficacy_promise',
        text: '"打完玻尿酸法令纹立刻消失"',
        deductionPoints: 10,
        standardAnswer: '应说明效果渐进呈现，且维持时间约6-12个月'
      }
    ],
    coreDemand: '消除法令纹',
    demandOptions: ['消除法令纹', '填充面部凹陷', '丰唇', '垫下巴'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: true,
    unlocked: true
  },
  {
    id: 'rec-008',
    title: '植发咨询 - 风险告知完整性',
    consultantName: '郑咨询师',
    customerName: '顾客H',
    duration: 280,
    level: 3,
    category: '毛发移植',
    thumbnail: 'https://picsum.photos/id/9/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-016',
        position: 18,
        category: 'risk_concealment',
        text: '"植发是最安全的手术之一"',
        deductionPoints: 12,
        standardAnswer: '须告知感染、出血、毛囊存活率等风险'
      },
      {
        id: 'v-017',
        position: 38,
        category: 'efficacy_promise',
        text: '"移植的头发永远不会掉"',
        deductionPoints: 15,
        standardAnswer: '应说明移植后仍有脱落可能，需配合维护'
      }
    ],
    coreDemand: '改善发际线后移',
    demandOptions: ['改善发际线后移', '头顶加密', '眉毛种植', '胡须种植'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: false
  },
  {
    id: 'rec-009',
    title: '激光美肤 - 术后护理',
    consultantName: '冯咨询师',
    customerName: '顾客I',
    duration: 130,
    level: 1,
    category: '皮肤管理',
    thumbnail: 'https://picsum.photos/id/6/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-018',
        position: 30,
        category: 'postoperative_care',
        text: '"做完激光不用防晒也没事"',
        deductionPoints: 10,
        standardAnswer: '激光术后必须严格防晒至少1个月，否则易色沉'
      }
    ],
    coreDemand: '改善色斑',
    demandOptions: ['改善色斑', '收缩毛孔', '提亮肤色', '改善痘印'],
    correctDemandIndex: 0,
    hasExaggeration: false,
    riskDisclosureComplete: true,
    unlocked: true
  },
  {
    id: 'rec-010',
    title: '正颌咨询 - 综合闯关',
    consultantName: '陈咨询师',
    customerName: '顾客J',
    duration: 400,
    level: 3,
    category: '颌面外科',
    thumbnail: 'https://picsum.photos/id/119/200/200',
    waveformData: generateWaveform(60),
    violations: [
      {
        id: 'v-019',
        position: 8,
        category: 'efficacy_promise',
        text: '"正颌后脸型会变成鹅蛋脸"',
        deductionPoints: 12,
        standardAnswer: '应说明正颌改善咬合功能为主，面型变化因人而异'
      },
      {
        id: 'v-020',
        position: 25,
        category: 'risk_concealment',
        text: '"现在技术很成熟，基本没有并发症"',
        deductionPoints: 15,
        standardAnswer: '须告知神经损伤、出血、感染等严重并发症风险'
      },
      {
        id: 'v-021',
        position: 48,
        category: 'price_objection',
        text: '"可以先做一半，另一半下次再补"',
        deductionPoints: 8,
        standardAnswer: '正颌为整体手术，不得拆分诱导二次消费'
      }
    ],
    coreDemand: '改善咬合问题',
    demandOptions: ['改善咬合问题', '改善面部不对称', '改善下颌前突', '改善面部轮廓'],
    correctDemandIndex: 0,
    hasExaggeration: true,
    riskDisclosureComplete: false,
    unlocked: false
  }
];

export const challengeLevels: ChallengeLevel[] = [
  {
    id: 'cl-001',
    level: 1,
    title: '初识质检',
    recordingId: 'rec-001',
    passed: true,
    score: 80,
    totalScore: 100,
    stars: 2,
    maxStars: 3,
    locked: false
  },
  {
    id: 'cl-002',
    level: 2,
    title: '话术辨伪',
    recordingId: 'rec-002',
    passed: true,
    score: 90,
    totalScore: 100,
    stars: 3,
    maxStars: 3,
    locked: false
  },
  {
    id: 'cl-003',
    level: 3,
    title: '价格陷阱',
    recordingId: 'rec-003',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: false
  },
  {
    id: 'cl-004',
    level: 4,
    title: '风险排查',
    recordingId: 'rec-004',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: false
  },
  {
    id: 'cl-005',
    level: 5,
    title: '护理规范',
    recordingId: 'rec-005',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: false
  },
  {
    id: 'cl-006',
    level: 6,
    title: '综合质检',
    recordingId: 'rec-006',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: true
  },
  {
    id: 'cl-007',
    level: 7,
    title: '红线识别',
    recordingId: 'rec-007',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: true
  },
  {
    id: 'cl-008',
    level: 8,
    title: '进阶闯关',
    recordingId: 'rec-008',
    passed: false,
    score: 0,
    totalScore: 100,
    stars: 0,
    maxStars: 3,
    locked: true
  }
];

import type { DeductionItem } from '@/types';

export const deductionItems: DeductionItem[] = [
  {
    id: 'di-001',
    recordingId: 'rec-001',
    violationId: 'v-001',
    category: 'efficacy_promise',
    categoryLabel: '效果承诺',
    violationText: '"做完立刻就能看到V脸效果"',
    standardAnswer: '应告知术后会有肿胀期，最终效果需1-3个月逐渐呈现',
    deductionPoints: 10,
    answered: true,
    correct: true
  },
  {
    id: 'di-002',
    recordingId: 'rec-001',
    violationId: 'v-002',
    category: 'price_objection',
    categoryLabel: '价格异议',
    violationText: '"这个价格我们绝对不会再收任何费用"',
    standardAnswer: '应说明可能产生的复诊、术后维护等后续费用',
    deductionPoints: 8,
    answered: true,
    correct: false
  },
  {
    id: 'di-003',
    recordingId: 'rec-002',
    violationId: 'v-003',
    category: 'efficacy_promise',
    categoryLabel: '效果承诺',
    violationText: '"保证做完之后鼻子会非常自然"',
    standardAnswer: '应说明个体差异，无法保证绝对自然，需配合术后护理',
    deductionPoints: 12,
    answered: true,
    correct: true
  },
  {
    id: 'di-004',
    recordingId: 'rec-002',
    violationId: 'v-004',
    category: 'risk_concealment',
    categoryLabel: '风险隐瞒',
    violationText: '"这个手术很安全，基本没有风险"',
    standardAnswer: '必须告知感染、假体移位、排异等可能风险',
    deductionPoints: 15,
    answered: false,
    correct: false
  },
  {
    id: 'di-005',
    recordingId: 'rec-003',
    violationId: 'v-005',
    category: 'price_objection',
    categoryLabel: '价格异议',
    violationText: '"今天做的话可以给你内部价，比外面便宜一半"',
    standardAnswer: '应明码标价，不得以虚假折扣诱导消费',
    deductionPoints: 10,
    answered: false,
    correct: false
  },
  {
    id: 'di-006',
    recordingId: 'rec-003',
    violationId: 'v-006',
    category: 'efficacy_promise',
    categoryLabel: '效果承诺',
    violationText: '"做一次就能维持3-5年"',
    standardAnswer: '应说明效果因人而异，一般维持1-2年需加强',
    deductionPoints: 10,
    answered: false,
    correct: false
  },
  {
    id: 'di-007',
    recordingId: 'rec-004',
    violationId: 'v-007',
    category: 'risk_concealment',
    categoryLabel: '风险隐瞒',
    violationText: '"吸脂手术很成熟，不会有什么问题"',
    standardAnswer: '须告知脂肪栓塞、皮肤凹凸不平等严重风险',
    deductionPoints: 15,
    answered: false,
    correct: false
  },
  {
    id: 'di-008',
    recordingId: 'rec-004',
    violationId: 'v-008',
    category: 'postoperative_care',
    categoryLabel: '术后护理',
    violationText: '"术后随便吃就行，不用特别忌口"',
    standardAnswer: '应详细告知术后饮食忌口、塑身衣佩戴等注意事项',
    deductionPoints: 8,
    answered: false,
    correct: false
  },
  {
    id: 'di-009',
    recordingId: 'rec-004',
    violationId: 'v-009',
    category: 'efficacy_promise',
    categoryLabel: '效果承诺',
    violationText: '"吸完就能瘦20斤"',
    standardAnswer: '吸脂主要塑形而非减重，应合理预期管理',
    deductionPoints: 12,
    answered: false,
    correct: false
  },
  {
    id: 'di-010',
    recordingId: 'rec-005',
    violationId: 'v-010',
    category: 'postoperative_care',
    categoryLabel: '术后护理',
    violationText: '"拆完线就能化妆了"',
    standardAnswer: '拆线后至少1-2周才可淡妆，需避免眼部拉扯',
    deductionPoints: 8,
    answered: false,
    correct: false
  }
];

export const sites = ['旺财体育', 'DW体育', '财神体育', '星河体育']
export const periods = ['2026-07', '2026-06', '2026-05']

const agents = ['dw666s01l', 'dw666s02l', 'dw666s03l', 'dw666s04l', 'billwork001']
const teams = ['DW666-S01-未达等级', 'DW666-S02-达标待回收', 'DW666-S03-历史结转', 'DW666-S04-达标盈利未发', 'bill单线']
const statuses = ['欠款待回收', '欠款待回收', '历史数据结转', '待发放', '欠款已回收']

export function money(value) {
  const amount = Number(value || 0)
  return `${amount < 0 ? '- ' : ''}¥ ${Math.abs(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function nowText() {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function buildSettlementRows(count = 25) {
  return Array.from({ length: count }, (_, index) => {
    const kind = index % 5
    const totalWin = [-80, -600, 80, 700, 0][kind] + Math.floor(index / 5) * 20
    const historyWin = [20, 0, 20, 0, 0][kind]
    const operationFee = [10, 30, 10, 30, 0][kind]
    const historyOperationFee = [20, 0, 20, 0, 0][kind]
    const venueFee = index < 5 ? 0 : 5
    const withdrawFee = index < 5 ? 0 : 3
    const rebateRate = [10, 20, 0, 40, 30][kind]
    const commissionNet = Number(((totalWin + historyWin - operationFee - historyOperationFee - venueFee - withdrawFee) * rebateRate / 100).toFixed(2))
    const debt = commissionNet < 0 ? Math.abs(commissionNet) : 0
    const commission = kind === 3 ? Math.max(0, commissionNet) : 0
    return {
      id: index + 1,
      site: sites[index % sites.length],
      agentName: agents[kind],
      period: `PS-${index % 4 === 0 ? '2222' : '8888'}-${periods[Math.floor(index / 10) % periods.length]}-${String(index + 1).padStart(3, '0')}`,
      teamName: teams[kind],
      agentId: 1829 + index * 3,
      identity: kind === 4 ? '官方代理' : '普通代理',
      parentAgent: index % 3 ? '—' : 'charles',
      totalWin,
      historyWin,
      operationFee,
      historyOperationFee,
      venueFee,
      withdrawFee,
      rebateLevel: rebateRate ? `${kind === 4 ? '单线' : '团队'}返佣${Math.max(1, kind)}级` : '—',
      rebateRate,
      historyBalance: 0,
      commissionNet,
      siteDebt: debt,
      adjustment: 0,
      commission,
      status: statuses[kind],
      agentTime: `2026-07-${String((index % 27) + 1).padStart(2, '0')} 00:00:00`,
      teamTime: `2026-07-${String((index % 27) + 1).padStart(2, '0')} 00:00:00`,
      issuer: '',
      issueTime: '',
      reason: kind === 4 ? '展示：单线负责人仅本团队参与结算' : 'DW666 durable current period snapshot'
    }
  })
}

export function buildReportRows() {
  return buildSettlementRows(8).map((row, index) => ({
    ...row,
    periodRange: index < 4 ? '2026-07-01 至 2026-07-31' : '2026-06-01 至 2026-06-30',
    settled: true,
    agentType: '团队代理',
    recommender: '—',
    level: '【多线】',
    teamCount: 3,
    memberCount: 6,
    registerCount: [1, 2, 0, 3, 5, 4, 6, 3][index],
    firstDepositCount: [2, 3, 1, 3, 0, 0, 1, 1][index],
    activeCount: [1, 5, 1, 6, 1, 1, 1, 1][index],
    newActiveCount: [0, 2, 0, 3, 0, 1, 0, 1][index],
    depositAmount: [200, 320, 100, 320, 100, 100, 100, 100][index],
    withdrawAmount: index < 4 ? 0 : 50
  }))
}

export function buildRelationRows(count = 60) {
  const operators = ['member-promotion-bind', 'admin', 'xiuxiu', 'charles']
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    account: ['testhd303', 'testhd302', 'charles02', 'dengji111'][index % 4],
    accountId: 1826 - index,
    site: sites[index % sites.length],
    siteId: [2222, 8888, 333333, 6666][index % 4],
    accountType: index % 5 === 0 ? '代理' : '会员',
    oldParentId: index % 3 === 0 ? 1774 : '—',
    oldParent: index % 3 === 0 ? 'charles' : '—',
    newParentId: index % 4 === 0 ? 1825 : 1749 + (index % 4),
    newParent: index % 4 === 0 ? 'ccc234' : `dailiwc00${index % 4}`,
    effectiveDate: `2026-07-${String(28 - (index % 22)).padStart(2, '0')}`,
    changeStatus: index % 5 === 3 ? '已取消' : '已生效',
    migrateFee: index % 3 === 2 ? '是' : '否',
    migrateStatus: index % 3 === 2 ? '已完成' : '无需迁移',
    retryCount: index % 3 === 2 ? 0 : '—',
    completeTime: index % 3 === 2 ? `2026-07-${String(28 - (index % 22)).padStart(2, '0')} 14:17:22` : '—',
    error: '—',
    operator: operators[index % operators.length],
    operationTime: `2026-07-${String(28 - (index % 22)).padStart(2, '0')} ${String(20 - (index % 10)).padStart(2, '0')}:55:19`,
    remark: index % 3 ? '会员推广绑定上级代理' : '—'
  }))
}

export const formulaRows = [
  ['运营费用', '活动奖励 + 会员推会员 + 返水 + VIP福利 + 彩金 + 余额宝利息'],
  ['总运营费用', '运营费用 + 三方场馆费用 + 充提手续费'],
  ['净输赢', '（总输赢 + 历史总输赢）－（总运营费用 + 历史运营费用）'],
  ['欠款前净佣金', '净输赢 × 返佣比例 + 历史结余佣金'],
  ['佣金净收益', '欠款前净佣金－历史欠款；正向收益优先自动回款，剩余金额才可发放'],
  ['欠站点总额', '历史欠款－本期回款 + 本期新增垫付'],
  ['佣金', '扣除历史欠款并完成自动回款后的最终可发放佣金']
]

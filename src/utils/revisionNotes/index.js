import masterNotes from './master'
import siteNotes from './site'
import agentNotes from './agent'
import { getBackendMeta, normalizeBackendMode } from '@/utils/prototypeBackend'

const UPDATED_AT = '2026-06-26 22:36'

const noteGroups = {
  master: masterNotes,
  site: siteNotes,
  agent: agentNotes
}

const fallbackByMode = {
  master: {
    moduleTitle: '总控业务模块',
    position: '用于总控后台查看和处理当前业务事项，帮助产品与运营确认页面流程、筛选条件和处理动作是否完整。',
    relations: ['总控后台相关模块', '站点后台', '代理后台']
  },
  site: {
    moduleTitle: '站点业务模块',
    position: '用于站点后台查看和处理当前站点内的业务事项，帮助站点运营确认日常管理流程。',
    relations: ['站点后台相关模块', '总控后台', '代理后台']
  },
  agent: {
    moduleTitle: '代理业务模块',
    position: '用于代理后台查看和处理代理自身业务事项，帮助代理和运营确认经营、资金和佣金流程。',
    relations: ['代理后台相关模块', '站点后台']
  }
}

const defaultChangeSummary = {
  time: UPDATED_AT,
  title: '业务及需求说明宽屏展示',
  content: '已将右上角业务及需求说明调整为覆盖主内容区的宽屏抽屉，并保留页面功能、字段说明、业务逻辑、关联模块和最新业务说明，便于产品与运营完整阅读。'
}

const pathChangeSummaries = [
  {
    mode: 'master',
    exact: ['/agent/earningBoard'],
    changeSummary: {
      time: '2026-06-26 22:36',
      title: '代理收益看板字段口径调整',
      content: '代理收益看板已将原代理名称字段调整为代理账号，并在总盈亏右侧新增该代理欠款和未收回欠款，便于总控同时查看代理收益和欠款风险。'
    }
  },
  {
    mode: 'master',
    prefixes: ['/site'],
    changeSummary: {
      time: '2026-06-23 04:20',
      title: '补充站点链路演示',
      content: '站点列表已补充演示站点资料，保证从总控进入站点后台的演示链路可见、可点、可评审。'
    }
  }
]

const fieldPresets = {
  dashboard: {
    fieldGroups: [
      group('筛选条件', [
        field('站点范围', '用于切换全部站点或指定站点，便于比较不同站点经营表现。'),
        field('统计时间', '用于查看今日、昨日、近几日或近一月的经营变化。')
      ]),
      group('核心指标', [
        field('收益与投注', '展示投注、收益、充值、提现等经营结果。'),
        field('用户与代理', '展示注册、活跃、付费、代理规模和代理余额。'),
        field('趋势与排行', '用于观察变化方向和重点站点表现。')
      ])
    ],
    businessRules: [
      '看板用于快速判断经营状态，发现异常后再进入报表、会员、代理或财务模块核对。',
      '快捷时间切换会影响页面汇总、趋势和排行展示范围。',
      '排行用于演示重点对象识别，不作为真实经营结论。'
    ]
  },
  site: {
    fieldGroups: [
      group('筛选条件', [
        field('站点名称与编号', '用于定位需要查看或维护的站点。'),
        field('站点状态', '用于区分正常、维护、待审批等运营状态。')
      ]),
      group('列表字段', [
        field('站点资料', '展示站点名称、类型、所属业务和管理账号。'),
        field('申请与审批信息', '展示开站申请、审批结果和处理说明。'),
        field('操作入口', '用于进入配置、发布、资源、场馆或站点后台演示。')
      ])
    ],
    businessRules: [
      '站点从申请、审批、配置到发布形成完整开站演示链路。',
      '总控可从站点列表进入站点后台，演示站点与站点后台之间的上下游关系。',
      '站点状态用于辅助运营判断是否可继续配置、发布或维护。'
    ]
  },
  venue: {
    fieldGroups: [
      group('筛选条件', [
        field('场馆名称', '用于定位指定体育、真人、电子或棋牌场馆。'),
        field('场馆状态', '用于查看正常、维护或停用状态。')
      ]),
      group('列表字段', [
        field('场馆资料', '展示场馆名称、类型、排序和展示资源。'),
        field('运营状态', '展示钱包、授权和维护相关状态。'),
        field('费用信息', '用于辅助查看场馆结算或费率演示口径。')
      ])
    ],
    businessRules: [
      '场馆状态会影响站点是否可展示和使用对应游戏内容。',
      '排序和展示资源用于演示前台场馆呈现方式。',
      '场馆资料会与游戏管理、站点场馆和报表模块互相关联。'
    ]
  },
  resources: {
    fieldGroups: [
      group('筛选条件', [
        field('资源名称', '用于查找游戏、皮肤、模板、版本或推广资源。'),
        field('资源类型与状态', '用于区分资源用途和可用状态。')
      ]),
      group('配置字段', [
        field('资源内容', '展示名称、编码、图片、模板或版本信息。'),
        field('使用范围', '说明资源可服务的站点、平台或业务场景。'),
        field('操作结果', '用于演示新增、编辑、上传、预览和导出。')
      ])
    ],
    businessRules: [
      '公共资源用于支撑多站点统一配置和前台展示评审。',
      '资源变更会影响站点配置、活动展示、消息触达或游戏下载推广。',
      '上传和预览均为演示行为，仅用于确认页面流程。'
    ]
  },
  game: {
    fieldGroups: [
      group('筛选条件', [
        field('游戏与场馆', '用于定位指定游戏、场馆或游戏类型。'),
        field('时间与状态', '用于查看不同时间范围和上下架状态。')
      ]),
      group('列表字段', [
        field('游戏资料', '展示游戏名称、类型、场馆和展示状态。'),
        field('投注记录', '展示会员、投注、输赢、局号和处理状态。'),
        field('配置内容', '用于确认游戏规则、展示和批量计划。')
      ])
    ],
    businessRules: [
      '游戏状态用于演示上架、下架、维护和站点授权的运营流程。',
      '投注记录用于和会员、报表、风控模块交叉核对。',
      '批量计划和配置页面用于产品评审，不代表真实游戏结果。'
    ]
  },
  member: {
    fieldGroups: [
      group('筛选条件', [
        field('会员账号', '用于定位具体会员。'),
        field('代理与站点', '用于查看会员归属关系。'),
        field('状态与时间', '用于筛选注册、活跃、冻结或风险相关对象。')
      ]),
      group('列表与详情字段', [
        field('基础资料', '展示账号、昵称、等级、状态和注册信息。'),
        field('资金信息', '展示余额、充值、提现、账变和福利记录。'),
        field('行为信息', '展示投注、登录、推广和团队关系。')
      ])
    ],
    businessRules: [
      '会员资料用于运营跟进、财务核对和风控判断。',
      '团队、推广和代理归属会影响会员统计和代理收益演示。',
      '详情页用于集中查看会员完整信息，辅助审核、追踪和配置。'
    ]
  },
  agent: {
    fieldGroups: [
      group('筛选条件', [
        field('代理账号', '用于定位指定代理。'),
        field('所属站点与上级代理', '用于查看代理归属和层级关系。'),
        field('周期与状态', '用于筛选结算、预支、发放或冲正进度。')
      ]),
      group('列表与配置字段', [
        field('代理资料', '展示账号、名称、层级、状态和上级关系。'),
        field('佣金信息', '展示佣金方案、账单、发放、预支和剩余次数。'),
        field('处理入口', '用于进入详情、结算配置、预支记录或代理后台。')
      ])
    ],
    businessRules: [
      '代理管理围绕层级、会员贡献、佣金管理和资金流转组织演示。',
      '总控可配置结算周期和预支规则，站点可查看本站代理记录，代理可查看自身结算结果。',
      '预支、发放和冲正用于演示结算前后关系，避免重复理解佣金去向。'
    ]
  },
  advance: {
    fieldGroups: [
      group('筛选条件', [
        field('所属站点', '总控可筛选站点，站点后台固定本站，代理后台固定自身归属。'),
        field('代理账号', '用于定位申请预支的代理。'),
        field('所属周期与领取时间', '用于核对预支发生在哪个结算周期。'),
        field('领取状态', '用于区分领取成功、不可领取或已撤销记录。')
      ]),
      group('记录字段', [
        field('本周期佣金', '用于了解预支计算的佣金基础。'),
        field('可预支金额', '展示当前规则下可提前领取的额度。'),
        field('本次预支与累计预支', '用于追踪本次领取和本周期已领取总额。'),
        field('剩余次数与说明', '用于判断后续是否还能继续领取。')
      ])
    ],
    businessRules: [
      '预支记录用于追踪代理提前领取佣金的完整结果。',
      '总控查看全部站点记录，站点查看本站记录，代理只查看自身记录。',
      '可领取额度受预支比例、盈利门槛、剩余佣金和剩余次数共同影响。'
    ]
  },
  earning: {
    fieldGroups: [
      group('筛选条件', [
        field('所属站点', '用于比较不同站点代理经营表现。'),
        field('代理账号', '用于定位具体代理收益。'),
        field('统计时间', '用于查看指定时间范围内的经营结果。')
      ]),
      group('收益指标', [
        field('佣金与余额', '展示预估净收益、当前余额、推广佣金和已结算佣金。'),
        field('充值提现、投注与欠款', '展示充值、提现、投注、有效投注、盈亏、该代理欠款和未收回欠款。'),
        field('代理与会员规模', '展示代理人数、会员人数、活跃和新增情况。')
      ])
    ],
    businessRules: [
      '收益看板用于总控按代理维度比较经营质量和推广效果。',
      '站点和上级代理用于说明代理归属，便于运营定位责任范围。',
      '该代理欠款用于查看代理当前欠款总额，未收回欠款用于查看尚未追回部分。',
      '收益数据用于演示评审，不作为真实结算结果。'
    ]
  },
  funds: {
    fieldGroups: [
      group('筛选条件', [
        field('账号或订单', '用于定位具体资金对象或资金单据。'),
        field('资金类型与状态', '用于筛选充值、提现、账变、额度或通道状态。'),
        field('时间范围', '用于查看指定周期内的资金流转。')
      ]),
      group('列表字段', [
        field('资金对象', '展示会员、代理、站点或账户归属。'),
        field('金额信息', '展示申请金额、到账金额、手续费、余额或调整金额。'),
        field('处理信息', '展示状态、处理人、处理时间和备注。')
      ])
    ],
    businessRules: [
      '财务页面用于演示充值、提现、账变、额度和通道的资金流转。',
      '状态变化用于说明待处理、成功、失败、驳回或已完成的业务进度。',
      '财务记录会与会员、代理、报表和风控模块互相核对。'
    ]
  },
  report: {
    fieldGroups: [
      group('筛选条件', [
        field('统计时间', '用于限定报表周期。'),
        field('站点、会员或代理', '用于按业务对象查看汇总或明细。'),
        field('场馆或类型', '用于查看不同业务分类的表现。')
      ]),
      group('报表字段', [
        field('汇总指标', '展示收入、支出、投注、盈亏、佣金或福利结果。'),
        field('明细信息', '用于向下追踪具体对象、时间和金额变化。'),
        field('导出内容', '用于演示将当前筛选结果用于运营复盘。')
      ])
    ],
    businessRules: [
      '报表用于复盘经营结果，并辅助定位需要继续查看的业务页面。',
      '汇总和明细应保持同一筛选口径，便于产品和运营核对。',
      '导出仅演示流程，不代表真实报表文件。'
    ]
  },
  activity: {
    fieldGroups: [
      group('筛选条件', [
        field('活动名称与类型', '用于定位指定活动配置。'),
        field('活动时间与状态', '用于查看活动投放周期和当前状态。')
      ]),
      group('配置字段', [
        field('活动规则', '展示活动对象、领取条件、流水倍数和奖励方式。'),
        field('展示素材', '用于确认前台活动图片和详情内容。'),
        field('奖励明细', '用于查看会员参与和发放结果。')
      ])
    ],
    businessRules: [
      '活动配置用于演示活动从创建、展示到奖励查看的完整流程。',
      '活动对象会影响会员、代理或指定站点的可参与范围。',
      '奖励明细用于和财务记录、会员福利进行核对。'
    ]
  },
  risk: {
    fieldGroups: [
      group('筛选条件', [
        field('风险对象', '用于定位会员、代理、账号或设备相关风险。'),
        field('风险类型与状态', '用于区分规则命中、人工处理或名单管理。'),
        field('发生时间', '用于追踪风险发生和处理时间。')
      ]),
      group('处理字段', [
        field('风险说明', '展示风险原因、标签和处理建议。'),
        field('名单信息', '用于维护黑名单、白名单或风险标签。'),
        field('处理结果', '用于记录审核、解除或继续跟进。')
      ])
    ],
    businessRules: [
      '风控页面用于演示异常识别、名单维护和处理追踪。',
      '风险信息会辅助提现审核、会员管理和游戏记录排查。',
      '名单和规则变更只用于产品评审，不影响真实用户。'
    ]
  },
  system: {
    fieldGroups: [
      group('筛选条件', [
        field('名称或账号', '用于定位后台账号、角色、菜单、参数或日志。'),
        field('状态与时间', '用于筛选启停状态或操作记录。')
      ]),
      group('管理字段', [
        field('基础资料', '展示账号、角色、部门、菜单、字典或参数内容。'),
        field('权限范围', '用于说明可查看和可处理的后台模块。'),
        field('日志信息', '用于追踪登录、操作和运行状态。')
      ])
    ],
    businessRules: [
      '系统管理用于支撑后台账号、权限、配置和运营审计演示。',
      '权限和菜单会影响后台可见模块和操作范围。',
      '监控和日志用于说明运营排查入口。'
    ]
  },
  generic: {
    fieldGroups: [
      group('筛选条件', [
        field('关键字', '用于快速定位当前页面中的业务对象。'),
        field('状态与时间', '用于查看不同处理阶段和发生周期。')
      ]),
      group('页面内容', [
        field('列表信息', '展示当前模块的主要业务记录。'),
        field('详情信息', '用于查看单条记录的完整内容。'),
        field('操作信息', '用于演示新增、修改、查看、删除、导出或处理动作。')
      ])
    ],
    businessRules: [
      '页面用于演示当前模块的查询、查看和处理流程。',
      '列表用于筛选和对比，详情或弹窗用于确认单条记录完整信息。',
      '处理结果仅用于原型评审，便于产品和运营讨论页面是否完整。'
    ]
  }
}

function group(title, items) {
  return { title, items }
}

function field(label, desc) {
  return { label, desc }
}

function inferMode(path, backendMode) {
  if (path.startsWith('/site-admin')) {
    return 'site'
  }
  if (path.startsWith('/agent-admin')) {
    return 'agent'
  }
  return normalizeBackendMode(backendMode)
}

function isMatch(item, path) {
  return (item.exact || []).includes(path) || (item.prefixes || []).some(prefix => path.startsWith(prefix))
}

function findNote(mode, path) {
  const notes = noteGroups[mode] || []
  return notes.find(item => isMatch(item, path)) || fallbackByMode[mode] || fallbackByMode.master
}

function pickPresetKey(path, moduleTitle = '', pageTitle = '') {
  const text = `${path} ${moduleTitle} ${pageTitle}`
  if (text.includes('advanceRecords') || text.includes('预支记录')) return 'advance'
  if (text.includes('earningBoard') || text.includes('收益看板')) return 'earning'
  if (text.includes('看板') || text.includes('首页')) return 'dashboard'
  if (text.includes('站点') && !path.includes('/siteprofit')) return 'site'
  if (text.includes('场馆')) return 'venue'
  if (text.includes('资源') || text.includes('皮肤') || text.includes('模板') || text.includes('版本')) return 'resources'
  if (text.includes('游戏') || text.includes('下注')) return 'game'
  if (text.includes('会员')) return 'member'
  if (text.includes('代理') || text.includes('佣金') || text.includes('结算') || text.includes('冲正')) return 'agent'
  if (text.includes('财务') || text.includes('资金') || text.includes('充值') || text.includes('提现') || text.includes('手续费')) return 'funds'
  if (text.includes('报表') || text.includes('盈亏') || text.includes('账变')) return 'report'
  if (text.includes('活动') || text.includes('奖励')) return 'activity'
  if (text.includes('风控') || text.includes('风险') || text.includes('黑名单') || text.includes('白名单')) return 'risk'
  if (text.includes('系统') || text.includes('监控') || text.includes('权限') || text.includes('日志')) return 'system'
  return 'generic'
}

function buildFeatures(pageTitle, note) {
  return note.features && note.features.length ? note.features : [
    `围绕“${pageTitle}”进行查看、筛选和处理`,
    '支持打开详情、配置或处理弹窗进行流程评审',
    '辅助产品和运营确认页面内容是否满足日常使用'
  ]
}

function resolvePreset(note, path, pageTitle) {
  const presetKey = pickPresetKey(path, note.moduleTitle, pageTitle)
  return fieldPresets[presetKey] || fieldPresets.generic
}

function buildFieldGroups(note, path, pageTitle) {
  if (note.fieldGroups && note.fieldGroups.length) {
    return note.fieldGroups
  }
  return resolvePreset(note, path, pageTitle).fieldGroups
}

function buildBusinessRules(note, path, pageTitle) {
  if (note.businessRules && note.businessRules.length) {
    return note.businessRules
  }
  return resolvePreset(note, path, pageTitle).businessRules
}

function buildAcceptanceFocus(note) {
  if (note.acceptanceFocus && note.acceptanceFocus.length) {
    return note.acceptanceFocus
  }
  return [
    '页面入口、筛选、表格、分页和弹窗展示正常。',
    '页面信息能够支持产品和运营完成原型评审。',
    '页面处理结果按演示口径展示，不代表真实业务结果。'
  ]
}

function buildChangeSummary(mode, path, note) {
  if (note.changeSummary) {
    return note.changeSummary
  }
  const pathSummary = pathChangeSummaries.find(item => item.mode === mode && isMatch(item, path))
  return pathSummary ? pathSummary.changeSummary : defaultChangeSummary
}

export function getRevisionNote(route = {}, backendMode = 'master') {
  const path = route.path || '/'
  const mode = inferMode(path, backendMode)
  const metaTitle = route.meta && route.meta.title
  const note = findNote(mode, path)
  const pageTitle = metaTitle || note.moduleTitle || '当前页面'
  const backendTitle = getBackendMeta(mode).title
  const changeSummary = buildChangeSummary(mode, path, note)
  return {
    backendTitle,
    moduleTitle: note.moduleTitle,
    pageTitle,
    position: note.position,
    features: buildFeatures(pageTitle, note),
    fieldGroups: buildFieldGroups(note, path, pageTitle),
    businessRules: buildBusinessRules(note, path, pageTitle),
    acceptanceFocus: buildAcceptanceFocus(note),
    relations: note.relations || [],
    changeSummary,
    updatedAt: changeSummary.time || UPDATED_AT,
    demoText: '当前页面用于演示原型评审，页面中的列表、弹窗和处理结果均为演示数据，适合产品和运营讨论流程与内容。'
  }
}

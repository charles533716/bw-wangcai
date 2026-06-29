<template>
  <section class="weekly-update-notes">
    <div class="weekly-update-notes__head">
      <div>
        <div class="weekly-update-notes__title">本周需求说明</div>
        <div class="weekly-update-notes__desc">
          按周展示演示原型本周新增或修改的业务模块、模块说明、修改说明和页面入口，便于产品与运营快速进入重点内容。
        </div>
      </div>
      <el-tag type="success" size="mini">每周最新</el-tag>
    </div>

    <div class="weekly-update-notes__weeks" :style="weekGridStyle">
      <article v-for="week in weeklyNotes" :key="week.weekKey" class="weekly-update-notes__week">
        <div class="weekly-update-notes__week-head">
          <div>
            <div class="weekly-update-notes__week-title">{{ week.weekLabel }}</div>
            <div class="weekly-update-notes__week-time">更新：{{ week.updatedAt }}</div>
          </div>
          <span class="weekly-update-notes__week-range">{{ week.range }}</span>
        </div>

        <p class="weekly-update-notes__summary">{{ week.summary }}</p>

        <div class="weekly-update-notes__groups">
          <section
            v-for="group in week.backendGroups"
            :key="group.backendTitle"
            class="weekly-update-notes__group"
          >
            <div class="weekly-update-notes__group-head">
              <div>
                <div class="weekly-update-notes__group-title">{{ group.backendTitle }}</div>
                <div class="weekly-update-notes__group-desc">{{ group.summary }}</div>
              </div>
              <el-tag size="mini" effect="plain">{{ group.modules.length }} 个模块</el-tag>
            </div>

            <div class="weekly-update-notes__items">
              <div v-for="item in group.modules" :key="item.title" class="weekly-update-notes__item">
                <div class="weekly-update-notes__item-head">
                  <div class="weekly-update-notes__item-title">{{ item.title }}</div>
                  <el-tag size="mini" :type="item.tagType || 'info'">{{ item.changeType }}</el-tag>
                </div>
                <div v-if="item.completedAt" class="weekly-update-notes__item-time">
                  完成时间：{{ item.completedAt }}
                </div>
                <div v-if="item.moduleNote" class="weekly-update-notes__item-row">
                  <strong>模块说明：</strong>{{ item.moduleNote }}
                </div>
                <div class="weekly-update-notes__item-desc">{{ item.businessNote }}</div>
                <div
                  v-if="item.changeNotes && item.changeNotes.length"
                  class="weekly-update-notes__change-notes"
                >
                  <div class="weekly-update-notes__change-title">修改说明</div>
                  <ul>
                    <li v-for="note in item.changeNotes" :key="note.title">
                      <strong>{{ note.title }}：</strong>{{ note.content }}
                    </li>
                  </ul>
                </div>
                <div class="weekly-update-notes__links">
                  <el-button
                    v-for="link in item.links"
                    :key="link.path"
                    size="mini"
                    type="text"
                    icon="el-icon-position"
                    @click="goTo(link.path)"
                  >
                    {{ link.label }}
                  </el-button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
const weeklyNotes = [
  {
    weekKey: '2026-W26',
    weekLabel: '2026年第26周',
    range: '06/22 - 06/28',
    updatedAt: '2026-06-26 04:20',
    summary: '本周围绕代理佣金预支链路做三后台闭环，并补充总控财务侧会员额度增减、充提手续费明细、存款设置、取款设置和运营报表 iOS 掉签分析能力：总控负责规则配置、全局记录、收益看板、会员额度调整、手续费核对、充提通道规则配置和 iOS 掉签用户召回名单；站点负责本站记录核对；代理负责预支领取和个人记录追踪。',
    backendGroups: [
      {
        backendTitle: '总控后台',
        summary: '总控侧重点是规则配置、全局追踪和跨站点经营判断，保障预支能力可管、可查、可评估。',
        modules: [
          {
            title: '结算周期设置',
            changeType: '规则配置',
            tagType: 'warning',
            completedAt: '2026-06-23 至 2026-06-24',
            moduleNote: '结算周期是已有模块，本次在原有结算规则基础上补充代理佣金预支能力，让总控可以先定义适配所有站点的全局规则，再为单个站点或特殊代理设置例外规则。',
            businessNote: '在结算周期设置中新增代理预支配置、全局配置、单站配置和单独代理配置；全局配置适配未单独配置站点，单站配置覆盖指定站点，单独代理配置只在具体站点下处理代理例外；当前预支配置已收敛为固定计算口径，不再提供额外佣金口径开关。',
            changeNotes: [
              {
                title: '新增代理预支配置',
                content: '在结算周期设置中增加佣金预支模式、最高可预支比例、每周期可预支次数、最低盈利门槛和最低剩余佣金额度，便于总控统一控制代理提前领取佣金的规则。'
              },
              {
                title: '新增全局配置与单站配置',
                content: '站点选择增加“全局配置（适配所有站点）”，全局配置作为默认规则；选择具体站点后可保存为单站配置，单站配置优先于全局配置。'
              },
              {
                title: '新增单独代理配置',
                content: '在选择具体站点时可维护单个代理的例外规则，用于处理重点代理或特殊代理，优先级高于单站配置和全局配置。'
              },
              {
                title: '调整详情页展示边界',
                content: '按最新评审口径，结算周期详情页不展示单站配置列表，不提供代理预支记录入口；全局配置时也不展示单独代理配置。'
              },
              {
                title: '调整菜单名称与预支配置项',
                content: '左侧菜单“结算周期”改为“结算周期设置”；佣金预支配置和单独代理配置中移除额外佣金口径开关，代理后台规则摘要同步不再展示该配置项。'
              }
            ],
            links: [
              { label: '结算周期设置', path: '/agent/settlementCycle' }
            ]
          },
          {
            title: '代理预支记录',
            changeType: '新增入口',
            tagType: 'success',
            completedAt: '2026-06-23 至 2026-06-24',
            moduleNote: '代理预支记录是本周新增的独立查询模块，用于承接代理领取预支佣金后的记录核对和追踪。',
            businessNote: '总控可查看全部站点、全部代理的预支记录，用于追踪领取结果、累计预支、剩余次数和处理说明。',
            changeNotes: [
              {
                title: '新增三后台记录入口',
                content: '总站、站点、代理后台均增加代理预支记录入口，避免代理领取后缺少查询去向。'
              },
              {
                title: '补充总控查询范围',
                content: '总控记录支持按站点、代理、周期、领取状态和领取时间筛选，可查看全部站点和全部代理的预支结果。'
              }
            ],
            links: [
              { label: '总控记录', path: '/agent/advanceRecords' }
            ]
          },
          {
            title: '代理收益看板',
            changeType: '字段口径调整',
            tagType: 'success',
            completedAt: '2026-06-26',
            moduleNote: '代理收益看板是代理管理下的独立模块，用于让总控按列表查看代理收益表现和欠款风险。',
            businessNote: '收益看板独立展示站点、代理编号、代理账号、上级代理、佣金、充值提现、投注盈亏、欠款、会员和代理规模指标；本次将原代理名称字段调整为代理账号，并在总盈亏右侧补充该代理欠款和未收回欠款。',
            changeNotes: [
              {
                title: '调整代理身份字段',
                content: '表格保留代理编号用于识别编码，原代理名称字段改名为代理账号，统一运营查看代理身份时的字段口径。'
              },
              {
                title: '补充代理欠款字段',
                content: '在总盈亏右侧新增该代理欠款和未收回欠款两个金额字段，帮助总控在收益看板中同时判断代理收益表现和欠款回收风险。'
              }
            ],
            links: [
              { label: '收益看板', path: '/agent/earningBoard' }
            ]
          },
          {
            title: '额度增减 - 会员额度增减',
            changeType: '规则增强',
            tagType: 'warning',
            completedAt: '2026-06-25',
            moduleNote: '额度增减是已有财务模块，本次只增强会员额度增减中的加额规则，用于让总控给会员增加额度时同步设置提现流水要求。',
            businessNote: '会员额度增减中固定展示提现流水倍数；会员增加额度时可输入且最低 1 倍，会员减少额度时字段锁定为 0 倍，不产生新增提现流水。',
            changeNotes: [
              {
                title: '提现流水倍数常驻展示',
                content: '会员额度增减表单固定展示提现流水倍数，避免加额和减额场景切换时出现规则口径不可见。'
              },
              {
                title: '补充计算口径',
                content: '新增提现流水按“增加额度 × 提现流水倍数”计算，并在确认弹窗和记录表中展示。'
              },
              {
                title: '限制减额场景',
                content: '当调整金额为负数时，提现流水倍数字段不可输入并固定为 0 倍，只保留可提现金额或锁定金额的优先扣除选择。'
              }
            ],
            links: [
              { label: '额度增减', path: '/funds/quotaAdjustment' }
            ]
          },
          {
            title: '充提手续费明细',
            changeType: '新增模块',
            tagType: 'success',
            completedAt: '2026-06-25',
            moduleNote: '充提手续费明细是充提费用管理下新增的交易明细模块，用于按每笔会员充提订单核对三方成本、站点报价和用户实际承担费用。',
            businessNote: '页面支持按时间、站点、业务类型、通道、账号名、代理树、上级代理和订单号筛选，列表展示账号类型、账号名、充值/提现账号、交易金额、三方手续费、站点报价手续费、用户实收手续费和站点与会员差额，并按筛选后的全部数据展示底部总计。',
            changeNotes: [
              {
                title: '调整充提费用菜单名称',
                content: '充提费用管理下两个原有子菜单改为“充提手续费设置”和“充提手续费报表”，与评审截图保持一致。'
              },
              {
                title: '新增手续费交易明细',
                content: '新增“充提手续费明细”独立入口，按每笔会员充值或提现订单展示站点、通道、会员、交易金额和三种费用口径。'
              },
              {
                title: '补充费用核对口径',
                content: '三方手续费代表通道成本，站点报价手续费代表给站点的报价口径，用户实收手续费代表会员实际承担费用，站点与会员差额按“用户实收手续费 - 站点报价手续费”展示。'
              },
              {
                title: '调整账号和代理树核对口径',
                content: '新增代理树筛选，可筛选某个代理及其下级代理；会员账号改为账号名并新增账号类型，去除会员姓名和操作列，在币种/协议右侧新增充值/提现账号，底部汇总从当前页小计改为当前筛选后的全部数据总计。'
              }
            ],
            links: [
              { label: '手续费设置', path: '/depositWithdrawFee/setting' },
              { label: '手续费报表', path: '/depositWithdrawFee/report' },
              { label: '手续费明细', path: '/depositWithdrawFee/detail' }
            ]
          },
          {
            title: '存款设置',
            changeType: '字段精简与规则增强',
            tagType: 'warning',
            completedAt: '2026-06-26',
            moduleNote: '存款设置是总控财务侧已有模块，本次按评审截图调整列表展示，并精简数字货币充值网络字段，保留通道使用条件配置，便于产品和运营讨论存款通道差异化规则。',
            businessNote: '页面按存款类型、存款币种和通道状态筛选，列表展示上游服务商、通道编码、排序、支付区间、协议手续费和状态；新增或修改弹窗中，数字货币可用表格行维护充值网络，通道可设置 VIP 使用条件，已去除地址模式、平台收款地址和手续费承担方模块。',
            changeNotes: [
              {
                title: '调整列表展示样式',
                content: '存款设置详情页按截图改为更轻量的筛选区、工具按钮和密集列表，字段顺序对齐存款类型、存款币种、上游服务商、通道编码、展示排序、支付姓名、金额类型、支付区间、协议手续费、状态和创建时间。'
              },
              {
                title: '新增数字货币充值网络',
                content: '当存款币种为 USDT、NEXUS 或 EB 等数字货币时，新增或修改弹窗支持增加、修改、删除充值网络，并在列表协议手续费中展示各网络手续费模式。充值网络已调整为表格行样式，仅展示网络名称、网络代码、代币标准、充值资产、合约地址、状态和操作。'
              },
              {
                title: '调整充值网络编辑规则',
                content: '代币标准不再使用下拉选择，改为点击单行“编辑”后手动输入；网络信息默认只读展示，编辑时当前行显示浅蓝底色和输入框高亮，完成编辑后回到只读状态，便于运营按实际网络资料维护。'
              },
              {
                title: '新增通道使用条件',
                content: '新增使用条件开关和 VIP 等级限制，用于演示通道只允许指定VIP等级以上会员使用的配置场景。'
              },
              {
                title: '移除手续费承担方',
                content: '存款设置新增或修改弹窗已去除手续费承担方模块，配置流程只保留通道基础信息、充值网络、支付区间与手续费、使用条件和支持站点。'
              }
            ],
            links: [
              { label: '存款设置', path: '/funds/pay/payChannel' }
            ]
          },
          {
            title: '取款设置',
            changeType: '字段精简与规则增强',
            tagType: 'warning',
            completedAt: '2026-06-26',
            moduleNote: '取款设置是总控财务侧已有模块，本次按评审截图调整列表展示，并精简数字货币取款网络字段，保留通道使用条件配置，便于产品和运营讨论提现通道差异化规则。',
            businessNote: '页面按取款类型、取款币种和状态筛选，列表展示上游服务商、通道编码、取款汇率、单笔上限、每日限额、手续费模式、协议手续费和支持平台；新增或修改弹窗中，数字货币可用表格行维护取款网络，通道可设置 VIP 使用条件，已去除平台出款地址和手续费承担方模块。',
            changeNotes: [
              {
                title: '调整列表展示样式',
                content: '取款设置详情页按截图改为轻量筛选区、工具按钮和密集列表，字段顺序对齐取款类型、取款币种、上游服务商、上游通道编码、取款汇率、单笔上限、每日限额、手续费模式、协议手续费、支持平台、状态和创建时间。'
              },
              {
                title: '新增数字货币取款网络',
                content: '当取款币种为 USDT、EB 或 NEXUS 等数字货币时，新增或修改弹窗支持增加、编辑完成、删除取款网络，并在列表协议手续费中展示各网络手续费模式。'
              },
              {
                title: '调整取款网络编辑规则',
                content: '取款网络采用表格行样式，仅展示网络名称、网络代码、代币标准、取款资产、合约地址、状态和操作；本次去除平台出款地址字段，点击单行“编辑”后当前行高亮，代币标准可手动输入。'
              },
              {
                title: '新增通道使用条件',
                content: '新增使用条件开关和 VIP 等级限制，用于演示取款通道只允许指定 VIP 等级以上会员使用的配置场景。'
              },
              {
                title: '移除手续费承担方',
                content: '取款设置新增或修改弹窗已去除手续费承担方模块，配置流程只保留通道基础信息、取款网络、取款限额与手续费、使用条件和支持站点。'
              }
            ],
            links: [
              { label: '取款设置', path: '/funds/pay/withdrawChannel' }
            ]
          },
          {
            title: '掉签分析',
            changeType: '新增模块',
            tagType: 'success',
            completedAt: '2026-06-25',
            moduleNote: '掉签分析是运营报表下新增模块，用于识别 iOS 用户掉签后未再登录的疑似流失用户，帮助运营形成外呼召回名单。',
            businessNote: '页面默认展示 iOS 掉签流失用户，客户端固定为 iOS，不展示 Android、H5 或 PC 用户；支持按站点、会员信息、邮箱、上级代理、掉签状态、登录状态、用户状态、版本、掉签时间、最后登录时间和跟进状态筛选。',
            changeNotes: [
              {
                title: '新增掉签流失判定',
                content: '当 iOS 用户存在掉签时间，且最后登录时间早于掉签时间或为空时，判定为掉签流失用户；最后登录时间晚于掉签时间时判定为已恢复。'
              },
              {
                title: '新增运营跟进闭环',
                content: '列表展示用户姓名、电话、邮箱、上级代理、版本、掉签时间、最后登录时间和跟进状态，并支持标记跟进和查看详情。'
              },
              {
                title: '新增外呼名单导出',
                content: '页面提供导出演示数据按钮，用于模拟将当前筛选结果分配给运营进行电话召回。'
              },
              {
                title: '收敛为 iOS 掉签口径',
                content: '掉签分析只展示 iOS 用户，客户端筛选固定为 iOS，页面不再出现 Android、H5 或 PC 用户，避免运营误按全端掉签口径评审。'
              },
              {
                title: '补充用户邮箱字段',
                content: '在手机号码右侧新增用户邮箱字段，并同步到掉签详情弹窗和会员信息搜索，便于运营保留邮件触达和身份核对信息。'
              }
            ],
            links: [
              { label: '掉签分析', path: '/report/dropSignAnalysis' }
            ]
          }
        ]
      },
      {
        backendTitle: '站点后台',
        summary: '站点侧重点是查看本站代理的预支执行结果，帮助站点运营核对代理结算和佣金发放。',
        modules: [
          {
            title: '代理预支记录',
            changeType: '新增入口',
            tagType: 'success',
            completedAt: '2026-06-23 至 2026-06-24',
            moduleNote: '站点代理预支记录是本周新增的站点侧查询入口，用于查看本站代理的预支领取情况。',
            businessNote: '站点后台可查看当前站点下代理的预支记录，规则默认沿用总控配置，便于站点运营核对本站代理领取情况。',
            changeNotes: [
              {
                title: '新增本站记录入口',
                content: '站点后台代理管理中增加代理预支记录入口，仅展示当前站点范围，便于站点运营核对本站代理领取情况。'
              },
              {
                title: '沿用总控规则',
                content: '站点后台本期不单独配置预支规则，默认按总控配置结果查看和核对记录。'
              }
            ],
            links: [
              { label: '站点记录', path: '/site-admin/agent/advanceRecords' }
            ]
          }
        ]
      },
      {
        backendTitle: '代理后台',
        summary: '代理侧重点是看清本周期可领取额度、剩余次数和领取结果，减少代理对佣金去向的疑问。',
        modules: [
          {
            title: '预支佣金',
            changeType: '新增模块',
            tagType: 'primary',
            completedAt: '2026-06-23 至 2026-06-24',
            moduleNote: '预支佣金是本周新增的代理侧领取模块，用于让代理清楚看到本周期可领取额度、已领取额度和剩余次数。',
            businessNote: '代理可查看本周期佣金、可预支金额、已预支金额和剩余次数，并在满足规则后领取预支佣金；领取后的记录可从下方“代理预支记录”入口继续核对。',
            changeNotes: [
              {
                title: '新增预支佣金模块',
                content: '代理后台佣金管理下新增预支佣金，用于展示本周期佣金、可预支金额、已预支金额、剩余预支次数和领取动作。'
              },
              {
                title: '补充不可领取原因',
                content: '页面展示未开启、未到周结算后、盈利未达门槛、剩余佣金不足、次数用完或已预支比例超限等不可领取原因。'
              }
            ],
            links: [
              { label: '预支佣金', path: '/agent-admin/commission/settlement' }
            ]
          },
          {
            title: '代理预支记录',
            changeType: '独立入口',
            tagType: 'success',
            completedAt: '2026-06-23 至 2026-06-24',
            moduleNote: '代理预支记录是本周新增的代理侧独立记录入口，用于让代理单独核对自己的预支领取结果。',
            businessNote: '代理预支记录从预支佣金页面中独立出来，并调整到预支佣金菜单入口下方，代理可单独查询自己的领取记录和详情。',
            changeNotes: [
              {
                title: '记录查询独立成页',
                content: '代理预支记录不再作为预支佣金页面内弹窗承载，而是在左侧菜单中作为独立入口展示。'
              },
              {
                title: '调整菜单位置',
                content: '代理预支记录入口移动到预支佣金下方，形成先领取、再查记录的顺序。'
              }
            ],
            links: [
              { label: '代理记录', path: '/agent-admin/agent/advanceRecords' }
            ]
          }
        ]
      }
    ]
  }
]

export default {
  name: 'WeeklyUpdateNotes',
  data() {
    return {
      weeklyNotes
    }
  },
  computed: {
    weekGridStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.max(1, this.weeklyNotes.length)}, minmax(320px, 1fr))`
      }
    }
  },
  methods: {
    goTo(path) {
      if (path && path !== this.$route.path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style scoped>
.weekly-update-notes {
  margin: 10px 12px 0;
  padding: 14px;
  border: 1px solid #e3e9f2;
  border-radius: 10px;
  background: #fff;
}

.weekly-update-notes__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.weekly-update-notes__title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.weekly-update-notes__desc {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.weekly-update-notes__weeks {
  display: grid;
  gap: 12px;
  overflow-x: auto;
}

.weekly-update-notes__week {
  min-width: 0;
  border: 1px solid #edf1f7;
  border-radius: 8px;
  background: #f8fbff;
}

.weekly-update-notes__week-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 8px;
  border-bottom: 1px solid #edf1f7;
}

.weekly-update-notes__week-title {
  font-weight: 700;
  color: #1f2937;
}

.weekly-update-notes__week-time,
.weekly-update-notes__week-range {
  margin-top: 4px;
  color: #7b8794;
  font-size: 12px;
  white-space: nowrap;
}

.weekly-update-notes__summary {
  margin: 0;
  padding: 10px 12px;
  color: #4b5563;
  line-height: 1.7;
  background: #fff;
}

.weekly-update-notes__groups {
  display: grid;
  gap: 12px;
  padding: 10px 12px 12px;
}

.weekly-update-notes__group {
  border: 1px solid #e6edf6;
  border-radius: 8px;
  background: #fff;
}

.weekly-update-notes__group-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eef3f8;
}

.weekly-update-notes__group-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.weekly-update-notes__group-desc {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.weekly-update-notes__items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
  padding: 12px;
}

.weekly-update-notes__item {
  padding: 10px;
  border-radius: 8px;
  background: #f8fbff;
}

.weekly-update-notes__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.weekly-update-notes__item-title {
  font-weight: 700;
  color: #243142;
}

.weekly-update-notes__item-time {
  margin-top: 6px;
  color: #409eff;
  font-size: 12px;
  line-height: 1.5;
}

.weekly-update-notes__item-row {
  margin-top: 5px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.6;
}

.weekly-update-notes__item-row strong {
  color: #334155;
}

.weekly-update-notes__item-desc {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.weekly-update-notes__change-notes {
  margin-top: 6px;
  color: #334155;
  font-size: 12px;
  line-height: 1.6;
}

.weekly-update-notes__change-title {
  font-weight: 700;
  color: #243142;
}

.weekly-update-notes__change-notes ul {
  margin: 4px 0 0;
  padding-left: 18px;
}

.weekly-update-notes__change-notes li + li {
  margin-top: 3px;
}

.weekly-update-notes__links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 6px;
}
</style>

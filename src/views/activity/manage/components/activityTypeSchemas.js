export const ACTIVITY_TYPE_ALIASES = {
    "每日投注额度加笔数": "每日投注额度+笔数",
    "累冲": "累充"
};
export const DEFAULT_TYPE_OPTIONS = [{
    value: "20",
    label: "连胜",
    description: "连续赢得指定场次获得奖励，可指定单个或复数游戏类型"
}, {
    value: "21",
    label: "累充",
    description: "在活动期间内累计充值达指定金额，按档位发放奖励"
}, {
    value: "22",
    label: "胜率",
    description: "在指定周期内达到目标胜率，满足条件即可领取奖励"
}, {
    value: "23",
    label: "连续每日投注",
    description: "每日投注N次且连续指定天数，连续达成多日后发放奖励"
}, {
    value: "24",
    label: "每日投注额度+笔数",
    description: "每日有效投注额度与笔数同时达标，按档位发放奖励"
}, {
    value: "25",
    label: "新人礼",
    description: "新注册会员首次参与，首存打码和成单达标后可领取活动奖励"
}, {
    value: "26",
    label: "首存活动",
    description: "会员首存后按配置比例或固定金额发放优惠奖励"
}, {
    value: "27",
    label: "签到",
    description: "按自然周配置每日有效投注额档位和签到奖励"
}];
export const VIP_LEVEL_OPTIONS = Array.from({
    length: 10
}, function(item, index) {
    return "VIP" + (index + 1)
});
export const STATISTICAL_PERIOD_OPTIONS = [{
    value: "活动期间内累计",
    label: "活动期间内累计"
}, {
    value: "按自然日统计",
    label: "按自然日统计"
}, {
    value: "按每周统计",
    label: "按每周统计"
}];
export const SAME_TIER_REPEAT_OPTIONS = [{
    value: false,
    label: "否（每档仅领一次）"
}, {
    value: true,
    label: "是（满足条件可重复领取）"
}];
export const STACK_HIGH_TIER_OPTIONS = [{
    value: true,
    label: "是（满足高档直接领）"
}, {
    value: false,
    label: "否（仅领取当前档）"
}];
export const DAILY_RESET_TIME_OPTIONS = [{
    value: "00:00:00 (自然日)",
    label: "00:00:00 (自然日)"
}, {
    value: "06:00:00 (自然日)",
    label: "06:00:00 (自然日)"
}, {
    value: "12:00:00 (自然日)",
    label: "12:00:00 (自然日)"
}];
const DEFAULT_EDITOR_PLACEHOLDER = "请输入内容";
const TEMPLATE_FIXED_KEYS = ["crossTypeCombined", "statisticalPeriod", "minimumValidBet", "gameTypes"];
const TYPE_DESCRIPTION_MAP = DEFAULT_TYPE_OPTIONS.reduce(function(result, item) {
    result[normalizeActivityTypeLabel(item.label || item.value)] = item.description;
    return result
}, {});

function deepClone(value) {
    if (value == null) {
        return value
    }
    return JSON.parse(JSON.stringify(value))
}

function createSwitchOption(key, label, description) {
    return {
        key: key,
        label: label,
        description: description
    }
}

function createBaseField(config) {
    return Object.assign({
        source: "root",
        type: "number",
        required: true,
        precision: 0,
        placeholder: "",
        tip: "",
        options: []
    }, config)
}

function createRewardColumn(config) {
    return Object.assign({
        type: "number",
        precision: 0,
        required: false,
        prefix: "",
        suffix: "",
        placeholder: "",
        align: "left"
    }, config)
}

function createRewardItem(data) {
    return {
        taskName: data.taskName || "",
        targetCount: data.targetCount === undefined ? null : data.targetCount,
        targetValidBetAmount: data.targetValidBetAmount === undefined ? null : data.targetValidBetAmount,
        rewardAmount: data.rewardAmount === undefined ? null : data.rewardAmount,
        taskSummary: data.taskSummary || "",
        enabled: data.enabled !== false,
        extraConfig: Object.assign({}, data.extraConfig || {})
    }
}

function createSigninRewardItem(data) {
    return createRewardItem({
        taskName: data.taskName || "",
        targetValidBetAmount: data.targetValidBetAmount === undefined ? 0 : data.targetValidBetAmount,
        rewardAmount: 0,
        enabled: true,
        extraConfig: {
            weekdayRewards: Object.assign({}, data.weekdayRewards || {}),
            fullSignReward: data.fullSignReward === undefined ? 0 : data.fullSignReward
        }
    })
}

function resolveRewardItemDisplayName(item, index) {
    var taskName = String(item && item.taskName ? item.taskName : "").trim();
    if (taskName) {
        return taskName
    }
    return "第" + (index + 1) + "个奖励档位"
}

function isPositiveIntegerValue(value) {
    var numericValue = Number(value);
    return Number.isInteger(numericValue) && numericValue > 0
}

function buildDefaultRuleSwitches(options) {
    return options.reduce(function(result, item) {
        result[item.key] = true;
        return result
    }, {})
}

function buildDefaultRows(taskPrefix, values) {
    return values.map(function(item, index) {
        return createRewardItem(Object.assign({
            taskName: taskPrefix + (index + 1),
            enabled: true
        }, item))
    })
}
const FALLBACK_NEW_MEMBER_TASK_TYPES = [{
    value: "0",
    label: "实名奖励"
}, {
    value: "1",
    label: "首充奖励"
}, {
    value: "2",
    label: "取款奖励"
}, {
    value: "3",
    label: "活跃奖励"
}, {
    value: "4",
    label: "复活奖励"
}, {
    value: "5",
    label: "累充奖励"
}];

function isSequenceNamedNewcomerTaskType(taskType) {
    return taskType === "1" || taskType === "5"
}

function normalizeNewcomerTaskTypeValue(value) {
    var normalized = String(value === undefined || value === null ? "" : value).trim();
    if (!/^\d+$/.test(normalized)) {
        return normalized
    }
    return Number(normalized) >= 6 ? "5" : normalized
}

function normalizeNewcomerTaskSeqValue(taskType, taskSeq, fallbackSeq) {
    var normalizedTaskType = normalizeNewcomerTaskTypeValue(taskType);
    var normalizedTaskSeq = String(taskSeq === undefined || taskSeq === null ? "" : taskSeq).trim();
    if (/^\d+$/.test(normalizedTaskSeq) && Number(normalizedTaskSeq) > 0) {
        return normalizedTaskSeq
    }
    var rawTaskType = String(taskType === undefined || taskType === null ? "" : taskType).trim();
    if (/^\d+$/.test(rawTaskType) && Number(rawTaskType) >= 6) {
        return String(Number(rawTaskType) - 4)
    }
    if (isSequenceNamedNewcomerTaskType(normalizedTaskType)) {
        return String(Number(fallbackSeq || 1))
    }
    return "1"
}

function buildNewcomerTaskLabel(taskType, taskSeq, optionSources, fallbackLabel) {
    var normalizedTaskType = normalizeNewcomerTaskTypeValue(taskType);
    var normalizedTaskSeq = normalizeNewcomerTaskSeqValue(normalizedTaskType, taskSeq, 1);
    var options = optionSources && Array.isArray(optionSources.newMemberTaskTypeOptions) ? optionSources.newMemberTaskTypeOptions : [];
    var matched = options.find(function(item) {
        return item && String(item.value) === String(normalizedTaskType)
    });
    var label = matched && matched.label ? matched.label : fallbackLabel || "";
    if (isSequenceNamedNewcomerTaskType(normalizedTaskType) && /\d+$/.test(label)) {
        label = label.replace(/\d+$/, "")
    }
    if (!label) {
        if (normalizedTaskType === "0") {
            label = "实名奖励"
        } else if (normalizedTaskType === "1") {
            label = "首充奖励"
        } else if (normalizedTaskType === "2") {
            label = "取款奖励"
        } else if (normalizedTaskType === "3") {
            label = "活跃奖励"
        } else if (normalizedTaskType === "4") {
            label = "复活奖励"
        } else {
            label = "累充奖励"
        }
    }
    if (isSequenceNamedNewcomerTaskType(normalizedTaskType)) {
        return label + normalizedTaskSeq
    }
    return label
}

function createNewcomerDefaultRewardItem(option, optionSources) {
    var taskType = normalizeNewcomerTaskTypeValue(option && option.value !== undefined ? option.value : "");
    var taskSeq = normalizeNewcomerTaskSeqValue(taskType, option && option.taskSeq !== undefined ? option.taskSeq : undefined, 1);
    var taskName = buildNewcomerTaskLabel(taskType, taskSeq, optionSources, option && option.label ? option.label : "");
    var config = {
        taskName: taskName,
        rewardAmount: 0,
        taskSummary: "",
        enabled: true,
        extraConfig: {
            taskType: taskType,
            taskSeq: taskSeq,
            validDays: 7
        }
    };
    if (taskType === "0") {
        config.rewardAmount = 8;
        config.extraConfig.taskCode = "realName";
        config.extraConfig.requireMobileBinding = true;
        config.extraConfig.requireRealName = true
    } else if (taskType === "1") {
        config.rewardAmount = 5;
        config.extraConfig.taskCode = "firstDeposit";
        config.extraConfig.accumulatedDeposit = 2500
    } else if (taskType === "2") {
        config.rewardAmount = 5;
        config.extraConfig.taskCode = "withdrawal";
        config.extraConfig.withdrawalCount = 1
    } else if (taskType === "3") {
        config.rewardAmount = 18;
        config.extraConfig.taskCode = "active";
        config.extraConfig.signInDays = 5;
        config.extraConfig.dailyDeposit = 100;
        config.extraConfig.dailyValidBet = 1e3
    } else if (taskType === "4") {
        config.rewardAmount = 888;
        config.extraConfig.taskCode = "revive";
        config.extraConfig.negativeProfit = 1e3
    } else {
        config.rewardAmount = taskType === "5" ? 58 : 0;
        config.extraConfig.taskCode = "cumulativeDepositCustom";
        config.extraConfig.accumulatedDeposit = taskType === "5" ? 5e3 : 0
    }
    return createRewardItem(config)
}

function buildNewcomerDefaults(optionSources) {
    var dictOptions = optionSources && Array.isArray(optionSources.newMemberTaskTypeOptions) ? optionSources.newMemberTaskTypeOptions.map(function(item) {
        return {
            value: String(item && item.value !== undefined ? item.value : "").trim(),
            label: item && item.label ? item.label : ""
        }
    }).filter(function(item) {
        return item.value !== ""
    }).sort(function(left, right) {
        return Number(left.value) - Number(right.value)
    }).slice(0, 6) : [];
    var options = dictOptions.length ? dictOptions : FALLBACK_NEW_MEMBER_TASK_TYPES;
    return options.map(function(option) {
        return createNewcomerDefaultRewardItem(option, optionSources)
    })
}
export function createNewcomerRewardItem(taskType, taskSeq, optionSources) {
    return createNewcomerDefaultRewardItem({
        value: normalizeNewcomerTaskTypeValue(taskType),
        taskSeq: normalizeNewcomerTaskSeqValue(taskType, taskSeq, 1)
    }, optionSources)
}
const WIN_STREAK_SWITCHES = [createSwitchOption("excludeDraw", "和局不计入连胜", "出现和局时连胜计数不中断，和局本身不计入场次。"), createSwitchOption("excludeParlay", "串关/混合过关不计入连胜", "参与串关或混合过关下注不计入连胜场次，也不中断连胜。"), createSwitchOption("excludeLottery", "彩票不计入连胜", "彩票类型投注不计入连胜统计。"), createSwitchOption("singlePlayCountOnce", "同场次同玩法多单下注只记一单获胜", "同一场次相同玩法的多个投注，仅计一场获胜。"), createSwitchOption("pendingSettlementPause", "待结算注单暂停计数", "连单待结算时连胜状态暂停，结算完成后继续累计。")];
const CUMULATIVE_RECHARGE_SWITCHES = [createSwitchOption("rechargeMustBoundWallet", "充值须来自绑定银行卡/电子钱包", "第三方充值渠道不计入累充统计"), createSwitchOption("refundAutoDeduct", "退款/冲正自动扣除", "若发生退款，对应金额从累充总额中扣除"), createSwitchOption("accountUniquenessCheck", "账户唯一性校验", "同一手机号/银行卡/设备/IP仅可参与一次")];
const WIN_RATE_SWITCHES = [createSwitchOption("excludeDrawForWinRate", "和局不计入胜负统计", "和局结果不影响胜率计算，也不计入局数"), createSwitchOption("excludeCanceledOrder", "取消/作废注单不计入", "被取消的注单不计入有效局数"), createSwitchOption("countSingleWinPerMatch", "同场次同玩法多单下注只记一单获胜", "同一场次相同玩法的多个投注，仅计一场获胜")];
const DAILY_STREAK_SWITCHES = [createSwitchOption("restartAfterBreak", "中断后重新计算", "若某日未达标，连续天数从0重新开始"), createSwitchOption("excludeDrawForDailyWin", "和局不计入获胜局数", "和局结果不算作“获胜”"), createSwitchOption("noCompensationForMissedDay", "当日未达标不补发", "不可用次日达标补发昨日未完成的任务"), createSwitchOption("mergeGameTypesForDaily", "跨游戏类型合并统计", "所有选中类型的投注笔数/获胜局数合并计算")];
const DAILY_AMOUNT_SWITCHES = [createSwitchOption("excludeCanceledOrRefundOrder", "排除取消/退款注单", "已取消或退款的注单不计入额度、笔数及订单数"), createSwitchOption("excludeSpecificOrders", "排除全赢/彩票/特码投注", "上述投注不计入额度、笔数及订单数"), createSwitchOption("accountUniquenessForDaily", "账户唯一性校验", "同一手机号/银行卡/设备/IP同一个账户参与")];
const NEWCOMER_SWITCHES = [createSwitchOption("realNameVerifyRequired", "实名验证前置", "须完成手机号、银行卡、邮箱绑定后方可申请"), createSwitchOption("deviceUniquenessCheck", "设备唯一性校验", "同一设备只能参与一次"), createSwitchOption("bankCardUniquenessCheck", "银行卡唯一性校验", "同一银行卡只能绑定一个账户参与")];
const SIGNIN_WEEKDAYS = ["1", "2", "3", "4", "5", "6", "7"];
const TYPE_SCHEMAS = {
    "连胜": {
        typeKey: "连胜",
        baseCaption: "基础配置",
        showGameTypes: true,
        gameTypeLabel: "适用游戏类型（可多选）",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1.6fr 1fr 1.1fr 1.1fr 90px 64px",
        baseFields: [createBaseField({
            key: "crossTypeCombined",
            label: "跨类型合并计算",
            type: "select",
            options: [{
                value: false,
                label: "否（各类型独立）"
            }, {
                value: true,
                label: "是（跨类型合并）"
            }]
        }), createBaseField({
            key: "statisticalPeriod",
            label: "统计周期",
            type: "select",
            options: STATISTICAL_PERIOD_OPTIONS
        }), createBaseField({
            key: "minimumValidBet",
            label: "最低有效投注",
            type: "number",
            precision: 2,
            tip: "单笔最低有效投注金额"
        })],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "input",
            field: "taskName",
            required: true,
            placeholder: "请输入任务名称"
        }), createRewardColumn({
            key: "targetCount",
            label: "连胜次数",
            type: "number",
            field: "targetCount",
            prefix: "≥",
            suffix: "场",
            precision: 0,
            required: true,
            validationLabel: "连胜次数"
        }), createRewardColumn({
            key: "targetValidBetAmount",
            label: "连胜期间总有效投注（元）",
            type: "number",
            field: "targetValidBetAmount",
            prefix: ">",
            precision: 2,
            required: true,
            validationLabel: "连胜期间总有效投注"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "赠送彩金金额（元）",
            type: "number",
            field: "rewardAmount",
            precision: 2,
            required: true,
            validationLabel: "赠送彩金金额"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增档位",
        ruleOptions: WIN_STREAK_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: 100,
            gameTypes: [],
            baseConfigExtra: {},
            rewardItems: buildDefaultRows("连胜奖励", [{
                targetCount: 6,
                targetValidBetAmount: 8888,
                rewardAmount: 188
            }, {
                targetCount: 8,
                targetValidBetAmount: 18888,
                rewardAmount: 388
            }, {
                targetCount: 10,
                targetValidBetAmount: 38888,
                rewardAmount: 588
            }, {
                targetCount: 12,
                targetValidBetAmount: 58888,
                rewardAmount: 888
            }, {
                targetCount: 15,
                targetValidBetAmount: 108888,
                rewardAmount: 1888
            }, {
                targetCount: 20,
                targetValidBetAmount: 888888,
                rewardAmount: 12888
            }]),
            ruleSwitches: buildDefaultRuleSwitches(WIN_STREAK_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "连胜奖励" + (index + 1),
                targetCount: 0,
                targetValidBetAmount: 0,
                rewardAmount: 0,
                enabled: true
            })
        }
    },
    "累充": {
        typeKey: "累充",
        baseCaption: "基础配置",
        showGameTypes: false,
        gameTypeLabel: "",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1.65fr 1.1fr 1fr 120px 90px 64px",
        baseFields: [createBaseField({
            key: "statisticalPeriod",
            label: "统计周期",
            type: "select",
            options: STATISTICAL_PERIOD_OPTIONS
        }), createBaseField({
            key: "sameTierRepeatable",
            source: "extra",
            label: "同一档位可重复领取",
            type: "select",
            options: SAME_TIER_REPEAT_OPTIONS
        }), createBaseField({
            key: "stackHighTierReward",
            source: "extra",
            label: "叠加高档奖励",
            type: "select",
            options: STACK_HIGH_TIER_OPTIONS
        })],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "input",
            field: "taskName",
            required: true,
            placeholder: "请输入任务名称"
        }), createRewardColumn({
            key: "targetValidBetAmount",
            label: "累计充值金额达（元）",
            type: "number",
            field: "targetValidBetAmount",
            prefix: ">",
            precision: 2,
            required: true,
            validationLabel: "累计充值金额"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "赠彩金额（元）",
            type: "number",
            field: "rewardAmount",
            precision: 2,
            required: true,
            validationLabel: "赠彩金额"
        }), createRewardColumn({
            key: "includeFirstRechargeBonus",
            label: "含首充加成",
            type: "switch",
            field: "extraConfig.includeFirstRechargeBonus"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增档位",
        ruleOptions: CUMULATIVE_RECHARGE_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: null,
            gameTypes: [],
            baseConfigExtra: {
                sameTierRepeatable: false,
                stackHighTierReward: false
            },
            rewardItems: buildDefaultRows("累充奖励", [{
                targetValidBetAmount: 500,
                rewardAmount: 28,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            }, {
                targetValidBetAmount: 1e3,
                rewardAmount: 68,
                extraConfig: {
                    includeFirstRechargeBonus: true
                }
            }, {
                targetValidBetAmount: 2e3,
                rewardAmount: 138,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            }, {
                targetValidBetAmount: 5e3,
                rewardAmount: 388,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            }, {
                targetValidBetAmount: 1e4,
                rewardAmount: 888,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            }, {
                targetValidBetAmount: 5e4,
                rewardAmount: 3888,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            }]),
            ruleSwitches: buildDefaultRuleSwitches(CUMULATIVE_RECHARGE_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "累充奖励" + (index + 1),
                targetValidBetAmount: 0,
                rewardAmount: 0,
                enabled: true,
                extraConfig: {
                    includeFirstRechargeBonus: false
                }
            })
        }
    },
    "胜率": {
        typeKey: "胜率",
        baseCaption: "基础配置",
        showGameTypes: true,
        gameTypeLabel: "适用游戏类型（可多选）",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1.6fr 1fr 1fr 1fr 90px 64px",
        baseFields: [createBaseField({
            key: "statisticalPeriod",
            label: "统计周期",
            type: "select",
            options: STATISTICAL_PERIOD_OPTIONS
        }), createBaseField({
            key: "minimumValidBet",
            label: "最低有效投注（元/局）",
            type: "number",
            precision: 2,
            tip: "低于此金额的局数不计入"
        }), createBaseField({
            key: "dailyMaxApplyCount",
            source: "extra",
            label: "每日最多申请次数",
            type: "number",
            precision: 0
        })],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "input",
            field: "taskName",
            required: true,
            placeholder: "请输入任务名称"
        }), createRewardColumn({
            key: "targetCount",
            label: "统计局数",
            type: "number",
            field: "targetCount",
            precision: 0,
            required: true,
            suffix: "局内",
            validationLabel: "统计局数"
        }), createRewardColumn({
            key: "winRateThreshold",
            label: "胜率门槛（%）",
            type: "number",
            field: "extraConfig.winRateThreshold",
            precision: 2,
            required: true,
            suffix: "%",
            validationLabel: "胜率门槛"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "赠彩金（元）",
            type: "number",
            field: "rewardAmount",
            precision: 2,
            required: true,
            validationLabel: "赠彩金"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增档位",
        ruleOptions: WIN_RATE_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: 100,
            gameTypes: [],
            baseConfigExtra: {
                dailyMaxApplyCount: 1
            },
            rewardItems: buildDefaultRows("胜率奖励", [{
                targetCount: 10,
                rewardAmount: 88,
                extraConfig: {
                    winRateThreshold: 55
                }
            }, {
                targetCount: 10,
                rewardAmount: 188,
                extraConfig: {
                    winRateThreshold: 60
                }
            }, {
                targetCount: 20,
                rewardAmount: 388,
                extraConfig: {
                    winRateThreshold: 55
                }
            }, {
                targetCount: 20,
                rewardAmount: 888,
                extraConfig: {
                    winRateThreshold: 60
                }
            }, {
                targetCount: 30,
                rewardAmount: 3888,
                extraConfig: {
                    winRateThreshold: 65
                }
            }]),
            ruleSwitches: buildDefaultRuleSwitches(WIN_RATE_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "胜率奖励" + (index + 1),
                targetCount: 0,
                rewardAmount: 0,
                enabled: true,
                extraConfig: {
                    winRateThreshold: 0
                }
            })
        }
    },
    "连续每日投注": {
        typeKey: "连续每日投注",
        baseCaption: "基础配置",
        showGameTypes: true,
        gameTypeLabel: "适用游戏类型（可多选）",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1.55fr 1fr 1.1fr 1fr 90px 64px",
        baseFields: [createBaseField({
            key: "dailyMinBetCount",
            source: "extra",
            label: "每日最少投注笔数",
            type: "number",
            precision: 0,
            tip: "当日有效投注达到N笔才视为“达标”"
        }), createBaseField({
            key: "dailyMinWinRoundCount",
            source: "extra",
            label: "每日最少获胜局数",
            type: "number",
            precision: 0,
            tip: "当日最少赢得N局才算完成"
        }), createBaseField({
            key: "minimumValidBet",
            label: "单笔最低有效投注（元）",
            type: "number",
            precision: 2,
            tip: "低于此金额的注单不计入笔数"
        })],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "input",
            field: "taskName",
            required: true,
            placeholder: "请输入任务名称"
        }), createRewardColumn({
            key: "targetCount",
            label: "连续达标天数",
            type: "number",
            field: "targetCount",
            precision: 0,
            required: true,
            prefix: "连续",
            suffix: "天",
            validationLabel: "连续达标天数"
        }), createRewardColumn({
            key: "accumulatedWinRoundCount",
            label: "期间最少获胜局数（累计）",
            type: "number",
            field: "extraConfig.accumulatedWinRoundCount",
            precision: 0,
            required: true,
            prefix: "≥",
            suffix: "局",
            validationLabel: "期间最少获胜局数"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "赠彩金（元）",
            type: "number",
            field: "rewardAmount",
            precision: 2,
            required: true,
            validationLabel: "赠彩金"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增档位",
        ruleOptions: DAILY_STREAK_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: 100,
            gameTypes: [],
            baseConfigExtra: {
                dailyMinBetCount: 10,
                dailyMinWinRoundCount: 6
            },
            rewardItems: buildDefaultRows("连续投注", [{
                targetCount: 3,
                rewardAmount: 188,
                extraConfig: {
                    accumulatedWinRoundCount: 5
                }
            }, {
                targetCount: 5,
                rewardAmount: 388,
                extraConfig: {
                    accumulatedWinRoundCount: 10
                }
            }, {
                targetCount: 7,
                rewardAmount: 888,
                extraConfig: {
                    accumulatedWinRoundCount: 10
                }
            }, {
                targetCount: 14,
                rewardAmount: 8888,
                extraConfig: {
                    accumulatedWinRoundCount: 15
                }
            }]),
            ruleSwitches: buildDefaultRuleSwitches(DAILY_STREAK_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "连续投注" + (index + 1),
                targetCount: 0,
                rewardAmount: 0,
                enabled: true,
                extraConfig: {
                    accumulatedWinRoundCount: 0
                }
            })
        }
    },
    "每日投注额度+笔数": {
        typeKey: "每日投注额度+笔数",
        baseCaption: "基础配置",
        showGameTypes: true,
        gameTypeLabel: "统计游戏类型（可多选）",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1.55fr 1fr 1fr 1fr 1fr 90px 64px",
        rewardNotice: "三项条件需同时满足方可领取对应档位奖励，取最高满足档位发放，每日限领一次。",
        baseFields: [createBaseField({
            key: "minimumValidBet",
            label: "单笔最低有效金额（元）",
            type: "number",
            precision: 2,
            tip: "低于此金额的注单不计入额度与笔数"
        }), createBaseField({
            key: "minimumValidOrderCount",
            source: "extra",
            label: "投注订单数最低有效笔数",
            type: "number",
            precision: 0,
            tip: "单日内有效订单数达到N笔才参与计算"
        }), createBaseField({
            key: "dailyResetTime",
            source: "extra",
            label: "每日统计重置时间",
            type: "select",
            options: DAILY_RESET_TIME_OPTIONS
        })],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "input",
            field: "taskName",
            required: true,
            placeholder: "请输入任务名称"
        }), createRewardColumn({
            key: "targetValidBetAmount",
            label: "每日有效投注额（元）",
            type: "number",
            field: "targetValidBetAmount",
            precision: 2,
            required: true,
            prefix: "≥",
            validationLabel: "每日有效投注额"
        }), createRewardColumn({
            key: "targetCount",
            label: "每日有效投注笔数",
            type: "number",
            field: "targetCount",
            precision: 0,
            required: true,
            prefix: "≥",
            suffix: "笔",
            validationLabel: "每日有效投注笔数"
        }), createRewardColumn({
            key: "dailyValidOrderCount",
            label: "每日有效订单数",
            type: "number",
            field: "extraConfig.dailyValidOrderCount",
            precision: 0,
            required: true,
            prefix: "≥",
            suffix: "单",
            validationLabel: "每日有效订单数"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "每日彩金（元）",
            type: "number",
            field: "rewardAmount",
            precision: 2,
            required: true,
            validationLabel: "每日彩金"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增档位",
        ruleOptions: DAILY_AMOUNT_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: 100,
            gameTypes: [],
            baseConfigExtra: {
                minimumValidOrderCount: 1,
                dailyResetTime: "00:00:00 (自然日)"
            },
            rewardItems: buildDefaultRows("每日任务", [{
                targetValidBetAmount: 500,
                targetCount: 10,
                rewardAmount: 8,
                extraConfig: {
                    dailyValidOrderCount: 5
                }
            }, {
                targetValidBetAmount: 1e3,
                targetCount: 20,
                rewardAmount: 28,
                extraConfig: {
                    dailyValidOrderCount: 10
                }
            }, {
                targetValidBetAmount: 3e3,
                targetCount: 30,
                rewardAmount: 88,
                extraConfig: {
                    dailyValidOrderCount: 20
                }
            }, {
                targetValidBetAmount: 5e3,
                targetCount: 50,
                rewardAmount: 188,
                extraConfig: {
                    dailyValidOrderCount: 30
                }
            }, {
                targetValidBetAmount: 1e4,
                targetCount: 80,
                rewardAmount: 388,
                extraConfig: {
                    dailyValidOrderCount: 50
                }
            }, {
                targetValidBetAmount: 3e4,
                targetCount: 100,
                rewardAmount: 808,
                extraConfig: {
                    dailyValidOrderCount: 80
                }
            }]),
            ruleSwitches: buildDefaultRuleSwitches(DAILY_AMOUNT_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "每日任务" + (index + 1),
                targetValidBetAmount: 0,
                targetCount: 0,
                rewardAmount: 0,
                enabled: true,
                extraConfig: {
                    dailyValidOrderCount: 0
                }
            })
        }
    },
    "新人礼": {
        typeKey: "新人礼",
        baseCaption: "",
        showGameTypes: false,
        gameTypeLabel: "",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "160px minmax(360px, 1fr) 220px 180px 90px 64px",
        baseFields: [],
        rewardColumns: [createRewardColumn({
            key: "taskName",
            label: "任务名称",
            type: "staticText",
            field: "taskName",
            required: true
        }), createRewardColumn({
            key: "conditionRequirement",
            label: "条件要求",
            type: "conditionDisplay",
            field: "extraConfig",
            required: true
        }), createRewardColumn({
            key: "taskSummary",
            label: "任务简介",
            type: "input",
            field: "taskSummary",
            maxlength: 500,
            placeholder: "请输入任务简介"
        }), createRewardColumn({
            key: "rewardAmount",
            label: "奖励内容",
            type: "number",
            field: "rewardAmount",
            precision: 0,
            required: true,
            suffix: "元",
            validationLabel: "奖励内容"
        }), createRewardColumn({
            key: "enabled",
            label: "启用",
            type: "switch",
            field: "enabled"
        }), createRewardColumn({
            key: "operate",
            label: "操作",
            type: "action"
        })],
        addButtonText: "新增累充奖励",
        ruleOptions: NEWCOMER_SWITCHES,
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: null,
            gameTypes: [],
            baseConfigExtra: {},
            rewardItems: buildNewcomerDefaults(),
            ruleSwitches: buildDefaultRuleSwitches(NEWCOMER_SWITCHES),
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createNewcomerRewardItem("5", Math.max(index - 4, 1))
        },
        validateRewardItem: function(item, index) {
            var extra = item.extraConfig || {};
            if (!item.taskName) {
                return "第" + (index + 1) + "个奖励档位名称不能为空"
            }
            if (!String(item.taskSummary || "").trim()) {
                return resolveRewardItemDisplayName(item, index) + "的任务简介不能为空"
            }
            if (!isPositiveIntegerValue(item.rewardAmount)) {
                return "第" + (index + 1) + "个奖励档位的奖励内容必须是大于0的整数"
            }
            if (extra.validDays === null || extra.validDays === undefined || Number(extra.validDays) <= 0) {
                return "第" + (index + 1) + "个奖励档位的注册有效期必须大于0"
            }
            if (extra.taskCode === "firstDeposit" || extra.taskCode === "cumulativeDeposit" || extra.taskCode === "cumulativeDepositCustom") {
                if (!isPositiveIntegerValue(extra.accumulatedDeposit)) {
                    return "第" + (index + 1) + "个奖励档位的累计存款金额必须是大于0的整数"
                }
            }
            if (extra.taskCode === "withdrawal") {
                if (extra.withdrawalCount === null || extra.withdrawalCount === undefined || Number(extra.withdrawalCount) <= 0) {
                    return "第" + (index + 1) + "个奖励档位的取款次数必须大于0"
                }
            }
            if (extra.taskCode === "active") {
                if (extra.signInDays === null || extra.signInDays === undefined || Number(extra.signInDays) <= 0) {
                    return "第" + (index + 1) + "个奖励档位的签到天数必须大于0"
                }
                if (!isPositiveIntegerValue(extra.dailyDeposit)) {
                    return "第" + (index + 1) + "个奖励档位的每日累计存款必须是大于0的整数"
                }
                if (!isPositiveIntegerValue(extra.dailyValidBet)) {
                    return "第" + (index + 1) + "个奖励档位的每日有效投注必须是大于0的整数"
                }
            }
            if (extra.taskCode === "revive") {
                if (!isPositiveIntegerValue(extra.negativeProfit)) {
                    return "第" + (index + 1) + "个奖励档位的累计负盈利必须是大于0的整数"
                }
            }
            return ""
        },
        validate: function(form) {
            var items = Array.isArray(form.rewardItems) ? form.rewardItems : [];
            var usedTaskKeys = new Set;
            var maxTaskSeqMap = {};
            var taskSeqMap = {};
            var firstDepositThresholds = [];
            var cumulativeDepositThresholds = [];
            var expectedFirstDepositValidDays = null;
            var expectedCumulativeValidDays = null;
            var previousFirstDepositReward = null;
            var previousCumulativeReward = null;
            for (var index = 0; index < items.length; index++) {
                var item = items[index];
                var rowError = this.validateRewardItem(item, index);
                if (rowError) {
                    return rowError
                }
                var extra = item.extraConfig || {};
                var validDays = Number(extra.validDays);
                if (Number.isNaN(validDays)) {
                    return "第" + (index + 1) + "个奖励档位的注册有效期不能为空"
                }
                var taskType = Number(normalizeNewcomerTaskTypeValue(extra.taskType));
                var taskSeq = Number(normalizeNewcomerTaskSeqValue(extra.taskType, extra.taskSeq, (maxTaskSeqMap[taskType] || 0) + 1));
                var taskKey = String(taskType) + "#" + String(taskSeq);
                if (usedTaskKeys.has(taskKey)) {
                    return "第" + (index + 1) + "个奖励档位的任务类型和序号重复"
                }
                usedTaskKeys.add(taskKey);
                maxTaskSeqMap[taskType] = Math.max(maxTaskSeqMap[taskType] || 0, taskSeq);
                if (!taskSeqMap[taskType]) {
                    taskSeqMap[taskType] = []
                }
                taskSeqMap[taskType].push(taskSeq);
                if (taskType === 1) {
                    firstDepositThresholds.push({
                        taskSeq: taskSeq,
                        amount: Number(extra.accumulatedDeposit)
                    });
                    if (expectedFirstDepositValidDays === null) {
                        expectedFirstDepositValidDays = validDays
                    } else if (validDays !== expectedFirstDepositValidDays) {
                        return "首充奖励的注册后有效期天数必须一致"
                    }
                    var firstDepositRewardAmount = Number(item.rewardAmount);
                    if (previousFirstDepositReward !== null && firstDepositRewardAmount <= previousFirstDepositReward) {
                        return "首充奖励金额必须大于前一档位的首充奖励金额"
                    }
                    previousFirstDepositReward = firstDepositRewardAmount
                }
                if (taskType === 5) {
                    cumulativeDepositThresholds.push({
                        taskSeq: taskSeq,
                        amount: Number(extra.accumulatedDeposit)
                    })
                }
                if (!Number.isNaN(taskType) && taskType === 5) {
                    if (expectedCumulativeValidDays === null) {
                        expectedCumulativeValidDays = validDays
                    } else if (validDays !== expectedCumulativeValidDays) {
                        return "累充奖励的注册后有效期天数必须一致"
                    }
                    var rewardAmount = Number(item.rewardAmount);
                    if (previousCumulativeReward !== null && rewardAmount <= previousCumulativeReward) {
                        return "累充奖励金额必须大于前一档位的累充奖励金额"
                    }
                    previousCumulativeReward = rewardAmount
                }
            }
            var firstDepositSeqList = Array.isArray(taskSeqMap[1]) ? taskSeqMap[1].slice().sort(function(left, right) {
                return left - right
            }) : [];
            var cumulativeSeqList = Array.isArray(taskSeqMap[5]) ? taskSeqMap[5].slice().sort(function(left, right) {
                return left - right
            }) : [];
            if (!firstDepositSeqList.length) {
                return "首充奖励必须至少保留一个"
            }
            if (!cumulativeSeqList.length) {
                return "累充奖励必须至少保留一个"
            }
            for (var firstDepositIndex = 0; firstDepositIndex < firstDepositSeqList.length; firstDepositIndex++) {
                if (firstDepositSeqList[firstDepositIndex] !== firstDepositIndex + 1) {
                    return "首充奖励只能从最大的task_seq开始删除"
                }
            }
            for (var cumulativeIndex = 0; cumulativeIndex < cumulativeSeqList.length; cumulativeIndex++) {
                if (cumulativeSeqList[cumulativeIndex] !== cumulativeIndex + 1) {
                    return "累充奖励只能从最大的task_seq开始删除"
                }
            }
            firstDepositThresholds.sort(function(left, right) {
                return left.taskSeq - right.taskSeq
            });
            for (var firstDepositThresholdIndex = 1; firstDepositThresholdIndex < firstDepositThresholds.length; firstDepositThresholdIndex++) {
                if (firstDepositThresholds[firstDepositThresholdIndex].amount <= firstDepositThresholds[firstDepositThresholdIndex - 1].amount) {
                    return "首充奖励的新人首充存款金额必须大于前一档位"
                }
            }
            cumulativeDepositThresholds.sort(function(left, right) {
                return left.taskSeq - right.taskSeq
            });
            for (var cumulativeThresholdIndex = 1; cumulativeThresholdIndex < cumulativeDepositThresholds.length; cumulativeThresholdIndex++) {
                if (cumulativeDepositThresholds[cumulativeThresholdIndex].amount <= cumulativeDepositThresholds[cumulativeThresholdIndex - 1].amount) {
                    return "累充奖励的累计存款金额必须大于前一档位"
                }
            }
            return ""
        }
    },
    "签到": {
        typeKey: "签到",
        baseCaption: "副标题：有效投注达标后即可签到，领取对应奖励",
        showGameTypes: false,
        gameTypeLabel: "",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1fr",
        baseFields: [],
        rewardColumns: [],
        addButtonText: "添加档位",
        ruleOptions: [],
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "每日累计",
            minimumValidBet: null,
            gameTypes: [],
            baseConfigExtra: {
                sameTierRepeatable: false,
                signinMethod: "固定自然周",
                activityDays: 7
            },
            rewardItems: [createSigninRewardItem({
                taskName: "签到档位1",
                targetValidBetAmount: 3888,
                weekdayRewards: {
                    1: 6,
                    2: 6,
                    3: 7,
                    4: 7,
                    5: 8,
                    6: 8,
                    7: 10
                },
                fullSignReward: 88
            }), createSigninRewardItem({
                taskName: "签到档位2",
                targetValidBetAmount: 18888,
                weekdayRewards: {
                    1: 28,
                    2: 28,
                    3: 36,
                    4: 36,
                    5: 42,
                    6: 42,
                    7: 48
                },
                fullSignReward: 188
            }), createSigninRewardItem({
                taskName: "签到档位3",
                targetValidBetAmount: 58888,
                weekdayRewards: {
                    1: 88,
                    2: 88,
                    3: 108,
                    4: 108,
                    5: 128,
                    6: 128,
                    7: 148
                },
                fullSignReward: 388
            }), createSigninRewardItem({
                taskName: "签到档位4",
                targetValidBetAmount: 188888,
                weekdayRewards: {
                    1: 288,
                    2: 288,
                    3: 328,
                    4: 328,
                    5: 388,
                    6: 388,
                    7: 458
                },
                fullSignReward: 888
            })],
            ruleSwitches: {},
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createSigninRewardItem({
                taskName: "签到档位" + (index + 1),
                targetValidBetAmount: 100,
                weekdayRewards: {
                    1: 100,
                    2: 100,
                    3: 100,
                    4: 100,
                    5: 100,
                    6: 100,
                    7: 100
                },
                fullSignReward: 200
            })
        },
        validate: function(form) {
            var items = Array.isArray(form.rewardItems) ? form.rewardItems : [];
            if (!items.length) {
                return "请至少配置一个奖励档位"
            }
            if (items.length > 6) {
                return "奖励档位最多支持配置6个档位！"
            }
            if (!String(form.venueType || "").trim()) {
                return "请选择适用游戏类型"
            }
            var previousBet = null;
            for (var index = 0; index < items.length; index++) {
                var item = items[index];
                var minValidBet = Number(item && item.targetValidBetAmount);
                if (!Number.isFinite(minValidBet) || minValidBet <= 0) {
                    return "第" + (index + 1) + "个奖励档位的每日有效投注额必须大于0"
                }
                if (previousBet !== null && minValidBet <= previousBet) {
                    return "第" + (index + 1) + "个奖励档位的每日有效投注额必须大于前一档位"
                }
                previousBet = minValidBet;
                var weekdayRewards = item && item.extraConfig && item.extraConfig.weekdayRewards ? item.extraConfig.weekdayRewards : {};
                for (var weekdayIndex = 0; weekdayIndex < SIGNIN_WEEKDAYS.length; weekdayIndex++) {
                    var weekday = SIGNIN_WEEKDAYS[weekdayIndex];
                    var reward = Number(weekdayRewards[weekday]);
                    if (!Number.isFinite(reward) || reward < 0) {
                        return "第" + (index + 1) + "个奖励档位的签到奖励不能为空"
                    }
                }
                if (String(form.fullSignFlg) === "1") {
                    var fullSignReward = Number(item && item.extraConfig ? item.extraConfig.fullSignReward : 0);
                    if (!Number.isFinite(fullSignReward) || fullSignReward < 0) {
                        return "第" + (index + 1) + "个奖励档位的满签奖励不能为空"
                    }
                }
            }
            return ""
        }
    },
    "首存活动": {
        typeKey: "首存活动",
        baseCaption: "",
        showGameTypes: false,
        gameTypeLabel: "",
        editorPlaceholder: DEFAULT_EDITOR_PLACEHOLDER,
        rewardGridTemplate: "1fr",
        baseFields: [],
        rewardColumns: [],
        addButtonText: "添加",
        ruleOptions: [],
        defaults: {
            crossTypeCombined: false,
            statisticalPeriod: "活动期间内累计",
            minimumValidBet: null,
            gameTypes: [],
            baseConfigExtra: {
                activityCategory: [],
                activityTag: "",
                displayDevices: ["all", "web", "appH5"],
                activityPeriod: "fixed",
                displayTimeRange: [],
                activityTimeRange: [],
                applyMode: "accountOnce",
                specialOffer: "0",
                venueWalletType: "rmb",
                selectedSites: ["wc"],
                venueSelections: {},
                rmbVenues: [],
                giftType: "percent",
                webContentMode: "popup",
                h5ModuleTop: "0",
                webListImage: "",
                h5ListImage: "",
                h5ShareImage: "",
                h5MainImage: "",
                webDetail: "",
                mobileDetail: ""
            },
            rewardItems: [
                createRewardItem({
                    taskName: "首存奖励1",
                    targetValidBetAmount: null,
                    rewardAmount: null,
                    targetCount: null,
                    extraConfig: {
                        giftRate: null,
                        giftLimit: null,
                        turnoverMultiple: null
                    }
                }),
                createRewardItem({
                    taskName: "首存奖励2",
                    targetValidBetAmount: null,
                    rewardAmount: null,
                    targetCount: null,
                    extraConfig: {
                        giftRate: null,
                        giftLimit: null,
                        turnoverMultiple: null
                    }
                }),
                createRewardItem({
                    taskName: "首存奖励3",
                    targetValidBetAmount: null,
                    rewardAmount: null,
                    targetCount: null,
                    extraConfig: {
                        giftRate: null,
                        giftLimit: null,
                        turnoverMultiple: null
                    }
                })
            ],
            ruleSwitches: {},
            activityDetail: ""
        },
        createRewardItem: function(index) {
            return createRewardItem({
                taskName: "首存奖励" + (index + 1),
                targetValidBetAmount: null,
                rewardAmount: null,
                targetCount: null,
                enabled: true,
                extraConfig: {
                    giftRate: null,
                    giftLimit: null,
                    turnoverMultiple: null
                }
            })
        },
        validate: function(form) {
            var extra = form && form.baseConfigExtra ? form.baseConfigExtra : {};
            if (!String(form && form.activityName || "").trim()) {
                return "请输入活动标题"
            }
            if (!Array.isArray(extra.activityCategory) || !extra.activityCategory.length) {
                return "请选择活动分类"
            }
            if (!String(extra.activityTag || "").trim()) {
                return "请选择活动标签"
            }
            var displayDevices = Array.isArray(extra.displayDevices) ? extra.displayDevices : [];
            if (!displayDevices.length) {
                return "请选择展示设备"
            }
            var selectedSites = Array.isArray(extra.selectedSites) ? extra.selectedSites : [];
            if (!selectedSites.length) {
                return "请选择站点"
            }
            var venueSelections = extra.venueSelections && typeof extra.venueSelections === "object" ? extra.venueSelections : {};
            var hasVenue = selectedSites.some(function(siteValue) {
                var values = Array.isArray(venueSelections[siteValue]) ? venueSelections[siteValue] : [];
                return values.some(function(value) {
                    return value !== "all"
                })
            });
            if (!hasVenue) {
                return "请选择活动场馆"
            }
            var items = Array.isArray(form && form.rewardItems) ? form.rewardItems : [];
            if (!items.length) {
                return "请至少配置一个首存奖励档位"
            }
            return ""
        }
    }
};

function findDefaultRewardItemByTaskCode(schema, source) {
    if (!source || !source.extraConfig || !source.extraConfig.taskCode) {
        return null
    }
    var taskCode = source.extraConfig.taskCode;
    return (schema.defaults.rewardItems || []).find(function(item) {
        return item.extraConfig && item.extraConfig.taskCode === taskCode
    }) || null
}

function normalizeNewcomerTaskType(value, taskCode, index) {
    var normalized = normalizeNewcomerTaskTypeValue(value);
    if (/^\d+$/.test(normalized)) {
        return normalized
    }
    var taskCodeMap = {
        realName: "0",
        firstDeposit: "1",
        withdrawal: "2",
        active: "3",
        revive: "4",
        cumulativeDeposit: "5",
        cumulativeDepositCustom: "5"
    };
    if (taskCode && taskCodeMap[taskCode]) {
        return taskCodeMap[taskCode]
    }
    return index <= 5 ? String(index) : "5"
}

function taskCodeOfNewcomerTaskType(taskType) {
    if (taskType === "0") {
        return "realName"
    }
    if (taskType === "1") {
        return "firstDeposit"
    }
    if (taskType === "2") {
        return "withdrawal"
    }
    if (taskType === "3") {
        return "active"
    }
    if (taskType === "4") {
        return "revive"
    }
    return "cumulativeDepositCustom"
}

function normalizeNewcomerRewardItem(item, index, optionSources) {
    var extraConfig = Object.assign({}, item.extraConfig || {});
    var taskType = normalizeNewcomerTaskType(extraConfig.taskType, extraConfig.taskCode, index);
    var taskSeq = normalizeNewcomerTaskSeqValue(extraConfig.taskType, extraConfig.taskSeq, 1);
    extraConfig.taskType = taskType;
    extraConfig.taskSeq = taskSeq;
    extraConfig.taskCode = taskCodeOfNewcomerTaskType(taskType);
    return createRewardItem(Object.assign({}, item, {
        taskName: buildNewcomerTaskLabel(taskType, taskSeq, optionSources, item.taskName),
        extraConfig: extraConfig
    }))
}

function normalizeRewardItems(activityType, rewardItems, optionSources) {
    var schema = getActivityTypeSchema(activityType, optionSources);
    var normalizedType = normalizeActivityTypeValue(activityType, optionSources);
    if (!Array.isArray(rewardItems) || !rewardItems.length) {
        return (schema.defaults.rewardItems || []).map(function(item, index) {
            var next = createRewardItem(deepClone(item));
            return normalizedType === "新人礼" ? normalizeNewcomerRewardItem(next, index, optionSources) : next
        })
    }
    return rewardItems.map(function(item, index) {
        var fallback = findDefaultRewardItemByTaskCode(schema, item) || (schema.defaults.rewardItems || [])[index] || schema.createRewardItem(index);
        var next = createRewardItem({
            taskName: item && item.taskName != null ? item.taskName : fallback.taskName,
            targetCount: item && item.targetCount != null ? item.targetCount : fallback.targetCount,
            targetValidBetAmount: item && item.targetValidBetAmount != null ? item.targetValidBetAmount : fallback.targetValidBetAmount,
            rewardAmount: item && item.rewardAmount != null ? item.rewardAmount : fallback.rewardAmount,
            taskSummary: item && item.taskSummary != null ? item.taskSummary : fallback.taskSummary,
            enabled: item && item.enabled !== undefined ? item.enabled : fallback.enabled,
            extraConfig: Object.assign({}, deepClone(fallback.extraConfig || {}), deepClone(item && item.extraConfig ? item.extraConfig : {}))
        });
        return normalizedType === "新人礼" ? normalizeNewcomerRewardItem(next, index, optionSources) : next
    })
}

function normalizeActivityTypeLabel(value) {
    var normalized = String(value || "").trim();
    if (!normalized) {
        return ""
    }
    return ACTIVITY_TYPE_ALIASES[normalized] || normalized
}

function normalizeActivityTypeOptionSources(optionSources) {
    if (Array.isArray(optionSources)) {
        return optionSources
    }
    if (optionSources && Array.isArray(optionSources.activityTypes)) {
        return optionSources.activityTypes
    }
    return []
}

function buildActivityTypeDictMaps(optionSources) {
    var options = normalizeActivityTypeOptionSources(optionSources);
    var valueToLabel = {};
    var labelToValue = {};
    options.forEach(function(item) {
        if (!item) {
            return
        }
        var value = item.value === undefined || item.value === null ? "" : String(item.value).trim();
        var rawLabel = item.label === undefined || item.label === null ? "" : String(item.label).trim();
        var label = normalizeActivityTypeLabel(rawLabel || value);
        if (!label) {
            return
        }
        if (value) {
            valueToLabel[value] = label
        }
        if (rawLabel) {
            valueToLabel[rawLabel] = label
        }
        valueToLabel[label] = label;
        if (value && !labelToValue[label]) {
            labelToValue[label] = value
        }
        if (rawLabel && value && !labelToValue[rawLabel]) {
            labelToValue[rawLabel] = value
        }
    });
    return {
        valueToLabel: valueToLabel,
        labelToValue: labelToValue
    }
}
export function normalizeActivityTypeValue(value, optionSources) {
    var normalized = String(value || "").trim();
    if (!normalized) {
        return "连胜"
    }
    var dictMaps = buildActivityTypeDictMaps(optionSources);
    return dictMaps.valueToLabel[normalized] || normalizeActivityTypeLabel(normalized)
}
export function resolveActivityTypeRequestValue(value, optionSources) {
    var rawValue = String(value || "").trim();
    if (!rawValue) {
        var defaultOptions = normalizeActivityTypeOptionSources(optionSources);
        return defaultOptions.length && defaultOptions[0].value !== undefined ? String(defaultOptions[0].value) : ""
    }
    var normalized = normalizeActivityTypeValue(rawValue, optionSources);
    var dictMaps = buildActivityTypeDictMaps(optionSources);
    if (dictMaps.labelToValue[normalized]) {
        return dictMaps.labelToValue[normalized]
    }
    return rawValue
}
export function getActivityTypeSchema(value, optionSources) {
    var key = normalizeActivityTypeValue(value, optionSources);
    return TYPE_SCHEMAS[key] || TYPE_SCHEMAS["连胜"]
}
export function getActivityTypeDescription(value, optionSources) {
    var key = normalizeActivityTypeValue(value, optionSources);
    return TYPE_DESCRIPTION_MAP[key] || "适用于活动任务及奖励配置。"
}
export function cloneActivityTypeState(state) {
    return deepClone(state) || {}
}

function resolveAvailableGameTypeOptions(optionSources) {
    var items = optionSources && Array.isArray(optionSources.gameTypeOptions) ? optionSources.gameTypeOptions : [];
    return items.map(function(item) {
        if (typeof item === "string") {
            return item
        }
        return item && (item.value || item.label)
    }).filter(function(item) {
        return !!item
    })
}

function resolveDefaultGameTypes(defaults, optionSources) {
    var fallback = deepClone(defaults || []);
    var available = resolveAvailableGameTypeOptions(optionSources);
    if (!available.length) {
        return fallback
    }
    return fallback.filter(function(item) {
        return available.indexOf(item) > -1
    })
}

function resolveFirstOptionValue(options, fallback) {
    if (Array.isArray(options) && options.length && options[0] && options[0].value !== undefined && options[0].value !== null && options[0].value !== "") {
        return options[0].value
    }
    return fallback
}

function resolveDefaultBaseConfigExtra(activityType, defaults, optionSources) {
    var normalizedType = normalizeActivityTypeValue(activityType, optionSources);
    var next = Object.assign({}, deepClone(defaults || {}));
    if (normalizedType === "累充") {
        next.sameTierRepeatable = resolveFirstOptionValue(optionSources && optionSources.sameTierRepeatOptions, next.sameTierRepeatable);
        next.stackHighTierReward = resolveFirstOptionValue(optionSources && optionSources.stackHighTierOptions, next.stackHighTierReward)
    }
    if (normalizedType === "每日投注额度+笔数") {
        next.dailyResetTime = resolveFirstOptionValue(optionSources && optionSources.dailyResetTimeOptions, next.dailyResetTime)
    }
    return next
}

function normalizeBooleanLike(value, fallback) {
    if (value === undefined || value === null || value === "") {
        return fallback
    }
    if (typeof value === "boolean") {
        return value
    }
    if (typeof value === "number") {
        return value !== 0
    }
    var text = String(value).trim().toLowerCase();
    if (text === "1" || text === "true" || text === "y") {
        return true
    }
    if (text === "0" || text === "false" || text === "n") {
        return false
    }
    return fallback
}

function normalizeNumericLike(value, fallback) {
    if (value === undefined || value === null || value === "") {
        return fallback
    }
    var next = Number(value);
    return Number.isNaN(next) ? value : next
}

function resolveActivityTypeTemplate(activityType, optionSources) {
    var key = normalizeActivityTypeValue(activityType, optionSources);
    var templates = optionSources && optionSources.activityTypeConfigTemplates ? optionSources.activityTypeConfigTemplates : {};
    return templates && templates[key] ? deepClone(templates[key]) : null
}

function resolveTemplateBaseConfigMap(template) {
    var result = {};
    var items = template && Array.isArray(template.baseConfig) ? template.baseConfig : [];
    items.forEach(function(item) {
        if (item && item.code) {
            result[item.code] = deepClone(item.value)
        }
    });
    return result
}

function resolveTemplateBaseConfigExtra(activityType, baseConfigValues, defaults, optionSources) {
    var normalizedType = normalizeActivityTypeValue(activityType, optionSources);
    var next = resolveDefaultBaseConfigExtra(activityType, defaults || {}, optionSources);
    Object.keys(baseConfigValues || {}).forEach(function(key) {
        if (TEMPLATE_FIXED_KEYS.indexOf(key) === -1) {
            next[key] = normalizeNumericLike(baseConfigValues[key], baseConfigValues[key])
        }
    });
    if (normalizedType === "累充") {
        next.sameTierRepeatable = normalizeBooleanLike(next.sameTierRepeatable, resolveFirstOptionValue(optionSources && optionSources.sameTierRepeatOptions, next.sameTierRepeatable));
        next.stackHighTierReward = normalizeBooleanLike(next.stackHighTierReward, resolveFirstOptionValue(optionSources && optionSources.stackHighTierOptions, next.stackHighTierReward))
    }
    if (normalizedType === "每日投注额度+笔数") {
        next.dailyResetTime = next.dailyResetTime || resolveFirstOptionValue(optionSources && optionSources.dailyResetTimeOptions, next.dailyResetTime)
    }
    return next
}

function resolveTemplateRewardItems(activityType, schema, template, optionSources) {
    var items = template && Array.isArray(template.bonusConfig) ? template.bonusConfig : [];
    if (!items.length) {
        var normalizedType = normalizeActivityTypeValue(activityType, optionSources);
        var defaults = normalizedType === "新人礼" ? buildNewcomerDefaults(optionSources) : schema.defaults.rewardItems || [];
        return normalizeRewardItems(activityType, defaults, optionSources)
    }
    var resolved = items.map(function(item, index) {
        var sourceExtra = deepClone(item && (item.extra_config || item.extraConfig) ? item.extra_config || item.extraConfig : {});
        var fallback = findDefaultRewardItemByTaskCode(schema, {
            extraConfig: sourceExtra
        }) || (schema.defaults.rewardItems || [])[index] || schema.createRewardItem(index);
        return {
            taskName: item && (item.task_name || item.taskName || item.name) ? item.task_name || item.taskName || item.name : fallback.taskName,
            targetCount: normalizeNumericLike(item && (item.target_count !== undefined ? item.target_count : item.targetCount), fallback.targetCount),
            targetValidBetAmount: normalizeNumericLike(item && (item.target_valid_bet_amount !== undefined ? item.target_valid_bet_amount : item.targetValidBetAmount), fallback.targetValidBetAmount),
            rewardAmount: normalizeNumericLike(item && (item.reward_amount !== undefined ? item.reward_amount : item.rewardAmount), fallback.rewardAmount),
            enabled: normalizeBooleanLike(item && (item.status !== undefined ? item.status : item.enabled), fallback.enabled),
            extraConfig: Object.assign({}, deepClone(fallback.extraConfig || {}), sourceExtra)
        }
    });
    return normalizeRewardItems(activityType, resolved, optionSources)
}

function resolveTemplateRuleSwitches(schema, template) {
    var items = template && Array.isArray(template.enableConfig) ? template.enableConfig : [];
    if (!items.length) {
        return Object.assign({}, schema.defaults.ruleSwitches || {})
    }
    var result = {};
    items.forEach(function(item) {
        var key = item && (item.code || item.key);
        if (key) {
            result[key] = normalizeBooleanLike(item.status !== undefined ? item.status : item.enabled, true)
        }
    });
    return Object.keys(result).length ? result : Object.assign({}, schema.defaults.ruleSwitches || {})
}
export function createDefaultActivityTypeState(activityType, optionSources) {
    var schema = getActivityTypeSchema(activityType, optionSources);
    var normalizedType = normalizeActivityTypeValue(activityType, optionSources);
    var template = resolveActivityTypeTemplate(activityType, optionSources);
    if (template) {
        var baseConfigValues = resolveTemplateBaseConfigMap(template);
        return {
            crossTypeCombined: normalizeBooleanLike(baseConfigValues.crossTypeCombined, resolveFirstOptionValue(optionSources && optionSources.crossTypeCombinedOptions, schema.defaults.crossTypeCombined)),
            statisticalPeriod: baseConfigValues.statisticalPeriod || resolveFirstOptionValue(optionSources && optionSources.statisticalPeriodOptions, schema.defaults.statisticalPeriod),
            minimumValidBet: normalizeNumericLike(baseConfigValues.minimumValidBet, schema.defaults.minimumValidBet),
            gameTypes: resolveDefaultGameTypes(Array.isArray(baseConfigValues.gameTypes) ? baseConfigValues.gameTypes : schema.defaults.gameTypes || [], optionSources),
            baseConfigExtra: resolveTemplateBaseConfigExtra(activityType, baseConfigValues, schema.defaults.baseConfigExtra || {}, optionSources),
            rewardItems: resolveTemplateRewardItems(activityType, schema, template, optionSources),
            ruleSwitches: resolveTemplateRuleSwitches(schema, template),
            activityDetail: schema.defaults.activityDetail || ""
        }
    }
    return {
        crossTypeCombined: resolveFirstOptionValue(optionSources && optionSources.crossTypeCombinedOptions, schema.defaults.crossTypeCombined),
        statisticalPeriod: resolveFirstOptionValue(optionSources && optionSources.statisticalPeriodOptions, schema.defaults.statisticalPeriod),
        minimumValidBet: schema.defaults.minimumValidBet,
        gameTypes: resolveDefaultGameTypes(schema.defaults.gameTypes || [], optionSources),
        baseConfigExtra: resolveDefaultBaseConfigExtra(activityType, schema.defaults.baseConfigExtra || {}, optionSources),
        rewardItems: normalizeRewardItems(activityType, normalizedType === "新人礼" ? buildNewcomerDefaults(optionSources) : schema.defaults.rewardItems || [], optionSources),
        ruleSwitches: Object.assign({}, schema.defaults.ruleSwitches || {}),
        activityDetail: schema.defaults.activityDetail || ""
    }
}
export function createNormalizedActivityTypeState(activityType, partialState, optionSources) {
    var defaults = createDefaultActivityTypeState(activityType, optionSources);
    var partial = partialState || {};
    return {
        crossTypeCombined: partial.crossTypeCombined === undefined || partial.crossTypeCombined === null ? defaults.crossTypeCombined : partial.crossTypeCombined,
        statisticalPeriod: partial.statisticalPeriod || defaults.statisticalPeriod,
        minimumValidBet: partial.minimumValidBet === undefined ? defaults.minimumValidBet : partial.minimumValidBet,
        gameTypes: Array.isArray(partial.gameTypes) ? deepClone(partial.gameTypes) : defaults.gameTypes,
        baseConfigExtra: Object.assign({}, defaults.baseConfigExtra, deepClone(partial.baseConfigExtra || {})),
        rewardItems: normalizeRewardItems(activityType, partial.rewardItems, optionSources),
        ruleSwitches: Object.assign({}, defaults.ruleSwitches, deepClone(partial.ruleSwitches || {})),
        activityDetail: partial.activityDetail === undefined || partial.activityDetail === null ? defaults.activityDetail : partial.activityDetail
    }
}
export function getActivityTypeOptionsMap() {
    return TYPE_SCHEMAS
}
export function isActivityTypeUsingGameTypes(activityType, optionSources) {
    return !!getActivityTypeSchema(activityType, optionSources).showGameTypes
}

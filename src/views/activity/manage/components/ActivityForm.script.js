import ImageUpload from "@/components/ImageUpload";
import {
    addActivity,
    getActivity,
    listActivities,
    listActivityAgents,
    updateActivity
} from "@/api/activity/manage";
import ActivityTypeDynamicSections from "./ActivityTypeDynamicSections";
import ActivityFrontendDisplayFields from "./ActivityFrontendDisplayFields";
import FirstDepositActivityForm from "./FirstDepositActivityForm";
import {
    DAILY_RESET_TIME_OPTIONS,
    DEFAULT_TYPE_OPTIONS,
    SAME_TIER_REPEAT_OPTIONS,
    STACK_HIGH_TIER_OPTIONS,
    STATISTICAL_PERIOD_OPTIONS,
    getActivityTypeDescription,
    normalizeActivityTypeValue,
    resolveActivityTypeRequestValue
} from "./activityTypeSchemas";
const CROSS_TYPE_COMBINED_OPTIONS = [{
    value: false,
    label: "否（各类型独立）"
}, {
    value: true,
    label: "是（跨类型合并）"
}];
const DEFAULT_ACTIVITY_OBJECT_VALUE = "0";
const DEFAULT_ACTIVITY_THEME_VALUE = "0";
const WORLD_CUP_ACTIVITY_THEME_VALUE = "1";
const VIP_ACTIVITY_OBJECT_VALUE = "1";
const SEVEN_DAY_REGISTERED_ACTIVITY_OBJECT_VALUE = "2";
const AGENT_ACTIVITY_OBJECT_VALUE = "3";
const FALLBACK_VIP_LEVEL_VALUE = "0";
const COMMON_ACTIVITY_TYPE_VALUE = "30";
const NEWCOMER_ACTIVITY_TYPE_VALUE = "25";
const NEWCOMER_ACTIVITY_TYPE_LABEL = "新人礼";
const SIGNIN_ACTIVITY_TYPE_VALUE = "27";
const SIGNIN_ACTIVITY_TYPE_LABEL = "签到";
const FIRST_DEPOSIT_ACTIVITY_TYPE_VALUE = "26";
const FIRST_DEPOSIT_ACTIVITY_TYPE_LABEL = "首存活动";
const SIGNIN_CLAIM_RULE_VALUE = "1";
const ACTIVITY_NAME_PATTERN = /^[\u4e00-\u9fa5A-Za-z0-9]{2,12}$/;
const FRONTEND_ACTIVITY_OBJECT_OPTIONS = [{
    value: DEFAULT_ACTIVITY_OBJECT_VALUE,
    label: "全体会员"
}, {
    value: VIP_ACTIVITY_OBJECT_VALUE,
    label: "VIP会员"
}, {
    value: SEVEN_DAY_REGISTERED_ACTIVITY_OBJECT_VALUE,
    label: "7天内注册用户"
}, {
    value: AGENT_ACTIVITY_OBJECT_VALUE,
    label: "代理"
}];

function padNumber(value) {
    return value < 10 ? "0" + value : String(value)
}

function formatDateValue(date) {
    return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join("-")
}

function parseDateStart(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0)
    }
    const matched = String(value || "").trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (!matched) {
        return null
    }
    const year = Number(matched[1]);
    const month = Number(matched[2]);
    const day = Number(matched[3]);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null
    }
    return date
}

function isDateStarted(value, now) {
    const dateStart = parseDateStart(value);
    if (!dateStart) {
        return false
    }
    return (now || new Date).getTime() > dateStart.getTime()
}

function isDateBefore(leftValue, rightValue) {
    const leftDate = parseDateStart(leftValue);
    const rightDate = parseDateStart(rightValue);
    if (!leftDate || !rightDate) {
        return false
    }
    return leftDate.getTime() < rightDate.getTime()
}

function isDateBeforeToday(value, now) {
    return isDateBefore(value, formatDateValue(now || new Date))
}

function getMetaOptionList(meta, key) {
    if (meta && Array.isArray(meta[key])) {
        return meta[key]
    }
    return []
}

function resolveDefaultSiteCode(meta) {
    const currentSiteCode = meta && meta.currentSiteCode ? meta.currentSiteCode : "";
    const isSiteReadonly = !!(meta && meta.siteReadonly);
    if (isSiteReadonly) {
        return currentSiteCode
    }
    const siteOptions = getMetaOptionList(meta, "siteOptions");
    if (siteOptions.length) {
        return siteOptions[0].value || ""
    }
    return ""
}

function resolveFirstOptionValue(options, fallback) {
    if (Array.isArray(options) && options.length && options[0].value !== undefined && options[0].value !== null && options[0].value !== "") {
        return options[0].value
    }
    return fallback
}

function resolveDefaultClaimRuleValue(options) {
    const normalizedOptions = Array.isArray(options) ? options : [];
    const defaultOption = normalizedOptions.find(item => String(item && item.value) === "1");
    if (defaultOption && defaultOption.value !== undefined && defaultOption.value !== null && defaultOption.value !== "") {
        return String(defaultOption.value)
    }
    return String(resolveFirstOptionValue(normalizedOptions, "1"))
}

function isDefaultOption(option) {
    if (!option) {
        return false
    }
    if (option.isDefault === true) {
        return true
    }
    const raw = String(option.isDefault || option.default || "").trim().toLowerCase();
    return raw === "true" || raw === "1" || raw === "y"
}

function resolveFirstActivityTypeValue(meta) {
    const options = getMetaOptionList(meta, "activityTypes");
    if (options.length) {
        const defaultOption = options.find(item => isDefaultOption(item)) || options[0];
        return normalizeActivityTypeValue(defaultOption.value || defaultOption.label, meta)
    }
    return "连胜"
}

function normalizeActivityObject(value, options) {
    const normalized = String(value || "").trim();
    const normalizedOptions = Array.isArray(options) ? options : [];
    if (normalized && (!normalizedOptions.length || normalizedOptions.some(item => String(item.value) === normalized))) {
        return normalized
    }
    return String(resolveFirstOptionValue(normalizedOptions, DEFAULT_ACTIVITY_OBJECT_VALUE))
}

function normalizeSiteCodeArray(value) {
    const rawList = Array.isArray(value) ? value : String(value || "").split(/[,，\s]+/);
    return Array.from(new Set(rawList.map(item => String(item || "").trim()).filter(item => !!item)))
}

function normalizeStatusValue(value, options) {
    const normalized = value === null || value === undefined ? "" : String(value).trim();
    const normalizedOptions = Array.isArray(options) ? options : [];
    if (normalized && (!normalizedOptions.length || normalizedOptions.some(item => String(item.value) === normalized))) {
        return normalized
    }
    return String(resolveFirstOptionValue(normalizedOptions, "0"))
}

function normalizeVipLevelToken(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (!normalized) {
        return ""
    }
    if (/^VIP\d+$/.test(normalized)) {
        return normalized.replace(/^VIP/, "")
    }
    if (/^\d+$/.test(normalized)) {
        return normalized
    }
    return ""
}

function formatVipLevelOption(value) {
    const normalized = normalizeVipLevelToken(value);
    return normalized ? "VIP" + normalized : ""
}

function normalizeVipOptionValues(rawOptions) {
    if (!Array.isArray(rawOptions)) {
        return []
    }
    const mapped = rawOptions.map(function(item) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
            return normalizeVipLevelToken(item.value || item.label || item.vipLevel || "")
        }
        return normalizeVipLevelToken(item)
    }).filter(function(item) {
        return !!item
    });
    return Array.from(new Set(mapped)).sort(function(left, right) {
        return Number(left) - Number(right)
    })
}

function getVipLevelOptionsBySiteMap(meta) {
    const rawMap = meta && meta.vipLevelOptionsBySite && typeof meta.vipLevelOptionsBySite === "object" ? meta.vipLevelOptionsBySite : {};
    return Object.keys(rawMap).reduce(function(result, key) {
        result[key] = normalizeVipOptionValues(rawMap[key]);
        return result
    }, {})
}

function resolveVipLevelOptions(meta, siteCode) {
    const vipLevelOptionsBySite = getVipLevelOptionsBySiteMap(meta);
    const explicitSiteCode = String(siteCode || "").trim();
    const normalizedSiteCode = explicitSiteCode || resolveDefaultSiteCode(meta);
    if (normalizedSiteCode && Array.isArray(vipLevelOptionsBySite[normalizedSiteCode]) && vipLevelOptionsBySite[normalizedSiteCode].length) {
        return vipLevelOptionsBySite[normalizedSiteCode]
    }
    if (explicitSiteCode) {
        return [FALLBACK_VIP_LEVEL_VALUE]
    }
    const globalOptions = normalizeVipOptionValues(meta && meta.vipLevelOptions);
    if (globalOptions.length) {
        return globalOptions
    }
    return [FALLBACK_VIP_LEVEL_VALUE]
}

function isSameStringArray(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false
    }
    return left.every(function(item, index) {
        return item === right[index]
    })
}

function normalizeVipLevels(value, allowedOptions) {
    const rawList = Array.isArray(value) ? value : String(value || "").split(/[\s,，]+/);
    const allowSet = new Set(normalizeVipOptionValues(allowedOptions));
    const mapped = rawList.map(function(item) {
        return normalizeVipLevelToken(item)
    }).filter(function(item) {
        if (!item) {
            return false
        }
        return !allowSet.size || allowSet.has(item)
    });
    return Array.from(new Set(mapped))
}

function normalizeAgentIdToken(value) {
    const normalized = String(value || "").trim();
    const matched = normalized.match(/^\d+/);
    return matched ? matched[0] : ""
}

function normalizeAgentIds(value) {
    const rawList = Array.isArray(value) ? value : String(value || "").split(/[\s,，]+/);
    const mapped = rawList.map(function(item) {
        return normalizeAgentIdToken(item)
    }).filter(function(item) {
        return !!item
    });
    return Array.from(new Set(mapped)).sort(function(left, right) {
        return Number(left) - Number(right)
    })
}

function cloneAgentTreeData(nodes) {
    if (!Array.isArray(nodes)) {
        return []
    }
    return nodes.map(function(node) {
        return {
            value: node && node.value !== undefined && node.value !== null ? String(node.value) : "",
            label: node && node.label ? node.label : "",
            name: node && node.name ? node.name : "",
            parentValue: node && node.parentValue !== undefined && node.parentValue !== null ? String(node.parentValue) : "",
            children: cloneAgentTreeData(node && node.children)
        }
    })
}

function normalizeDateKey(value) {
    const matched = String(value || "").trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (!matched) {
        return ""
    }
    return [matched[1], padNumber(Number(matched[2])), padNumber(Number(matched[3]))].join("-")
}

function createDefaultForm(meta) {
    const activityObjectOptions = getMetaOptionList(meta, "activityObjectOptions");
    const claimRuleOptions = getMetaOptionList(meta, "claimRuleOptions");
    const statusOptions = getMetaOptionList(meta, "statusOptions");
    return {
        id: null,
        activityCode: "",
        activityName: "",
        activityType: resolveFirstActivityTypeValue(meta),
        activityObject: normalizeActivityObject(resolveFirstOptionValue(activityObjectOptions, DEFAULT_ACTIVITY_OBJECT_VALUE), activityObjectOptions),
        activityTheme: DEFAULT_ACTIVITY_THEME_VALUE,
        siteCode: normalizeSiteCodeArray(resolveDefaultSiteCode(meta)),
        activityBeginTime: formatDateValue(new Date),
        activityEndTime: "",
        withdrawBetMultiple: 1,
        activitySort: 1,
        hotSort: 1,
        activityIntroduction: "",
        activityPictureUrl: "",
        activityListPictureUrl: "",
        homePopupPictureUrl: "",
        activityDetailPictureUrl: "",
        claimTime: 7,
        claimRule: resolveDefaultClaimRuleValue(claimRuleOptions),
        fullSignFlg: "0",
        venueType: "",
        gameTypes: [],
        activityDetail: "",
        crossTypeCombined: false,
        statisticalPeriod: "活动期间内累计",
        minimumValidBet: null,
        baseConfigExtra: {},
        rewardItems: [],
        ruleSwitches: {},
        status: normalizeStatusValue(null, statusOptions),
        vipLevel: [],
        agentCode: [],
        remark: ""
    }
}

function createRequiredNumberRule(fieldLabel) {
    return {
        validator: (rule, value, callback) => {
            if (value === "" || value === null || value === undefined) {
                callback(new Error("请输入" + fieldLabel));
                return
            }
            callback()
        },
        trigger: "change"
    }
}

function createPositiveNumberRule(fieldLabel) {
    return {
        validator: (rule, value, callback) => {
            if (value === "" || value === null || value === undefined) {
                callback(new Error("请输入" + fieldLabel));
                return
            }
            var numericValue = Number(value);
            if (Number.isNaN(numericValue) || numericValue <= 0) {
                callback(new Error(fieldLabel + "必须大于0"));
                return
            }
            callback()
        },
        trigger: "change"
    }
}

function createActivityNameRule(vm) {
    return {
        required: true,
        validator: (rule, value, callback) => {
            const text = String(value || "").trim();
            if (!text) {
                callback(new Error("请输入活动名称"));
                return
            }
            if (vm && vm.isEdit) {
                callback();
                return
            }
            if (!ACTIVITY_NAME_PATTERN.test(text)) {
                callback(new Error("活动名称请输入2-12个汉字或英文数字"));
                return
            }
            callback()
        },
        trigger: "blur"
    }
}

function createRequiredTextRule(fieldLabel, trigger, messagePrefix) {
    return {
        required: true,
        validator: (rule, value, callback) => {
            if (!String(value || "").trim()) {
                callback(new Error((messagePrefix || "请输入") + fieldLabel));
                return
            }
            callback()
        },
        trigger: trigger || "blur"
    }
}

function createRequiredTextMaxLengthRule(fieldLabel, maxLength) {
    return {
        required: true,
        validator: (rule, value, callback) => {
            const text = String(value || "").trim();
            if (!text) {
                callback(new Error("请输入" + fieldLabel));
                return
            }
            if (Array.from(text).length > maxLength) {
                callback(new Error(fieldLabel + "最多输入" + maxLength + "个字符"));
                return
            }
            callback()
        },
        trigger: "blur"
    }
}

function createActivityEndTimeRule(vm) {
    return {
        validator: (rule, value, callback) => {
            const endTime = String(value || "").trim();
            if (!endTime) {
                callback();
                return
            }
            if (isDateBefore(endTime, vm && vm.form ? vm.form.activityBeginTime : "")) {
                callback(new Error("活动结束时间不能小于开始时间"));
                return
            }
            callback()
        },
        trigger: "change"
    }
}

function createActivityBeginTimeRule(vm) {
    return {
        required: true,
        validator: (rule, value, callback) => {
            const beginTime = String(value || "").trim();
            if (!beginTime) {
                callback(new Error("请选择活动开始时间"));
                return
            }
            if (vm && vm.isEdit && vm.isActivityBeginTimeLocked) {
                callback();
                return
            }
            if (isDateBeforeToday(beginTime)) {
                callback(new Error("活动开始时间不能小于今天"));
                return
            }
            callback()
        },
        trigger: "change"
    }
}

function normalizeDisplayOptions(rawOptions, fallback) {
    if (Array.isArray(rawOptions) && rawOptions.length) {
        return rawOptions.map(item => ({
            value: item && item.value !== undefined && item.value !== null ? item.value : "",
            label: item && item.label ? item.label : String(item && item.value !== undefined ? item.value : ""),
            description: item && item.description ? item.description : ""
        }))
    }
    return (fallback || []).map(item => Object.assign({}, item))
}

function normalizeBooleanOptions(rawOptions, fallback) {
    if (Array.isArray(rawOptions) && rawOptions.length) {
        return rawOptions.map(item => ({
            value: String(item.value) === "1",
            label: item.label || String(item.value || "")
        }))
    }
    return (fallback || []).map(item => Object.assign({}, item))
}

function normalizeStringValueOptions(rawOptions, fallback) {
    return normalizeDisplayOptions(rawOptions, fallback).map(item => ({
        value: item.value,
        label: item.label,
        description: item.description
    }))
}

function normalizeActivityTypeOptions(rawOptions) {
    if (Array.isArray(rawOptions) && rawOptions.length) {
        const optionSources = {
            activityTypes: rawOptions
        };
        return rawOptions.map(item => {
            const value = resolveActivityTypeRequestValue(item.value || item.label, optionSources);
            const rawLabel = item && item.label ? item.label : "";
            const normalized = normalizeActivityTypeValue(rawLabel || item.value || value, optionSources);
            return {
                value: value,
                label: rawLabel || normalized,
                description: getActivityTypeDescription(normalized, optionSources),
                isDefault: isDefaultOption(item)
            }
        })
    }
    return DEFAULT_TYPE_OPTIONS.map((item, index) => Object.assign({}, item, {
        isDefault: index === 0
    }))
}

function normalizeGameTypeOptions(rawOptions) {
    if (Array.isArray(rawOptions) && rawOptions.length) {
        return rawOptions.map(item => {
            if (item && typeof item === "object" && !Array.isArray(item)) {
                const value = String(item.value || item.label || "").trim();
                const label = String(item.label || item.value || "").trim();
                return {
                    value: value,
                    label: label || value
                }
            }
            const value = String(item || "").trim();
            return {
                value: value,
                label: value
            }
        }).filter(item => !!item.value)
    }
    return []
}
export default {
    name: "ActivityForm",
    components: {
        ActivityTypeDynamicSections: ActivityTypeDynamicSections,
        ActivityFrontendDisplayFields: ActivityFrontendDisplayFields,
        FirstDepositActivityForm: FirstDepositActivityForm,
        ImageUpload: ImageUpload
    },
    props: {
        mode: {
            type: String,
            default: "create"
        },
        activityId: {
            type: [String, Number],
            default: null
        },
        initialActivityType: {
            type: String,
            default: ""
        },
        meta: {
            type: Object,
            default: function() {
                return {}
            }
        }
    },
    data() {
        return {
            loading: false,
            saving: false,
            agentSelectorVisible: false,
            agentTreeLoading: false,
            agentTreeKeyword: "",
            agentTreeData: [],
            agentTreeCache: {},
            relatedActivityRecords: [],
            activityTypeTouched: false,
            persistedActivityType: "",
            originalActivityBeginTime: "",
            form: createDefaultForm(this.meta),
            rules: {
                activityName: [createActivityNameRule(this)],
                siteCode: [{
                    validator: (rule, value, callback) => {
                        if (!normalizeSiteCodeArray(value).length) {
                            callback(new Error("请选择站点"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }],
                activityType: [{
                    validator: (rule, value, callback) => {
                        const rawValue = String(value || "").trim();
                        if (!rawValue) {
                            callback(new Error("请选择活动类型"));
                            return
                        }
                        const normalized = normalizeActivityTypeValue(rawValue, this.meta);
                        const matched = this.activityTypeOptions.some(item => normalizeActivityTypeValue(item.value, this.meta) === normalized);
                        if (!matched) {
                            callback(new Error("请选择活动类型"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }],
                activityObject: [{
                    validator: (rule, value, callback) => {
                        const rawValue = String(value || "").trim();
                        if (!rawValue) {
                            callback(new Error("请选择活动对象"));
                            return
                        }
                        if (this.activityObjectOptions.length && !this.activityObjectOptions.some(item => item.value === rawValue)) {
                            callback(new Error("请选择活动对象"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }],
                activityTheme: [{
                    required: true,
                    message: "请选择活动主题",
                    trigger: "change"
                }],
                status: [{
                    validator: (rule, value, callback) => {
                        const rawValue = String(value === null || value === undefined ? "" : value).trim();
                        if (!rawValue) {
                            callback(new Error("请选择活动状态"));
                            return
                        }
                        if (this.statusOptions.length && !this.statusOptions.some(item => item.value === rawValue)) {
                            callback(new Error("请选择活动状态"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }],
                activityBeginTime: [createActivityBeginTimeRule(this)],
                activityEndTime: [createActivityEndTimeRule(this)],
                withdrawBetMultiple: [createPositiveNumberRule("提现流水倍数")],
                activitySort: [createPositiveNumberRule("活动排序")],
                hotSort: [createPositiveNumberRule("热门排序")],
                activityIntroduction: [createRequiredTextMaxLengthRule("活动简介", 500)],
                activityPictureUrl: [createRequiredTextRule("活动图片", "change", "请上传")],
                activityListPictureUrl: [createRequiredTextRule("列表图片", "change", "请上传")],
                activityDetail: [createRequiredTextRule("活动文案")],
                claimTime: [createPositiveNumberRule("达标后可领取时间")],
                claimRule: [{
                    required: true,
                    message: "请选择领取规则",
                    trigger: "change"
                }],
                vipLevel: [{
                    validator: (rule, value, callback) => {
                        if (this.isVipObject && (!Array.isArray(value) || !value.length)) {
                            callback(new Error("请选择VIP等级"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }],
                agentCode: [{
                    validator: (rule, value, callback) => {
                        if (this.isAgentObject && (!Array.isArray(value) || !value.length)) {
                            callback(new Error("请选择代理名称"));
                            return
                        }
                        callback()
                    },
                    trigger: "change"
                }]
            }
        }
    },
    computed: {
        isEdit() {
            return this.mode === "edit"
        },
        isSiteReadonly() {
            return !!(this.meta && this.meta.siteReadonly)
        },
        siteOptions() {
            return normalizeDisplayOptions(this.meta && this.meta.siteOptions, [])
        },
        selectedSiteCodes() {
            return normalizeSiteCodeArray(this.form.siteCode)
        },
        objectSelectorSiteCode() {
            return this.selectedSiteCodes[0] || ""
        },
        activityTypeOptions() {
            return normalizeActivityTypeOptions(DEFAULT_TYPE_OPTIONS).filter(item => String(item.value) !== COMMON_ACTIVITY_TYPE_VALUE)
        },
        activityObjectOptions() {
            if (this.isFrontendDisplayActivity) {
                return FRONTEND_ACTIVITY_OBJECT_OPTIONS
            }
            return normalizeStringValueOptions(this.meta && this.meta.activityObjectOptions, [])
        },
        activityThemeOptions() {
            if (this.isSigninActivity) {
                return [{
                    value: DEFAULT_ACTIVITY_THEME_VALUE,
                    label: "通用"
                }, {
                    value: WORLD_CUP_ACTIVITY_THEME_VALUE,
                    label: "世界杯"
                }]
            }
            return normalizeStringValueOptions(this.meta && this.meta.activityThemeOptions, [{
                value: DEFAULT_ACTIVITY_THEME_VALUE,
                label: "通用"
            }])
        },
        canEditActivityTheme() {
            return this.isSigninActivity
        },
        statusOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.statusOptions, [])
        },
        vipLevelOptions() {
            return resolveVipLevelOptions(this.meta, this.objectSelectorSiteCode)
        },
        claimRuleOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.claimRuleOptions, [])
        },
        displayClaimRuleOptions() {
            if (this.isSigninActivity) {
                return [{
                    value: SIGNIN_CLAIM_RULE_VALUE,
                    label: "只能领取最高档"
                }]
            }
            return this.claimRuleOptions
        },
        isSigninActivity() {
            return normalizeActivityTypeValue(this.form.activityType, this.meta) === SIGNIN_ACTIVITY_TYPE_LABEL || resolveActivityTypeRequestValue(this.form.activityType, this.meta) === SIGNIN_ACTIVITY_TYPE_VALUE
        },
        isFrontendDisplayActivity() {
            const normalizedType = normalizeActivityTypeValue(this.form.activityType, this.meta);
            const requestType = resolveActivityTypeRequestValue(this.form.activityType, this.meta);
            return normalizedType === NEWCOMER_ACTIVITY_TYPE_LABEL || requestType === NEWCOMER_ACTIVITY_TYPE_VALUE || this.isSigninActivity
        },
        isFirstDepositActivity() {
            return normalizeActivityTypeValue(this.form.activityType, this.meta) === FIRST_DEPOSIT_ACTIVITY_TYPE_LABEL || resolveActivityTypeRequestValue(this.form.activityType, this.meta) === FIRST_DEPOSIT_ACTIVITY_TYPE_VALUE || String(this.form.activityType || "").trim() === FIRST_DEPOSIT_ACTIVITY_TYPE_VALUE
        },
        isClaimRuleSelectable() {
            return !this.isSigninActivity && !!String(this.form.activityEndTime || "").trim()
        },
        crossTypeCombinedOptions() {
            return normalizeBooleanOptions(this.meta && this.meta.crossTypeCombinedOptions, CROSS_TYPE_COMBINED_OPTIONS)
        },
        statisticalPeriodOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.statisticalPeriodOptions, STATISTICAL_PERIOD_OPTIONS)
        },
        gameTypeOptions() {
            return normalizeGameTypeOptions(this.meta && this.meta.gameTypeOptions)
        },
        newMemberTaskTypeOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.newMemberTaskTypeOptions, [])
        },
        sameTierRepeatOptions() {
            return normalizeBooleanOptions(this.meta && this.meta.sameTierRepeatOptions, SAME_TIER_REPEAT_OPTIONS)
        },
        stackHighTierOptions() {
            return normalizeBooleanOptions(this.meta && this.meta.stackHighTierOptions, STACK_HIGH_TIER_OPTIONS)
        },
        dailyResetTimeOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.dailyResetTimeOptions, DAILY_RESET_TIME_OPTIONS)
        },
        fullSignFlgOptions() {
            return normalizeStringValueOptions(this.meta && this.meta.fullSignFlgOptions, [{
                value: "0",
                label: "无满签奖励"
            }, {
                value: "1",
                label: "有满签奖励"
            }])
        },
        dynamicOptionSources() {
            return {
                crossTypeCombinedOptions: this.crossTypeCombinedOptions,
                statisticalPeriodOptions: this.statisticalPeriodOptions,
                gameTypeOptions: this.gameTypeOptions,
                sameTierRepeatOptions: this.sameTierRepeatOptions,
                stackHighTierOptions: this.stackHighTierOptions,
                dailyResetTimeOptions: this.dailyResetTimeOptions,
                activityTypes: this.activityTypeOptions,
                newMemberTaskTypeOptions: this.newMemberTaskTypeOptions,
                fullSignFlgOptions: this.fullSignFlgOptions,
                activityTypeConfigTemplates: this.meta && this.meta.activityTypeConfigTemplates ? this.meta.activityTypeConfigTemplates : {}
            }
        },
        displayActivityTypeOptions() {
            return this.activityTypeOptions.map(item => ({
                value: item.value,
                label: item.label || item.value,
                description: item.description || getActivityTypeDescription(item.value, this.meta)
            }))
        },
        selectedActivityTypeOption() {
            const currentType = normalizeActivityTypeValue(this.form.activityType, this.meta);
            return this.displayActivityTypeOptions.find(item => normalizeActivityTypeValue(item.value, this.meta) === currentType) || null
        },
        selectedActivityTypeLabel() {
            return this.selectedActivityTypeOption ? this.selectedActivityTypeOption.label : this.form.activityType || "-"
        },
        selectedActivityTypeDescription() {
            return this.selectedActivityTypeOption ? this.selectedActivityTypeOption.description : ""
        },
        isVipObject() {
            return this.form.activityObject === VIP_ACTIVITY_OBJECT_VALUE
        },
        isAgentObject() {
            return this.form.activityObject === AGENT_ACTIVITY_OBJECT_VALUE
        },
        isActivityBeginTimeLocked() {
            return this.isEdit && isDateStarted(this.originalActivityBeginTime)
        },
        activityBeginPickerOptions() {
            return {
                disabledDate: time => isDateBeforeToday(time)
            }
        },
        activityEndPickerOptions() {
            return {
                disabledDate: time => isDateBefore(time, this.form.activityBeginTime)
            }
        },
        agentSelectorDisabled() {
            return !this.objectSelectorSiteCode
        },
        agentSelectionSummary() {
            if (!Array.isArray(this.form.agentCode) || !this.form.agentCode.length) {
                return ""
            }
            const labelMap = {};
            const walk = nodes => {
                if (!Array.isArray(nodes)) {
                    return
                }
                nodes.forEach(node => {
                    if (!node || !node.value) {
                        return
                    }
                    labelMap[String(node.value)] = this.formatAgentLabel(node);
                    walk(node.children)
                })
            };
            walk(this.agentTreeCache[this.objectSelectorSiteCode] || this.agentTreeData);
            const labels = this.form.agentCode.map(item => labelMap[String(item)] || String(item));
            if (labels.length <= 2) {
                return labels.join("，")
            }
            return labels.slice(0, 2).join("，") + " 等" + labels.length + "项"
        },
        filteredAgentOptions() {
            const keyword = String(this.agentTreeKeyword || "").trim().toLowerCase();
            if (!keyword) {
                return this.agentFlatOptions
            }
            return this.agentFlatOptions.filter(item => {
                const value = String(item.value || "").toLowerCase();
                const name = String(item.name || "").toLowerCase();
                const parentLabel = String(item.parentLabel || "").toLowerCase();
                return value.indexOf(keyword) > -1 || name.indexOf(keyword) > -1 || parentLabel.indexOf(keyword) > -1
            })
        },
        agentFlatOptions() {
            const rows = [];
            const walk = (nodes, parentNode) => {
                if (!Array.isArray(nodes)) {
                    return
                }
                nodes.forEach(node => {
                    if (!node || !node.value) {
                        return
                    }
                    const children = Array.isArray(node.children) ? node.children : [];
                    rows.push({
                        value: String(node.value),
                        name: node.name || "",
                        label: this.formatAgentLabel(node),
                        parentValue: parentNode && parentNode.value ? String(parentNode.value) : "",
                        parentLabel: parentNode && parentNode.value ? this.formatAgentNameOnly(parentNode) : "-",
                        childCount: children.length
                    });
                    walk(children, node)
                })
            };
            walk(this.agentTreeData, null);
            return rows
        },
        hasActivityPicture() {
            return !!(this.form.activityPictureUrl && String(this.form.activityPictureUrl).trim())
        },
        hasActivityListPicture() {
            return !!(this.form.activityListPictureUrl && String(this.form.activityListPictureUrl).trim())
        },
        hasHomePopupPicture() {
            return !!(this.form.homePopupPictureUrl && String(this.form.homePopupPictureUrl).trim())
        }
    },
    watch: {
        activityId: {
            immediate: true,
            handler(val) {
                if (this.isEdit && val) {
                    this.loadDetail()
                }
            }
        },
        meta: {
            deep: true,
            handler() {
                if (this.isEdit) {
                    this.syncVipLevelSelection();
                    return
                }
                this.syncMetaDefaults()
            }
        },
        "form.siteCode": {
            deep: true,
            handler() {
                if (!this.isEdit && this.isVipObject) {
                    this.form.vipLevel = []
                } else {
                    this.syncVipLevelSelection()
                }
                if (this.isAgentObject) {
                    this.agentTreeKeyword = "";
                    if (!this.isEdit) {
                        this.form.agentCode = []
                    }
                    this.agentTreeData = [];
                    if (this.agentSelectorVisible || this.isEdit && this.form.agentCode.length) {
                        this.loadAgentTree(this.objectSelectorSiteCode)
                    }
                }
                this.$nextTick(() => {
                    if (this.$refs.form) {
                        this.$refs.form.clearValidate(["siteCode", "vipLevel", "agentCode"])
                    }
                })
            }
        },
        "form.activityObject"(val) {
            if (val !== VIP_ACTIVITY_OBJECT_VALUE) {
                this.form.vipLevel = []
            } else if (!this.isEdit) {
                this.form.vipLevel = []
            } else {
                this.syncVipLevelSelection()
            }
            if (val !== AGENT_ACTIVITY_OBJECT_VALUE) {
                this.form.agentCode = [];
                this.agentTreeKeyword = "";
                this.agentTreeData = [];
                this.agentSelectorVisible = false
            } else if (!this.isEdit) {
                this.form.agentCode = []
            } else {
                this.loadAgentTree(this.objectSelectorSiteCode)
            }
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate(["vipLevel", "agentCode"])
                }
            })
        },
        "form.activityEndTime"() {
            this.syncClaimRuleState();
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.validateField("activityEndTime")
                }
            })
        },
        "form.activityType"() {
            this.syncClaimRuleState();
            this.syncActivityThemeState()
        },
        "form.activityBeginTime"() {
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.validateField("activityEndTime")
                }
            })
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.syncMetaDefaults();
            this.syncDynamicSectionsState()
        })
    },
    methods: {
        getVipLevelOptions(siteCode) {
            return resolveVipLevelOptions(this.meta, siteCode)
        },
        formatVipLevelOption: formatVipLevelOption,
        formatAgentLabel(node) {
            if (!node || !node.value) {
                return ""
            }
            const value = String(node.value);
            const name = String(node.name || "").trim();
            if (name) {
                return value + "：" + name
            }
            return String(node.label || value).replace(":", "：")
        },
        formatAgentNameOnly(node) {
            if (!node) {
                return ""
            }
            const name = String(node.name || "").trim();
            if (name) {
                return name
            }
            const label = String(node.label || "").trim();
            const separatorIndex = label.indexOf("：") > -1 ? label.indexOf("：") : label.indexOf(":");
            if (separatorIndex > -1) {
                return label.slice(separatorIndex + 1).trim()
            }
            return label
        },
        syncVipLevelSelection() {
            if (!this.isVipObject) {
                return
            }
            const options = this.getVipLevelOptions(this.objectSelectorSiteCode);
            const nextVipLevels = normalizeVipLevels(this.form.vipLevel, options);
            if (!isSameStringArray(nextVipLevels, this.form.vipLevel)) {
                this.form.vipLevel = nextVipLevels
            }
        },
        applyAgentTreeData(siteCode, treeData) {
            this.agentTreeData = cloneAgentTreeData(treeData)
        },
        async loadAgentTree(siteCode) {
            const normalizedSiteCode = String(siteCode || "").trim();
            if (!normalizedSiteCode) {
                this.agentTreeData = [];
                return
            }
            const cachedTree = this.agentTreeCache[normalizedSiteCode];
            if (cachedTree) {
                this.applyAgentTreeData(normalizedSiteCode, cachedTree);
                return
            }
            this.agentTreeData = [];
            this.agentTreeLoading = true;
            try {
                const res = await listActivityAgents(normalizedSiteCode);
                const treeData = cloneAgentTreeData(res && res.data || []);
                this.agentTreeCache = Object.assign({}, this.agentTreeCache, {
                    [normalizedSiteCode]: treeData
                });
                this.applyAgentTreeData(normalizedSiteCode, treeData)
            } finally {
                this.agentTreeLoading = false
            }
        },
        findAgentNodeById(agentId, nodes) {
            if (!agentId || !Array.isArray(nodes)) {
                return null
            }
            for (let index = 0; index < nodes.length; index += 1) {
                const node = nodes[index];
                if (!node) {
                    continue
                }
                if (String(node.value) === String(agentId)) {
                    return node
                }
                const matched = this.findAgentNodeById(agentId, node.children);
                if (matched) {
                    return matched
                }
            }
            return null
        },
        findAgentAncestorIds(agentId, nodes, ancestors) {
            if (!agentId || !Array.isArray(nodes)) {
                return []
            }
            const currentAncestors = Array.isArray(ancestors) ? ancestors : [];
            for (let index = 0; index < nodes.length; index += 1) {
                const node = nodes[index];
                if (!node || !node.value) {
                    continue
                }
                if (String(node.value) === String(agentId)) {
                    return currentAncestors.map(item => String(item.value))
                }
                const matched = this.findAgentAncestorIds(agentId, node.children, currentAncestors.concat(node));
                if (matched.length) {
                    return matched
                }
            }
            return []
        },
        collectAgentIdsFromNode(node) {
            if (!node || !node.value) {
                return []
            }
            const children = Array.isArray(node.children) ? node.children : [];
            return [String(node.value)].concat(...children.map(child => this.collectAgentIdsFromNode(child)))
        },
        isAgentSelected(row) {
            const value = row && row.value ? String(row.value) : "";
            return !!value && Array.isArray(this.form.agentCode) && this.form.agentCode.includes(value)
        },
        isAgentLockedByAncestor(row) {
            const value = row && row.value ? String(row.value) : "";
            if (!value || !Array.isArray(this.form.agentCode) || !this.form.agentCode.length) {
                return false
            }
            const selectedIds = normalizeAgentIds(this.form.agentCode);
            return this.findAgentAncestorIds(value, this.agentTreeData).some(item => selectedIds.includes(item))
        },
        handleAgentSelectorTrigger() {
            if (!this.objectSelectorSiteCode) {
                this.$message.warning("请先选择站点")
            }
        },
        handleAgentSelectorOpen() {
            this.agentTreeKeyword = "";
            this.loadAgentTree(this.objectSelectorSiteCode)
        },
        handleAgentSelectorClose() {
            this.agentTreeKeyword = ""
        },
        toggleAgentSelection(row, checked) {
            if (!checked && this.isAgentLockedByAncestor(row)) {
                return
            }
            const node = this.findAgentNodeById(row && row.value, this.agentTreeData);
            const relatedIds = normalizeAgentIds(this.collectAgentIdsFromNode(node));
            const currentIds = normalizeAgentIds(this.form.agentCode);
            const nextIds = checked ? currentIds.concat(relatedIds) : currentIds.filter(item => !relatedIds.includes(item));
            this.form.agentCode = normalizeAgentIds(nextIds);
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate(["agentCode"])
                }
            })
        },
        resolveLeadingActivityType() {
            const firstCard = Array.isArray(this.displayActivityTypeOptions) && this.displayActivityTypeOptions.length ? this.displayActivityTypeOptions[0] : null;
            return normalizeActivityTypeValue(firstCard && (firstCard.value || firstCard.label) || resolveFirstActivityTypeValue(this.meta), this.meta)
        },
        resolveInitialActivityType() {
            const initialType = String(this.initialActivityType || "").trim();
            if (!initialType) {
                return ""
            }
            const normalizedInitialType = normalizeActivityTypeValue(initialType, this.meta);
            const matchedType = this.activityTypeOptions.find(item => normalizeActivityTypeValue(item.value, this.meta) === normalizedInitialType || normalizeActivityTypeValue(item.label, this.meta) === normalizedInitialType);
            return matchedType ? normalizeActivityTypeValue(matchedType.value || matchedType.label, this.meta) : ""
        },
        syncMetaDefaults() {
            if (this.isEdit) {
                return
            }
            if (this.isSiteReadonly) {
                this.form.siteCode = normalizeSiteCodeArray(this.meta.currentSiteCode || "")
            } else {
                const validSiteCodes = normalizeSiteCodeArray(this.form.siteCode).filter(siteCode => this.siteOptions.some(item => item.value === siteCode));
                this.form.siteCode = validSiteCodes.length ? validSiteCodes : normalizeSiteCodeArray(resolveDefaultSiteCode(this.meta))
            }
            this.syncVipLevelSelection();
            const normalizedActivityObject = normalizeActivityObject(this.form.activityObject, this.activityObjectOptions);
            if (!this.activityObjectOptions.some(item => item.value === normalizedActivityObject)) {
                this.form.activityObject = normalizeActivityObject(resolveFirstOptionValue(this.activityObjectOptions, DEFAULT_ACTIVITY_OBJECT_VALUE), this.activityObjectOptions)
            } else if (this.form.activityObject !== normalizedActivityObject) {
                this.form.activityObject = normalizedActivityObject
            }
            this.syncClaimRuleState();
            this.syncActivityThemeState();
            const normalizedStatus = normalizeStatusValue(this.form.status, this.statusOptions);
            if (this.form.status !== normalizedStatus) {
                this.form.status = normalizedStatus
            }
            const defaultActivityType = this.resolveInitialActivityType() || resolveFirstActivityTypeValue(this.meta);
            const hasMatchedActivityType = this.activityTypeOptions.some(item => normalizeActivityTypeValue(item.value, this.meta) === normalizeActivityTypeValue(this.form.activityType, this.meta));
            if (!hasMatchedActivityType || !this.activityTypeTouched && normalizeActivityTypeValue(this.form.activityType, this.meta) !== normalizeActivityTypeValue(defaultActivityType, this.meta)) {
                this.form.activityType = defaultActivityType;
                this.$nextTick(() => {
                    if (this.$refs.form) {
                        this.$refs.form.clearValidate(["activityType"])
                    }
                    this.syncDynamicSectionsState()
                })
            }
        },
        isTypeCardActive(value) {
            return normalizeActivityTypeValue(value, this.meta) === normalizeActivityTypeValue(this.form.activityType, this.meta)
        },
        handleSelectActivityType(value) {
            if (this.isEdit) {
                return
            }
            const previousValue = this.form.activityType;
            const nextValue = normalizeActivityTypeValue(value, this.meta);
            if (normalizeActivityTypeValue(previousValue, this.meta) === nextValue) {
                return
            }
            if (this.$refs.dynamicSections) {
                this.$refs.dynamicSections.handleTypeChange(previousValue, nextValue)
            }
            this.form.activityType = nextValue;
            this.activityTypeTouched = true;
            this.syncClaimRuleState();
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate(["activityType"]);
                    this.$refs.form.validateField("activityType")
                }
            })
        },
        syncClaimRuleState() {
            const defaultClaimRule = this.isSigninActivity ? SIGNIN_CLAIM_RULE_VALUE : resolveDefaultClaimRuleValue(this.claimRuleOptions);
            const currentClaimRule = this.form.claimRule === null || this.form.claimRule === undefined ? "" : String(this.form.claimRule);
            const hasCurrentOption = this.displayClaimRuleOptions.some(item => String(item.value) === currentClaimRule);
            if (!this.isClaimRuleSelectable) {
                if (currentClaimRule !== defaultClaimRule) {
                    this.form.claimRule = defaultClaimRule
                }
            } else if (!hasCurrentOption) {
                this.form.claimRule = defaultClaimRule
            }
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate(["claimRule"])
                }
            })
        },
        syncActivityThemeState() {
            if (!this.canEditActivityTheme) {
                this.form.activityTheme = DEFAULT_ACTIVITY_THEME_VALUE
            }
        },
        normalizeRewardItems(items) {
            if (!Array.isArray(items)) {
                return []
            }
            return items.map(item => ({
                taskName: item.taskName || "",
                targetCount: item.targetCount,
                targetValidBetAmount: item.targetValidBetAmount,
                rewardAmount: item.rewardAmount,
                taskSummary: item.taskSummary || "",
                enabled: item.enabled !== false,
                extraConfig: Object.assign({}, item.extraConfig || {})
            }))
        },
        syncDynamicSectionsState() {
            if (this.$refs.dynamicSections) {
                this.$refs.dynamicSections.resetTypeCache(this.form.activityType)
            }
        },
        applyForm(data) {
            const next = createDefaultForm(this.meta);
            const persistedActivityType = normalizeActivityTypeValue(data.activityType || next.activityType, this.meta);
            const preferredActivityType = normalizeActivityTypeValue(this.initialActivityType || persistedActivityType, this.meta);
            next.id = data.id || null;
            next.activityCode = data.activityCode || "";
            next.activityName = data.activityName || "";
            next.activityType = preferredActivityType || this.resolveLeadingActivityType();
            next.activityObject = normalizeActivityObject(data.activityObject, this.activityObjectOptions);
            next.activityTheme = (normalizeActivityTypeValue(next.activityType, this.meta) === SIGNIN_ACTIVITY_TYPE_LABEL || resolveActivityTypeRequestValue(next.activityType, this.meta) === SIGNIN_ACTIVITY_TYPE_VALUE) && data.activityTheme != null ? String(data.activityTheme) : DEFAULT_ACTIVITY_THEME_VALUE;
            next.siteCode = this.isSiteReadonly ? normalizeSiteCodeArray(this.meta.currentSiteCode || "") : normalizeSiteCodeArray(data.siteCode || resolveDefaultSiteCode(this.meta));
            next.activityBeginTime = data.activityBeginTime || next.activityBeginTime;
            next.activityEndTime = data.activityEndTime || "";
            next.withdrawBetMultiple = data.withdrawBetMultiple == null ? next.withdrawBetMultiple : data.withdrawBetMultiple;
            next.activitySort = data.activitySort == null ? next.activitySort : data.activitySort;
            next.hotSort = data.hotSort == null ? next.hotSort : data.hotSort;
            next.activityIntroduction = data.activityIntroduction || "";
            next.activityPictureUrl = data.activityPictureUrl || "";
            next.activityListPictureUrl = data.activityListPictureUrl || "";
            next.homePopupPictureUrl = data.homePopupPictureUrl || "";
            next.activityDetailPictureUrl = data.activityDetailPictureUrl || "";
            next.claimTime = data.claimTime == null ? next.claimTime : data.claimTime;
            next.claimRule = data.claimRule || next.claimRule;
            next.fullSignFlg = data.fullSignFlg == null ? next.fullSignFlg : String(data.fullSignFlg);
            next.venueType = data.venueType || "";
            next.gameTypes = Array.isArray(data.gameTypes) ? data.gameTypes.slice() : [];
            next.activityDetail = data.activityDetail || "";
            next.crossTypeCombined = data.crossTypeCombined == null ? next.crossTypeCombined : data.crossTypeCombined;
            next.statisticalPeriod = data.statisticalPeriod || next.statisticalPeriod;
            next.minimumValidBet = data.minimumValidBet == null ? next.minimumValidBet : data.minimumValidBet;
            next.baseConfigExtra = Object.assign({}, data.baseConfigExtra || {});
            next.rewardItems = this.normalizeRewardItems(data.rewardItems);
            next.ruleSwitches = Object.assign({}, data.ruleSwitches || {});
            next.activityTypeStates = data.activityTypeStates || {};
            next.status = normalizeStatusValue(data.status == null ? next.status : data.status, this.statusOptions);
            const vipLevelOptions = this.getVipLevelOptions(normalizeSiteCodeArray(next.siteCode)[0] || "");
            next.vipLevel = next.activityObject === VIP_ACTIVITY_OBJECT_VALUE ? normalizeVipLevels(data.vipLevel, vipLevelOptions) : [];
            next.agentCode = next.activityObject === AGENT_ACTIVITY_OBJECT_VALUE ? normalizeAgentIds(data.agentCode) : [];
            next.remark = data.remark || "";
            this.persistedActivityType = persistedActivityType;
            this.activityTypeTouched = false;
            this.originalActivityBeginTime = next.activityBeginTime;
            this.form = next;
            this.$nextTick(() => {
                this.syncClaimRuleState();
                if (this.$refs.form) {
                    this.$refs.form.clearValidate()
                }
                this.syncMetaDefaults();
                if (next.activityObject === AGENT_ACTIVITY_OBJECT_VALUE && next.agentCode.length) {
                    this.loadAgentTree(this.objectSelectorSiteCode)
                }
                if (this.$refs.dynamicSections && data && data.activityTypeStates && Object.keys(data.activityTypeStates).length) {
                    this.$refs.dynamicSections.importTypeStates(data.activityTypeStates, next.activityType)
                } else {
                    this.syncDynamicSectionsState()
                }
            })
        },
        async loadDetail() {
            if (!this.activityId) {
                return
            }
            this.loading = true;
            try {
                const currentType = resolveActivityTypeRequestValue(this.initialActivityType || this.form.activityType, this.meta);
                const res = await getActivity(this.activityId, {
                    activityType: currentType
                });
                const detail = res && res.data || {};
                this.applyForm(detail);
                await this.loadRelatedActivityRecords(detail)
            } catch (error) {
                console.error("Failed to backfill activity detail", error);
                this.$message.error("活动详情回填失败")
            } finally {
                this.loading = false
            }
        },
        async loadRelatedActivityRecords(detail) {
            const activityName = String(detail && detail.activityName ? detail.activityName : "").trim();
            const activityBeginTime = normalizeDateKey(detail && detail.activityBeginTime);
            const activityType = resolveActivityTypeRequestValue(detail && detail.activityType ? detail.activityType : this.persistedActivityType || this.form.activityType, this.meta);
            const defaultSelectedSiteCodes = this.isSiteReadonly ? normalizeSiteCodeArray(this.meta && this.meta.currentSiteCode) : normalizeSiteCodeArray(detail && detail.siteCode);
            if (!activityName) {
                this.relatedActivityRecords = this.buildFallbackRelatedRecords(detail);
                this.form.siteCode = defaultSelectedSiteCodes;
                return
            }
            try {
                const res = await listActivities({
                    pageNum: 1,
                    pageSize: 999,
                    activityName: activityName,
                    activityType: activityType
                });
                const rows = Array.isArray(res && res.rows) ? res.rows : [];
                const relatedRows = rows.filter(row => {
                    const rowActivityType = resolveActivityTypeRequestValue(row && row.activityType ? row.activityType : "", this.meta);
                    return row && String(row.activityName || "").trim() === activityName && String(rowActivityType || "") === String(activityType || "") && (!activityBeginTime || normalizeDateKey(row.activityBeginTime) === activityBeginTime) && String(row.siteCode || "").trim()
                });
                const records = relatedRows.length ? relatedRows : this.buildFallbackRelatedRecords(detail);
                const relatedRecords = records.map(row => ({
                    id: row.id || null,
                    activityCode: row.activityCode || "",
                    siteCode: String(row.siteCode || "").trim()
                })).filter(row => row.siteCode);
                const currentSiteCodes = normalizeSiteCodeArray(this.meta && this.meta.currentSiteCode);
                this.relatedActivityRecords = this.isSiteReadonly ? relatedRecords.filter(row => currentSiteCodes.indexOf(row.siteCode) !== -1) : relatedRecords;
                this.form.siteCode = this.isSiteReadonly ? currentSiteCodes : defaultSelectedSiteCodes
            } catch (error) {
                console.error("Failed to load related activity records", error);
                this.relatedActivityRecords = this.buildFallbackRelatedRecords(detail);
                this.form.siteCode = defaultSelectedSiteCodes
            }
        },
        buildFallbackRelatedRecords(detail) {
            const siteCodes = normalizeSiteCodeArray(detail && detail.siteCode ? detail.siteCode : this.form.siteCode);
            return siteCodes.map(siteCode => ({
                id: detail && detail.id ? detail.id : null,
                activityCode: detail && detail.activityCode ? detail.activityCode : "",
                siteCode: siteCode
            }))
        },
        buildPayload(siteCode, extra) {
            if (this.$refs.dynamicSections) {
                this.$refs.dynamicSections.syncNewcomerTaskSummaries()
            }
            const payload = Object.assign({}, this.form);
            payload.id = extra && Object.prototype.hasOwnProperty.call(extra, "id") ? extra.id : this.form.id;
            payload.activityCode = extra && Object.prototype.hasOwnProperty.call(extra, "activityCode") ? extra.activityCode : this.form.activityCode;
            payload.siteCode = siteCode || (this.isSiteReadonly ? normalizeSiteCodeArray(this.meta.currentSiteCode || this.form.siteCode)[0] : this.objectSelectorSiteCode);
            payload.activityObject = normalizeActivityObject(payload.activityObject, this.activityObjectOptions);
            const visibleActivityType = normalizeActivityTypeValue(payload.activityType, this.meta);
            const selectedActivityType = this.isEdit && !this.activityTypeTouched && this.persistedActivityType ? this.persistedActivityType : visibleActivityType;
            payload.activityType = resolveActivityTypeRequestValue(selectedActivityType, this.meta);
            payload.activityName = (payload.activityName || "").trim();
            payload.activityTheme = payload.activityType === SIGNIN_ACTIVITY_TYPE_VALUE ? String(payload.activityTheme == null ? DEFAULT_ACTIVITY_THEME_VALUE : payload.activityTheme) : DEFAULT_ACTIVITY_THEME_VALUE;
            payload.activityIntroduction = payload.activityIntroduction || "";
            payload.activityPictureUrl = payload.activityPictureUrl || "";
            payload.activityListPictureUrl = payload.activityListPictureUrl || "";
            payload.homePopupPictureUrl = payload.homePopupPictureUrl || "";
            payload.activityDetailPictureUrl = payload.activityDetailPictureUrl || "";
            payload.fullSignFlg = String(payload.fullSignFlg == null ? "0" : payload.fullSignFlg);
            payload.venueType = payload.venueType || "";
            payload.activityDetail = payload.activityDetail || "";
            payload.vipLevel = this.isVipObject ? normalizeVipLevels(this.form.vipLevel, this.getVipLevelOptions(payload.siteCode)).join(",") : "";
            payload.agentCode = this.isAgentObject ? normalizeAgentIds(this.form.agentCode).join(",") : "";
            payload.remark = payload.remark || "";
            payload.gameTypes = Array.isArray(this.form.gameTypes) ? this.form.gameTypes.slice() : [];
            payload.baseConfigExtra = Object.assign({}, this.form.baseConfigExtra || {});
            payload.rewardItems = this.form.rewardItems.map(item => ({
                taskName: item.taskName,
                targetCount: item.targetCount,
                targetValidBetAmount: item.targetValidBetAmount,
                rewardAmount: item.rewardAmount,
                taskSummary: item.taskSummary || "",
                enabled: item.enabled !== false,
                extraConfig: Object.assign({}, item.extraConfig || {})
            }));
            payload.ruleSwitches = Object.assign({}, this.form.ruleSwitches);
            if (this.$refs.dynamicSections) {
                payload.activityTypeStates = this.$refs.dynamicSections.exportTypeStates([payload.activityType])
            }
            payload.status = Number(normalizeStatusValue(payload.status, this.statusOptions));
            if (this.isSigninActivity) {
                payload.claimRule = SIGNIN_CLAIM_RULE_VALUE
            }
            if (!payload.activityEndTime) {
                payload.activityEndTime = null;
                if (!this.isSigninActivity) {
                    payload.claimRule = resolveDefaultClaimRuleValue(this.claimRuleOptions)
                }
            }
            return payload
        },
        scrollToFirstError() {
            this.$nextTick(() => {
                const isError = this.$el.querySelector(".is-error") || document.querySelector(".activity-manage-dialog .is-error");
                if (isError) {
                    isError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    })
                }
            })
        },
        handleSubmit() {
            if (!this.$refs.form) {
                return
            }
            if (!String(this.form.activityType || "").trim()) {
                this.form.activityType = resolveFirstActivityTypeValue(this.meta)
            }
            if (!(this.isEdit && this.isActivityBeginTimeLocked) && isDateBeforeToday(this.form.activityBeginTime)) {
                this.$message.error("活动开始时间不能小于今天");
                return
            }
            this.$refs.form.validate(async valid => {
                if (!valid) {
                    this.$message.error("请修正表单错误后重新提交");
                    this.scrollToFirstError();
                    return
                }
                if (this.$refs.dynamicSections && !this.$refs.dynamicSections.validate()) {
                    return
                }
                this.saving = true;
                try {
                    const siteCodes = normalizeSiteCodeArray(this.form.siteCode);
                    let lastRes = null;
                    if (this.isEdit) {
                        const existingRecordMap = this.relatedActivityRecords.reduce((result, row) => {
                            if (row && row.siteCode && row.id) {
                                result[row.siteCode] = row
                            }
                            return result
                        }, {});
                        for (const siteCode of siteCodes) {
                            const existingRecord = existingRecordMap[siteCode];
                            if (existingRecord) {
                                lastRes = await updateActivity(this.buildPayload(siteCode, {
                                    id: existingRecord.id,
                                    activityCode: existingRecord.activityCode || ""
                                }));
                                continue
                            }
                            lastRes = await addActivity(this.buildPayload(siteCode, {
                                id: null,
                                activityCode: ""
                            }))
                        }
                    } else {
                        for (const siteCode of siteCodes) {
                            lastRes = await addActivity(this.buildPayload(siteCode, {
                                id: null,
                                activityCode: ""
                            }))
                        }
                    }
                    this.$modal.msgSuccess(this.isEdit ? "活动修改成功" : "活动新增成功");
                    this.$emit("success", lastRes && lastRes.data || null)
                } finally {
                    this.saving = false
                }
            })
        },
        handleCancel() {
            this.$emit("cancel")
        },
        handleReplacePicture(refName) {
            const uploader = this.$refs[refName];
            if (uploader && typeof uploader.openFileDialog === "function") {
                uploader.openFileDialog()
            }
        },
        handleClearPicture(fieldName) {
            if (Object.prototype.hasOwnProperty.call(this.form, fieldName)) {
                this.form[fieldName] = "";
                this.$nextTick(() => {
                    if (this.$refs.form) {
                        this.$refs.form.validateField(fieldName)
                    }
                })
            }
        }
    }
};

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) {
    throw new Error(message + ': ' + expected)
  }
}

const component = read('src/views/activity/manage/components/ActivityFrontendDisplayFields.vue')
const activityTemplate = read('src/views/activity/manage/components/ActivityForm.template.html')
const activityScript = read('src/views/activity/manage/components/ActivityForm.script.js')
const commonTemplate = read('src/views/activity/manage/components/ActivityCommonForm.template.html')
const commonScript = read('src/views/activity/manage/components/ActivityCommonForm.script.js')
const dynamicSectionsScript = read('src/views/activity/manage/components/ActivityTypeDynamicSections.script.js')
const compactCommonScript = commonScript.replace(/\s+/g, '')
const schemas = read('src/views/activity/manage/components/activityTypeSchemas.js')

;['活动分类', '活动标签', '展示设备', '活动周期', '展示时间', '活动时间'].forEach(label => {
  assertIncludes(component, label, '共用展示配置缺少字段')
})

assertIncludes(component, 'label="状态"', '共用展示配置缺少状态字段')
assertIncludes(component, 'active-value="0"', '状态开关缺少启用值')
assertIncludes(component, 'inactive-value="1"', '状态开关缺少禁用值')
assertIncludes(component, 'inactive-text="禁用"', '状态开关缺少禁用文案')
assertIncludes(component, 'active-text="启用"', '状态开关缺少启用文案')
assertIncludes(component, 'grid-template-columns: minmax(260px, 1fr) minmax(220px, 340px) max-content max-content;', '展示设备与状态字段间距过大')
assertIncludes(component, 'max-width: 1120px;', '共用展示配置缺少紧凑宽度限制')

;['最新', '体育', '真人', '电竞', '彩票', '棋牌', '电子', '捕鱼', '哈希'].forEach(label => {
  assertIncludes(component, `label: '${label}'`, '活动分类缺少选项')
})

;['全部', 'Web', 'APP/H5'].forEach(label => {
  assertIncludes(component, `label: '${label}'`, '展示设备缺少选项')
})

assertIncludes(activityTemplate, '<activity-frontend-display-fields', '新人礼/签到表单未接入展示配置')
assertIncludes(activityTemplate, ':is-edit="isEdit"', '新人礼/签到状态无法区分新增和编辑')
assertIncludes(activityScript, 'isFrontendDisplayActivity()', '新人礼/签到缺少活动类型限制')
assertIncludes(activityScript, 'NEWCOMER_ACTIVITY_TYPE_VALUE', '新人礼缺少活动类型识别')
assertIncludes(activityScript, 'ActivityFrontendDisplayFields', '新人礼/签到表单未注册共用组件')
assertIncludes(activityScript, 'label: "通用"', '签到活动主题缺少通用选项')
assertIncludes(activityScript, 'label: "世界杯"', '签到活动主题缺少世界杯选项')
;['全体会员', 'VIP会员', '7天内注册用户', '代理'].forEach(label => {
  assertIncludes(activityScript, `label: "${label}"`, '新人礼/签到活动对象缺少选项')
  assertIncludes(commonScript, `label:"${label}"`, '通用活动对象缺少选项')
})
assertIncludes(schemas, '"新人礼": {', '缺少新人礼配置模型')
assertIncludes(schemas, '"签到": {', '缺少签到配置模型')
assertIncludes(schemas, 'createSwitchOption("ipUniquenessCheck", "IP唯一性校验", "同一IP只能参与一次")', '新人礼规则缺少IP唯一性校验')
assertIncludes(schemas, 'var result = Object.assign({}, schema.defaults.ruleSwitches || {});', '活动模板规则未继承新增开关默认值')
assertIncludes(dynamicSectionsScript, 'this.currentSchema.ruleOptions.forEach', '活动模板未补齐内置规则开关')

assertIncludes(commonTemplate, '<activity-frontend-display-fields', '通用活动表单未接入展示配置')
assertIncludes(commonTemplate, ':is-edit="isEdit"', '通用活动状态无法区分新增和编辑')
assertIncludes(commonScript, 'ActivityFrontendDisplayFields', '通用活动表单未注册共用组件')
assertIncludes(compactCommonScript, 'next.baseConfigExtra=Object.assign({},data.baseConfigExtra||{})', '通用活动编辑未回显展示配置')
assertIncludes(compactCommonScript, 'baseConfigExtra:Object.assign({},this.form.baseConfigExtra||{})', '通用活动保存未提交展示配置')

console.log('activity frontend display fields check passed')

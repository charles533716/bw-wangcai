import { listSite } from '@/api/site/site'
import { listGameBase } from '@/api/resources/gameBase'
import { listGameFactory } from '@/api/resources/gameFactory'
import {
  addGameGroup,
  bindGameGroupGames,
  delGameGroup,
  getGameGroup,
  listGameGroup,
  listGameGroupRel,
  listGameGroupTree,
  updateGameGroup
} from '@/api/resources/gameGroup'

export default {
  name: 'GameGroup',
  data() {
    const validateTerminalScope = (rule, value, callback) => {
      if (![0, 1, 2].includes(Number(value))) {
        callback(new Error('适配终端不能为空'))
        return
      }
      callback()
    }
    const validateDisplayStyle = (rule, value, callback) => {
      if (![0, 1, 2].includes(Number(value))) {
        callback(new Error('展示样式不能为空'))
        return
      }
      callback()
    }

    return {
      loading: false,
      showSearch: true,
      total: 0,
      groupList: [],
      siteOptions: [],
      parentGroupOptions: [],
      bindAllGames: [],
      gameTransferData: [],
      bindGameRows: [],
      bindCandidateCheckedIds: [],
      bindRowCheckedKeys: [],
      bindAvailableKeyword: '',
      bindSelectedKeyword: '',
      bindRowSeq: 0,
      bindGameTotal: 0,
      bindGroupId: undefined,
      bindGroupName: '',
      bindGroupType: undefined,
      bindGroupSiteId: undefined,
      bindFactoryId: undefined,
      bindFactoryOptions: [],
      bindGameKeyword: '',
      bindGamesLoading: false,
      bindActiveTab: 'game',
      bindActionLoading: false,
      bindChildGroupList: [],
      subGroupMoveOptions: [],
      subGroupMoveIds: [],
      bindOpen: false,
      treeOpen: false,
      groupTree: [],
      sceneOptions: [
        { value: 1, label: 'PC' },
        { value: 2, label: 'H5' },
        { value: 3, label: '全端' }
      ],
      terminalScopeOptions: [
        { value: 0, label: 'PC/手机端' },
        { value: 1, label: 'PC' },
        { value: 2, label: '手机端' }
      ],
      statusOptions: [
        { value: 0, label: '禁用' },
        { value: 1, label: '启用' }
      ],
      displayStyleOptions: [
        { value: 0, label: '默认展示' },
        { value: 1, label: '样式1' },
        { value: 2, label: '样式2' }
      ],
      imageFileTypes: ['png', 'jpg', 'jpeg', 'webp'],
      treeProps: {
        label: 'groupName',
        children: 'children'
      },
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        groupCode: undefined,
        groupName: undefined,
        groupType: undefined,
        scene: undefined,
        terminalScope: undefined,
        isHotGroup: undefined,
        status: undefined
      },
      form: {},
      rules: {
        siteId: [{ required: true, message: '站点不能为空', trigger: 'change' }],
        groupCode: [{ required: true, message: '分组编码不能为空', trigger: 'blur' }],
        groupName: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }],
        groupType: [{ required: true, message: '分组级别不能为空', trigger: 'change' }],
        scene: [{ required: true, message: '场景不能为空', trigger: 'change' }],
        terminalScope: [{ validator: validateTerminalScope, trigger: 'change' }],
        displayStyle: [{ validator: validateDisplayStyle, trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        parentId: [{ validator: (rule, value, callback) => {
          if (this.form.groupType === 2 && (!value || value <= 0)) {
            callback(new Error('二级分组必须选择父级分组'))
            return
          }
          callback()
        }, trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadSiteOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listGameGroup(this.queryParams).then(response => {
        this.groupList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    loadSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.siteOptions = response.rows || []
      })
    },
    loadParentGroups(siteId) {
      if (!siteId) {
        this.parentGroupOptions = []
        return
      }
      listGameGroup({ pageNum: 1, pageSize: 1000, siteId, groupType: 1 }).then(response => {
        this.parentGroupOptions = response.rows || []
      })
    },
    sceneLabel(value) {
      const found = this.sceneOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    normalizeTerminalScope(value) {
      const scope = Number(value)
      if (scope === 1) return 1
      if (scope === 2 || scope === 4 || scope === 8 || scope === 6 || scope === 10 || scope === 12 || scope === 14) return 2
      return 0
    },
    terminalScopeLabel(value) {
      const normalized = this.normalizeTerminalScope(value)
      const found = this.terminalScopeOptions.find(item => item.value === normalized)
      return found ? found.label : '-'
    },
    statusLabel(value) {
      const found = this.statusOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    displayStyleLabel(value) {
      const found = this.displayStyleOptions.find(item => item.value === Number(value))
      return found ? found.label : '默认展示'
    },
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value)
    },
    subGroupOptionLabel(item) {
      const parentLabel = item.parentGroupName || '未分配'
      return `${item.groupName || '-'} [${item.groupCode || '-'}]（当前父级：${parentLabel}）`
    },
    reset() {
      this.form = {
        id: undefined,
        siteId: undefined,
        groupCode: undefined,
        groupName: undefined,
        scene: 3,
        groupType: 1,
        parentId: 0,
        terminalScope: 0,
        isHotGroup: 0,
        displayStyle: 0,
        icon: undefined,
        pcIcon: undefined,
        h5Icon: undefined,
        selectedIcon: undefined,
        status: 0,
        sort: 0,
        remark: undefined
      }
      this.parentGroupOptions = []
      this.resetForm('form')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增游戏分组'
    },
    handleUpdate(row) {
      const id = row ? row.id : this.ids[0]
      getGameGroup(id).then(response => {
        this.reset()
        this.form = Object.assign({}, this.form, response.data)
        this.form.terminalScope = this.normalizeTerminalScope(this.form.terminalScope)
        this.form.isHotGroup = Number(this.form.isHotGroup) === 1 ? 1 : 0
        this.form.displayStyle = [0, 1, 2].includes(Number(this.form.displayStyle)) ? Number(this.form.displayStyle) : 0
        this.loadParentGroups(this.form.siteId)
        this.open = true
        this.title = '修改游戏分组'
      })
    },
    handleFormSiteChange(siteId) {
      this.loadParentGroups(siteId)
      if (this.form.groupType === 2) {
        this.form.parentId = undefined
      }
    },
    handleFormGroupTypeChange(groupType) {
      if (groupType === 1) {
        this.form.parentId = 0
      } else {
        this.form.parentId = undefined
        this.loadParentGroups(this.form.siteId)
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const submitData = Object.assign({}, this.form)
        delete submitData.supportPlatforms
        delete submitData.supportPlatformList
        submitData.terminalScope = this.normalizeTerminalScope(submitData.terminalScope)
        submitData.isHotGroup = Number(submitData.isHotGroup) === 1 ? 1 : 0
        submitData.displayStyle = [0, 1, 2].includes(Number(submitData.displayStyle)) ? Number(submitData.displayStyle) : 0
        if (submitData.groupType === 1) {
          submitData.parentId = 0
        } else {
          submitData.selectedIcon = undefined
        }
        const api = submitData.id ? updateGameGroup : addGameGroup
        api(submitData).then(() => {
          this.$modal.msgSuccess(submitData.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row ? row.id : this.ids.join(',')
      this.$modal.confirm('是否确认删除分组ID为"' + ids + '"的数据项？').then(() => {
        return delGameGroup(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    async handleBind(row) {
      const target = row || this.groupList.find(item => item.id === this.ids[0])
      if (!target) {
        return
      }
      this.bindGroupId = target.id
      this.bindGroupName = target.groupName
      this.bindGroupType = target.groupType
      this.bindGroupSiteId = target.siteId
      this.bindActiveTab = 'game'
      this.bindActionLoading = false
      this.bindAllGames = []
      this.gameTransferData = []
      this.bindGameRows = []
      this.bindCandidateCheckedIds = []
      this.bindRowCheckedKeys = []
      this.bindAvailableKeyword = ''
      this.bindSelectedKeyword = ''
      this.bindRowSeq = 0
      this.bindGameTotal = 0
      this.bindFactoryId = undefined
      this.bindFactoryOptions = []
      this.bindGameKeyword = ''
      this.bindGamesLoading = false
      this.bindChildGroupList = []
      this.subGroupMoveOptions = []
      this.subGroupMoveIds = []
      this.bindOpen = true

      try {
        await this.loadBindGames()
        await this.loadBindSubGroups()
      } catch (error) {
        this.$modal.msgError('加载编排数据失败')
      }
    },
    async loadBindGames() {
      this.bindGamesLoading = true
      try {
        const [factoryResp, relResp] = await Promise.all([
          listGameFactory({ pageNum: 1, pageSize: 5000 }),
          listGameGroupRel({ pageNum: 1, pageSize: 5000, groupId: this.bindGroupId })
        ])

        this.bindFactoryOptions = factoryResp.rows || []
        const relRows = relResp.rows || []
        this.bindAllGames = []
        this.bindGameRows = relRows.map((item, index) => this.buildBindGameRow(item, index))
        await this.loadBindGameCandidates()
      } finally {
        this.bindGamesLoading = false
      }
    },
    async loadBindGameCandidates() {
      this.bindGamesLoading = true
      try {
        const query = {
          pageNum: 1,
          pageSize: 500,
          status: 1
        }
        if (this.bindFactoryId) {
          query.factoryId = this.bindFactoryId
        }
        const keyword = String(this.bindGameKeyword || '').trim()
        if (keyword) {
          query.keyword = keyword
        }
        const response = await listGameBase(query)
        this.bindAllGames = response.rows || []
        this.bindGameTotal = response.total || 0
        this.applyBindGameFilters()
        this.ensureBindGameSorts()
      } finally {
        this.bindGamesLoading = false
      }
    },
    applyBindGameFilters() {
      this.gameTransferData = (this.bindAllGames || []).map(item => this.buildBindGameOption(item))
      const visibleIds = new Set(this.gameTransferData.map(item => Number(item.id)))
      this.bindCandidateCheckedIds = (this.bindCandidateCheckedIds || []).filter(id => visibleIds.has(Number(id)))
    },
    resetBindGameFilters() {
      this.bindFactoryId = undefined
      this.bindGameKeyword = ''
      this.loadBindGameCandidates()
    },
    buildBindGameOption(item) {
      return {
        key: item.id,
        id: item.id,
        label: [
          item.gameName,
          item.gameAlias,
          item.gameCode,
          item.factoryName,
          item.lineName,
          item.id
        ].filter(Boolean).join(' '),
        gameCode: item.gameCode,
        gameName: item.gameName,
        gameAlias: item.gameAlias,
        factoryId: item.factoryId,
        factoryName: item.factoryName,
        lineName: item.lineName,
        terminalScope: item.terminalScope,
        isHot: item.isHot,
        isNew: item.isNew,
        isTop: item.isTop,
        sort: item.sort
      }
    },
    buildBindGameRow(item, index) {
      const gameId = item.gameId || item.id
      const row = {
        rowKey: item.id && item.gameId ? `rel_${item.id}` : `tmp_${++this.bindRowSeq}`,
        relId: item.id && item.gameId ? item.id : undefined,
        gameId,
        id: gameId,
        label: [
          item.gameName,
          item.gameAlias,
          item.gameCode,
          item.factoryName,
          item.lineName,
          gameId
        ].filter(Boolean).join(' '),
        gameCode: item.gameCode,
        gameName: item.gameName,
        gameAlias: item.gameAlias,
        factoryId: item.factoryId,
        factoryName: item.factoryName,
        lineName: item.lineName,
        terminalScope: item.terminalScope,
        isHot: item.isHot,
        isNew: item.isNew,
        isTop: item.isTop,
        sort: this.normalizeBindDisplaySort(item.sort) || index + 1
      }
      return row
    },
    normalizeBindDisplaySort(value) {
      const numberValue = Number(value)
      if (!Number.isFinite(numberValue)) {
        return undefined
      }
      const sortValue = Math.floor(numberValue)
      return sortValue > 0 ? sortValue : undefined
    },
    selectedBindGameList() {
      return this.bindGameRows || []
    },
    filteredCandidateGameList() {
      return this.filterBindRows(this.gameTransferData, this.bindAvailableKeyword)
    },
    filteredSelectedBindGameList() {
      return this.filterBindRows(this.bindGameRows, this.bindSelectedKeyword)
    },
    filterBindRows(rows, keyword) {
      const normalized = String(keyword || '').trim().toLowerCase()
      if (!normalized) {
        return rows || []
      }
      return (rows || []).filter(item => String(item.label || '').toLowerCase().includes(normalized))
    },
    ensureBindGameSorts() {
      this.bindGameRows.forEach((item, index) => {
        const sortValue = this.normalizeBindDisplaySort(item.sort) || index + 1
        this.$set(item, 'sort', sortValue)
      })
      return this.selectedBindGameList()
    },
    nextBindSort() {
      return this.bindGameRows.length + 1
    },
    addBindGame(option) {
      if (!option) {
        return
      }
      this.bindGameRows.push(this.buildBindGameRow(Object.assign({}, option, { sort: this.nextBindSort() }), this.bindGameRows.length))
    },
    addCheckedBindGames() {
      const checkedIds = new Set((this.bindCandidateCheckedIds || []).map(id => Number(id)))
      this.gameTransferData.forEach(option => {
        if (checkedIds.has(Number(option.id))) {
          this.addBindGame(option)
        }
      })
      this.bindCandidateCheckedIds = []
    },
    removeBindGame(row) {
      if (!row) {
        return
      }
      this.bindGameRows = this.bindGameRows.filter(item => item.rowKey !== row.rowKey)
      this.bindRowCheckedKeys = this.bindRowCheckedKeys.filter(key => key !== row.rowKey)
    },
    removeCheckedBindGames() {
      const checkedKeys = new Set(this.bindRowCheckedKeys || [])
      this.bindGameRows = this.bindGameRows.filter(row => !checkedKeys.has(row.rowKey))
      this.bindRowCheckedKeys = []
    },
    toggleAllCandidates(checked) {
      this.bindCandidateCheckedIds = checked ? this.filteredCandidateGameList().map(item => item.id) : []
    },
    toggleAllBoundRows(checked) {
      this.bindRowCheckedKeys = checked ? this.filteredSelectedBindGameList().map(item => item.rowKey) : []
    },
    isAllCandidatesChecked() {
      const list = this.filteredCandidateGameList()
      return list.length > 0 && list.every(item => this.bindCandidateCheckedIds.includes(item.id))
    },
    isCandidateIndeterminate() {
      const list = this.filteredCandidateGameList()
      const checkedCount = list.filter(item => this.bindCandidateCheckedIds.includes(item.id)).length
      return checkedCount > 0 && checkedCount < list.length
    },
    isAllBoundChecked() {
      const list = this.filteredSelectedBindGameList()
      return list.length > 0 && list.every(item => this.bindRowCheckedKeys.includes(item.rowKey))
    },
    isBoundIndeterminate() {
      const list = this.filteredSelectedBindGameList()
      const checkedCount = list.filter(item => this.bindRowCheckedKeys.includes(item.rowKey)).length
      return checkedCount > 0 && checkedCount < list.length
    },
    handleBindSortChange(row) {
      if (row) {
        this.$set(row, 'sort', this.normalizeBindDisplaySort(row.sort) || 1)
      }
    },
    async loadBindSubGroups() {
      if (this.bindGroupType !== 1 || !this.bindGroupSiteId) {
        this.bindChildGroupList = []
        this.subGroupMoveOptions = []
        this.subGroupMoveIds = []
        return
      }
      const response = await listGameGroup({
        pageNum: 1,
        pageSize: 2000,
        siteId: this.bindGroupSiteId,
        groupType: 2
      })
      const rows = response.rows || []
      const groupId = Number(this.bindGroupId)
      this.bindChildGroupList = rows.filter(item => Number(item.parentId) === groupId)
      this.subGroupMoveOptions = rows.filter(item => Number(item.parentId) !== groupId)
      this.subGroupMoveIds = []
    },
    handleBindPrimaryAction() {
      if (this.bindActiveTab === 'subgroup') {
        this.submitBindSubGroups()
        return
      }
      this.submitBind()
    },
    submitBind() {
      this.bindActionLoading = true
      const selectedGames = this.ensureBindGameSorts()
      bindGameGroupGames({
        groupId: this.bindGroupId,
        gameIds: selectedGames.map(item => item.gameId),
        games: selectedGames.map(item => ({
          relId: item.relId,
          gameId: item.gameId,
          gameAlias: String(item.gameAlias || '').trim(),
          sort: this.normalizeBindDisplaySort(item.sort)
        }))
      }).then(() => {
        this.$modal.msgSuccess('绑定成功')
        this.bindOpen = false
        this.getList()
      }).finally(() => {
        this.bindActionLoading = false
      })
    },
    async submitBindSubGroups() {
      if (this.bindGroupType !== 1) {
        this.$modal.msgWarning('仅一级分组支持挂载二级分组')
        return
      }
      const moveIds = Array.from(new Set((this.subGroupMoveIds || []).map(id => Number(id)).filter(id => id > 0)))
      if (moveIds.length === 0) {
        this.$modal.msgWarning('请先选择要挂载的二级分组')
        return
      }
      this.bindActionLoading = true
      let successCount = 0
      const failedIds = []
      for (const id of moveIds) {
        try {
          await updateGameGroup({ id, parentId: this.bindGroupId })
          successCount += 1
        } catch (e) {
          failedIds.push(id)
        }
      }
      if (successCount > 0) {
        this.$modal.msgSuccess(`已挂载${successCount}个二级分组`)
      }
      if (failedIds.length > 0) {
        this.$modal.msgError(`部分挂载失败，分组ID：${failedIds.join(',')}`)
      }
      try {
        await this.loadBindSubGroups()
      } finally {
        this.bindActionLoading = false
      }
      this.getList()
    },
    handleTree() {
      if (!this.queryParams.siteId) {
        this.$modal.msgWarning('请先选择站点后查看分组树')
        return
      }
      listGameGroupTree({ siteId: this.queryParams.siteId }).then(response => {
        this.groupTree = response.data || []
        this.treeOpen = true
      })
    }
  }
}

<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="线路" prop="lineId">
        <el-select v-model="queryParams.lineId" placeholder="请选择线路" clearable size="small" filterable @change="handleQueryLineChange">
          <el-option v-for="line in lineOptions" :key="line.id" :label="line.lineName" :value="line.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="厂商" prop="factoryId">
        <el-select v-model="queryParams.factoryId" placeholder="请选择厂商" clearable size="small" filterable>
          <el-option v-for="factory in queryFactoryOptions" :key="factory.id" :label="factory.factoryName" :value="factory.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏编码" prop="gameCode">
        <el-input v-model="queryParams.gameCode" placeholder="请输入游戏编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="游戏名称" prop="gameName">
        <el-input v-model="queryParams.gameName" placeholder="请输入游戏名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameType">
        <el-input-number v-model="queryParams.gameType" :min="1" :max="9999" controls-position="right" size="small" />
      </el-form-item>
      <el-form-item label="来源" prop="gameSource">
        <el-select v-model="queryParams.gameSource" placeholder="请选择来源" clearable size="small">
          <el-option v-for="item in gameSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="适配终端" prop="terminalScope">
        <el-select v-model="queryParams.terminalScope" placeholder="请选择终端" clearable size="small">
          <el-option v-for="item in terminalScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="热门" prop="isHot">
        <el-select v-model="queryParams.isHot" placeholder="请选择" clearable size="small">
          <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="最新" prop="isNew">
        <el-select v-model="queryParams.isNew" placeholder="请选择" clearable size="small">
          <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Top" prop="isTop">
        <el-select v-model="queryParams.isTop" placeholder="请选择" clearable size="small">
          <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['resources:gameBase:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['resources:gameBase:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['resources:gameBase:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="gameList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="线路" align="center" prop="lineName" min-width="120" />
      <el-table-column label="厂商" align="center" prop="factoryName" min-width="120" />
      <el-table-column label="游戏编码" align="center" prop="gameCode" min-width="120" />
      <el-table-column label="游戏名称" align="center" prop="gameName" min-width="140" />
      <el-table-column label="游戏类型" align="center" prop="gameType" width="90" />
      <el-table-column label="来源" align="center" width="90">
        <template slot-scope="scope">{{ sourceLabel(scope.row.gameSource) }}</template>
      </el-table-column>
      <el-table-column label="币种" align="center" prop="currency" width="100" />
      <el-table-column label="适配终端" align="center" min-width="180">
        <template slot-scope="scope">
          <el-tag size="mini">{{ terminalScopeLabel(scope.row.terminalScope) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="封面" align="center" prop="cover" min-width="140" show-overflow-tooltip />
      <el-table-column label="PC端游戏图片" align="center" prop="pcIcon" min-width="160" show-overflow-tooltip />
      <el-table-column label="手机端游戏图片" align="center" prop="h5Icon" min-width="160" show-overflow-tooltip />
      <el-table-column label="热门" align="center" width="80">
        <template slot-scope="scope">{{ yesNoLabel(scope.row.isHot) }}</template>
      </el-table-column>
      <el-table-column label="最新" align="center" width="80">
        <template slot-scope="scope">{{ yesNoLabel(scope.row.isNew) }}</template>
      </el-table-column>
      <el-table-column label="Top" align="center" width="80">
        <template slot-scope="scope">{{ yesNoLabel(scope.row.isTop) }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="扩展配置" align="center" prop="extraJson" min-width="180" show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" min-width="140" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" width="170">
        <template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['resources:gameBase:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['resources:gameBase:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路" prop="lineId">
              <el-select v-model="form.lineId" placeholder="请选择线路" filterable style="width: 100%" @change="handleFormLineChange">
                <el-option v-for="line in lineOptions" :key="line.id" :label="line.lineName" :value="line.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂商" prop="factoryId">
              <el-select v-model="form.factoryId" placeholder="请选择厂商" filterable style="width: 100%">
                <el-option v-for="factory in formFactoryOptions" :key="factory.id" :label="factory.factoryName" :value="factory.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游戏编码" prop="gameCode">
              <el-input v-model="form.gameCode" placeholder="请输入游戏编码" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游戏名称" prop="gameName">
              <el-input v-model="form.gameName" placeholder="请输入游戏名称" maxlength="128" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="游戏类型" prop="gameType">
              <el-input-number v-model="form.gameType" :min="1" :max="9999" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="游戏来源" prop="gameSource">
              <el-select v-model="form.gameSource" placeholder="请选择来源" style="width: 100%">
                <el-option v-for="item in gameSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="form.currency" placeholder="请选择币种" style="width: 100%">
                <el-option v-for="item in currencyOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适配终端" prop="terminalScope">
          <el-radio-group v-model="form.terminalScope">
            <el-radio v-for="item in terminalScopeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="封面URL" prop="cover">
              <ImageUpload v-model="form.cover" :limit="1" :isShowTip="false" />
              <el-input v-model="form.cover" placeholder="上传后自动回填，可手动修改" maxlength="255" style="margin-top: 8px;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PC端游戏图片" prop="pcIcon">
              <ImageUpload v-model="form.pcIcon" :limit="1" :isShowTip="false" />
              <el-input v-model="form.pcIcon" placeholder="上传后自动回填，可手动修改" maxlength="255" style="margin-top: 8px;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机端游戏图片" prop="h5Icon">
              <ImageUpload v-model="form.h5Icon" :limit="1" :isShowTip="false" />
              <el-input v-model="form.h5Icon" placeholder="上传后自动回填，可手动修改" maxlength="255" style="margin-top: 8px;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="game-flag-row">
          <el-col :span="12">
            <el-form-item label="热门" prop="isHot">
              <el-radio-group v-model="form.isHot">
                <el-radio v-for="item in yesNoOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最新" prop="isNew">
              <el-radio-group v-model="form.isNew">
                <el-radio v-for="item in yesNoOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="game-flag-row">
          <el-col :span="12">
            <el-form-item label="是否TOP" prop="isTop">
              <el-radio-group v-model="form.isTop">
                <el-radio v-for="item in yesNoOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="扩展配置(JSON)" prop="extraJson">
          <el-input
            v-model="form.extraJson"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder='请输入合法JSON，例如：{"rtp":"96.5"}'
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addGameBase, delGameBase, getGameBase, listGameBase, updateGameBase } from '@/api/resources/gameBase'
import { listGameCurrency } from '@/api/resources/gameCurrency'
import { listGameFactory } from '@/api/resources/gameFactory'
import { listGameLine } from '@/api/resources/gameLine'

export default {
  name: 'GameBase',
  data() {
    const validateJson = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      try {
        JSON.parse(value)
        callback()
      } catch (e) {
        callback(new Error('扩展配置必须是合法JSON'))
      }
    }

    const validateTerminalScope = (rule, value, callback) => {
      if (![0, 1, 2].includes(Number(value))) {
        callback(new Error('适配终端不能为空'))
        return
      }
      callback()
    }

    return {
      loading: false,
      showSearch: true,
      total: 0,
      gameList: [],
      lineOptions: [],
      queryFactoryOptions: [],
      formFactoryOptions: [],
      factoryCache: {},
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      gameSourceOptions: [
        { value: 1, label: '自营' },
        { value: 2, label: '三方' }
      ],
      currencyOptions: [],
      terminalScopeOptions: [
        { value: 0, label: 'PC/手机端' },
        { value: 1, label: 'PC' },
        { value: 2, label: '手机端' }
      ],
      statusOptions: [
        { value: 0, label: '禁用' },
        { value: 1, label: '启用' }
      ],
      yesNoOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lineId: undefined,
        factoryId: undefined,
        gameCode: undefined,
        gameName: undefined,
        gameType: undefined,
        gameSource: undefined,
        terminalScope: undefined,
        isHot: undefined,
        isNew: undefined,
        isTop: undefined,
        status: undefined
      },
      form: {},
      rules: {
        lineId: [{ required: true, message: '线路不能为空', trigger: 'change' }],
        factoryId: [{ required: true, message: '厂商不能为空', trigger: 'change' }],
        gameName: [{ required: true, message: '游戏名称不能为空', trigger: 'blur' }],
        currency: [{ required: true, message: '币种不能为空', trigger: 'change' }],
        terminalScope: [{ validator: validateTerminalScope, trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        extraJson: [{ validator: validateJson, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadLineOptions()
    this.loadCurrencyOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listGameBase(this.queryParams).then(response => {
        this.gameList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    loadLineOptions() {
      listGameLine({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.lineOptions = response.rows || []
      })
    },
    loadCurrencyOptions() {
      listGameCurrency({ pageNum: 1, pageSize: 1000, status: 1 }).then(response => {
        this.currencyOptions = (response.rows || []).map(item => ({
          value: item.currencyCode,
          label: item.currencyName ? `${item.currencyCode}（${item.currencyName}）` : item.currencyCode
        }))
      })
    },
    loadFactoryOptionsByLine(lineId, target, clearSelected = true) {
      if (!lineId) {
        if (target === 'query') {
          this.queryFactoryOptions = []
          this.queryParams.factoryId = undefined
        } else {
          this.formFactoryOptions = []
          if (clearSelected) {
            this.form.factoryId = undefined
          }
        }
        return
      }

      const cacheKey = String(lineId)
      const applyRows = rows => {
        if (target === 'query') {
          this.queryFactoryOptions = rows
          if (clearSelected) {
            this.queryParams.factoryId = undefined
          }
        } else {
          this.formFactoryOptions = rows
          if (clearSelected) {
            this.form.factoryId = undefined
          }
        }
      }

      if (this.factoryCache[cacheKey]) {
        applyRows(this.factoryCache[cacheKey])
        return
      }

      listGameFactory({ pageNum: 1, pageSize: 1000, lineId }).then(response => {
        const rows = response.rows || []
        this.factoryCache[cacheKey] = rows
        applyRows(rows)
      })
    },
    handleQueryLineChange(value) {
      this.loadFactoryOptionsByLine(value, 'query')
    },
    handleFormLineChange(value) {
      this.loadFactoryOptionsByLine(value, 'form')
      const line = this.lineOptions.find(item => item.id === value)
      if (line && line.lineType) {
        this.form.gameSource = line.lineType
      }
    },
    sourceLabel(value) {
      const found = this.gameSourceOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    yesNoLabel(value) {
      const found = this.yesNoOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    statusLabel(value) {
      const found = this.statusOptions.find(item => item.value === value)
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
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value)
    },
    reset() {
      this.form = {
        id: undefined,
        lineId: undefined,
        factoryId: undefined,
        gameCode: undefined,
        gameName: undefined,
        gameType: 1,
        gameSource: 1,
        currency: this.currencyOptions.length > 0 ? this.currencyOptions[0].value : 'CNY',
        terminalScope: 0,
        cover: undefined,
        pcIcon: undefined,
        h5Icon: undefined,
        status: 0,
        isHot: 0,
        isNew: 0,
        isTop: 0,
        sort: 0,
        extraJson: undefined,
        remark: undefined
      }
      this.formFactoryOptions = []
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
      this.queryFactoryOptions = []
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
      this.title = '新增游戏'
    },
    handleUpdate(row) {
      const id = row ? row.id : this.ids[0]
      getGameBase(id).then(response => {
        this.reset()
        this.form = Object.assign({}, this.form, response.data)
        this.form.terminalScope = this.normalizeTerminalScope(this.form.terminalScope)
        this.loadFactoryOptionsByLine(this.form.lineId, 'form', false)
        this.open = true
        this.title = '修改游戏'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const submitData = Object.assign({}, this.form)
        delete submitData.supportPlatforms
        delete submitData.supportPlatformList
        if (typeof submitData.gameCode === 'string') {
          submitData.gameCode = submitData.gameCode.trim()
        }
        submitData.terminalScope = this.normalizeTerminalScope(submitData.terminalScope)
        const api = submitData.id ? updateGameBase : addGameBase
        api(submitData).then(() => {
          this.$modal.msgSuccess(submitData.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row ? row.id : this.ids.join(',')
      this.$modal.confirm('是否确认删除游戏ID为"' + ids + '"的数据项？').then(() => {
        return delGameBase(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.game-flag-row ::v-deep .el-radio-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
}

.game-flag-row ::v-deep .el-radio {
  margin-right: 28px;
}
</style>

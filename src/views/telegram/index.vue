<template>
  <div class="app-container telegram-bot-config">
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="88px"
    >
      <el-form-item label="机器人编码" prop="botCode">
        <el-input
          v-model="queryParams.botCode"
          placeholder="如 devwangcaibot"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机器人用户名" prop="botUsername">
        <el-input
          v-model="queryParams.botUsername"
          placeholder="不带 @"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="如 2222"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable>
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['telegram:config:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['telegram:config:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['telegram:config:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['telegram:config:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="telegramList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="机器人编码" align="center" prop="botCode" min-width="150" show-overflow-tooltip />
      <el-table-column label="用户名" align="center" prop="botUsername" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ formatBotUsername(scope.row.botUsername) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Token" align="center" prop="botTokenCipher" min-width="120">
        <template slot-scope="scope">
          <span>{{ formatToken(scope.row.botTokenCipher) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="站点编码" align="center" prop="siteCode" min-width="100" />
      <el-table-column label="H5基础地址" align="center" prop="h5BaseUrl" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="开始游戏" align="center" prop="gamePath" min-width="120" show-overflow-tooltip />
      <el-table-column label="提现" align="center" prop="withdrawPath" min-width="120" show-overflow-tooltip />
      <el-table-column label="充值" align="center" prop="rechargePath" min-width="120" show-overflow-tooltip />
      <el-table-column label="余额" align="center" prop="balancePath" min-width="120" show-overflow-tooltip />
      <el-table-column label="欢迎图片" align="center" prop="welcomePhotoUrl" min-width="180" show-overflow-tooltip />
      <el-table-column label="Start图片" align="center" prop="startPhotoUrl" min-width="180" show-overflow-tooltip />
      <el-table-column label="Start文案" align="center" prop="startCaption" min-width="180" show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" min-width="140" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime || scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="130" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['telegram:config:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['telegram:config:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="机器人编码" prop="botCode">
          <el-input v-model="form.botCode" placeholder="如 devwangcaibot" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="机器人用户名" prop="botUsername">
          <el-input v-model="form.botUsername" placeholder="不带 @，如 devwangcaibot" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="机器人Token" prop="botTokenCipher">
          <el-input
            v-model="form.botTokenCipher"
            placeholder="请输入 Telegram Bot Token"
            show-password
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="站点编码" prop="siteCode">
          <el-input v-model="form.siteCode" placeholder="如 2222" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="H5基础地址" prop="h5BaseUrl">
          <el-input v-model="form.h5BaseUrl" placeholder="如 https://dev.wangcaisports.com" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999999" controls-position="right" />
        </el-form-item>
        <el-form-item label="欢迎图片" prop="welcomePhotoUrl">
          <el-input v-model="form.welcomePhotoUrl" placeholder="请输入欢迎图片 URL" />
        </el-form-item>
        <el-form-item label="Start图片" prop="startPhotoUrl">
          <el-input v-model="form.startPhotoUrl" placeholder="请输入 start 图片 URL" />
        </el-form-item>
        <el-form-item label="Start文案" prop="startCaption">
          <el-input
            v-model="form.startCaption"
            type="textarea"
            :rows="4"
            maxlength="1024"
            show-word-limit
            placeholder="请输入 /start 消息文案"
          />
        </el-form-item>
        <el-form-item label="开始游戏路径" prop="gamePath">
          <el-input v-model="form.gamePath" placeholder="/home/" />
        </el-form-item>
        <el-form-item label="提现路径" prop="withdrawPath">
          <el-input v-model="form.withdrawPath" placeholder="/withdraw/" />
        </el-form-item>
        <el-form-item label="充值路径" prop="rechargePath">
          <el-input v-model="form.rechargePath" placeholder="/recharge/" />
        </el-form-item>
        <el-form-item label="查询余额路径" prop="balancePath">
          <el-input v-model="form.balancePath" placeholder="/profile/" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { listTelegram, getTelegram, delTelegram, addTelegram, updateTelegram } from "@/api/telegram/telegram"

const PATH_REGEXP = /^\/[^\s]*$/
const HTTP_URL_REGEXP = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

function validateBaseUrl(_rule, value, callback) {
  const text = String(value || '').trim()
  if (!text) {
    callback(new Error('H5基础地址不能为空'))
    return
  }
  if (!HTTP_URL_REGEXP.test(text)) {
    callback(new Error('请输入正确的 http/https 地址'))
    return
  }
  callback()
}

function validatePath(_rule, value, callback) {
  const text = String(value || '').trim()
  if (text && !PATH_REGEXP.test(text)) {
    callback(new Error('路径必须以 / 开头，且不能包含空格'))
    return
  }
  callback()
}

function validateOptionalUrl(_rule, value, callback) {
  const text = String(value || '').trim()
  if (!text || HTTP_URL_REGEXP.test(text)) {
    callback()
    return
  }
  callback(new Error('请输入正确的 http/https 地址'))
}

export default {
  name: "Telegram",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      telegramList: [],
      title: "",
      open: false,
      statusOptions: [
        { label: "启用", value: 0 },
        { label: "停用", value: 1 }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        botCode: null,
        botUsername: null,
        siteCode: null,
        status: null
      },
      form: {},
      rules: {
        botCode: [
          { required: true, message: "机器人编码不能为空", trigger: "blur" }
        ],
        botUsername: [
          { required: true, message: "机器人用户名不能为空", trigger: "blur" }
        ],
        botTokenCipher: [
          { required: true, message: "机器人Token不能为空", trigger: "blur" }
        ],
        siteCode: [
          { required: true, message: "站点编码不能为空", trigger: "blur" }
        ],
        h5BaseUrl: [
          { required: true, validator: validateBaseUrl, trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ],
        gamePath: [
          { validator: validatePath, trigger: "blur" }
        ],
        withdrawPath: [
          { validator: validatePath, trigger: "blur" }
        ],
        rechargePath: [
          { validator: validatePath, trigger: "blur" }
        ],
        balancePath: [
          { validator: validatePath, trigger: "blur" }
        ],
        welcomePhotoUrl: [
          { validator: validateOptionalUrl, trigger: "blur" }
        ],
        startPhotoUrl: [
          { validator: validateOptionalUrl, trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listTelegram(this.queryParams).then(response => {
        this.telegramList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: null,
        botCode: null,
        botUsername: null,
        botTokenCipher: null,
        siteCode: null,
        h5BaseUrl: null,
        welcomePhotoUrl: null,
        startPhotoUrl: null,
        startCaption: null,
        gamePath: "/home/",
        withdrawPath: "/withdraw/",
        rechargePath: "/recharge/",
        balancePath: "/profile/",
        status: 0,
        sortOrder: 0,
        remark: null
      }
      this.resetForm("form")
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm("queryForm")
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
      this.title = "添加Telegram机器人配置"
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getTelegram(id).then(response => {
        this.form = {
          ...this.form,
          ...(response.data || {}),
          status: Number(response.data && response.data.status) || 0,
          sortOrder: Number(response.data && response.data.sortOrder) || 0
        }
        this.open = true
        this.title = "修改Telegram机器人配置"
      })
    },
    submitForm() {
      this.normalizeForm()
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return
        }
        const request = this.form.id != null ? updateTelegram : addTelegram
        request(this.form).then(() => {
          this.$modal.msgSuccess(this.form.id != null ? "修改成功" : "新增成功")
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除Telegram机器人配置编号为"' + ids + '"的数据项？').then(function() {
        return delTelegram(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleExport() {
      this.download('telegram/config/export', {
        ...this.queryParams
      }, `telegram_${new Date().getTime()}.xlsx`)
    },
    normalizeForm() {
      const trimFields = [
        "botCode",
        "botUsername",
        "botTokenCipher",
        "siteCode",
        "h5BaseUrl",
        "welcomePhotoUrl",
        "startPhotoUrl",
        "startCaption",
        "gamePath",
        "withdrawPath",
        "rechargePath",
        "balancePath",
        "remark"
      ]
      trimFields.forEach(field => {
        if (typeof this.form[field] === "string") {
          this.form[field] = this.form[field].trim()
        }
      })
      ;["welcomePhotoUrl", "startPhotoUrl", "startCaption", "remark"].forEach(field => {
        if (this.form[field] == null) {
          this.form[field] = ""
        }
      })
      if (this.form.botUsername && this.form.botUsername.startsWith("@")) {
        this.form.botUsername = this.form.botUsername.substring(1)
      }
      if (this.form.h5BaseUrl) {
        this.form.h5BaseUrl = this.form.h5BaseUrl.replace(/\/+$/, "")
      }
      this.form.status = Number(this.form.status)
      this.form.sortOrder = Number(this.form.sortOrder) || 0
    },
    formatBotUsername(username) {
      return username ? `@${username}` : "-"
    },
    formatToken(token) {
      if (!token) {
        return "未配置"
      }
      const text = String(token)
      return `已配置(${text.slice(-4)})`
    },
    formatStatus(status) {
      return Number(status) === 0 ? "启用" : "停用"
    },
    statusTagType(status) {
      return Number(status) === 0 ? "success" : "info"
    }
  }
}
</script>

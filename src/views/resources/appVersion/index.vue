<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="App版本" prop="appVersion">
        <el-input
          v-model="queryParams.appVersion"
          placeholder="请输入版本号，如 1.0.0"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['resources:appVersion:add']"
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
          v-hasPermi="['resources:appVersion:edit']"
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
          v-hasPermi="['resources:appVersion:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="appVersionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="App版本" align="center" prop="appVersion" width="140" />
      <el-table-column label="强行弹窗" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isForceShowDialog === 1 ? 'danger' : 'info'">
            {{ scope.row.isForceShowDialog === 1 ? '开启' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="强制更新" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isForceUpdate === 1 ? 'danger' : 'info'">
            {{ scope.row.isForceUpdate === 1 ? '开启' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="站点下载地址" align="center" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ formatDownloadPathPreview(scope.row.downloadPath) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['resources:appVersion:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['resources:appVersion:remove']"
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

    <el-dialog :title="title" :visible.sync="open" width="860px" append-to-body :before-close="handleAppVersionDialogClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="最新App版本" prop="appVersion">
              <el-input v-model="form.appVersion" placeholder="请输入版本号，如 1.0.0" maxlength="32" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="强行弹窗" prop="isForceShowDialog">
              <el-switch
                v-model="form.isForceShowDialog"
                :active-value="1"
                :inactive-value="0"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="强制更新" prop="isForceUpdate">
              <el-switch
                v-model="form.isForceUpdate"
                :active-value="1"
                :inactive-value="0"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注（可选）" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="安卓APK配置">
          <div class="config-tip">按站点编码配置安卓 APK；每个站点只保留一个 APK 地址。</div>
          <div
            v-for="(item, index) in form.apkDownloadPathRows"
            :key="'apk-' + index"
            class="config-row"
          >
            <el-select
              v-model="item.siteCode"
              filterable
              allow-create
              default-first-option
              placeholder="站点编码"
              class="config-site"
            >
              <el-option
                v-for="site in siteOptions"
                :key="site.code"
                :label="site.code + ' - ' + site.nameZn"
                :value="site.code"
              />
            </el-select>
            <el-input
              v-model="item.apkDownloadUrl"
              placeholder="请上传或输入该站点安卓APK OSS地址"
              class="config-url"
            />
            <el-button
              type="primary"
              plain
              icon="el-icon-upload2"
              :disabled="!item.siteCode"
              @click="openApkUploadDialog(index)"
            >点击上传</el-button>
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              @click="removeApkDownloadPathRow(index)"
            >删除</el-button>
          </div>
          <el-button type="primary" plain icon="el-icon-plus" @click="addApkDownloadPathRow">新增APK配置</el-button>
          <div class="config-tip">仅支持 .apk 文件，上传成功后会自动填入当前站点行。</div>
        </el-form-item>

        <el-form-item label="站点下载地址配置">
          <div class="config-tip">按站点编码配置下载地址；同一站点可添加多行，保存后按录入顺序作为多个下载地址。</div>
          <div
            v-for="(item, index) in form.downloadPathRows"
            :key="index"
            class="config-row"
          >
            <el-select
              v-model="item.siteCode"
              filterable
              allow-create
              default-first-option
              placeholder="站点编码"
              class="config-site"
            >
              <el-option
                v-for="site in siteOptions"
                :key="site.code"
                :label="site.code + ' - ' + site.nameZn"
                :value="site.code"
              />
            </el-select>
            <el-input
              v-model="item.downloadUrl"
              placeholder="请输入该站点App下载地址"
              class="config-url"
            />
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              @click="removeDownloadPathRow(index)"
            >删除</el-button>
          </div>
          <el-button type="primary" plain icon="el-icon-plus" @click="addDownloadPathRow">新增下载地址</el-button>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上传安卓APK" :visible.sync="apkUploadOpen" width="460px" append-to-body>
      <el-upload
        v-show="!apkUploading"
        ref="apkUpload"
        class="apk-uploader"
        drag
        action="#"
        :http-request="uploadApkDirectly"
        :show-file-list="false"
        :disabled="apkUploading"
        :before-upload="beforeApkUpload"
        :on-success="handleApkUploadSuccess"
        :on-error="handleApkUploadError"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将 APK 文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">仅支持 .apk 文件，单个文件不超过 300MB。</div>
      </el-upload>
      <div v-if="apkUploading || apkUploadProgress > 0" class="apk-upload-progress">
        <div class="apk-upload-stage">{{ apkUploadStage }}</div>
        <el-progress
          :percentage="apkUploadProgress"
          :status="apkUploadProgress === 100 ? 'success' : undefined"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :disabled="apkUploading" @click="apkUploadOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAppVersion, getAppVersion, addAppVersion, updateAppVersion, delAppVersion, getApkDirectUploadSign, deleteApkObject } from '@/api/resources/appVersion'
import { listSite } from '@/api/site/site'

export default {
  name: 'AppVersion',
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      appVersionList: [],
      siteOptions: [],
      title: '',
      open: false,
      apkUploadOpen: false,
      apkUploading: false,
      apkUploadProgress: 0,
      apkUploadStage: '',
      currentApkUploadIndex: -1,
      pendingUploadedApkUrls: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appVersion: undefined
      },
      form: {},
      rules: {
        appVersion: [
          { required: true, message: 'App版本不能为空', trigger: 'blur' },
          {
            pattern: /^\d+\.\d+\.\d+$/,
            message: '版本格式必须为 x.y.z，例如 1.0.0',
            trigger: 'blur'
          }
        ]
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
      listAppVersion(this.queryParams).then(response => {
        this.appVersionList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.siteOptions = response.rows || []
      })
    },
    formatDownloadPathPreview(configText) {
      if (!configText) {
        return '-'
      }
      try {
        const obj = JSON.parse(configText)
        const entries = Object.entries(obj)
        if (!entries.length) {
          return '-'
        }
        return entries.map(([k, v]) => {
          const urls = (Array.isArray(v) ? v : [v]).map(url => url == null ? '' : String(url))
          return `${k}: ${urls.join('、')}`
        }).join(' ; ')
      } catch (e) {
        return configText
      }
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    reset() {
      this.form = {
        id: undefined,
        appVersion: '',
        isForceShowDialog: 0,
        isForceUpdate: 0,
        remark: '',
        apkDownloadPath: '{}',
        apkDownloadPathRows: [{ siteCode: '', apkDownloadUrl: '' }],
        downloadPath: '{}',
        downloadPathRows: [{ siteCode: '', downloadUrl: '' }]
      }
      this.pendingUploadedApkUrls = {}
      this.currentApkUploadIndex = -1
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.title = '新增App版本配置'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getAppVersion(id).then(response => {
        const data = response.data || {}
        this.form = {
          ...this.form,
          ...data,
          isForceShowDialog: data.isForceShowDialog == null ? 0 : data.isForceShowDialog,
          isForceUpdate: data.isForceUpdate == null ? 0 : data.isForceUpdate,
          apkDownloadPath: data.apkDownloadPath || '{}',
          apkDownloadPathRows: this.parseApkDownloadPath(data.apkDownloadPath),
          downloadPathRows: this.parseDownloadPath(data.downloadPath)
        }
        this.title = '修改App版本配置'
        this.open = true
      })
    },
    parseDownloadPath(configText) {
      if (!configText) {
        return [{ siteCode: '', downloadUrl: '' }]
      }
      try {
        const obj = JSON.parse(configText)
        const rows = Object.entries(obj).reduce((result, [siteCode, downloadUrl]) => {
          const urls = Array.isArray(downloadUrl) ? downloadUrl : [downloadUrl]
          urls.forEach(url => {
            result.push({ siteCode, downloadUrl: url == null ? '' : String(url) })
          })
          return result
        }, [])
        return rows.length ? rows : [{ siteCode: '', downloadUrl: '' }]
      } catch (e) {
        return [{ siteCode: '', downloadUrl: '' }]
      }
    },
    addDownloadPathRow() {
      this.form.downloadPathRows.push({ siteCode: '', downloadUrl: '' })
    },
    removeDownloadPathRow(index) {
      this.form.downloadPathRows.splice(index, 1)
      if (!this.form.downloadPathRows.length) {
        this.form.downloadPathRows.push({ siteCode: '', downloadUrl: '' })
      }
    },
    buildDownloadPathJson() {
      const config = {}
      for (const row of this.form.downloadPathRows) {
        const siteCode = (row.siteCode || '').trim()
        const downloadUrl = (row.downloadUrl || '').trim()
        if (!siteCode && !downloadUrl) {
          continue
        }
        if (!siteCode || !downloadUrl) {
          this.$modal.msgError('站点编码和下载地址必须同时填写')
          return null
        }
        if (!config[siteCode]) {
          config[siteCode] = []
        }
        if (!config[siteCode].includes(downloadUrl)) {
          config[siteCode].push(downloadUrl)
        }
      }
      const normalized = {}
      Object.entries(config).forEach(([siteCode, urls]) => {
        normalized[siteCode] = urls.length === 1 ? urls[0] : urls
      })
      return JSON.stringify(normalized)
    },
    parseApkDownloadPath(configText) {
      if (!configText) {
        return [{ siteCode: '', apkDownloadUrl: '' }]
      }
      if (/^https?:\/\//i.test(String(configText).trim())) {
        return [{ siteCode: '', apkDownloadUrl: String(configText).trim() }]
      }
      try {
        const obj = JSON.parse(configText)
        const rows = Object.entries(obj).reduce((result, [siteCode, apkDownloadUrl]) => {
          result.push({ siteCode, apkDownloadUrl: apkDownloadUrl == null ? '' : String(apkDownloadUrl) })
          return result
        }, [])
        return rows.length ? rows : [{ siteCode: '', apkDownloadUrl: '' }]
      } catch (e) {
        return [{ siteCode: '', apkDownloadUrl: '' }]
      }
    },
    addApkDownloadPathRow() {
      this.form.apkDownloadPathRows.push({ siteCode: '', apkDownloadUrl: '' })
    },
    removeApkDownloadPathRow(index) {
      const row = this.form.apkDownloadPathRows[index] || {}
      const siteCode = (row.siteCode || '').trim()
      this.form.apkDownloadPathRows.splice(index, 1)
      if (!this.form.apkDownloadPathRows.length) {
        this.form.apkDownloadPathRows.push({ siteCode: '', apkDownloadUrl: '' })
      }
      if (siteCode && this.pendingUploadedApkUrls[siteCode] && this.pendingUploadedApkUrls[siteCode] === row.apkDownloadUrl) {
        this.cleanupUploadedApk(this.pendingUploadedApkUrls[siteCode])
        this.$delete(this.pendingUploadedApkUrls, siteCode)
      }
    },
    buildApkDownloadPathJson() {
      const config = {}
      for (const row of this.form.apkDownloadPathRows) {
        const siteCode = (row.siteCode || '').trim()
        const apkDownloadUrl = (row.apkDownloadUrl || '').trim()
        if (!siteCode && !apkDownloadUrl) {
          continue
        }
        if (!siteCode || !apkDownloadUrl) {
          this.$modal.msgError('站点编码和APK地址必须同时填写')
          return null
        }
        if (config[siteCode]) {
          this.$modal.msgError(`站点 ${siteCode} 的APK配置不能重复`)
          return null
        }
        if (!/^https?:\/\//i.test(apkDownloadUrl)) {
          this.$modal.msgError(`站点 ${siteCode} 的APK地址必须以 http:// 或 https:// 开头`)
          return null
        }
        if (!this.isApkUrl(apkDownloadUrl)) {
          this.$modal.msgError(`站点 ${siteCode} 的APK地址必须是 .apk 文件`)
          return null
        }
        config[siteCode] = apkDownloadUrl
      }
      return JSON.stringify(config)
    },
    parseApkDownloadPathObject(configText) {
      if (!configText) {
        return {}
      }
      try {
        const obj = JSON.parse(configText)
        return Object.entries(obj).reduce((result, [siteCode, apkDownloadUrl]) => {
          if (siteCode && apkDownloadUrl) {
            result[siteCode] = String(apkDownloadUrl)
          }
          return result
        }, {})
      } catch (e) {
        return {}
      }
    },
    isApkUrl(url) {
      const normalized = String(url || '').split('?')[0].split('#')[0]
      return /\.apk$/i.test(normalized)
    },
    openApkUploadDialog(index) {
      const row = this.form.apkDownloadPathRows[index]
      if (!row || !(row.siteCode || '').trim()) {
        this.$modal.msgError('请先选择站点')
        return
      }
      this.currentApkUploadIndex = index
      this.resetApkUploadState()
      this.apkUploadOpen = true
      this.$nextTick(() => {
        if (this.$refs.apkUpload) {
          this.$refs.apkUpload.clearFiles()
        }
      })
    },
    beforeApkUpload(file) {
      const fileName = file && file.name ? file.name : ''
      const isApk = /\.apk$/i.test(fileName)
      const isWithinLimit = file.size / 1024 / 1024 <= 300
      if (!isApk) {
        this.$modal.msgError('只能上传 APK 文件')
        return false
      }
      if (!isWithinLimit) {
        this.$modal.msgError('APK 文件不能超过 300MB')
        return false
      }
      this.apkUploading = true
      this.apkUploadProgress = 1
      this.apkUploadStage = '正在获取上传签名...'
      return true
    },
    uploadApkDirectly(options) {
      let ossXhr = null
      const row = this.form.apkDownloadPathRows[this.currentApkUploadIndex] || {}
      const siteCode = (row.siteCode || '').trim()
      getApkDirectUploadSign({
        fileName: options.file.name,
        fileSize: options.file.size,
        siteCode
      }).then(signResponse => {
        const sign = signResponse.data || {}
        if (!sign.host || !sign.objectKey || !sign.url || !sign.policy || !sign.signature || !sign.accessKeyId) {
          throw new Error('APK上传签名缺少必要参数')
        }
        const formData = new FormData()
        formData.append('key', sign.objectKey)
        formData.append('policy', sign.policy)
        formData.append('OSSAccessKeyId', sign.accessKeyId)
        formData.append('signature', sign.signature)
        formData.append('success_action_status', sign.successActionStatus || '200')
        formData.append('file', options.file)

        this.apkUploadStage = '正在上传到 OSS...'
        this.apkUploadProgress = Math.max(this.apkUploadProgress, 1)
        return this.postApkToOss(sign.host, formData, percent => {
          this.apkUploadProgress = percent
          if (options.onProgress) {
            options.onProgress({ percent })
          }
        }, xhr => {
          ossXhr = xhr
        }).then(() => {
          options.onSuccess({
            code: 200,
            url: sign.url,
            fileName: sign.url,
            newFileName: sign.objectKey ? sign.objectKey.split('/').pop() : options.file.name,
            originalFilename: options.file.name,
            objectKey: sign.objectKey,
            storage: 'oss'
          })
        })
      }).catch(error => {
        options.onError(error)
      })
      // Do not return the internal Promise. Element UI treats returned promises
      // as uploads and calls success/error again, which causes duplicate toasts.
      return {
        abort() {
          if (ossXhr) {
            ossXhr.abort()
          }
        }
      }
    },
    postApkToOss(host, formData, onProgress, onXhrReady) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        if (onXhrReady) {
          onXhrReady(xhr)
        }
        xhr.open('POST', host, true)
        xhr.upload.onprogress = event => {
          if (!event.lengthComputable) {
            return
          }
          const percent = Math.min(99, Math.max(1, Math.floor((event.loaded / event.total) * 100)))
          onProgress(percent)
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress(100)
            resolve()
            return
          }
          reject(new Error(`OSS上传失败(${xhr.status})`))
        }
        xhr.onerror = () => reject(new Error('OSS上传失败，请检查OSS跨域配置或网络状态'))
        xhr.onabort = () => reject(new Error('APK上传已取消'))
        xhr.send(formData)
      })
    },
    handleApkUploadSuccess(response) {
      this.apkUploading = false
      this.apkUploadProgress = 100
      this.apkUploadStage = '上传完成'
      if (!response || response.code !== 200) {
        this.$modal.msgError(response && response.msg ? response.msg : 'APK上传失败')
        return
      }
      const row = this.form.apkDownloadPathRows[this.currentApkUploadIndex]
      if (!row) {
        this.$modal.msgError('APK上传行不存在，请重新选择站点后上传')
        return
      }
      const siteCode = (row.siteCode || '').trim()
      const previousPendingUrl = this.pendingUploadedApkUrls[siteCode]
      row.apkDownloadUrl = response.url || response.fileName || ''
      this.$set(this.pendingUploadedApkUrls, siteCode, row.apkDownloadUrl)
      if (previousPendingUrl && previousPendingUrl !== row.apkDownloadUrl) {
        this.cleanupUploadedApk(previousPendingUrl)
      }
      this.apkUploadOpen = false
      this.$modal.msgSuccess('APK上传成功')
      this.$nextTick(() => {
        this.resetApkUploadState()
      })
    },
    handleApkUploadError(error) {
      this.apkUploading = false
      this.apkUploadStage = '上传失败'
      this.$modal.msgError(error && error.message ? error.message : 'APK上传失败，请稍后重试')
    },
    resetApkUploadState() {
      this.apkUploading = false
      this.apkUploadProgress = 0
      this.apkUploadStage = ''
    },
    cleanupUploadedApk(url) {
      if (!url) {
        return Promise.resolve()
      }
      return deleteApkObject({ url }).catch(() => {})
    },
    cleanupPendingUploadedApk(savedUrl) {
      const savedMap = this.parseApkDownloadPathObject(savedUrl)
      const savedUrls = new Set(Object.values(savedMap))
      const pendingEntries = Object.entries(this.pendingUploadedApkUrls || {})
      if (!pendingEntries.length) {
        return Promise.resolve()
      }
      const cleanupTasks = pendingEntries.map(([siteCode, pendingUrl]) => {
        if (!pendingUrl || savedUrls.has(pendingUrl)) {
          return Promise.resolve()
        }
        return this.cleanupUploadedApk(pendingUrl).then(() => {
          if (this.pendingUploadedApkUrls[siteCode] === pendingUrl) {
            this.$delete(this.pendingUploadedApkUrls, siteCode)
          }
        })
      })
      return Promise.all(cleanupTasks).then(() => {})
    },
    handleAppVersionDialogClose(done) {
      this.cleanupPendingUploadedApk('').finally(() => {
        done()
        this.reset()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const siteConfigJson = this.buildDownloadPathJson()
        if (siteConfigJson === null) {
          return
        }
        const apkConfigJson = this.buildApkDownloadPathJson()
        if (apkConfigJson === null) {
          return
        }

        const payload = {
          id: this.form.id,
          appVersion: this.form.appVersion,
          isForceShowDialog: this.form.isForceShowDialog,
          isForceUpdate: this.form.isForceUpdate,
          remark: this.form.remark,
          apkDownloadPath: apkConfigJson,
          downloadPath: siteConfigJson
        }

        const request = payload.id ? updateAppVersion(payload) : addAppVersion(payload)
        request.then(() => {
          this.$modal.msgSuccess(payload.id ? '修改成功' : '新增成功')
          this.cleanupPendingUploadedApk(payload.apkDownloadPath)
          this.pendingUploadedApkUrls = {}
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm(`是否确认删除App版本配置编号为"${ids}"的数据项？`).then(() => {
        return delAppVersion(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    cancel() {
      this.cleanupPendingUploadedApk('').finally(() => {
        this.open = false
        this.reset()
      })
    }
  }
}
</script>

<style scoped>
.config-tip {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}

.config-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.apk-config-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.apk-url {
  flex: 1;
}

.apk-uploader {
  text-align: center;
}

.apk-upload-progress {
  margin-top: 18px;
}

.apk-upload-stage {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
  text-align: center;
}

.config-site {
  width: 220px;
}

.config-url {
  flex: 1;
}
</style>

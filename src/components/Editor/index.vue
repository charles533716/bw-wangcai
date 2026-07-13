<template>
  <div :class="['editor-shell', { 'editor-shell--zh': toolbarLocale === 'zh-CN' }]">
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
      ref="upload"
      v-if="this.type == 'url'"
    >
    </el-upload>
    <div class="editor" ref="editor" :style="styles"></div>
  </div>
</template>

<script>
import axios from "axios"
import Quill from "quill"
import "quill/dist/quill.core.css"
import "quill/dist/quill.snow.css"
import "quill/dist/quill.bubble.css"
import { getToken } from "@/utils/auth"
import { isExternal } from "@/utils/validate"

const normalizeBaseUrl = (baseUrl) => String(baseUrl || "").replace(/\/+$/, "")
const joinApiUrl = (baseUrl, path) => {
  const rawPath = String(path || "")
  if (!rawPath) {
    return normalizeBaseUrl(baseUrl)
  }
  if (isExternal(rawPath)) {
    return rawPath
  }
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`
  return `${normalizedBaseUrl}${normalizedPath}`
}

export default {
  name: "Editor",
  props: {
    /* 编辑器的内容 */
    value: {
      type: String,
      default: "",
    },
    /* 高度 */
    height: {
      type: Number,
      default: null,
    },
    /* 最小高度 */
    minHeight: {
      type: Number,
      default: null,
    },
    /* 只读 */
    readOnly: {
      type: Boolean,
      default: false,
    },
    /* 上传文件大小限制(MB) */
    fileSize: {
      type: Number,
      default: 5,
    },
    /* 类型（base64格式、url格式） */
    type: {
      type: String,
      default: "url",
    },
    toolbarLocale: {
      type: String,
      default: "",
    }
  },
  data() {
    const baseUrl = normalizeBaseUrl(process.env.VUE_APP_BASE_API)
    return {
      baseUrl,
      uploadUrl: joinApiUrl(baseUrl, "/common/upload"), // 上传的图片服务器地址
      headers: {
        Authorization: "Bearer " + getToken()
      },
      Quill: null,
      currentValue: "",
      options: {
        theme: "snow",
        bounds: document.body,
        debug: "warn",
        modules: {
          // 工具栏配置
          toolbar: this.toolbarLocale === "zh-CN" ? [
            [{ header: [false, 1, 2, 3] }],
            ["blockquote", "bold", "underline", "italic", "strike"],
            [{ color: [] }, { background: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ font: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"]
          ] : [
            ["bold", "italic", "underline", "strike"],       // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"],                    // 引用  代码块
            [{ list: "ordered" }, { list: "bullet" }],       // 有序、无序列表
            [{ indent: "-1" }, { indent: "+1" }],            // 缩进
            [{ size: ["small", false, "large", "huge"] }],   // 字体大小
            [{ header: [1, 2, 3, 4, 5, 6, false] }],         // 标题
            [{ color: [] }, { background: [] }],             // 字体颜色、字体背景颜色
            [{ align: [] }],                                 // 对齐方式
            ["clean"],                                       // 清除文本格式
            ["link", "image", "video"]                       // 链接、图片、视频
          ],
        },
        placeholder: "请输入内容",
        readOnly: this.readOnly,
      },
    }
  },
  computed: {
    styles() {
      let style = {}
      if (this.minHeight) {
        style.minHeight = `${this.minHeight}px`
      }
      if (this.height) {
        style.height = `${this.height}px`
      }
      return style
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          this.currentValue = val === null ? "" : val
          if (this.Quill) {
            this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue)
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.Quill = null
  },
  methods: {
    init() {
      const editor = this.$refs.editor
      this.Quill = new Quill(editor, this.options)
      if (this.toolbarLocale === "zh-CN") {
        this.localizeToolbar()
      }
      // 如果设置了上传地址则自定义图片上传事件
      if (this.type == 'url') {
        let toolbar = this.Quill.getModule("toolbar")
        toolbar.addHandler("image", (value) => {
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click()
          } else {
            this.quill.format("image", false)
          }
        })
        this.Quill.root.addEventListener('paste', this.handlePasteCapture, true)
      }
      this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue)
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        const html = this.$refs.editor.children[0].innerHTML
        const text = this.Quill.getText()
        const quill = this.Quill
        this.currentValue = html
        this.$emit("input", html)
        this.$emit("on-change", { html, text, quill })
      })
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        this.$emit("on-text-change", delta, oldDelta, source)
      })
      this.Quill.on("selection-change", (range, oldRange, source) => {
        this.$emit("on-selection-change", range, oldRange, source)
      })
      this.Quill.on("editor-change", (eventName, ...args) => {
        this.$emit("on-editor-change", eventName, ...args)
      })
    },
    localizeToolbar() {
      const toolbar = this.Quill && this.Quill.getModule("toolbar")
      const container = toolbar && toolbar.container
      if (!container) {
        return
      }
      const titles = {
        ".ql-blockquote": "引用",
        ".ql-bold": "加粗",
        ".ql-underline": "下划线",
        ".ql-italic": "斜体",
        ".ql-strike": "删除线",
        ".ql-list[value='ordered']": "有序列表",
        ".ql-list[value='bullet']": "无序列表",
        ".ql-link": "插入链接",
        ".ql-image": "插入图片",
        ".ql-video": "插入视频",
        ".ql-clean": "清除格式"
      }
      Object.keys(titles).forEach(selector => {
        const button = container.querySelector(selector)
        if (button) {
          button.setAttribute("title", titles[selector])
        }
      })
      const formatGroup = document.createElement("span")
      formatGroup.className = "ql-formats editor-zh-line-height-wrap"
      const lineHeightSelect = document.createElement("select")
      lineHeightSelect.className = "editor-zh-line-height"
      ;[
        { value: "normal", label: "默认行高" },
        { value: "1.5", label: "1.5倍行高" },
        { value: "2", label: "2倍行高" }
      ].forEach(item => {
        const option = document.createElement("option")
        option.value = item.value
        option.textContent = item.label
        lineHeightSelect.appendChild(option)
      })
      lineHeightSelect.addEventListener("change", event => {
        this.Quill.root.style.lineHeight = event.target.value
      })
      formatGroup.appendChild(lineHeightSelect)
      container.appendChild(formatGroup)
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"]
      const isJPG = type.includes(file.type)
      // 检验文件格式
      if (!isJPG) {
        this.$message.error(`图片格式错误!`)
        return false
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize
        if (!isLt) {
          this.$message.error(`上传文件大小不能超过 ${this.fileSize} MB!`)
          return false
        }
      }
      return true
    },
    handleUploadSuccess(res, file) {
      // 如果上传成功
      if (res.code == 200) {
        const imageUrl = this.getUploadImageUrl(res)
        if (!imageUrl) {
          this.$message.error("图片插入失败")
          return
        }
        // 获取富文本组件实例
        let quill = this.Quill
        // 获取光标所在位置
        let length = quill.getSelection().index
        // 插入图片  res.url为服务器返回的图片地址
        quill.insertEmbed(length, "image", imageUrl)
        // 调整光标到最后
        quill.setSelection(length + 1)
      } else {
        this.$message.error("图片插入失败")
      }
    },
    getUploadImageUrl(res) {
      const url = res.url || res.fileName
      if (!url) {
        return ""
      }
      return joinApiUrl(this.baseUrl, url)
    },
    handleUploadError() {
      this.$message.error("图片插入失败")
    },
    // 复制粘贴图片处理
    handlePasteCapture(e) {
      const clipboard = e.clipboardData || window.clipboardData
      if (clipboard && clipboard.items) {
        for (let i = 0; i < clipboard.items.length; i++) {
          const item = clipboard.items[i]
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault()
            const file = item.getAsFile()
            this.insertImage(file)
          }
        }
      }
    },
    insertImage(file) {
      const formData = new FormData()
      formData.append("file", file)
      axios.post(this.uploadUrl, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: this.headers.Authorization } }).then(res => {
        this.handleUploadSuccess(res.data)
      })
    }
  }
}
</script>

<style>
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
.editor-shell--zh .ql-snow .ql-picker.ql-header .ql-picker-label:not([data-value])::before {
  content: "正文";
}
.editor-shell--zh .ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before {
  content: "默认字号";
}
.editor-shell--zh .ql-snow .ql-picker.ql-font .ql-picker-label:not([data-value])::before {
  content: "默认字体";
}
.editor-shell--zh .ql-picker.ql-size,
.editor-shell--zh .ql-picker.ql-font {
  width: 96px;
}
.editor-shell--zh .ql-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.editor-zh-line-height {
  height: 28px;
  padding: 0 26px 0 10px;
  border: none;
  color: #444;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
.editor-zh-line-height:focus {
  outline: none;
}
</style>

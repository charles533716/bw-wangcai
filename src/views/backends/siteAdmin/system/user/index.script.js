import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  deptTreeSelect,
  updateUserGoogleAuth,
  getGoogleAuthQrCode,
  verifyGoogleCode
} from '@/api/system/user';
import { getToken } from '@/utils/auth';
import { getConfigKeyObj, updateConfig } from '@/api/system/config';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import VueQr from 'vue-qr';

export default {
  name: 'User',
  dicts: ['sys_normal_disable', 'sys_user_sex'],
  components: { Treeselect, Splitpanes, Pane, VueQr },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 所有部门树选项
      deptOptions: undefined,
      // 过滤掉已禁用部门树选项
      enabledDeptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 全局设置弹出层
      globalConfigOpen: false,
      // Google验证管理弹出层
      googleAuthOpen: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
	      // 角色选项
	      roleOptions: [],
	      // 站点选项（仅admin新增站点管理员时使用）
	      siteOptions: [],
	      // 角色单选值
	      selectedRoleId: undefined,
      // 表单参数
      form: {},
      // 全局设置表单
      globalConfigForm: {
        isGoogleAuth: 'false',
        configId: ''
      },
      // Google验证相关数据
      googleAuthTitle: '',
      googleAuthForm: {
        userId: undefined,
        userName: '',
        isGoogleAuth: '0',
        googleKey: ''
      },
      qrCodeData: {
        secretKey: '',
        qrCodeText: ''
      },
      testCode: '',
      generatingKey: false,
      testingCode: false,
      testCodeVerified: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        isGoogleAuth: undefined,
        deptId: undefined
      },
      // 列信息
      columns: {
        userId: { label: '用户编号', visible: true },
        userName: { label: '用户名称', visible: true },
        nickName: { label: '用户昵称', visible: true },
        isGoogleAuth: { label: '登录方式', visible: true },
        googleKey: { label: 'Google密钥', visible: true },
        status: { label: '状态', visible: true },
        createTime: { label: '创建时间', visible: true }
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
          { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\\ |', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  computed: {
    // 验证Google验证设置是否有效
    isGoogleAuthValid() {
      if (this.googleAuthForm.isGoogleAuth === '0') {
        return true; // 禁用状态总是有效
      }
      // 启用状态下需要验证测试通过
      return this.googleAuthForm.googleKey && this.testCodeVerified;
    },
    isCurrentAdminAccount() {
      const roles = this.$store.getters.roles || [];
      if (Array.isArray(roles) && roles.includes('admin')) {
        return true;
      }
      const userName = this.$store.getters.userName || this.$store.getters.name;
      return userName === 'admin';
    },
    selectedRoleOption() {
      return this.roleOptions.find((item) => item.roleId === this.selectedRoleId) || null;
    },
    selectedRoleKey() {
      return this.selectedRoleOption ? this.selectedRoleOption.roleKey : '';
    },
    availableRoleOptions() {
      if (this.form.userId === undefined) {
        return this.roleOptions.filter((item) => item.roleKey === 'siteadmin');
      }
      if (this.isCurrentAdminAccount) {
        return this.roleOptions;
      }
      return this.roleOptions.filter((item) => item.roleKey !== 'siteadmin');
    },
    showSiteSelector() {
      return this.isCurrentAdminAccount && this.selectedRoleKey === 'siteadmin';
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
    selectedRoleId() {
      if (this.selectedRoleKey !== 'siteadmin') {
        this.form.siteCode = undefined;
      }
    }
  },
  created() {
    this.getList();
    this.getDeptTree();
    this.getConfigKey('sys.user.initPassword').then((response) => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then((response) => {
        this.deptOptions = response.data;
        this.enabledDeptOptions = this.filterDisabledDept(
          JSON.parse(JSON.stringify(response.data))
        );
      });
    },
    // 过滤禁用的部门
    filterDisabledDept(deptList) {
      return deptList.filter((dept) => {
        if (dept.disabled) {
          return false;
        }
        if (dept.children && dept.children.length) {
          dept.children = this.filterDisabledDept(dept.children);
        }
        return true;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    applyUserMetaOptions(response) {
      this.roleOptions = Array.isArray(response.roles) ? response.roles : [];
      const rawSites = Array.isArray(response.sites) ? response.sites : [];
      this.siteOptions = rawSites
        .filter((item) => item && item.code)
        .map((item) => ({
          code: item.code,
          label: item.name ? `${item.name} (${item.code})` : item.code
        }));
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === '0' ? '启用' : '停用';
      this.$modal
        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + '成功');
        })
        .catch(function () {
          row.status = row.status === '0' ? '1' : '0';
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        isGoogleAuth: '0',
        googleKey: undefined,
        siteCode: undefined,
        remark: undefined,
        postIds: [],
        roleIds: []
      };
      this.selectedRoleId = undefined;
      this.resetForm('form');
    },
    // 重置Google验证表单
    resetGoogleAuthForm() {
      this.googleAuthForm = {
        userId: undefined,
        userName: undefined,
        isGoogleAuth: '0',
        googleKey: undefined
      };
      this.qrCodeData = {
        secretKey: '',
        qrCodeText: ''
      };
      this.testCode = '';
      this.testCodeVerified = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm('queryForm');
      this.queryParams.deptId = undefined;
      this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleResetPwd':
          this.handleResetPwd(row);
          break;
        case 'handleAuthRole':
          this.handleAuthRole(row);
          break;
        case 'handleGoogleAuth':
          this.handleGoogleAuth(row);
          break;
        default:
          break;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      getUser().then((response) => {
        this.postOptions = response.posts;
        this.applyUserMetaOptions(response);
        const siteAdminRole = this.roleOptions.find((item) => item.roleKey === 'siteadmin');
        this.selectedRoleId = siteAdminRole ? siteAdminRole.roleId : undefined;
        this.open = true;
        this.title = '添加用户';
        this.form.password = this.initPassword;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.applyUserMetaOptions(response);
        this.$set(this.form, 'postIds', response.postIds);
        this.$set(this.form, 'roleIds', response.roleIds);
        this.selectedRoleId = Array.isArray(response.roleIds) && response.roleIds.length > 0 ? response.roleIds[0] : undefined;
        this.open = true;
        this.title = '修改用户';
        this.form.password = '';
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
        inputValidator: (value) => {
          if (/<|>|"|'|\||\\/.test(value)) {
            return '不能包含非法字符：< > " \' \\\ |';
          }
        }
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.$modal.msgSuccess('修改成功，新密码是：' + value);
          });
        })
        .catch(() => {});
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push('/system/user-auth/role/' + userId);
    },
    /** Google验证管理 */
    handleGoogleAuth(row) {
      this.resetGoogleAuthForm();
      this.googleAuthForm = {
        userId: row.userId,
        userName: row.userName,
        isGoogleAuth: row.isGoogleAuth || '0',
        googleKey: row.googleKey || ''
      };
      this.googleAuthTitle = 'Google验证管理 - ' + row.userName;
      this.googleAuthOpen = true;

      // 如果已有密钥，显示二维码
      if (this.googleAuthForm.googleKey && this.googleAuthForm.isGoogleAuth === '1') {
        this.generateQRCodeFromExistingKey();
      }
    },
    /** 生成Google密钥和二维码 */
    async generateGoogleKeyForUser() {
      this.generatingKey = true;
      try {
        const response = await getGoogleAuthQrCode(
          this.googleAuthForm.userName,
          this.$store.getters.siteTitle
        );

        this.qrCodeData.qrCodeText = response.qrCodeText;
        this.qrCodeData.secretKey = response.secretKey;
        this.googleAuthForm.googleKey = response.secretKey;
        this.testCodeVerified = false;
        this.testCode = '';
        this.$modal.msgSuccess('密钥生成成功，请扫描二维码并测试验证码');
      } catch (error) {
        console.error(error);
        this.$modal.msgError('密钥生成失败');
      } finally {
        this.generatingKey = false;
      }
    },
    /** 从现有密钥生成二维码 */
    generateQRCodeFromExistingKey() {
      if (this.googleAuthForm.googleKey) {
        this.qrCodeData = {
          secretKey: this.googleAuthForm.googleKey,
          qrCodeText: `otpauth://totp/${encodeURIComponent(this.googleAuthForm.userName)}?secret=${
            this.googleAuthForm.googleKey
          }&issuer=${encodeURIComponent(this.$store.getters.siteTitle)}`
        };
      }
    },
    /** 测试Google验证码 */
    async testGoogleCode() {
      if (!this.testCode || this.testCode.length !== 6) {
        this.$modal.msgError('请输入6位验证码');
        return;
      }

      if (!this.googleAuthForm.googleKey) {
        this.$modal.msgError('请先生成Google密钥');
        return;
      }

      this.testingCode = true;
      try {
        await verifyGoogleCode(this.googleAuthForm.googleKey, this.testCode);
        this.testCodeVerified = true;
        this.$modal.msgSuccess('验证码测试成功');
      } catch (error) {
        this.testCodeVerified = false;
        this.$modal.msgError('验证码错误，请重新输入');
      } finally {
        this.testingCode = false;
      }
    },
    /** 复制密钥 */
    copySecretKey() {
      if (!this.googleAuthForm.googleKey) {
        this.$modal.msgError('没有可复制的密钥');
        return;
      }

      const textarea = document.createElement('textarea');
      textarea.value = this.googleAuthForm.googleKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.$modal.msgSuccess('密钥已复制到剪贴板');
    },
    /** Google验证状态变更处理 */
    handleGoogleAuthChange(value) {
      if (value === '0') {
        // 禁用Google验证
        this.googleAuthForm.googleKey = '';
        this.qrCodeData = { secretKey: '', qrCodeText: '' };
        this.testCode = '';
        this.testCodeVerified = false;
      }
    },
    /** 提交Google验证设置 */
    async submitGoogleAuth() {
      if (this.googleAuthForm.isGoogleAuth === '1' && !this.testCodeVerified) {
        this.$modal.msgError('请先测试验证码并通过验证');
        return;
      }

      try {
        await updateUserGoogleAuth(this.googleAuthForm);
        this.$modal.msgSuccess('设置成功');
        this.googleAuthOpen = false;
        this.getList();
      } catch (error) {
        this.$modal.msgError('设置失败');
      }
    },
    /** 全局设置按钮操作 */
    handleGlobalConfig() {
      getConfigKeyObj('sys.account.is_google_auth')
        .then((response) => {
          this.globalConfigForm.isGoogleAuth = response.data ? response.data.configValue : '0';
          this.globalConfigOpen = true;
          this.globalConfigForm.configId = response.data ? response.data.configId : '';
        })
        .catch(() => {
          this.globalConfigForm.isGoogleAuth = '0';
          this.globalConfigForm.configId = '';
          this.globalConfigOpen = true;
        });
    },
    /** 提交全局设置 */
    submitGlobalConfig() {
      const configData = {
        configId: this.globalConfigForm.configId,
        configKey: 'sys.account.is_google_auth',
        configValue: this.globalConfigForm.isGoogleAuth,
        configName: '是否启用Google验证',
        configType: 'Y',
        remark: '全局登录方式设置：0-账号密码登录，1-Google验证码登录'
      };
      updateConfig(configData)
        .then((response) => {
          this.$modal.msgSuccess('设置成功');
          this.globalConfigOpen = false;
        })
        .catch(() => {
          this.$modal.msgError('设置失败');
        });
    },
    /** 生成Google密钥 */
    generateGoogleKey() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let key = '';
      for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.form.googleKey = key;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.selectedRoleId) {
            this.$modal.msgError('请选择一个角色');
            return;
          }
          if (this.form.userId === undefined && this.selectedRoleKey !== 'siteadmin') {
            this.$modal.msgError('新增用户仅允许创建站点管理员');
            return;
          }
          if (this.selectedRoleKey === 'siteadmin') {
            if (!this.isCurrentAdminAccount) {
              this.$modal.msgError('仅admin账户可以新增站点管理员');
              return;
            }
            if (!this.form.siteCode) {
              this.$modal.msgError('请选择所属站点');
              return;
            }
          } else if (!this.isCurrentAdminAccount) {
            this.form.siteCode = this.$store.getters.userSiteCode || this.form.siteCode;
          }
          if (!this.form.nickName && this.form.userName) {
            this.form.nickName = this.form.userName;
          }
          this.form.roleIds = [this.selectedRoleId];
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功');
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
              this.$modal.msgSuccess('新增成功');
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal
        .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/user/export',
        {
          ...this.queryParams
        },
        `user_${new Date().getTime()}.xlsx`
      );
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入';
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`);
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          '</div>',
        '导入结果',
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      const file = this.$refs.upload.uploadFiles;
      if (
        !file ||
        file.length === 0 ||
        (!file[0].name.toLowerCase().endsWith('.xls') &&
          !file[0].name.toLowerCase().endsWith('.xlsx'))
      ) {
        this.$modal.msgError('请选择后缀为 "xls"或"xlsx"的文件。');
        return;
      }
      this.$refs.upload.submit();
    }
  }
};

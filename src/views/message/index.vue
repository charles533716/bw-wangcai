<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="消息标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入消息标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <el-select v-model="queryParams.messageType" placeholder="消息类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.message_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发送对象" prop="sendTarget">
        <el-select v-model="queryParams.sendTarget" placeholder="发送对象" clearable size="small">
          <el-option label="所有用户" value="all" />
          <el-option label="指定用户" value="specific" />
        </el-select>
      </el-form-item>
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="消息状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.message_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['system:message:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:message:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:message:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          @click="handleExport"
          v-hasPermi="['system:message:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-send"
          :disabled="single"
          @click="handleSend"
          v-hasPermi="['system:message:send']"
        >发送</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-refresh-left"
          :disabled="single"
          @click="handleRecall"
          v-hasPermi="['system:message:recall']"
        >撤回</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="messageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="消息类型" align="center" prop="messageType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.message_type" :value="scope.row.messageType" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority === 1" type="danger" size="small">重要</el-tag>
          <el-tag v-else type="info" size="small">普通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送对象" align="center" prop="sendTarget" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.sendTarget === 'all'">所有用户</span>
          <span v-else>指定用户</span>
        </template>
      </el-table-column>
      <el-table-column label="站点编码" align="center" prop="siteCode" width="120" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.message_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="已读人数" align="center" prop="readCount" width="80" />
      <el-table-column label="发送时间" align="center" prop="sendTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.sendTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['system:message:query']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:message:edit']"
          >修改</el-button>
          <el-button
            v-if="scope.row.status === '0'"
            size="mini"
            type="text"
            icon="el-icon-send"
            @click="handleSend(scope.row)"
            v-hasPermi="['system:message:send']"
          >发送</el-button>
          <el-button
            v-if="scope.row.status === '1'"
            size="mini"
            type="text"
            icon="el-icon-refresh-left"
            @click="handleRecall(scope.row)"
            v-hasPermi="['system:message:recall']"
          >撤回</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:message:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改站内信对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入消息标题" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="form.messageType" placeholder="请选择消息类型" style="width: 100%">
                <el-option
                  v-for="dict in dict.type.message_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-radio-group v-model="form.priority">
                <el-radio :label="0">普通</el-radio>
                <el-radio :label="1">重要</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发送对象" prop="sendTarget">
              <el-radio-group v-model="form.sendTarget" @change="handleSendTargetChange">
                <el-radio label="all">所有用户</el-radio>
                <el-radio label="specific">指定用户</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点编码" prop="siteCode">
              <el-input v-model="form.siteCode" placeholder="请输入站点编码（留空表示所有站点）" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.sendTarget === 'specific'">
          <el-col :span="24">
            <el-form-item label="接收用户" prop="recipientIds">
              <el-input
                v-model="form.recipientIds"
                type="textarea"
                :rows="3"
                placeholder="请输入用户ID，多个用逗号分隔。例如：1,2,3"
              />
              <div class="form-tips">提示：可点击右侧按钮选择用户</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息内容" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="6"
                placeholder="请输入消息内容"
                maxlength="500"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发送时间" prop="sendTime">
              <el-date-picker
                v-model="form.sendTime"
                type="datetime"
                placeholder="选择发送时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
              <div class="form-tips">不选择则立即发送</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                v-model="form.expireTime"
                type="datetime"
                placeholder="选择过期时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
              <div class="form-tips">留空表示永不过期</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 站内信详情对话框 -->
    <el-dialog title="消息详情" :visible.sync="openView" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="消息标题">{{ form.title }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <dict-tag :options="dict.type.message_type" :value="form.messageType" />
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="form.priority === 1" type="danger" size="small">重要</el-tag>
          <el-tag v-else type="info" size="small">普通</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送对象">
          <span v-if="form.sendTarget === 'all'">所有用户</span>
          <span v-else>指定用户</span>
        </el-descriptions-item>
        <el-descriptions-item label="站点编码">{{ form.siteCode || '所有站点' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="dict.type.message_status" :value="form.status" />
        </el-descriptions-item>
        <el-descriptions-item label="已读人数">{{ form.readCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ parseTime(form.sendTime, '{y}-{m}-{d} {h}:{i}') }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ parseTime(form.expireTime, '{y}-{m}-{d} {h}:{i}') || '永不过期' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(form.createTime, '{y}-{m}-{d} {h}:{i}') }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ form.createBy }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <div class="message-content-view">
        <h4>消息内容：</h4>
        <div class="content-box">{{ form.content }}</div>
      </div>
      <el-divider />
      <div class="message-recipients" v-if="form.sendTarget === 'specific' && form.recipientIds">
        <h4>接收用户ID：</h4>
        <div class="recipients-box">{{ form.recipientIds }}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openView = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMessage, getMessage, delMessage, addMessage, updateMessage, sendMessage, recallMessage } from "@/api/message/message";

export default {
  name: "Message",
  dicts: ['message_type', 'message_status'],
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
      // 站内信表格数据
      messageList: [],
      // 日期范围
      dateRange: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示查看弹出层
      openView: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        messageType: null,
        priority: null,
        sendTarget: null,
        siteCode: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "消息标题不能为空", trigger: "blur" },
          { max: 200, message: "消息标题长度不能超过200个字符", trigger: "blur" }
        ],
        messageType: [
          { required: true, message: "消息类型不能为空", trigger: "change" }
        ],
        content: [
          { required: true, message: "消息内容不能为空", trigger: "blur" }
        ],
        priority: [
          { required: true, message: "优先级不能为空", trigger: "change" }
        ],
        sendTarget: [
          { required: true, message: "发送对象不能为空", trigger: "change" }
        ],
        recipientIds: [
          { required: true, message: "接收用户不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询站内信列表 */
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
        beginSendTime: this.dateRange[0],
        endSendTime: this.dateRange[1]
      };
      listMessage(params).then(response => {
        this.messageList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        id: null,
        title: null,
        content: null,
        messageType: "1",
        priority: 0,
        sendTarget: "all",
        recipientIds: null,
        siteCode: null,
        status: "0",
        readCount: 0,
        sendTime: null,
        expireTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加站内信";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getMessage(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改站内信";
      });
    },
    /** 查看详情按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getMessage(id).then(response => {
        this.form = response.data;
        this.openView = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMessage(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMessage(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除站内信编号为"' + ids + '"的数据项？').then(() => {
        return delMessage(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 发送按钮操作 */
    handleSend(row) {
      const id = row.id || this.ids[0];
      this.$modal.confirm('是否确认发送该消息？').then(() => {
        return sendMessage(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("发送成功");
      }).catch(() => {});
    },
    /** 撤回按钮操作 */
    handleRecall(row) {
      const id = row.id || this.ids[0];
      this.$modal.confirm('是否确认撤回该消息？').then(() => {
        return recallMessage(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("撤回成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = {
        ...this.queryParams,
        beginSendTime: this.dateRange[0],
        endSendTime: this.dateRange[1]
      };
      this.download('system/message/export', queryParams, `message_${new Date().getTime()}.xlsx`);
    },
    /** 发送对象变化处理 */
    handleSendTargetChange(value) {
      if (value === 'all') {
        this.form.recipientIds = null;
      }
    }
  }
};
</script>

<style scoped>
.form-tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.message-content-view {
  margin: 20px 0;
}

.content-box {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.message-recipients {
  margin: 20px 0;
}

.recipients-box {
  padding: 10px;
  background: #f0f9eb;
  border-radius: 4px;
  font-family: monospace;
}

.el-divider {
  margin: 20px 0;
}
</style>

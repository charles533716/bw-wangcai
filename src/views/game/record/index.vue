<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <!-- 站点编码 -->
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 会员账号 -->
      <el-form-item label="会员账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入会员账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 上级代理ID -->
      <el-form-item label="上级代理ID" prop="agentCode">
        <el-input
          v-model="queryParams.agentCode"
          placeholder="请输入上级代理ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 上级代理名字 -->
      <el-form-item label="上级代理名字" prop="agentName">
        <el-input
          v-model="queryParams.agentName"
          placeholder="请输入上级代理名字"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 注单流水号 -->
      <el-form-item label="注单流水号" prop="generatedId">
        <el-input
          v-model="queryParams.generatedId"
          placeholder="请输入三方注单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 场馆名称 -->
      <el-form-item label="场馆名称" prop="venueCode">
        <el-select
          v-model="queryParams.venueCode"
          placeholder="请选择场馆名称"
          clearable
          filterable
          size="small"
          style="width: 180px"
        >
          <el-option
            v-for="venue in venueOptions"
            :key="venue.code"
            :label="venue.nameZn"
            :value="venue.code"
          />
        </el-select>
      </el-form-item>

      <!-- 场馆类型 -->
      <el-form-item label="场馆类型" prop="venueType">
        <el-select
          v-model="queryParams.venueType"
          placeholder="请选择场馆类型"
          clearable
          size="small"
          style="width: 180px"
        >
          <el-option
            v-for="dict in venueTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <!-- 游戏名称 -->
      <el-form-item label="游戏名称" prop="gameTypeName">
        <el-input
          v-model="queryParams.gameTypeName"
          placeholder="请输入游戏名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 订单状态 -->
      <el-form-item label="订单状态" prop="obBetStatus">
        <el-select
          v-model="queryParams.obBetStatus"
          placeholder="请选择订单状态"
          clearable
          size="small"
          style="width: 180px"
        >
          <el-option label="未结算" :value="0" />
          <el-option label="已结算" :value="1" />
          <el-option label="不结算" :value="2" />
        </el-select>
      </el-form-item>

      <!-- 游戏编号 -->
      <el-form-item label="游戏编号" prop="gameTypeId">
        <el-input
          v-model="queryParams.gameTypeId"
          placeholder="请输入游戏类型ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 下注金额范围 -->
      <el-form-item label="下注金额">
        <el-input
          v-model="queryParams.minBetAmount"
          placeholder="最小金额"
          clearable
          size="small"
          style="width: 100px"
          @keyup.enter.native="handleQuery"
        />
        <span style="margin: 0 5px">至</span>
        <el-input
          v-model="queryParams.maxBetAmount"
          placeholder="最大金额"
          clearable
          size="small"
          style="width: 100px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 联赛/赛事名称 -->
      <el-form-item label="赛事名称" prop="matchDetail">
        <el-input
          v-model="queryParams.matchDetail"
          placeholder="请输入赛事详情"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- 下注时间范围 -->
      <el-form-item label="下注时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="结算时间">
        <el-date-picker
          v-model="netDateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="同步时间">
        <el-date-picker
          v-model="syncDateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          >导出</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleSync"
          v-hasPermi="['bet:records:sync']"
        >同步数据</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="betRecordsList"
      @selection-change="handleSelectionChange"
      :summary-method="getSummaries"
      show-summary
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column
        label="注单号"
        align="center"
        prop="generatedId"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column label="站点编码" align="center" prop="siteCode" width="100" />
      <el-table-column label="会员账号" align="center" prop="userName" width="120" />
      <el-table-column label="上级代理ID" align="center" prop="agentCode" width="120" />
      <el-table-column
        label="上级代理名字"
        align="center"
        prop="agentName"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column label="场馆类型" align="center" prop="venueType" width="120" />
      <el-table-column label="场馆名称" align="center" prop="venueName" width="120" />
      <el-table-column
        label="游戏ID"
        align="center"
        prop="gameTypeId"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="游戏名称"
        align="center"
        prop="gameTypeName"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column label="下注详情" align="center" prop="betContent" width="120" />
      <el-table-column label="下注金额" align="center" prop="betAmount" width="100" />

      <el-table-column label="有效投注" align="center" prop="validBetAmount" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.validBetAmount ? scope.row.validBetAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赔率" align="center" prop="oddsValue" width="120" />
      <el-table-column label="盘口" align="center" prop="marketDetail" width="120" />
      <el-table-column label="房间" align="center" prop="gameRoom" width="120" />
      <el-table-column label="净盈利" align="center" prop="netAmount" width="100">
        <template slot-scope="scope">
          <span
            :class="{
              'text-success': scope.row.netAmount > 0,
              'text-danger': scope.row.netAmount < 0
            }"
          >
            {{ scope.row.netAmount ? scope.row.netAmount.toFixed(2) : '0.00' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="obBetStatus" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.obBetStatus === 1
                ? 'success'
                : scope.row.obBetStatus === 2
                ? 'warning'
                : 'info'
            "
          >
            {{
              scope.row.obBetStatus === 1
                ? '已结算'
                : scope.row.obBetStatus === 2
                ? '不结算'
                : '未结算'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下注时间" align="center" prop="betAt" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.betAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算时间" align="center" prop="netAt" width="160">
        <template slot-scope="scope">
          <span>{{
            scope.row.netAt ? parseTime(scope.row.netAt, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="同步时间" align="center" prop="syncAt" width="160">
        <template slot-scope="scope">
          <span>{{
            scope.row.syncAt ? parseTime(scope.row.syncAt, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="币种" align="center" prop="currency" width="80" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['bet:records:query']"
            >详情</el-button
          >
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bet:records:remove']"
          >删除</el-button> -->
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

    <!-- 同步数据对话框 -->
    <el-dialog title="同步注单数据" :visible.sync="syncOpen" width="500px" append-to-body>
      <el-form ref="syncForm" :model="syncForm" :rules="syncRules" label-width="100px">
        <el-form-item label="场馆编码" prop="venueCode">
          <el-select
            v-model="syncForm.venueCode"
            placeholder="请选择场馆编码"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="venue in venueOptions"
              :key="venue.code"
              :label="`${venue.nameZn} (${venue.code})`"
              :value="venue.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-input v-model="syncForm.currency" placeholder="请输入币种，如：CNY, USD" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="syncForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="syncForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSyncForm" :loading="syncLoading"
          >开始同步</el-button
        >
        <el-button @click="cancelSync">取消</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="注单详情" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="注单ID">{{ currentRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="三方注单号">{{
          currentRecord.generatedId
        }}</el-descriptions-item>
        <el-descriptions-item label="会员账号">{{ currentRecord.userName }}</el-descriptions-item>
        <el-descriptions-item label="三方游戏账号">{{
          currentRecord.playerName
        }}</el-descriptions-item>
        <el-descriptions-item label="场馆名称">{{ currentRecord.venueName }}</el-descriptions-item>
        <el-descriptions-item label="游戏名称">{{
          currentRecord.gameTypeName
        }}</el-descriptions-item>
        <el-descriptions-item label="平台名称">{{
          currentRecord.platformName
        }}</el-descriptions-item>
        <el-descriptions-item label="下注金额">{{
          currentRecord.betAmount ? currentRecord.betAmount.toFixed(2) : '0.00'
        }}</el-descriptions-item>
        <el-descriptions-item label="有效投注">{{
          currentRecord.validBetAmount ? currentRecord.validBetAmount.toFixed(2) : '0.00'
        }}</el-descriptions-item>
        <el-descriptions-item label="净盈利">{{
          currentRecord.netAmount ? currentRecord.netAmount.toFixed(2) : '0.00'
        }}</el-descriptions-item>
        <el-descriptions-item label="派奖金额">{{
          currentRecord.payAmount ? currentRecord.payAmount.toFixed(2) : '0.00'
        }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag
            :type="
              currentRecord.obBetStatus === 1
                ? 'success'
                : currentRecord.obBetStatus === 2
                ? 'warning'
                : 'info'
            "
          >
            {{
              currentRecord.obBetStatus === 1
                ? '已结算'
                : currentRecord.obBetStatus === 2
                ? '不结算'
                : '未结算'
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="赔率">{{ currentRecord.oddsValue }}</el-descriptions-item>
        <el-descriptions-item label="注数">{{ currentRecord.betCount }}</el-descriptions-item>
        <el-descriptions-item label="倍数">{{ currentRecord.betMultiple }}</el-descriptions-item>
        <el-descriptions-item label="下注时间">{{
          parseTime(currentRecord.betAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="结算时间">{{
          currentRecord.netAt ? parseTime(currentRecord.netAt) : '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="同步时间">{{
          parseTime(currentRecord.syncAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="投注内容" :span="2">{{
          currentRecord.betContent
        }}</el-descriptions-item>
        <el-descriptions-item label="判奖结果" :span="2">{{
          currentRecord.judgeResult
        }}</el-descriptions-item>
        <el-descriptions-item label="赛事详情" :span="2">{{
          currentRecord.matchDetail
        }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listBetRecords,
  summaryBetRecords,
  delBetRecords,
  syncBetRecords,
  getBetRecords
} from '@/api/game/betRecords';
import { listVenue } from '@/api/venue/venue';
import { omitPagination } from '@/utils/reportSummary';

function padNumber(value) {
  return value < 10 ? '0' + value : String(value);
}

function formatDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('-');
}

function createDefaultBetDateRange() {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  return [
    `${formatDateValue(startDate)} 00:00:00`,
    `${formatDateValue(endDate)} 23:59:59`
  ];
}

export default {
  name: 'BetRecords',
  dicts: ['venue_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      syncLoading: false,
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
      // 投注记录表格数据
      betRecordsList: [],
      // 场馆选项
      venueOptions: [],
      // 场馆类型字典
      venueTypeOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示同步弹出层
      syncOpen: false,
      // 是否显示详情弹出层
      viewOpen: false,
      // 日期范围
      dateRange: createDefaultBetDateRange(),
      netDateRange: [],
      syncDateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: null,
        userName: null,
        agentCode: null,
        agentName: null,
        generatedId: null,
        venueCode: null,
        venueType: null,
        gameTypeName: null,
        obBetStatus: null,
        gameTypeId: null,
        minBetAmount: null,
        maxBetAmount: null,
        matchDetail: null
      },
      // 总计数据（按当前筛选条件）
      summaryData: {
        betAmount: 0,
        validBetAmount: 0,
        netAmount: 0
      },
      // 同步表单参数
      syncForm: {
        venueCode: null,
        currency: 'CNY',
        startTime: null,
        endTime: null
      },
      // 同步表单校验
      syncRules: {
        venueCode: [{ required: true, message: '场馆编码不能为空', trigger: 'blur' }],
        currency: [{ required: true, message: '币种不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }]
      },
      // 当前查看的记录
      currentRecord: null
    };
  },
  created() {
    this.getList();
    this.getVenueList();
    this.getDicts('venue_type').then((response) => {
      this.venueTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询投注记录列表 */
    getList() {
      this.loading = true;
      const params = this.buildQueryParams();
      listBetRecords(params)
        .then((response) => {
          this.betRecordsList = response.rows;
          this.total = response.total;
        })
        .finally(() => {
          this.loading = false;
        });
      this.getSummary(params);
    },

    buildQueryParams() {
      const params = {
        ...this.queryParams,
        params: {}
      };
      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0];
        params.params.endTime = this.dateRange[1];
      }
      if (this.netDateRange && this.netDateRange.length === 2) {
        params.params.beginNetAt = this.netDateRange[0];
        params.params.endNetAt = this.netDateRange[1];
      }
      if (this.syncDateRange && this.syncDateRange.length === 2) {
        params.params.beginSyncAt = this.syncDateRange[0];
        params.params.endSyncAt = this.syncDateRange[1];
      }
      return params;
    },

    getSummary(params) {
      summaryBetRecords(omitPagination(params))
        .then((response) => {
          const data = (response && response.data) || {};
          this.summaryData = {
            betAmount: this.toNumber(data.betAmount),
            validBetAmount: this.toNumber(data.validBetAmount),
            netAmount: this.toNumber(data.netAmount)
          };
        })
        .catch(() => {
          this.summaryData = {
            betAmount: 0,
            validBetAmount: 0,
            netAmount: 0
          };
        });
    },

    /** 获取场馆列表 */
    getVenueList() {
      listVenue({ pageSize: 100 }).then((response) => {
        this.venueOptions = response.rows;
      });
    },

    // 取消按钮
    cancel() {
      this.syncOpen = false;
      this.resetSyncForm();
    },

    // 取消同步
    cancelSync() {
      this.syncOpen = false;
      this.resetSyncForm();
    },

    // 表单重置
    reset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        siteCode: null,
        userName: null,
        agentCode: null,
        agentName: null,
        generatedId: null,
        venueCode: null,
        venueType: null,
        gameTypeName: null,
        obBetStatus: null,
        gameTypeId: null,
        minBetAmount: null,
        maxBetAmount: null,
        matchDetail: null
      };
      this.dateRange = createDefaultBetDateRange();
      this.netDateRange = [];
      this.syncDateRange = [];
      this.handleQuery();
    },

    // 重置同步表单
    resetSyncForm() {
      this.syncForm = {
        venueCode: null,
        currency: 'CNY',
        startTime: null,
        endTime: null
      };
      this.resetForm('syncForm');
    },
    /** 表格底部汇总 */
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      const summaryMap = {
        betAmount: this.summaryData.betAmount,
        validBetAmount: this.summaryData.validBetAmount,
        netAmount: this.summaryData.netAmount
      };
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        if (Object.prototype.hasOwnProperty.call(summaryMap, column.property)) {
          sums[index] = this.formatAmount(summaryMap[column.property]);
        } else {
          sums[index] = '-';
        }
      });
      return sums;
    },
    toNumber(value) {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    },
    /** 格式化金额显示 */
    formatAmount(amount) {
      if (amount === null || amount === undefined) return '0.00';
      const num = parseFloat(amount);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.dateRange = createDefaultBetDateRange();
      this.netDateRange = [];
      this.syncDateRange = [];
      this.handleQuery();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 同步按钮操作 */
    handleSync() {
      this.resetSyncForm();
      this.syncOpen = true;
    },

    /** 提交同步表单 */
    submitSyncForm() {
      this.$refs['syncForm'].validate((valid) => {
        if (valid) {
          this.syncLoading = true;
          syncBetRecords(
            this.syncForm.venueCode,
            this.syncForm.currency,
            this.syncForm.startTime,
            this.syncForm.endTime
          )
            .then((response) => {
              this.syncLoading = false;
              if (response.code === 200) {
                this.$modal.msgSuccess(response.msg || '同步成功');
                this.syncOpen = false;
                this.getList();
              } else {
                this.$modal.msgError(response.msg || '同步失败');
              }
            })
            .catch(() => {
              this.syncLoading = false;
              this.$modal.msgError('同步失败');
            });
        }
      });
    },

    /** 导出按钮操作 */
    handleExport() {
      const params = this.buildQueryParams();

      this.download(
        '/bet/records/export',
        params,
        `投注记录_${new Date().getTime()}.xlsx`
      );
    },

    /** 查看详情按钮操作 */
    handleView(row) {
      this.currentRecord = row;
      this.viewOpen = true;
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除注单记录编号为"' + ids + '"的数据项？')
        .then(function () {
          return delBetRecords(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>

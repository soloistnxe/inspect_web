<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>检查工作配置</el-breadcrumb-item>
        <el-breadcrumb-item>检查工作列表</el-breadcrumb-item>
        <h5 style="float: right; height: 13px;margin: 0px">当前登录用户：{{user.userName}}</h5>
      </el-breadcrumb>
      <el-card>
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入产品类型" v-model="queryInfo.query" clearable @clear="getWorkList">
              <el-button slot="append" icon="el-icon-search" @click="getWorkList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加检查工作</el-button>
          </el-col>
        </el-row>

        <!-- 项目列表区域 -->
        <el-table :data="workList" border>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="检查工作编号" prop="workId"></el-table-column>
          <el-table-column label="公司名称" prop="companyName"></el-table-column>
          <el-table-column label="产品类型" prop="productType"></el-table-column>
          <el-table-column label="总得分" prop="score"></el-table-column>
          <el-table-column label="审核状态" prop="score" :formatter="typeFormate"></el-table-column>
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <!--查看详情-->
              <el-tooltip effect="dark" content="查看详情" placement="top" :enterable="false">
                <el-button type="success" icon="el-icon-view" size="mini"  @click="showDetail(scope.row)"></el-button>
              </el-tooltip>
              <!-- 修改按钮 -->
              <el-tooltip effect="dark" content="审核" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)" :disabled="check(scope.row)"></el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeWorkById(scope.row.workId)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pageNum" :page-sizes="[5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-card>
      <!--添加检查工作区域-->
      <el-dialog title="添加检查工作" :visible.sync="addDialogVisible" width="40%" @close="showDialogClosed('addWorkFormRef')">
        <!-- 内容主体区域 -->
        <el-form :model="addWorkForm" :rules="addWorkFormRules" ref="addWorkFormRef" label-width="110px">
          <el-form-item label="公司ID" prop="companyId">
            <el-input  v-model="addWorkForm.companyId"></el-input>
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName">
            <el-input  v-model="addWorkForm.companyName"></el-input>
          </el-form-item>
          <el-form-item label="产品类型" prop="productType">
            <el-input v-model="addWorkForm.productType"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetForm('addWorkFormRef')">重置</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm()">提交</el-button>
      </span>
      </el-dialog>

      <!-- 查看检查工作详情的对话框 -->
      <el-dialog title="检查工作详情" :visible.sync="showDialogVisible" width="60%">
        <el-form :model="work"  ref="showFormRef" label-width="80px">
          <el-form-item label="检查工作" prop="workId">
            <el-input v-model="work.workId" disabled></el-input>
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="work.companyName" disabled></el-input>
          </el-form-item>
          <el-form-item label="产品类型" prop="productType">
            <el-input v-model="work.productType" disabled></el-input>
          </el-form-item>
          <el-table :data="work.inspectScoreDetail" :cell-style="switchColor" border show-summary>
            <el-table-column prop="project" label="巡检项目名">
            </el-table-column>
            <el-table-column prop="score" label="得分">
            </el-table-column>
          </el-table>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showDialogVisible = false">关 闭</el-button>
      </span>
      </el-dialog>

      <!--审核检查工作的对话框-->
      <el-dialog title="审核抽检工作" :visible.sync="editDialogVisible" width="40%" @close="showDialogClosed('editWorkFormRef')">
        <!-- 内容主体区域 -->
        <el-form :model="editWorkForm" ref="editWorkFormRef"  label-width="140px">
          <el-form-item label="检查编号" prop="workId">
            <el-input v-model="editWorkForm.workId" style="width: 80%" disabled></el-input>
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="editWorkForm.companyName" style="width: 80%" disabled></el-input>
          </el-form-item>
          <el-form-item label="产品类型" prop="projectTypeId">
            <el-input v-model="editWorkForm.productType" style="width: 80%" disabled>
            </el-input>
          </el-form-item>
          <el-form-item v-for="(item,index) in editWorkForm.inspectScoreDetail" :key="index" :label="item.project" :prop="'inspectScoreDetail.'+index+'.score'" :rules=editWorkFormRules.score>
            <el-input v-model.number="item.score" style="width: 80%">
            </el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm()">提交</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    var checkNumber = (rule, value, cb) => {
      const regType = /^([0-9]|10)$/
      if (regType.test(value)) {
        return cb()
      }
      cb(new Error('分数在0-10之间'))
    }
    return {
      user: '',
      queryInfo: {
        query: '',
        // 当前的页数
        pageNum: 1,
        // 当前每页显示多少条数据
        pageSize: 10
      },
      workList: [],
      projectTypeList: [],
      work: {},
      total: 0,
      addWorkForm: {
        companyId: '',
        companyName: '',
        productType: '',
        auditType: 0
      },
      editWorkForm: {
        workId: '',
        companyName: '',
        productType: '',
        inspectScoreDetail: [],
        auditType: 1
      },
      // 控制添加项目对话框的显示与隐藏
      addDialogVisible: false,
      // 控制工作详情对话框的显示与隐藏
      showDialogVisible: false,
      // 控制编辑巡检项目详情的显示与隐藏
      editDialogVisible: false,
      // 添加表单的验证规则对象
      addWorkFormRules: {
        companyName: [
          { required: true, message: '请输入检查工作公司名称', trigger: 'blur' }
        ],
        productType: [
          { required: true, message: '请输入检查工作产品类型', trigger: 'blur' }
        ]
      },
      editWorkFormRules: {
        score: [
          { type: 'number', required: true, message: '请打分', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getWorkList () {
      const { data: res } = await this.$http.get('work/findPage', {
        params: this.queryInfo
      })
      if (res.code !== 200) {
        return this.$message.error('获取巡检项目列表失败！')
      }
      this.workList = res.data.inspectWork
      this.total = res.data.total
    },
    submitForm () {
      this.$refs.addWorkFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('work/insertWork', this.$qs.stringify(this.addWorkForm))
        if (res.code !== 200) {
          this.$message.error('添加检查工作失败！')
        } else {
          this.$message.success('添加检查工作成功！')
        }
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getWorkList()
      })
    },
    async getProjectTypeList () {
      const { data: res } = await this.$http.get('project/findProjectType')
      if (res.code !== 200) {
        return this.$message.error('获取巡检项目类型列表失败！')
      }
      var projectTypeList = res.data.inspectProjectType
      var list = []
      for (let i = 0; i < projectTypeList.length; i++) {
        let sc = {
          project: projectTypeList[i].projectTypeName,
          score: null
        }
        list.push(sc)
      }
      this.editWorkForm.inspectScoreDetail = list
    },
    submitEditForm () {
      var data = JSON.stringify(this.editWorkForm)
      this.$refs.editWorkFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('work/updateWork', data, { headers: { 'Content-type': 'application/json' } })
        if (res.code !== 200) {
          this.$message.error('修改巡检项目失败！')
        } else {
          this.$message.success('修改添加巡检项目成功！')
        }
        // 隐藏添加用户的对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getWorkList()
      })
    },
    async removeWorkById (id) {
      // 弹框询问项目是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该巡检项目, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.get('work/deleteWork/' + id)

      if (res.code !== 200) {
        return this.$message.error('删除项目失败！')
      } else {
        this.$message.success('删除项目成功！')
      }
      this.getWorkList()
    },
    // 用户类型转义，0：管理员
    typeFormate (row) {
      const type = row.auditType
      if (type === 0) {
        return '未审核'
      } else { return '已审核' }
    },
    check (row) {
      const type = row.auditType
      if (type === 0) {
        return false
      } else { return true }
    },
    showDetail (row) {
      this.work = row
      console.log(this.work)
      this.showDialogVisible = true
    },
    async showEditDialog (list) {
      this.editWorkForm.workId = list.workId
      this.editWorkForm.companyName = list.companyName
      this.editWorkForm.productType = list.productType
      console.log(this.editWorkForm)
      this.editDialogVisible = true
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pageSize = newSize
      this.getWorkList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getWorkList()
    },
    // 监听对话框的关闭事件
    showDialogClosed (formName) {
      this.$refs[formName].resetFields()
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    switchColor (row, column, rowIndex, columnIndex) {
      if (row.column.label === '得分' && row.row.score < 6) {
        return 'color:red'
      }
    }
  },
  created () {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    this.user = user
    this.getWorkList()
    this.getProjectTypeList()
  }
}
</script>
<style scoped>

</style>

<template>
  <div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>巡检项目配置</el-breadcrumb-item>
    <el-breadcrumb-item>巡检项目列表</el-breadcrumb-item>
    <h5 style="float: right; height: 13px;margin: 0px">当前登录用户：{{user.userName}}</h5>
  </el-breadcrumb>
  <el-card>
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getProjectList">
          <el-button slot="append" icon="el-icon-search" @click="getProjectList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible = true">添加巡检项目</el-button>
      </el-col>
    </el-row>

    <!-- 项目列表区域 -->
    <el-table :data="projectList" border>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="检查项目编号" prop="projectId"></el-table-column>
      <el-table-column label="检查项目类型" prop="projectTypeName"></el-table-column>
      <el-table-column label="检查项目内容" prop="projectContent" width="1024px"></el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!--查看详情-->
          <el-tooltip effect="dark" content="查看详情" placement="top" :enterable="false">
            <el-button type="success" icon="el-icon-view" size="mini"  @click="showDetail(scope.row)"></el-button>
          </el-tooltip>
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeProjectById(scope.row.projectId)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pageNum" :page-sizes="[5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </el-card>
<!--添加项目区域-->
    <el-dialog title="添加巡检项目" :visible.sync="addDialogVisible" width="50%" @close="showDialogClosed('addProjectFormRef')">
      <!-- 内容主体区域 -->
      <el-form :model="addProjectForm" :rules="addProjectFormRules" ref="addProjectFormRef" label-width="110px">
        <el-form-item label="巡检项目内容" prop="projectContent">
          <el-input type="textarea" :rows="2" v-model="addProjectForm.projectContent" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item label="巡检项目类型" prop="projectTypeId">
          <el-select v-model="addProjectForm.projectTypeId" placeholder="请选择">
            <el-option v-for="item in projectType" :key="item.projectTypeId" :label="item.projectTypeName" :value="item.projectTypeId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-for="(item,index) in addProjectForm.projectOptionList" :label="'选项' + (index+1)" :key="index" :prop= "item"
        >
          <el-input v-model="addProjectForm.projectOptionList[index]" style="width: 80%"></el-input><el-button @click.prevent="removeDomain(index)" style="margin: 0px 0px 0px 10px">删除</el-button>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDomain">新增选项</el-button>
          <el-button @click="resetForm('addProjectFormRef')">重置</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm()">提交</el-button>
      </span>
    </el-dialog>

    <!-- 查看巡检项目详情的对话框 -->
    <el-dialog title="项目详情" :visible.sync="showDialogVisible" width="50%">
      <el-form :model="project"  ref="showFormRef" label-width="80px">
        <el-form-item label="项目编号" prop="projectId">
          <el-input v-model="project.projectId" readonly></el-input>
        </el-form-item>
        <el-form-item label="项目类型" prop="projectTypeName">
          <el-input v-model="project.projectTypeName" readonly></el-input>
        </el-form-item>
        <el-form-item label="项目内容" prop="projectContent">
          <el-input type="textarea" :rows="2" v-model="project.projectContent" readonly></el-input>
        </el-form-item>
        <el-form-item v-for="(item,index) in project.projectOptionList" :label="'选项' + (index+1)" :prop= item :key="index">
          <el-input v-model="project.projectOptionList[index]" readonly></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
    <!--编辑巡检项目详情的对话框-->
    <el-dialog title="编辑巡检项目" :visible.sync="editDialogVisible" width="50%" @close="showDialogClosed('editProjectFormRef')">
      <!-- 内容主体区域 -->
      <el-form :model="editProjectForm" :rules="addProjectFormRules" ref="editProjectFormRef" label-width="110px">
        <el-form-item label="巡检项目编号" prop="projectId">
          <el-input v-model="editProjectForm.projectId" style="width: 80%" disabled></el-input>
        </el-form-item>
        <el-form-item label="巡检项目内容" prop="projectContent">
          <el-input type="textarea" :rows="2" v-model="editProjectForm.projectContent" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item label="巡检项目类型" prop="projectTypeId">
          <el-select v-model="editProjectForm.projectTypeId" placeholder="请选择">
            <el-option v-for="item in projectType" :key="item.projectTypeId" :label="item.projectTypeName" :value="item.projectTypeId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-for="(item,index) in editProjectForm.projectOptionList" :label="'选项' + (index+1)" :key="index" :prop= "item">
          <el-input v-model="editProjectForm.projectOptionList[index]" style="width: 80%"></el-input><el-button @click.prevent="removeEditDomain(index)" style="margin: 0px 0px 0px 10px">删除</el-button>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
          <el-button @click="addEditDomain">新增选项</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm()">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      user: '',
      // 获取巡检项目列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pageNum: 1,
        // 当前每页显示多少条数据
        pageSize: 10
      },
      addProjectForm: {
        projectContent: '',
        projectTypeId: '',
        projectOptionList: ['']
      },
      editProjectForm: {
        projectId: '',
        projectContent: '',
        projectTypeId: '',
        projectOptionList: []
      },
      project: {},
      projectList: [],
      projectType: [],
      projectTypeName: '',
      total: 0,
      // 控制添加项目对话框的显示与隐藏
      addDialogVisible: false,
      // 控制查看巡检项目详情的显示与隐藏
      showDialogVisible: false,
      // 控制编辑巡检项目详情的显示与隐藏
      editDialogVisible: false,

      // 添加表单的验证规则对象
      addProjectFormRules: {
        projectName: [
          { required: true, message: '请输入巡检项目名称', trigger: 'blur' }
        ],
        projectContent: [
          { required: true, message: '请输入巡检项目内容', trigger: 'blur' }
        ],
        projectTypeId: [
          { required: true, message: '请选择项目类别', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getProjectList () {
      const { data: res } = await this.$http.get('project/findPage', {
        params: this.queryInfo
      })
      if (res.code !== 200) {
        return this.$message.error('获取巡检项目列表失败！')
      }
      this.projectList = res.data.inspectProject
      this.total = res.data.total
    },
    async getProjectTypeList () {
      const { data: res } = await this.$http.get('project/findProjectType')
      if (res.code !== 200) {
        return this.$message.error('获取巡检项目类型列表失败！')
      }
      this.projectType = res.data.inspectProjectType
    },
    showDetail (list) {
      this.project = list
      this.showDialogVisible = true
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pageSize = newSize
      this.getProjectList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getProjectList()
    },
    // 监听修改用户对话框的关闭事件
    showDialogClosed (formName) {
      this.$refs[formName].resetFields()
    },
    removeDomain (index) {
      if (index !== -1) {
        this.addProjectForm.projectOptionList.splice(index, 1)
      }
    },

    removeEditDomain (index) {
      if (index !== -1) {
        this.editProjectForm.projectOptionList.splice(index, 1)
      }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    addDomain () {
      this.addProjectForm.projectOptionList.push('')
    },
    addEditDomain () {
      this.editProjectForm.projectOptionList.push('')
    },
    submitForm () {
      this.$refs.addProjectFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('project/insertProject', this.$qs.stringify(this.addProjectForm))
        if (res.code !== 200) {
          this.$message.error('添加巡检项目失败！')
        } else {
          this.$message.success('添加巡检项目成功！')
        }
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getProjectList()
      })
    },
    submitEditForm () {
      this.$refs.editProjectFormRef.validate(async valid => {
        console.log(this.editProjectForm)
        if (!valid) return
        const { data: res } = await this.$http.post('project/updateProject', this.$qs.stringify(this.editProjectForm))
        if (res.code !== 200) {
          this.$message.error('修改巡检项目失败！')
        } else {
          this.$message.success('修改添加巡检项目成功！')
        }
        // 隐藏添加用户的对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getProjectList()
      })
    },
    async removeProjectById (id) {
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

      const { data: res } = await this.$http.get('project/deleteProject/' + id)

      if (res.code !== 200) {
        return this.$message.error('删除项目失败！')
      } else {
        this.$message.success('删除项目成功！')
      }
      this.getProjectList()
    },
    async showEditDialog (list) {
      this.editProjectForm = list
      console.log(this.editProjectForm)
      this.editDialogVisible = true
    }
  },
  created () {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    this.user = user
    this.getProjectList()
    this.getProjectTypeList()
  }
}
</script>

<style scoped>

</style>

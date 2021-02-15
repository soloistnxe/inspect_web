<template>
  <div id="app">
    <div class="content">
      <div class="content_input">
        <div class="title">
          <p>食品安全监管系统</p>
        </div>
        <!-- 登录表单区域 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: 'admin'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm () {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('user/login', this.$qs.stringify(this.loginForm))
        if (!res.success) return this.$message.error(res.message)
        this.$message.success(res.message)
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        const user = JSON.stringify(res.data.user)
        window.sessionStorage.setItem('user', user)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style scoped>
  .content {
    width: 500px;
    height: 300px;
    box-sizing: border-box;
    padding: 0 50px;
    border-radius: 5px;
    box-shadow: 0px 2px 12px 0px rgba(105, 105, 105, 0.07);
    background: rgba(255, 255, 255, 0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: mymove 1s ease-in-out  alternate;
    overflow: hidden;
    transition: 1.5s;
  }

  @keyframes mymove {
    0% {
      width: 0px;
      height: 5px;
    }

    10% {
      width: 50px;
      height: 5px;
    }

    15% {
      width: 100px;
      height: 5px;
    }

    20% {
      width: 150px;
      height: 5px;
    }

    25% {
      width: 200px;
      height: 5px;
    }

    30% {
      width: 250px;
      height: 5px;
    }

    35% {
      width: 300px;
      height: 5px;
    }

    40% {
      width: 350px;
      height: 5px;
    }

    45% {
      width: 450px;
      height: 5px;
    }

    50% {
      width: 500px;
      height: 5px;
    }

    55% {
      height: 30px;
    }

    60% {
      height: 60px;
    }

    65% {
      height: 90px;
    }

    70% {
      height: 120px;
    }

    75% {
      height: 150px;
    }

    80% {
      height: 180px;
    }

    85% {
      height: 210px;
    }

    90% {
      height: 240px;
    }

    95% {
      height: 240px;
    }

    100% {
      height: 300px;
    }
  }

  .content_input {
    width: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

  }
  .title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 30px;
    font-weight: bold;
    color: #606266;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>

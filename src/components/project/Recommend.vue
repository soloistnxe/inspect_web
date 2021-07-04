<template xmlns:el-table="http://www.w3.org/1999/html">
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据分析</el-breadcrumb-item>
      <el-breadcrumb-item>推荐分析</el-breadcrumb-item>
      <h5 style="float: right; height: 13px;margin: 0px">当前登录用户：{{user.userName}}</h5>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 100%;height:650px;"></div>
      <div style="height: 200px">
        <div style="display: inline-block;float: left">
        <template>
          <table style="border-style:hidden;font-size: 18px" cellspacing="3">
            <caption>最终频繁项集</caption>
            <tr>
              <td :key="index" v-for="(item,index) in frequentItems">{{item}}</td>
            </tr>
          </table>
        </template>
        </div>
        <div style="display: inline-block;float: right">
        <template>
          <table border="2" cellspacing="5" style="font-size: 18px">
            <caption>推荐结果</caption>
            <tr>
              <td>项集</td>
              <td>置信度</td>
            </tr>
            <tr :key="index" v-for="(item,index) in recommend">
              <td>{{index}}</td>
              <td>{{item}}</td>
            </tr>
          </table>
        </template>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入 echarts
import echarts from 'echarts'

export default {
  data () {
    return {
      user: '',
      record: {},
      frequentItems: [],
      recommend: []
    }
  },
  methods: {},
  created () {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    this.user = user
  },
  async mounted () {
    // 3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 4. 准备数据和配置项
    const { data: res } = await this.$http.get('report/apriori')
    if (res.code !== 200) {
      return this.$message.error('获取巡检项目类型列表失败！')
    }
    this.record = res.data.record
    this.frequentItems = res.data.frequentItems
    this.recommend = res.data.recommend
    console.log(this.option)
    // 5. 展示数据
    myChart.setOption({
      title: {
        text: '频繁项集饼状图'
      },
      series: [
        {
          name: '访问来源',
          type: 'pie', // 设置图表类型为饼图
          radius: '80%', // 饼图的半径，外半径为可视区尺寸（容器高宽中较小一项）的 55% 长度。
          data: res.data.count,
          center: ['50%', '50%'],
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: '{b} : {c} ({d}%)',
                textStyle: {
                  fontSize: 18
                }
              },
              labelLine: { show: true }
            }
          }
        }
      ]
    })
  }
}
</script>

<style scoped>
  table
  {
    border-collapse:collapse;
  }

  table,th, td
  {
    border: 1px solid black;
  }
  td
  {
    padding:2px;
  }
</style>

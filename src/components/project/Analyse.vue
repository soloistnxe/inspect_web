<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据分析</el-breadcrumb-item>
      <el-breadcrumb-item>主成分分析</el-breadcrumb-item>
      <h5 style="float: right; height: 13px;margin: 0px">当前登录用户：{{user.userName}}</h5>
    </el-breadcrumb>
    <el-card>
      <h5 v-text="names" style="margin: 0px 0px 30px;color: red;font-size: 16px"></h5>
      <div id="main" style="width: 50%;height:500px;display: inline-block"></div>
      <div style="height:500px;display: inline-block;float: right">
        <template>
          <table border="0" cellspacing="3" style="font-size: 16px">
            <caption>主成分载荷</caption>
            <tr>
              <td></td>
              <td :key="index" v-for="(item,index) in xAxis">{{item}}</td>
            </tr>
            <tr :key="index" v-for="(item,index) in report.loadings">
              <td :key="index" v-for="(domain,index) in item">{{domain}}</td>
            </tr>
          </table>
        </template>
      </div>
      <div>
        <template>
          <table border="0" cellspacing="10" style="font-size: 18px">
            <caption>主成分分析表</caption>
            <tr>
              <td></td>
              <td :key="index" v-for="(item,index) in xAxis">{{item}}</td>
            </tr>
            <tr>
              <td >主成分方差</td>
              <td :key="index" v-for="(item,index) in report.variance" v-bind="item">{{item}}</td>
            </tr>
            <tr>
              <td>主成分标准差</td>
              <td :key="item" v-for="(item) in report.standardDeviation" v-bind="item">{{item}}</td>
            </tr>
            <tr>
              <td>方差贡献率</td>
              <td :key="item" v-for="(item) in report.proportionOfvariance" v-bind="item">{{item}}</td>
            </tr>
            <tr>
              <td>累计方差贡献率</td>
              <td :key="item" v-for="(item) in report.cumulativeProportion" v-bind="item">{{item}}</td>
            </tr>
          </table>
        </template>
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
      report: {},
      names: {},
      xAxis: [],
      option: {
        title: {
          text: '主成分分析碎石图'
        },
        tooltip: {},
        legend: {
          data: ['方差'],
          textStyle: {
            fontSize: 18
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          data: [],
          axisLabel: {
            textStyle: {
              fontSize: 18
            }
          }
        },
        yAxis: {
          axisLabel: {
            textStyle: {
              fontSize: 18
            }
          }
        },
        series: {
          name: '方差',
          type: 'line',
          data: []
        }
      }
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
    const { data: res } = await this.$http.get('report/pca')
    if (res.code !== 200) {
      return this.$message.error('主成分分析失败，请检查R语言服务是否开启！')
    }
    this.report = res.data.report
    this.names = res.data.names
    this.xAxis = res.data.xAxis
    this.option.series.data = this.report.variance
    this.option.xAxis.data = res.data.xAxis
    // 5. 展示数据
    myChart.setOption(this.option)
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

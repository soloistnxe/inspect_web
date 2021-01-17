import Vue from 'vue'
import './plugins/element.js'
import App from './App'
import router from './router'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import qs from 'qs'
// Vue全局对象可用
Vue.prototype.$qs = qs
Vue.config.productionTip = false
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8763'
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axios.defaults.withCredentials = true
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
Vue.prototype.$http = axios
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

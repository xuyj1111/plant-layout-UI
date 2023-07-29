import { createApp } from 'vue'
import Vue from 'vue'
import App from './App.vue'
import axios from "axios"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import Vuex from 'vuex'
import store from './store'

const app = createApp(App);
const currentUrl = window.location.href;
const targetIp = currentUrl.split('/')[2].split(':')[0];

// 设置 axios 对象为全局变量
app.config.globalProperties.$axios = axios;
// 设置 axiosInstance 对象为全局变量
app.config.globalProperties.$axiosInstance = axios.create({
    baseURL: 'http://' + targetIp + ':8889/api',
    timeout: 3000,
    responseType: 'json',
    headers: {}
})
// 加载 element-plus
app.use(ElementPlus);
// 加载路由
app.use(router);
// 加载 vuex
app.use(Vuex);
// 加载公共变量
app.use(store);

app.mount('#app');
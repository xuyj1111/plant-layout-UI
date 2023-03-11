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

// 设置 axios 对象为全局变量
app.config.globalProperties.$axios = axios;
// 设置 axiosInstance 对象为全局变量
app.config.globalProperties.$axiosInstance = axios.create({
    baseURL: 'http://localhost:8889/api',
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

// 每次跳转网址前执行
router.beforeEach((to, from, next) => {
    let isLogin = sessionStorage.getItem('isLogin');
    if (to.path == '/logout') {
        sessionStorage.clear();
        next({ path: '/login' });
    } else if (to.path == '/login') {
        if (isLogin != null) {
            next({ path: '/map' });
        }
    } else if(to.path == '/map') {
        next({ path: '/map/' + store.state.plant });
    } else if (!to.path.startsWith('/api') && isLogin == null) {
        next({ path: '/login' });
    }
    next();
})
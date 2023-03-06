import { createApp } from 'vue'
import App from './App.vue'
import axios from "axios"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import Vuex from 'vuex'

// 将 axios 挂载到全局
const app = createApp(App);
app.config.globalProperties.$axios = axios;
// 加载 element-plus
app.use(ElementPlus); 
// 加载路由
app.use(router);
// 加载 vuex
app.use(Vuex);

app.mount('#app');


router.beforeEach((to, from, next) => {
    let isLogin = sessionStorage.getItem('isLogin');
    if(to.path == '/logout') {
        sessionStorage.clear();
        next({path: '/login'});
    } else if(to.path == '/login') {
        if(isLogin != null) {
            next({path: '/map'});
        }
    } else if(isLogin == null) {
        next({path: '/login'});
    }
    next();
})
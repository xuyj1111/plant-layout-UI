import { createApp } from 'vue'
import App from './App.vue'
import axios from "axios"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'

// 将 axios 挂载到全局
const app = createApp(App);
app.config.globalProperties.$axios = axios;
// 加载 element-plus
app.use(ElementPlus); 
// 加载路由
app.use(router);

app.mount('#app');

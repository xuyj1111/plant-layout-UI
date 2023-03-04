import { createRouter, createWebHashHistory } from "vue-router"
import LoginView from '../login'
import MapView from '../map'

// 配置信息中需要页面的相关配置

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView
    },
    {
        path: '/map',
        name: 'map',
        component: MapView
    }
]


const router = createRouter({
    /**
     * createWebHashHistory
     *      login: http://localhost:8080/#/
     *      map: http://localhost:8080/#/map
     * 原理：a标签锚点链接
     * 
     * createWebHistory
     *      login: http://localhost:8080/
     *      map: http://localhost:8080/map
     * 此种方式，需要后台配合做重定向，否则会出现404
     * 原理：H5 pushState()
     */
    history:createWebHashHistory(),
    routes
})

 
export default router;
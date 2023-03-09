import { createRouter, createWebHistory } from "vue-router"
import LoginView from '../modules/login/index.vue'
import MapView from '../modules/map/index.vue'
import NotFoundView from '../modules/NotFound.vue'

// 配置信息中需要页面的相关配置
const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        alias: '/logout'
    },
    {
        path: '/map',
        name: 'map',
        component: MapView
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/:catchAll(.*)',
        name: '404',
        component: NotFoundView
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
    history: createWebHistory(),
    routes
})

export default router;
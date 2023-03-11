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
        component: MapView
    },
    {
        path: '/map/:plant',
        name: 'map',
        component: MapView
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/404',
        name: '404',
        component: NotFoundView
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }
]

const router = createRouter({
    /**
     * createWebHashHistory
     *      login: http://localhost:8888/#/
     *      map: http://localhost:8888/#/map
     * 原理：a标签锚点链接
     * 
     * createWebHistory
     *      login: http://localhost:8888/
     *      map: http://localhost:8888/map
     * 此种方式，需要后台配合做重定向，否则会出现404
     * 原理：H5 pushState()
     */
    history: createWebHistory(),
    routes
})

export default router;
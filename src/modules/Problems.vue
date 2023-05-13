<template>
    <body>
        <Sidebar ref="sidebar" />
        <ProblemsBody ref="mapBody" />
    </body>
</template>

<script>
import Sidebar from '../modules/part/Sidebar.vue';
import ProblemsBody from '../modules/part/ProblemsBody.vue';
import { mapState } from 'vuex'

// 固定的七个厂房名
const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Problems',
    data() {
        return {
        }
    },
    components: {
        Sidebar,
        ProblemsBody
    },
    /**
     * 实例创建完后调用，在 mounted 之前；
     * 可以访问 data、computed、methods 的数据；
     * 无法访问 DOM；
     * 
     * 用于数据初始化、路由跳转；
     * 
     */
    created() {
        console.log('problems.vue created......');
        // 若路径是'/map/assy'，则arrStr = ["", "map", "assy"]
        const arrStr = this.$route.path.split('/');
        if (plants.has(arrStr[2])) {
            this.$store.state.plant = arrStr[2];
            // 初始化全局变量
            this.$store.commit('restoreStateFromStorage');
        } else {
            this.$router.push('/404');
        }
    },
    /**
     * 渲染完成后；
     * 可以访问 DOM；
     * 
     * 因为可以访问 DOM，所以用于内容初始化、监听定义
     */
    mounted() {
        console.log('problems.vue mounted......');

    },
    methods: {
    }
}

</script>

<style scoped></style>
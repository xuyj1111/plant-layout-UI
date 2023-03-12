<template>
    <body>
        <Menu ref="menuChild" />
        <DisMap ref="disMapChild" />
        <!-- 方法缩小，都需要加载一遍地图 -->
        <Operation @onBiggerOrSmaller="init" />
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';

const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    components: {
        Menu,
        DisMap,
        Operation
    },
    mounted() {
        const suffix = this.$route.path.substring('/map/'.length);
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(suffix)) {
            this.$router.push('/404');
        } else {
            this.$store.state.plant = suffix;
            this.init();
        }
    },
    beforeRouteUpdate(to, from, next) {
        const suffix = this.$route.path.substring('/map/'.length);
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(suffix)) {
            this.$router.push('/404');
        } else {
            this.init();
        }
        next();
    },
    methods: {
        // 进入该页面的初始化
        init() {
            const menu = this.$refs.menuChild;
            const disMap = this.$refs.disMapChild;
            menu.handleMouseLeave();
            disMap.init();
            disMap.choose = '';
        }
    }
}

</script>

<style scoped></style>
<template>
    <body>
        <Menu />
        <DisMap ref="disMapChild" />
        <Operation />
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';
import { init } from 'events';

const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    components: {
        Menu,
        DisMap,
        Operation
    },
    mounted() {
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(this.$route.path.substring('/map/'.length))) {
            this.$router.push('/404');
        } else {
            this.init();
        }
    },
    beforeRouteUpdate(to, from, next) {
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(this.$route.path.substring('/map/'.length))) {
            this.$router.push('/404');
        } else {
            this.init();
        }
        next();
    },
    methods: {
        // 进入该页面的初始化
        init() {
            const disMap = this.$refs.disMapChild;
            disMap.init();
        }
    }
}

</script>

<style scoped></style>
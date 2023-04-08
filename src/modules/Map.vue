<template>
    <body>
        <Sidebar ref="sidebar" />
        <!-- 
            @onScrollBar: 滚动条
         -->
        <MapBody ref="mapBody" @onScrollBar="init" />
        <!-- 
            @init
            @onDraging: 拖拽选中框
        -->
        <Infobar ref="infobar" @init="init" @onDraging="draging" />
    </body>
</template>

<script>
import Sidebar from '../modules/part/Sidebar.vue';
import MapBody from '../modules/part/MapBody.vue';
import Infobar from '../modules/part/Infobar.vue';
import { mapState } from 'vuex'

// 固定的七个厂房名
const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    data() {
        return {
        }
    },
    components: {
        Sidebar,
        MapBody,
        Infobar
    },
    computed: {
        ...mapState(['map', 'thumbnail'])
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
        console.log('map.vue created......');
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
        console.log('map.vue mounted......');
        // 地图页的初始化
        this.init();
        // 监听浏览器页面大小变化
        window.addEventListener('resize', () => {
            this.init();
        });
        // 监听choose变量
        this.$watch("$store.state.choose", (newVal, oldVal) => {
            if (newVal == '') {
                console.log('未选中设备');
            } else {
                console.log(`选中的设备值+岗位号: ${newVal}`);
            }
            this.init();
            this.$store.commit('saveStateToStorage');
        });
    },
    /**
     * 切换地图时进入
     */
    beforeRouteUpdate(to, from, next) {
        console.log('map.vue beforeRouteUpdate......');
        this.init();
        next();
    },
    methods: {
        async init() {
            // 地图选项（sidebar.currentId）刷新
            this.$refs['sidebar'].handleMouseLeave();
            // 地图数据（state.shapes）刷新
            await this.$refs['mapBody'].setPlantData();
            // 画图
            this.draw();
            // 滚动条偏移值（state.map.scrollLeft、state.map.scrollTop）刷新
            this.setScrollTopAndScrollLeft();
            // 表单数据刷新
            this.$refs['infobar'].updateForm()
            // 问题点表单数据更新
            this.$refs['infobar'].setProblemCount();
        },
        // 画地图 + 缩略图
        draw() {
            const mapContext = this.$refs['mapBody'].$refs['map'].getContext("2d");
            const thumbnailContext = this.$refs['infobar'].$refs['thumbnailDom'].getContext("2d");
            // 地图放大，设备也同样放大
            const multiple = (1.0 + 0.05 * this.map.per);
            mapContext.clearRect(0, 0, this.map.width, this.map.height);
            thumbnailContext.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height);
            thumbnailContext.strokeStyle = "black";
            this.$store.state.shapes.forEach(async (shape, key) => {
                this.$refs['mapBody'].drawMap(shape, key, multiple);
                this.$refs['infobar'].drawThumbnail(shape, key);
            });
            this.drawThumbnailCheck();
        },
        // 画缩略图的选中框
        drawThumbnailCheck() {
            const mapBody = this.$refs['mapBody'];
            // 计算显示区域和实际区域的百分比
            const widthPer = mapBody.$refs['section'].clientWidth / this.map.width;
            const heightPer = mapBody.$refs['section'].clientHeight / this.map.height;
            // 计算滚动值和实际区域的百分比
            const offsetX = mapBody.$refs['section'].scrollLeft / this.map.width;
            const offsetY = mapBody.$refs['section'].scrollTop / this.map.height;
            this.$refs['infobar'].drawThumbnailCheck(widthPer, heightPer, offsetX, offsetY);
        },
        // 拖动缩略图选中框时执行
        draging(scrollLeft, scrollTop) {
            // 设置滚动条位置
            this.$refs['mapBody'].$refs['section'].scrollTo(scrollLeft, scrollTop);
            this.draw();
        },
        // 滚动条偏移量赋值
        setScrollTopAndScrollLeft() {
            const dom = this.$refs['mapBody'].$refs['section'];
            this.map.scrollLeft = dom.scrollLeft;
            this.map.scrollTop = dom.scrollTop;
        }
    }
}

</script>

<style scoped></style>
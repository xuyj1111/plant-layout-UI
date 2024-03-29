<template>
    <body>
        <!-- 
            @removeResizeEvent: 删除“页面大小变化”事件
         -->
        <Sidebar ref="sidebar" @removeResizeEvent="removeResizeEvent" />
        <!-- 
            @onScrollBar: 滚动条
         -->
        <MapBody ref="mapBody" @onScrollBar="init" />
        <!-- 
            @init
            @onDraging: 拖拽选中框
            @removeResizeEvent: 删除“页面大小变化”事件
        -->
        <Infobar ref="infobar" @init="init" @onDraging="draging" @removeResizeEvent="removeResizeEvent" />
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
            // 存储鼠标xy值，实现移动选中框使用
            clientXCache: null,
            clientYCache: null,
            // “页面大小变化”时，延时防重复触发
            resizeTimer: null
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
        // 缩略图选中框复位
        this.$refs['mapBody'].$refs['section'].scrollTo(this.$store.state.map.scrollLeft, this.$store.state.map.scrollTop);
        // 地图页的初始化
        this.init();
        // window监听事件
        if (!this.$store.state.isAddWindowEvent) {
            // 监听浏览器页面大小变化
            window.addEventListener("resize", this.resizeWindowEvent);
            // 监听鼠标，辅助实现缩略图选中框移动
            window.addEventListener('mousemove', (event => {
                this.clientXCache = event.clientX;
                this.clientYCache = event.clientY;
            }));
            this.$store.state.isAddWindowEvent = true;
        }
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
        // 监听displayByUser变量
        this.$watch("$store.state.displayByUser", (newVal, oldVal) => {
            this.init();
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
            // 地图选项赋值
            this.setDisplayOptions();
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
            this.$refs['mapBody'].drawChoose(multiple);
            this.$refs['infobar'].drawChoose();
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
            const infobar = this.$refs['infobar'];
            this.map.scrollLeft = dom.scrollLeft;
            this.map.scrollTop = dom.scrollTop;
            infobar.firstClickX = this.clientXCache - infobar.rectLeft;
            infobar.firstClickY = this.clientYCache - infobar.rectTop;
        },
        // “页面大小变化”事件触发代码
        resizeWindowEvent() {
            var that = this;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(function () {
                that.init();
                console.log('页面结束变化');
            }, 500);
        },
        // 删除“页面大小变化”事件
        removeResizeEvent() {
            if (this.$store.state.isAddWindowEvent) {
                window.removeEventListener("resize", this.resizeWindowEvent);
                this.$store.state.isAddWindowEvent = false;
            }
        },
        // 地图选项赋值
        setDisplayOptions() {
            if (this.$store.state.displayOptions == null) {
                this.$store.state.displayOptions = [{
                    value: 'all',
                    label: '全部'
                }, {
                    value: 'zt1',
                    label: '保全'
                }, {
                    value: 'zt2',
                    label: '组装技术'
                }, {
                    value: 'zt3',
                    label: '加工技术'
                }, {
                    value: 'improve',
                    label: '改善班'
                }, {
                    value: 'provide',
                    label: '供给中心'
                }];
                this.$store.state.displayOptions.push({
                    value: this.$store.state.plant,
                    label: this.$refs['infobar'].USER_VALUE[this.$store.state.plant]
                });
            }
        }
    }
}

</script>

<style scoped></style>
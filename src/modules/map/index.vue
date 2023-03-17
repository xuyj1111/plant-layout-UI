<template>
    <body>
        <Menu ref="menuChild" />
        <!-- 
            @onDraw: 画地图
            @updateForm: 信息栏更新值
            @clearForm: 信息栏清除
         -->
        <DisMap v-if="isMapPage" ref="disMapChild" @onDraw="draw" @updateForm="updateForm" @clearForm="clearForm" />
        <!-- 
            @onBiggerOrSmaller: 方法缩小，都需要加载一遍地图
            @onDrag: 拖拽选中框
            @setScrollTopAndScrollLeft: 控制滚动条
            @onDraw: 画地图
            @onSearch: 选中搜索到的设备
            @clearForm: 信息栏清除
        -->
        <Operation v-if="isMapPage" ref="operationChild" @onBiggerOrSmaller="init" @onDrag="draging"
            @setScrollTopAndScrollLeft="setScrollTopAndScrollLeft" @onDraw="draw" @onSearch="search" @clearForm="clearForm"
            @toProblems="toProblems" />

        <Problems v-else @toMap="toMap"></Problems>
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';
import Problems from './problems.vue';
import { mapState } from 'vuex'

const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    data() {
        return {
            // 标记当前页面，是否为地图页，问题点页=flase
            isMapPage: true
        }
    },
    components: {
        Menu,
        DisMap,
        Operation,
        Problems
    },
    computed: {
        ...mapState(['map', 'thumbnail'])
    },
    mounted() {
        // 若路径是'/map/assy/problems'，则arrStr = ["", "map", "assy", "problems"]
        const arrStr = this.$route.path.split('/');
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(arrStr[2])) {
            console.log('haha');
            this.$router.push('/404');
        } else {
            this.$store.state.plant = arrStr[2];
            this.init();
            this.$store.state.choose = '';
        }

        // 问题点列表页
        if (arrStr.length == 4) {
            this.isMapPage = false;
        }

        // 监听滚动条
        const disMap = this.$refs.disMapChild;
        disMap.$refs['section'].addEventListener(
            "scroll",
            this.throttle(() => {
                this.draw();
                this.setScrollTopAndScrollLeft();
                console.log('滚动条拖动结束')
            }, 200)
        );

        // 监听浏览器页面大小变化
        window.addEventListener('resize', () => {
            this.init();
        });
    },
    beforeRouteUpdate(to, from, next) {
        const suffix = this.$route.path.substring('/map/'.length);
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(suffix)) {
            this.$router.push('/404');
        } else {
            this.init();
            this.$store.state.choose = '';
        }
        next();
    },
    methods: {
        // 进入该页面的初始化
        init() {
            const menu = this.$refs.menuChild;
            const disMap = this.$refs.disMapChild;
            console.log('刷新地图');
            menu.handleMouseLeave();
            disMap.init();
            this.setScrollTopAndScrollLeft();
        },
        // 画地图
        draw() {
            const mapContext = this.$refs.disMapChild.$refs['mapDom'].getContext("2d");
            const thumbnailContext = this.$refs.operationChild.$refs['mapDom'].getContext("2d");

            mapContext.clearRect(0, 0, this.map.width, this.map.height);
            thumbnailContext.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height);
            mapContext.strokeStyle = "black";
            thumbnailContext.strokeStyle = "black";
            // 地图放大，设备也同样放大
            const multiple = (1.0 + 0.05 * this.map.per);

            this.$store.state.shapes.forEach((value, key) => {
                mapContext.beginPath();
                thumbnailContext.beginPath();
                mapContext.rect(
                    value["coordX"] * multiple,
                    value["coordY"] * multiple,
                    value["width"] * multiple,
                    value["height"] * multiple
                );
                thumbnailContext.rect(
                    value["coordX"] * 0.35,
                    value["coordY"] * 0.35,
                    value["width"] * 0.35,
                    value["height"] * 0.35
                );
                if (key == this.$store.state.choose) {
                    // 选中设备
                    mapContext.fillStyle = "red";
                    mapContext.fill();
                    thumbnailContext.fillStyle = "red";
                    thumbnailContext.fill();
                } else {
                    //传送带
                    if (value["conveyor"] == "true") {
                        mapContext.fillStyle = "#a8a6a5";
                        mapContext.fill();
                        thumbnailContext.fillStyle = "#a8a6a5";
                        thumbnailContext.fill();
                    }
                    // 其他设备
                    mapContext.stroke();
                    thumbnailContext.stroke();
                }
            });
            this.drawThumbnailCheck();
        },
        // 画缩略图的选中框
        drawThumbnailCheck() {
            const thumbnailContext = this.$refs.operationChild.$refs['mapDom'].getContext("2d");
            const disMap = this.$refs.disMapChild;

            // 计算显示区域和实际区域的百分比
            const widthPer = disMap.$refs['section'].clientWidth / this.map.width;
            const heightPer = disMap.$refs['section'].clientHeight / this.map.height;
            // 计算滚动值和实际区域的百分比
            const offsetX = disMap.$refs['section'].scrollLeft / this.map.width;
            const offsetY = disMap.$refs['section'].scrollTop / this.map.height;
            // 赋值给全局变量
            this.thumbnail.checkOffsetX = this.thumbnail.width * offsetX;
            this.thumbnail.checkOffsetY = this.thumbnail.height * offsetY;
            this.thumbnail.checkWidth = this.thumbnail.width * ((widthPer > 1) ? 1 : widthPer);
            this.thumbnail.checkHeight = this.thumbnail.height * ((heightPer > 1) ? 1 : heightPer);
            // 画图
            thumbnailContext.strokeStyle = "#00ffff";
            thumbnailContext.beginPath();
            thumbnailContext.lineWidth = 2;
            thumbnailContext.rect(
                this.thumbnail.checkOffsetX,
                this.thumbnail.checkOffsetY,
                this.thumbnail.checkWidth,
                this.thumbnail.checkHeight
            );
            thumbnailContext.stroke();
            thumbnailContext.lineWidth = 1;
        },
        // 拖动缩略图选中框后执行
        draging(scrollLeft, scrollTop) {
            this.$refs['disMapChild'].$refs['section'].scrollTo(scrollLeft, scrollTop);
            this.draw();
        },
        // 滚动条偏移量赋值
        setScrollTopAndScrollLeft() {
            const dom = this.$refs['disMapChild'].$refs['section'];
            this.map.scrollLeft = dom.scrollLeft;
            this.map.scrollTop = dom.scrollTop;
        },
        // 信息栏更新
        updateForm(value) {
            const operation = this.$refs['operationChild'];
            operation.formMsg.deviceNum = value['deviceNum'];
            operation.formMsg.stationNum = value['stationNum'];
            operation.formLabel.deviceNum = value['deviceNum'];
            operation.formLabel.stationNum = value['stationNum'];
            operation.formLabel.coordX = value['coordX'];
            operation.formLabel.coordY = value['coordY'];
            operation.formLabel.width = value['width'];
            operation.formLabel.height = value['height'];
            operation.formLabel.conveyor = value['conveyor'];
        },
        // 信息栏清除
        clearForm() {
            const operation = this.$refs['operationChild'];
            operation.formMsg.deviceNum = '';
            operation.formMsg.stationNum = '';
            operation.formLabel.deviceNum = '';
            operation.formLabel.stationNum = '';
            operation.formLabel.coordX = '';
            operation.formLabel.coordY = '';
            operation.formLabel.width = '';
            operation.formLabel.height = '';
            operation.formLabel.conveyor = '';
        },
        // 传入搜索到的设备，放大缩小到合适大小，并将设备显示在地图中间
        // 不想做，直接选中好了
        search(shape) {
            this.$store.state.choose = shape['deviceNum'] + '+' + shape['stationNum'];
            this.updateForm(shape);
        },
        toMap() {
            this.isMapPage = true;
            this.init();
        },
        toProblems() {
            this.isMapPage = false;
        },
        throttle(fn, delay) {
            let timer = null;
            return function () {
                const context = this;
                const args = arguments;
                clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(context, args);
                }, delay);
            };
        }
    }
}

</script>

<style scoped></style>
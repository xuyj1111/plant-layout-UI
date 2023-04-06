<template>
    <body>
        <Menu ref="menu" @toMap="toMap"/>
        <!-- 
            @onDraw: 画地图
            @updateForm: 信息栏更新值
            @clearForm: 信息栏清除
         -->
        <DisMap v-if="isMapPage" ref="disMap" @onDraw="onDraw" @updateForm="updateForm" @clearForm="clearForm" />
        <!-- 
            @onBiggerOrSmaller: 方法缩小，都需要加载一遍地图
            @onDrag: 拖拽选中框
            @setScrollTopAndScrollLeft: 控制滚动条
            @onDraw: 画地图
            @onSearch: 选中搜索到的设备
            @clearForm: 信息栏清除
        -->
        <Operation v-if="isMapPage" ref="operation" @onBiggerOrSmaller="init" @onDrag="draging"
            @setScrollTopAndScrollLeft="setScrollTopAndScrollLeft" @onDraw="onDraw" @onSearch="search"
            @clearForm="clearForm" @toProblems="toProblems" />

        <Problems v-else @toMap="toMap"></Problems>
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';
import Problems from './problems.vue';
import { mapState, storeKey } from 'vuex'

// 固定的七个厂房名
const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    data() {
        return {
            // 标记当前页面，是否为地图页，问题点页=flase
            isMapPage: null
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
    /**
     * 实例创建完后调用，在 mounted 之前；
     * 可以访问 data、computed、methods 的数据；
     * 无法访问 DOM；
     * 
     * 用于数据初始化、路由跳转；
     * 
     * isMapPage不能在mounted初始化，因为需要isMapPage来选择渲染
     */
    created() {
        // 若路径是'/map/assy/problems'，则arrStr = ["", "map", "assy", "problems"]
        const arrStr = this.$route.path.split('/');
        if (plants.has(arrStr[2])) {
            this.$store.state.plant = arrStr[2];
            // 初始化 全局变量
            this.$store.commit('restoreStateFromStorage');
            // 初始化 isMapPage
            if (arrStr.length == 4) {
                if (this.$store.state.choose == '') {
                    this.isMapPage = true;
                    this.$router.push('/map/' + this.$store.state.plant);
                } else {
                    this.isMapPage = false;
                }
            } else {
                this.isMapPage = true;
                this.$store.state.choose = '';
            }
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
        // 地图页的初始化
        if (this.isMapPage) {
            this.init();
            // 监听滚动条
            const disMap = this.$refs.disMap;
            disMap.$refs['section'].addEventListener(
                "scroll",
                this.throttle(() => {
                    this.onDraw();
                    this.setScrollTopAndScrollLeft();
                    console.log('滚动条拖动结束')
                }, 200)
            );
        }
        // 监听浏览器页面大小变化
        window.addEventListener('resize', () => {
            this.init();
        });
        // 监听choose变量
        this.$watch("$store.state.choose", (newVal, oldVal) => {
            if (newVal == '') {
                console.log('未选中设备');
            } else {
                console.log(`选中的设备值+工位号: ${newVal}`);
            }
            this.onDraw();
            this.setProblemCount();
        });
        // 监听isMapPage变量
        this.$watch("isMapPage", (newVal, oldVal) => {
            this.$nextTick(function () {
                // $nextTick回调函数会在 DOM 渲染后调用，因此避免了init方法中用到 null 的 DOM
                if (this.isMapPage) {
                    this.init();
                }
            })
        });
    },
    /**
     * 切换地图时进入
     */
    beforeRouteUpdate(to, from, next) {
        if (this.isMapPage) {
            this.$store.state.choose = '';
            this.init();
            this.clearForm();
        }
        next();
    },
    methods: {
        // 地图的初始化
        async init() {
            console.log('刷新地图');
            const menu = this.$refs.menu;
            const disMap = this.$refs.disMap;
            // 地图选项（menu.currentId）刷新
            menu.handleMouseLeave();
            // 地图数据（state.shapes）刷新
            await disMap.setPlantData();
            // 滚动条偏移值（state.map.scrollLeft、state.map.scrollTop）刷新
            this.setScrollTopAndScrollLeft();
            // 表单数据刷新
            if (this.$store.state.choose != "") {
                this.updateForm(this.$store.state.shapes.get(this.$store.state.choose));
            }
            // 问题点表单数据更新
            this.setProblemCount();
        },
        // 画地图 + 缩略图
        onDraw() {
            const mapContext = this.$refs.disMap.$refs['mapDom'].getContext("2d");
            const thumbnailContext = this.$refs.operation.$refs['thumbnailDom'].getContext("2d");
            // 地图放大，设备也同样放大
            const multiple = (1.0 + 0.05 * this.map.per);
            mapContext.clearRect(0, 0, this.map.width, this.map.height);
            mapContext.strokeStyle = "black";
            thumbnailContext.clearRect(0, 0, this.thumbnail.width, this.thumbnail.height);
            thumbnailContext.strokeStyle = "black";
            this.$store.state.shapes.forEach((value, key) => {
                this.$refs.disMap.drawMap(value, key, multiple);
                this.$refs.operation.drawThumbnail(value, key);
            });
            this.drawThumbnailCheck();
        },
        // 画缩略图的选中框
        drawThumbnailCheck() {
            const thumbnailContext = this.$refs.operation.$refs['thumbnailDom'].getContext("2d");
            const disMap = this.$refs.disMap;

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
            this.$refs['disMap'].$refs['section'].scrollTo(scrollLeft, scrollTop);
            this.onDraw();
        },
        // 滚动条偏移量赋值
        setScrollTopAndScrollLeft() {
            const dom = this.$refs['disMap'].$refs['section'];
            this.map.scrollLeft = dom.scrollLeft;
            this.map.scrollTop = dom.scrollTop;
        },
        // 信息栏更新
        updateForm(value) {
            const operation = this.$refs['operation'];
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
            const operation = this.$refs['operation'];
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
        toProblems() {
            this.isMapPage = false;
        },
        toMap() {
            this.isMapPage = true;
        },
        // 问题点信息栏
        setProblemCount() {
            const operation = this.$refs['operation'];
            if (this.$store.state.choose != '') {
                const arr = this.$store.state.choose.split('+');
                const deviceNum = arr[0];
                const stationNum = arr[1];

                this.execCountRequest(deviceNum, stationNum, null, null).then(data => {
                    operation.formMsg.problem.count = data;
                })
                this.execCountRequest(deviceNum, stationNum, true, 'unfinished').then(data => {
                    operation.formMsg.problem.needHelpAndUnfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, true, 'finished').then(data => {
                    operation.formMsg.problem.needHelpAndfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, false, 'unfinished').then(data => {
                    operation.formMsg.problem.noHelpAndUnfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, false, 'finished').then(data => {
                    operation.formMsg.problem.noHelpAndfinished = data;
                })
            } else {
                operation.formMsg.problem.count = 0;
                operation.formMsg.problem.needHelpAndUnfinished = 0;
                operation.formMsg.problem.needHelpAndfinished = 0;
                operation.formMsg.problem.noHelpAndUnfinished = 0;
                operation.formMsg.problem.noHelpAndfinished = 0;
            }
        },
        execCountRequest(deviceNum, stationNum, isNeedHelp, status) {
            return new Promise((resolve, reject) => {
                this.$axiosInstance.get("/plant/problems/count", {
                    params: {
                        plant: this.$store.state.plant,
                        deviceNum: deviceNum,
                        stationNum: stationNum,
                        isNeedHelp: isNeedHelp,
                        status: status
                    }
                }).then(function (response) {
                    resolve(response.data['count']);
                }).catch(function (error) {
                    reject(error);
                })
            })
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
<template>
    <body>
        <Menu ref="menuChild" />
        <DisMap ref="disMapChild" @onDraw="draw" />
        <!-- 方法缩小，都需要加载一遍地图 -->
        <Operation ref="operationChild" @onBiggerOrSmaller="init" @onDrag="draging" />
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';
import { mapState } from 'vuex'

const plants = new Set(['assy', 'logistics', 'case', 'gear', 'pulley', 'differential', 'heat']);

export default {
    name: 'Map',
    components: {
        Menu,
        DisMap,
        Operation
    },
    computed: {
        ...mapState(['map', 'thumbnail'])
    },
    mounted() {
        const suffix = this.$route.path.substring('/map/'.length);
        // 后缀名不是厂房后缀名，跳转到404
        if (!plants.has(suffix)) {
            this.$router.push('/404');
        } else {
            this.$store.state.plant = suffix;
            this.init();
            this.$store.state.choose = '';
        }

        // 监听滚动条
        const disMap = this.$refs.disMapChild;
        disMap.$refs['section'].addEventListener(
            "scroll",
            this.throttle(() => {
                this.draw();
            }, 200)
        );
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
            menu.handleMouseLeave();
            disMap.init();


            // 地图的实际width、height，当然代码中肯定用全局变量width、height
            console.log('clientWidth: ', disMap.$refs['mapDom'].clientWidth);
            console.log('clientHeight: ', disMap.$refs['mapDom'].clientHeight);
            // 地图显示区域的width、height
            console.log('clientWidth: ', disMap.$refs['section'].clientWidth);
            console.log('clientHeight: ', disMap.$refs['section'].clientHeight);
            // 滚动条之后的偏移量
            console.log('scrollTop: ', disMap.$refs['section'].scrollTop);
            console.log('scrollLeft: ', disMap.$refs['section'].scrollLeft);
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
            thumbnailContext.strokeStyle = "blue";
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
        draging(offsetX, offsetY) {
            const sectionOffsetX = (offsetX / this.thumbnail.width) * this.map.width;
            const sectionOffsetY = (offsetY / this.thumbnail.height) * this.map.height;
            this.$refs['disMapChild'].$refs['section'].scrollTo(sectionOffsetX, sectionOffsetY);
            this.draw();
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
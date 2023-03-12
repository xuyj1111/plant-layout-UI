<template>
    <body>
        <Menu ref="menuChild" />
        <DisMap ref="disMapChild" @onDraw="draw" />
        <!-- 方法缩小，都需要加载一遍地图 -->
        <Operation ref="operationChild" @onBiggerOrSmaller="init" />
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


            // for (var i = 0; i < this.shapes.size; i++) {
            //     mapContext.beginPath();
            //     // thumbnailContext.beginPath();
            //     mapContext.rect(
            //         shapes[i]["coordX"] * multiple,
            //         shapes[i]["coordY"] * multiple,
            //         shapes[i]["width"] * multiple,
            //         shapes[i]["height"] * multiple
            //     );
            // thumbnailContext.rect(
            //     shapes[i]["coordX"] * 0.35,
            //     shapes[i]["coordY"] * 0.35,
            //     shapes[i]["width"] * 0.35,
            //     shapes[i]["height"] * 0.35
            // );
            // if (i == choose) {
            //     mapContext.fillStyle = "black";
            //     mapContext.fill();
            //     thumbnailContext.fillStyle = "black";
            //     thumbnailContext.fill();
            // } else {
            //     //传送带
            //     if (shapes[i]["conveyor"] == "true") {

            //         mapContext.fillStyle = "#a8a6a5";
            //         mapContext.fill();
            //         thumbnailContext.fillStyle = "#a8a6a5";
            //         thumbnailContext.fill();
            //     }
            //     mapContext.stroke();
            //     thumbnailContext.stroke();
            // }
            // }
        }
    }
}

</script>

<style scoped></style>
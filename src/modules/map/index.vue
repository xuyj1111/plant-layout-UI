<template>
    <body>
        <Menu ref="menuChild" />
        <DisMap ref="disMapChild" @onDraw="draw"/>
        <!-- 方法缩小，都需要加载一遍地图 -->
        <Operation @onBiggerOrSmaller="init" />
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
        ...mapState(['map'])
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
        },
        // 画地图
        draw() {
            const mapContext = this.$refs.disMapChild.$refs['mapDom'].getContext("2d");

            mapContext.clearRect(0, 0, this.map.width, this.map.height);
            mapContext.strokeStyle = "black";
            // thumbnailContext.strokeStyle = "black";
            // 地图放大，设备也同样放大
            const multiple = (1.0 + 0.05 * this.map.per);

            this.$store.state.shapes.forEach((value, key) => {
                mapContext.beginPath();
                mapContext.rect(
                    value["coordX"] * multiple,
                    value["coordY"] * multiple,
                    value["width"] * multiple,
                    value["height"] * multiple
                );
                if (key == this.$store.state.choose) {
                    // 选中设备
                    mapContext.fillStyle = "black";
                    mapContext.fill();
                } else {
                    //传送带
                    if (value["conveyor"] == "true") {
                        mapContext.fillStyle = "#a8a6a5";
                        mapContext.fill();
                    }
                    // 其他设备
                    mapContext.stroke();
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
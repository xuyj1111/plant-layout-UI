<template>
    <!-- 显示地图 -->
    <section id="main">
        <canvas ref="mapDom" :width="map.width" :height="map.height"> </canvas>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DisMap',
    data() {
        return {
            // 地图中的图形
            shapes: new Map()
        }
    },
    mounted() {
        var that = this;
        window.addEventListener('load', this.init);
        // 地图中的点击事件，以选中设备
        this.$refs.mapDom.addEventListener('click', function (e) {
            that.draw({ x: e.offsetX, y: e.offsetY });
        }, false);
    },
    computed: {
        ...mapState(['map'])
    },
    methods: {
        init() {
            this.setPlantData();
        },
        // 获取地图数据，即赋值给 this.shapes
        setPlantData() {
            const that = this;
            this.$axiosInstance.get("/plant", {
                params: {
                    name: this.$store.state.plant
                }
            }).then(function (response) {
                var jsonObj = response.data;
                that.shapes.clear();
                for (var i = 0; i < jsonObj.length; i++) {
                    // 校验json，不抛出错误
                    if (that.batchValidation(jsonObj[i], i + 1)) {
                        // 校验成功才赋值，校验失败跳过
                        that.shapes.set(jsonObj[i]['deviceNum'] + jsonObj[i]['stationNum'], jsonObj[i]);
                    }
                }
                console.log('地图切换完成');
            }).catch(function (error) {
                console.log(error);
                window.alert("切换地图失败！请检查！");
                return false;
            })
        },
        // 切换地图校验json
        batchValidation(data, num) {
            if (this.isEmpty(data["deviceNum"])) {
                console.log("第" + num + "个设备编号为空！跳过");
                return false;
            } else if (this.shapes.has(data['deviceNum'] + data['stationNum'])) {
                console.log("第" + num + "个设备编号+工作号已存在! deviceNum[" + data['deviceNum'] + "], stationNum[" + data['stationNum'] + "], 跳过");
                return false;
            } else if (this.isEmpty(data["coordX"])) {
                console.log("第" + num + "个坐标x为空! deviceNum[" + data['deviceNum'] + "], 跳过");
                return false;
            } else if (this.isEmpty(data["coordY"])) {
                console.log("第" + num + "个坐标y为空! deviceNum[" + data['deviceNum'] + "], 跳过");
                return false;
            } else if (this.isEmpty(data["width"])) {
                console.log("第" + num + "个宽度为空! deviceNum[" + data['deviceNum'] + "], 跳过");
                return false;
            } else if (this.isEmpty(data["height"])) {
                console.log("第" + num + "个高度为空! deviceNum[" + data['deviceNum'] + "], 跳过");
                return false;
            } else {
                if (parseInt(data["coordX"]) + parseInt(data["width"]) > 580) {
                    console.log("第" + num + "个坐标x加宽度不可超过580! deviceNum[" + data['deviceNum'] + "], 跳过");
                    return false;
                }
                if (parseInt(data["coordY"]) + parseInt(data["height"]) > 380) {
                    console.log("第" + num + "个坐标y加高度不可超过380! deviceNum[" + data['deviceNum'] + "], 跳过");
                    return false;
                }
                return true;
            }
        },
        draw(p) {
            console.log(p.x);
            console.log(p.y);
        },
        // 判断字符串是否为空
        isEmpty(str) {
            if (str == null || str.trim() == "") {
                return true;
            }
            return false;
        }
    }
}
</script>

<style scoped>
/* 地图区域 */
#main {
    /* 高度百分百，宽度根据“菜单栏”、“操作框”、窗口宽度变化 */
    height: 100%;
    width: calc(100vw - 300px);
    /* 内容溢出盒子时，使用滚动条方式 */
    overflow-x: scroll;
    overflow-y: scroll;

    /* 背景 */
    background: linear-gradient(135deg, #cacaca 0%, #cacaca 5%, transparent 5%, transparent 10%, #cacaca 10%, #cacaca 15%, transparent 15%, transparent 20%, #cacaca 20%, #cacaca 25%, transparent 25%, transparent 30%, #cacaca 30%, #cacaca 35%, transparent 35%, transparent 40%, #cacaca 40%, #cacaca 45%, transparent 45%, transparent 50%, #cacaca 50%, #cacaca 55%, transparent 55%, transparent 60%, #cacaca 60%, #cacaca 65%, transparent 65%, transparent 70%, #cacaca 70%, #cacaca 75%, transparent 70%, transparent 80%, #cacaca 80%, #cacaca 85%, transparent 85%, transparent 90%, #cacaca 90%, #cacaca 95%, transparent 95%);
    background-size: 1em 1em;
    background-color: #ffffff;
    /* 设置透明度 */
    opacity: 0.5;
}

/* 地图区域的画板 */
#main canvas {
    background: white;
    /* 盒子边框 */
    border: 2px solid rgb(153, 153, 153);
}
</style>
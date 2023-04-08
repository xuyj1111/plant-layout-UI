<template>
    <!-- 显示地图 -->
    <section ref="section" id="main">
        <canvas ref="map" :width="map.width" :height="map.height"> </canvas>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'MapBody',
    data() {
        return {
        }
    },
    mounted() {
        console.log('mapBody.vue mounted......');
        var that = this;
        // 地图中的点击事件，以选中设备
        this.$refs['map'].addEventListener('click', function (e) {
            const mapContext = that.$refs['map'].getContext("2d");
            const multiple = (1.0 + 0.05 * that.map.per);
            // 用foreach，无法使用break或return跳出循环，因此使用for
            for (let [key, value] of that.$store.state.shapes) {
                mapContext.beginPath();
                mapContext.rect(
                    value["coordX"] * multiple,
                    value["coordY"] * multiple,
                    value["width"] * multiple,
                    value["height"] * multiple
                );
                if (mapContext.isPointInPath(e.offsetX, e.offsetY)) {
                    that.$store.state.choose = key;
                    break;
                } else {
                    that.$store.state.choose = '';
                }
            };
        });
        // 监听滚动条
        this.$refs['section'].addEventListener(
            "scroll",
            this.throttle(() => {
                this.$emit('onScrollBar');
                console.log('滚动条拖动结束')
            }, 200)
        );
    },
    computed: {
        ...mapState(['map'])
    },
    methods: {
        /**
         * 画地图
         * Map.vue调用
         */
        drawMap(shape, key, multiple) {
            const mapContext = this.$refs['map'].getContext("2d");
            mapContext.strokeStyle = "black";
            mapContext.beginPath();
            mapContext.rect(
                shape["coordX"] * multiple,
                shape["coordY"] * multiple,
                shape["width"] * multiple,
                shape["height"] * multiple
            );
            /**
             * 有未解决的问题，显示红色
             * 有审核的问题，显示黄色
             * 没有问题，传送带显示黑色 其他设备显示灰色
             */
            if (shape['unfinishedCount'] > 0) {
                mapContext.fillStyle = "red";
                mapContext.fill();
                mapContext.stroke();
            } else if (shape['reviewCount']) {
                mapContext.fillStyle = "yellow";
                mapContext.fill();
                mapContext.stroke();
            } else {
                //传送带
                if (shape["conveyor"] == "true") {
                    mapContext.fillStyle = "black";
                    mapContext.fill();
                    mapContext.stroke();
                } else {
                    mapContext.fillStyle = "#B5B5B5";
                    mapContext.fill();
                    mapContext.stroke();
                }
            }
            // 选中设备
            if (key == this.$store.state.choose) {
                mapContext.beginPath();
                mapContext.rect(
                    shape["coordX"] * multiple,
                    shape["coordY"] * multiple,
                    shape["width"] * multiple,
                    shape["height"] * multiple
                );
                mapContext.strokeStyle = "#00ffff";
                mapContext.stroke();
            }
        },
        /**
         * this.$store.state.shapes赋值
         * Map.vue调用
         */
        async setPlantData() {
            const that = this;
            const shapes = this.$store.state.shapes;
            // 获取地图数据
            await this.$axiosInstance.get("/plant", {
                params: {
                    name: this.$store.state.plant
                }
            }).then(function (response) {
                var jsonObj = response.data;
                shapes.clear();
                for (var i = 0; i < jsonObj.length; i++) {
                    // 校验json，不抛出错误
                    if (that.batchValidation(jsonObj[i], i + 1)) {
                        // 校验成功才赋值，校验失败跳过
                        shapes.set(jsonObj[i]['deviceNum'] + '+' + jsonObj[i]['stationNum'], jsonObj[i]);
                    }
                }
            }).catch(function (error) {
                console.log(error);
                window.alert("切换地图失败！请检查！");
                return false;
            });
            // 获取地图groupBy count
            await this.$axiosInstance.get("/plant/problems/groupby", {
                params: {
                    plant: this.$store.state.plant
                }
            }).then(function (response) {
                for (let data of response.data) {
                    let shape = shapes.get(data['deviceNum'] + '+' + data['stationNum']);
                    if (shape != null) {
                        shape['unfinishedCount'] = data['unfinishedCount'];
                        shape['reviewCount'] = data['reviewCount'];
                    }
                }
            }).catch(function (error) {
                console.log(error);
                window.alert("切换地图失败！请检查！");
                return false;
            });
        },
        // 切换地图校验json
        batchValidation(data, num) {
            if (this.isEmpty(data["deviceNum"])) {
                console.log(`第${num}个设备编号为空！跳过`);
                return false;
            } else if (this.$store.state.shapes.has(data['deviceNum'] + '+' + data['stationNum'])) {
                console.log(`第${num}个设备编号+工作号已存在! deviceNum[${data['deviceNum']}], stationNum[${data['stationNum']}], 跳过`);
                return false;
            } else if (this.isEmpty(data["coordX"])) {
                console.log(`第${num}个坐标X为空! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (!this.isNumeric(data["coordX"])) {
                console.log(`第${num}个坐标X不是数字! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (this.isEmpty(data["coordY"])) {
                console.log(`第${num}个坐标Y为空! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (!this.isNumeric(data["coordY"])) {
                console.log(`第${num}个坐标Y不是数字! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (this.isEmpty(data["width"])) {
                console.log(`第${num}个宽度为空! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (!this.isNumeric(data["width"])) {
                console.log(`第${num}个宽度不是数字! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (this.isEmpty(data["height"])) {
                console.log(`第${num}个高度为空! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else if (!this.isNumeric(data["height"])) {
                console.log(`第${num}个高度不是数字! deviceNum[${data['deviceNum']}], 跳过`);
                return false;
            } else {
                if (parseFloat(data["coordX"]) + parseFloat(data["width"]) > 580) {
                    console.log(`第${num}个坐标X加宽度不可超过580! deviceNum[${data['deviceNum']}], 跳过`);
                    return false;
                }
                if (parseFloat(data["coordY"]) + parseFloat(data["height"]) > 380) {
                    console.log(`第${num}个坐标Y加高度不可超过380! deviceNum[${data['deviceNum']}], 跳过`);
                    return false;
                }
                return true;
            }
        },
        /**
         * 辅助实现监听“滚动结束”事件
         * 设置一个定时器，滚动时会执行该方法，即clearTimeout；
         * 若定时器到达，则表示不再滚动，即触发事件；
         */
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
        },
        // 判断字符串是否为空
        isEmpty(str) {
            if (str == null || str.trim() == "") {
                return true;
            }
            return false;
        },
        // 判断字符串是否都是数字，包括最多只有1个小数点
        isNumeric(str) {
            return /^\d+(\.\d+)?$/.test(str);
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
<template>
    <!-- 操作栏 -->
    <section id="operation">
        <!-- 搜索框 -->
        <div id="search">
            <el-input v-model="search_input" class="w-50 m-2" placeholder="请输入设备编号">
                <template #prefix>
                    <el-icon class="el-input__icon">
                        <search />
                    </el-icon>
                </template>
            </el-input>
        </div>

        <div id="switch">
            <el-switch v-model="switch_value" active-text="编辑信息" />
        </div>

        <!-- 不可编辑信息栏 -->
        <div id="info" v-show="!switch_value">
            <el-descriptions title="设备信息" :column="1" border>
                <el-descriptions-item label="设备编号" label-align="right" align="center" width="100px">{{ forMsg.deviceNum
                }}</el-descriptions-item>
                <el-descriptions-item label="岗位号" label-align="right" align="center" width="100px">{{ forMsg.stationNum
                }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="问题点" :column="1" border>
                <el-descriptions-item label="总数" label-align="right" align="center" width="100px">{{ forMsg.problem.count
                }}</el-descriptions-item>
                <el-descriptions-item label="需协助" label-align="right" align="center" width="100px">
                    <font color="red">{{ forMsg.problem.needHelpAndUnfinished }}</font>
                    <font> / </font>
                    <font color="green">{{ forMsg.problem.needHelpAndfinished }}</font>
                </el-descriptions-item>
                <el-descriptions-item label="无需协助" label-align="right" align="center" width="100px">
                    <font color="red">{{ forMsg.problem.noHelpAndUnfinished }}</font>
                    <font> / </font>
                    <font color="green">{{ forMsg.problem.noHelpAndfinished }}</font>
                </el-descriptions-item>
                <el-descriptions-item label="完成率" label-align="right" align="center" width="100px">
                    <el-tag size="small">{{ (forMsg.problem.count != 0) ?
                        ((forMsg.problem.needHelpAndfinished + forMsg.problem.noHelpAndfinished) /
                            forMsg.problem.count) * 100 : 0 }}%</el-tag>
                </el-descriptions-item>
            </el-descriptions>

            <el-link :underline="false" type="primary" id="link">问题点详情>></el-link>
        </div>

        <!-- 可编辑信息栏 -->
        <div id="edit_info" v-show="switch_value">
            <el-form label-width="70px" :model="formLabel">
                <el-form-item label="设备编号">
                    <el-input v-model="formLabel.deviceNum" />
                </el-form-item>
                <el-form-item label="岗位号">
                    <el-input v-model="formLabel.stationNum" />
                </el-form-item>
                <el-form-item label="坐标X">
                    <el-input v-model="formLabel.coordX" />
                </el-form-item>
                <el-form-item label="坐标Y">
                    <el-input v-model="formLabel.coordY" />
                </el-form-item>
                <el-form-item label="宽度">
                    <el-input v-model="formLabel.width" />
                </el-form-item>
                <el-form-item label="高度">
                    <el-input v-model="formLabel.height" />
                </el-form-item>
                <el-form-item label="传送带" prop="conveyor">
                    <el-radio v-model="formLabel.conveyor" label='true'>是</el-radio>
                    <el-radio v-model="formLabel.conveyor" label='false'>否</el-radio>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="">保存</el-button>
                    <el-button type="danger">删除</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div id="map-button">
            <button @click="bigger()">+</button>
            <span></span>
            <button @click="smaller()">-</button>
            <span>&nbsp;&nbsp;{{ map.per }}%</span>
        </div>
        <!-- 缩略图 -->
        <canvas id='canvas' ref="mapDom" width="203" height="133" @mousedown="startDraging" @mouseup="stopDraging"
            @mousemove="draging">
        </canvas>
    </section>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
import { mapState } from 'vuex'

export default {
    name: 'Operation',
    components: {
        Search
    },
    data() {
        return {
            // 搜索框输入
            search_input: "",
            // 切换是否可编辑
            switch_value: false,
            // 不可编辑信息栏
            forMsg: {
                // 设备编号
                deviceNum: "",
                // 岗位号
                stationNum: "",
                // 问题点
                problem: {
                    // 总数
                    count: 0,
                    // 需要协助 未完成数量
                    needHelpAndUnfinished: 0,
                    // 需要协助 完成数量
                    needHelpAndfinished: 0,
                    // 不需要协助 未完成数量
                    noHelpAndUnfinished: 0,
                    // 不需要协助 完成数量
                    noHelpAndfinished: 0
                }
            },
            // 可编辑信息栏
            formLabel: {
                // 设备编号
                deviceNum: "",
                // 岗位号
                stationNum: "",
                // 坐标X
                coordX: "",
                // 坐标Y
                coordY: "",
                // 宽度
                width: "",
                // 高度
                height: "",
                // 是否传送带
                conveyor: ""
            },
            // 缩略图相对于页面左边的距离，用来计算鼠标在缩略图的相对坐标
            rectLeft: 0,
            // 缩略图相对于页面的顶部的距离，用来计算鼠标在缩略图的相对坐标
            rectTop: 0,
            // 鼠标在缩略图首次点击的坐标
            firstClickX: 0,
            firstClickY: 0
        }
    },
    computed: {
        ...mapState(['map', 'thumbnail'])
    },
    methods: {
        // 放大地图
        bigger() {
            if (this.map.per < 100) {
                this.map.width += 10 * ((this.map.maxWidth - this.map.minWidth) / 100);
                this.map.height += 10 * ((this.map.maxHeight - this.map.minHeight) / 100);
                this.map.per += 10;
                // 触发父vue执行方法
                this.$emit('onBiggerOrSmaller');
            }
        },
        // 缩小地图
        smaller() {
            if (this.map.per > 0) {
                this.map.width -= 10 * ((this.map.maxWidth - this.map.minWidth) / 100);
                this.map.height -= 10 * ((this.map.maxHeight - this.map.minHeight) / 100);
                this.map.per -= 10;
                // 触发父vue执行方法
                this.$emit('onBiggerOrSmaller');
            }
        },
        // 开始拖动
        startDraging(event) {
            const rect = this.$refs['mapDom'].getBoundingClientRect();
            this.rectLeft = rect.left;
            this.rectTop = rect.top;
            this.firstClickX = event.clientX - this.rectLeft;
            this.firstClickY = event.clientY - this.rectTop;
            console.log('start draging...');
        },
        // 停止拖动
        stopDraging() {
            this.rectLeft = 0;
            this.rectTop = 0;
            this.firstClickX = 0;
            this.firstClickY = 0;
            this.$emit('setScrollTopAndScrollLeft');
            console.log('over drag');
        },
        // 拖动的具体实现
        draging(event) {
            // 只有鼠标按下才不为0，松开为0，即鼠标按下拖动即进入
            if (this.rectLeft > 0 && this.rectTop > 0) {
                // x, y 是鼠标在缩略图中的相对坐标
                const x = event.clientX - this.rectLeft;
                const y = event.clientY - this.rectTop;
                // 判断点击位置，是否在选中框内
                if ((x >= this.thumbnail.checkOffsetX && x <= (this.thumbnail.checkOffsetX + this.thumbnail.checkWidth))
                    && (y >= this.thumbnail.checkOffsetY && y <= (this.thumbnail.checkOffsetY + this.thumbnail.checkHeight))) {
                    // (x - this.firstClickX) 表示：鼠标首次点击坐标，至当前坐标的偏移量
                    // offsetX、offsetY 表示：缩略图偏移量 转换为 地图偏移量
                    const offsetX = ((x - this.firstClickX) / this.thumbnail.width) * this.map.width;
                    const offsetY = ((y - this.firstClickY) / this.thumbnail.height) * this.map.height;
                    // 当前滚动条偏移量 + 地图偏移量 = 目标滚动条偏移量
                    this.$emit('onDrag', this.map.scrollLeft + offsetX, this.map.scrollTop + offsetY);
                }
            }
        }
    }
}
</script>

<style scoped>
/* 操作栏 */
#operation {
    /* 高度百分百，宽度固定 250px */
    height: 100%;
    width: 250px;
    /* 内容溢出盒子时，使用滚动条方式 */
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: white;
    /* 使用 flex 布局，方向 column */
    display: flex;
    flex-direction: column;
}

/* 搜索框 */
#search {
    margin: 20px auto 0;
}

/* 编辑信息开关 */
#switch {
    margin-top: 10px;
    position: relative;
    left: 110px;
}

/* 信息区域/可编辑信息区域 */
#info,
#edit_info {
    width: 220px;
    margin: 10px auto 0;
}

/* 问题点链接 */
#link {
    margin-bottom: 20px;
    margin-top: 10px;
    position: relative;
    left: 110px;
}

/* 操作栏的放大缩小按钮 */
#map-button {
    margin: 0 17px;
}

/* 输入框+导入按钮 */




/* 缩略图 */
#canvas {
    margin: 0 auto;
    background-color: white;
    border: 1px solid black;
}
</style>
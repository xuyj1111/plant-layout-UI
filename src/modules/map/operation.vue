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

        <!-- 信息区域 -->
        <div id="info" v-show="!switch_value">
            <el-descriptions title="设备信息" :column="1" border>
                <el-descriptions-item label="设备编号" label-align="right" align="center"
                    width="100px">MMR50012</el-descriptions-item>
                <el-descriptions-item label="岗位号" label-align="right" align="center"
                    width="100px">G030</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="问题点" :column="1" border>
                <el-descriptions-item label="总数" label-align="right" align="center" width="100px">10</el-descriptions-item>
                <el-descriptions-item label="需协助" label-align="right" align="center" width="100px">
                    <!-- <font color="red">3</font>
                    <font> / </font>
                    <font color="green">1</font> -->
                </el-descriptions-item>
                <el-descriptions-item label="无需协助" label-align="right" align="center" width="100px">
                    <!-- <font color="red">3</font>
                    <font> / </font>
                    <font color="green">3</font> -->
                </el-descriptions-item>
                <el-descriptions-item label="完成率" label-align="right" align="center" width="100px">
                    <el-tag size="small">60%</el-tag>
                </el-descriptions-item>
            </el-descriptions>

            <el-link :underline="false" type="primary" id="link">问题点详情</el-link>
        </div>

        <!-- 可编辑信息区域 -->
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
                    <el-radio-group v-model="formLabel.conveyor">
                        <el-radio label="是" />
                        <el-radio label="否" />
                    </el-radio-group>
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
        <div id="canvas">
            <canvas width="203" height="133"> </canvas>
        </div>
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
            }
        }
    },
    computed: {
        ...mapState(['map'])
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
    border: 1px solid rgb(0, 0, 0);
}
</style>
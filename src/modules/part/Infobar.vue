<template>
    <!-- 操作栏 -->
    <section id="operation">
        <!-- 搜索框 -->
        <div id="search">
            <el-input v-model.trim="search" class="w-50 m-2"
                :placeholder="this.$store.state.plant == 'assy' ? '请输入工位号' : '请输入设备编号'" @keyup.enter="handleSearch"
                @blur="handleSearch">
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
                <el-descriptions-item label="设备编号" label-align="right" align="center" width="100px">{{ formMsg.deviceNum
                }}</el-descriptions-item>
                <el-descriptions-item label="岗位号" label-align="right" align="center" width="100px">{{ formMsg.stationNum
                }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="问题点" :column="1" border>
                <el-descriptions-item label="总数" label-align="right" align="center" width="100px">{{ formMsg.problem.count
                }}</el-descriptions-item>
                <el-descriptions-item label="需协助" label-align="right" align="center" width="100px">
                    <span style="color: red">{{ formMsg.problem.needHelpAndUnfinished }}</span>
                    <span> / </span>
                    <span style="color: green">{{ formMsg.problem.needHelpAndfinished }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="无需协助" label-align="right" align="center" width="100px">
                    <span style="color: red">{{ formMsg.problem.noHelpAndUnfinished }}</span>
                    <span> / </span>
                    <span style="color: green">{{ formMsg.problem.noHelpAndfinished }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="完成率" label-align="right" align="center" width="100px">
                    <el-tag size="small">{{ (formMsg.problem.count != 0) ?
                        (((formMsg.problem.needHelpAndfinished + formMsg.problem.noHelpAndfinished) /
                            formMsg.problem.count) * 100).toFixed(0) : 0 }}%</el-tag>
                </el-descriptions-item>
            </el-descriptions>

            <el-link :underline="false" type="primary" id="link" @click="toProblems">问题点详情>></el-link>
        </div>

        <!-- 可编辑信息栏 -->
        <div id="edit_info" v-show="switch_value">
            <el-form label-width="80px" :model="formLabel" :rules="rules" ref="form">
                <el-form-item label="设备编号" prop="deviceNum">
                    <el-input v-model="formLabel.deviceNum" />
                </el-form-item>
                <el-form-item label="岗位号">
                    <el-input v-model="formLabel.stationNum" />
                </el-form-item>
                <el-form-item label="坐标X" prop="coordX">
                    <el-input v-model="formLabel.coordX" />
                </el-form-item>
                <el-form-item label="坐标Y" prop="coordY">
                    <el-input v-model="formLabel.coordY" />
                </el-form-item>
                <el-form-item label="宽度" prop="width">
                    <el-input v-model="formLabel.width" />
                </el-form-item>
                <el-form-item label="高度" prop="height">
                    <el-input v-model="formLabel.height" />
                </el-form-item>
                <el-form-item label="传送带" prop="conveyor">
                    <el-radio v-model="formLabel.conveyor" label='true'>是</el-radio>
                    <el-radio v-model="formLabel.conveyor" label='false'>否</el-radio>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveMachine('form')">保存</el-button>
                    <el-button type="danger" @click="deleteMachine('form')">删除</el-button>
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
        <canvas id='canvas' ref="thumbnailDom" width="203" height="133" @mousedown="startDraging" @mouseup="stopDraging"
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
            search: "",
            // 切换是否可编辑
            switch_value: false,
            // 不可编辑信息栏
            formMsg: {
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
            firstClickY: 0,
            rules: {
                deviceNum: [
                    { required: true, message: '设备编号不能为空', trigger: 'submit' }
                ],
                coordX: [
                    { required: true, message: '坐标X不能为空', trigger: 'submit' }
                ],
                coordY: [
                    { required: true, message: '坐标Y不能为空', trigger: 'submit' }
                ],
                width: [
                    { required: true, message: '宽度不能为空', trigger: 'submit' }
                ],
                height: [
                    { required: true, message: '高度不能为空', trigger: 'submit' }
                ],
                conveyor: [
                    { required: true, message: '传送带选项不能为空', trigger: 'submit' }
                ]
            }
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
                this.$emit('init');
            }
        },
        // 缩小地图
        smaller() {
            if (this.map.per > 0) {
                this.map.width -= 10 * ((this.map.maxWidth - this.map.minWidth) / 100);
                this.map.height -= 10 * ((this.map.maxHeight - this.map.minHeight) / 100);
                this.map.per -= 10;
                this.$emit('init');
            }
        },
        // 画缩略图
        drawThumbnail(value, key) {
            const thumbnailContext = this.$refs['thumbnailDom'].getContext("2d");
            thumbnailContext.beginPath();
            thumbnailContext.rect(
                value["coordX"] * 0.35,
                value["coordY"] * 0.35,
                value["width"] * 0.35,
                value["height"] * 0.35
            );
            if (key == this.$store.state.choose) {
                // 选中设备
                thumbnailContext.fillStyle = "red";
                thumbnailContext.fill();
            } else {
                //传送带
                if (value["conveyor"] == "true") {
                    thumbnailContext.fillStyle = "#a8a6a5";
                    thumbnailContext.fill();
                }
                // 其他设备
                thumbnailContext.stroke();
            }
        },
        // 画缩略图的选中框
        drawThumbnailCheck(widthPer, heightPer, offsetX, offsetY) {
            const thumbnailContext = this.$refs['thumbnailDom'].getContext("2d");
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
        // 开始拖动
        startDraging(event) {
            const rect = this.$refs['thumbnailDom'].getBoundingClientRect();
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
            this.$emit('init');
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
                    this.$emit('onDraging', this.map.scrollLeft + offsetX, this.map.scrollTop + offsetY);
                }
            }
        },
        updateForm() {
            const shape = this.$store.state.shapes.get(this.$store.state.choose);
            if (shape == null) {
                this.formMsg.deviceNum = '';
                this.formMsg.stationNum = '';
                this.formLabel.deviceNum = '';
                this.formLabel.stationNum = '';
                this.formLabel.coordX = '';
                this.formLabel.coordY = '';
                this.formLabel.width = '';
                this.formLabel.height = '';
                this.formLabel.conveyor = '';
            } else {
                this.formMsg.deviceNum = shape['deviceNum'];
                this.formMsg.stationNum = shape['stationNum'];
                this.formLabel.deviceNum = shape['deviceNum'];
                this.formLabel.stationNum = shape['stationNum'];
                this.formLabel.coordX = shape['coordX'];
                this.formLabel.coordY = shape['coordY'];
                this.formLabel.width = shape['width'];
                this.formLabel.height = shape['height'];
                this.formLabel.conveyor = shape['conveyor'];
            }
        },
        // 添加/更新设备
        saveMachine(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.$store.state.choose == '') {
                        if (!confirm('你确定要添加此设备吗？')) {
                            // 否 跳出
                            return;
                        }
                        // 判断设备编号 + 工位号是否存在
                        if (this.$store.state.shapes.has(this.formLabel.deviceNum + '+' + this.formLabel.stationNum)) {
                            window.alert('该设备编号 + 工位号已存在！操作失败！');
                            return;
                        }
                    } else {
                        if (!confirm('你确定要更新此设备吗？')) {
                            // 否 跳出
                            return;
                        }
                    }
                    // 坐标X、Y、width、height是否都是数字
                    if (!this.isNumeric(this.formLabel.coordX)) {
                        window.alert('坐标X不是数字！操作失败！');
                        return;
                    }
                    if (!this.isNumeric(this.formLabel.coordY)) {
                        window.alert('坐标Y不是数字！操作失败！');
                        return;
                    }
                    if (!this.isNumeric(this.formLabel.width)) {
                        window.alert('宽度不是数字！操作失败！');
                        return;
                    }
                    if (!this.isNumeric(this.formLabel.height)) {
                        window.alert('高度不是数字！操作失败！');
                        return;
                    }
                    if (!this.isNumeric(this.formLabel.coordX)) {
                        window.alert('坐标X不是数字！操作失败！');
                        return;
                    }
                    // x+width不能超过580，y+height不能超过380
                    if ((parseFloat(this.formLabel.coordX) + parseFloat(this.formLabel.width)) > 580) {
                        window.alert('坐标X加宽度不可超过580！操作失败！');
                        return;
                    }
                    if ((parseFloat(this.formLabel.coordY) + parseFloat(this.formLabel.height)) > 380) {
                        window.alert('坐标Y加高度不可超过380！操作失败！');
                        return;
                    }
                    // 添加/更新设备操作
                    if (this.$store.state.choose == '') {
                        this.$store.state.choose = this.formLabel.deviceNum + '+' + this.formLabel.stationNum;
                        this.$store.state.shapes.set(this.$store.state.choose, {
                            deviceNum: this.formLabel.deviceNum,
                            stationNum: this.formLabel.stationNum,
                            coordX: this.formLabel.coordX,
                            coordY: this.formLabel.coordY,
                            width: this.formLabel.width,
                            height: this.formLabel.height,
                            conveyor: this.formLabel.conveyor
                        });
                        this.$store.state.choose = this.formLabel.deviceNum + '+' + this.formLabel.stationNum;
                    } else {
                        this.$store.state.shapes.set(this.$store.state.choose, {
                            deviceNum: this.formLabel.deviceNum,
                            stationNum: this.formLabel.stationNum,
                            coordX: this.formLabel.coordX,
                            coordY: this.formLabel.coordY,
                            width: this.formLabel.width,
                            height: this.formLabel.height,
                            conveyor: this.formLabel.conveyor
                        });
                        // 添加操作会自动刷新地图，因为choose在disMap.vue中监控变动
                        // 只有修改操作要手动刷新地图
                        this.$emit('init');
                    }
                    this.updatePlantData();
                }
            });
        },
        // 删除设备
        deleteMachine(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.$store.state.choose == '') {
                        window.alert('未选中设备，无法删除！');
                        return;
                    } else {
                        if (!confirm('你确定要删除此设备吗？')) {
                            // 否 跳出
                            return;
                        }
                    }
                    this.$store.state.shapes.delete(this.$store.state.choose);
                    this.$store.state.choose = '';
                    this.formMsg.deviceNum = '';
                    this.formMsg.stationNum = '';
                    this.formLabel.deviceNum = '';
                    this.formLabel.stationNum = '';
                    this.formLabel.coordX = '';
                    this.formLabel.coordY = '';
                    this.formLabel.width = '';
                    this.formLabel.height = '';
                    this.formLabel.conveyor = '';
                    this.updatePlantData();
                }
            });
        },
        // 更新地图数据
        updatePlantData() {
            this.$axiosInstance.post("/plant", JSON.parse(JSON.stringify(Array.from(this.$store.state.shapes.values()))), {
                params: {
                    name: this.$store.state.plant
                }
            }).then(function (response) {
                console.log('地图数据更新成功！');
            }).catch(function (error) {
                console.log(error);
                window.alert('更新地图错误！请检查！');
                return false;
            })
        },
        handleSearch() {
            if (this.$store.state.plant == 'assy') {
                console.log(`搜索工位号: ${this.search}`);
                // 创建一个对象，key = 工位号，value = 设备编号+工位号
                const values = Array.from(this.$store.state.shapes.keys()).reduce((acc, cur, index) => {
                    acc[cur.split('+').pop()] = cur;
                    return acc;
                }, {});
                // 判断是否存在
                if (values[this.search] != null) {
                    this.$store.state.choose = values[this.search];
                } else {
                    console.log('不存在该设备！');
                    this.$store.state.choose = '';
                    this.updateForm();
                }
            } else {
                console.log(`搜索设备编号: ${this.search}`);
                // 创建一个对象，key = 设备编号+工位号，value = 设备编号
                // 设备编号可重复，所以作为value
                const values = Array.from(this.$store.state.shapes.keys()).reduce((acc, cur, index) => {
                    const arr = cur.split('+');
                    arr.pop();
                    acc[cur] = arr[0];
                    return acc;
                }, {});
                // 无法直接通过value来找key，所以只好遍历
                var flag = false;
                for (let key in values) {
                    if (values[key] == this.search) {
                        this.$store.state.choose = key;
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    console.log('不存在该设备！');
                    this.$store.state.choose = '';
                }
            }
        },
        // 问题点信息栏赋值
        setProblemCount() {
            if (!this.isEmpty(this.$store.state.choose)) {
                const arr = this.$store.state.choose.split('+');
                const deviceNum = arr[0];
                const stationNum = arr[1];

                this.execCountRequest(deviceNum, stationNum, null, null).then(data => {
                    this.formMsg.problem.count = data;
                })
                this.execCountRequest(deviceNum, stationNum, true, 'unfinished').then(data => {
                    this.formMsg.problem.needHelpAndUnfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, true, 'finished').then(data => {
                    this.formMsg.problem.needHelpAndfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, false, 'unfinished').then(data => {
                    this.formMsg.problem.noHelpAndUnfinished = data;
                })
                this.execCountRequest(deviceNum, stationNum, false, 'finished').then(data => {
                    this.formMsg.problem.noHelpAndfinished = data;
                })
            } else {
                this.formMsg.problem.count = 0;
                this.formMsg.problem.needHelpAndUnfinished = 0;
                this.formMsg.problem.needHelpAndfinished = 0;
                this.formMsg.problem.noHelpAndUnfinished = 0;
                this.formMsg.problem.noHelpAndfinished = 0;
            }
        },
        // 执行count请求，setProblemCount()调用
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
        // 跳转到问题点列表页
        toProblems() {
            // 选中才可以点击跳转
            if (!this.isEmpty(this.$store.state.choose)) {
                this.$router.push(this.$route.path + '/problems');
            }
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

/* 缩略图 */
#canvas {
    margin: 0 auto;
    background-color: white;
    border: 1px solid black;
}
</style>
<template>
    <section class="body">
        <div id="title">
            <div class="element">
                <el-link :underline="false" type="primary" id="link" @click="toMap">&lt;&nbsp;返回</el-link>
            </div>
            <span class="element">{{ isEmpty(deviceNum) ? '' : `设备编号：${deviceNum}` }}</span>
            <span class="element">{{ isEmpty(stationNum) ? '' : `工位号：${stationNum}` }}</span>
        </div>

        <div id="operation">
            <!-- 搜索框 -->
            <span class="search">
                <el-input v-model.trim="search" class="w-50 m-2" placeholder='支持搜索序号、提交人、问题点描述' @keyup.enter="handleSearch"
                    @blur="handleSearch">
                    <template #prefix>
                        <el-icon class="el-input__icon">
                            <search />
                        </el-icon>
                    </template>
                </el-input>
            </span>

            <!-- 过滤选项 -->
            <span class="filter">
                <el-select v-model="status" placeholder="所有问题点" @change="handleFilter">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </span>
        </div>
        <div id="table">
            <el-table :data="tableData" stripe fixed style="width: 100%" :cell-style="{ 'text-align': 'center' }"
                :header-cell-style="{ background: '#10472D', color: 'white', 'line-hight': '50px', 'text-align': 'center' }">
                <el-table-column prop="id" label="序号" width="120">
                </el-table-column>
                <el-table-column prop="name" label="提交人" width="120">
                </el-table-column>
                <el-table-column prop="dateCreated" label="提交日期" width="180">
                </el-table-column>
                <el-table-column prop="detail" label="问题点描述" width="180">
                </el-table-column>
                <el-table-column prop="isNeedHelp" label="是否需要其他部门协助" width="250">
                </el-table-column>
                <el-table-column prop="picture" label="图片" width="180">
                </el-table-column>
                <el-table-column prop="status" label="状态" fixed="right">
                </el-table-column>
            </el-table>
        </div>

        <!-- <div id="page">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page.sync="currentPage3" :page-size="5" layout="prev, pager, next, jumper" :total="500">
            </el-pagination>
        </div> -->

        <div id="page">
            <span class="countTxt">共{{ count }}条&nbsp</span>
            <el-pagination background @current-change="setPage" :page-size="5" layout="prev, pager, next, jumper"
                :total=count>
            </el-pagination>
        </div>

    </section>
</template>

<script>
import { Search } from '@element-plus/icons-vue'

export default {
    name: 'ProblemsMap',
    components: {
        Search
    },
    data() {
        return {
            deviceNum: '',
            stationNum: '',
            search: '',
            options: [{
                value: 'all',
                label: '所有'
            }, {
                value: 'unfinished',
                label: '未完成'
            }, {
                value: 'review',
                label: '审核中'
            }, {
                value: 'finished',
                label: '已完成'
            }],
            status: 'all',
            tableData: [],
            count: 0,
            page: 0
        }
    },
    mounted() {
        console.log('跳转到问题点详情页');
        const arr = this.$store.state.choose.split('+');
        this.deviceNum = arr[0];
        this.stationNum = arr[1];

        this.$watch("page", (newVal, oldVal) => {
            this.tableData = [];
            new Promise((resolve, reject) => {
                this.$axiosInstance.get("/plant/problems", {
                    params: {
                        plant: this.$store.state.plant,
                        deviceNum: this.deviceNum,
                        stationNum: this.stationNum,
                        status: this.status == 'all' ? null : this.status,
                        page: this.page,
                        size: 5
                    }
                }).then(function (response) {
                    resolve(response.data);
                }).catch(function (error) {
                    reject(error);
                })
            }).then(data => {
                this.tableData = data;
            })
        });

        new Promise((resolve, reject) => {
            this.$axiosInstance.get("/plant/problems/count", {
                params: {
                    plant: this.$store.state.plant,
                    deviceNum: this.deviceNum,
                    stationNum: this.stationNum,
                    status: this.status == 'all' ? null : this.status
                }
            }).then(function (response) {
                resolve(response.data['count']);
            }).catch(function (error) {
                reject(error);
            })
        }).then(data => {
            this.count = data;
        })

        new Promise((resolve, reject) => {
            this.$axiosInstance.get("/plant/problems", {
                params: {
                    plant: this.$store.state.plant,
                    deviceNum: this.deviceNum,
                    stationNum: this.stationNum,
                    status: this.status == 'all' ? null : this.status,
                    page: this.page,
                    size: 5
                }
            }).then(function (response) {
                resolve(response.data);
            }).catch(function (error) {
                reject(error);
            })
        }).then(data => {
            this.tableData = data;
        })
    },
    methods: {
        // 判断字符串是否为空
        isEmpty(str) {
            if (str == null || str.trim() == "") {
                return true;
            }
            return false;
        },
        handleSearch() {

        },
        handleFilter() {
            console.log(this.status);
        },
        // 跳转到地图页
        toMap() {
            this.$emit('toMap');
            this.$router.push(this.$route.path.replace(new RegExp("/problems$"), ""));
        },
        setPage(val) {
            this.page = val - 1;
        }
    }
}
</script>

<!-- 为改变element的分页控件 而不是用canvas -->
<style>
.body {
    width: calc(100vw - 50px);
    overflow-y: scroll;
}

.body #title {
    margin-bottom: 20px;
}

.body #title .element {
    font-weight: bold;
    font-size: 20px;
    margin: 10px 0px 10px 20px;
}

.body #operation {
    position: relative;
    width: 100%;
}

.body #operation .search {
    width: 280px;
    display: inline-block;
    position: relative;
    left: 20px;
}

.body #operation .filter {
    width: 140px;
    display: inline-block;
    position: relative;
    left: calc(100% - 440px);
}

.body #table {
    margin: 20px 20px 20px 20px;
}

.body #page {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

/* 改变分页控件的颜色 */
.el-pagination.is-background .el-pager li:hover {
    color: #10472D;
}

.el-pagination.is-background .el-pager li:not(.disabled).is-active {
    background-color: #10472D;
}
</style>
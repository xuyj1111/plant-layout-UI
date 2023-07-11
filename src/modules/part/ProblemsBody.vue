<template>
    <section class="body">
        <div id="title">
            <div class="element">
                <el-link :underline="false" type="primary" id="link" @click="toMap">&lt;&nbsp;返回</el-link>
            </div>
            <span v-if="$store.state.problemPage == 'device'" class="element">{{ isEmpty(deviceNum) ? '' :
                `设备编号：${deviceNum}`
            }}</span>
            <span v-if="$store.state.problemPage == 'device'" class="element">{{ isEmpty(stationNum) ? '' :
                `岗位号：${stationNum}`
            }}</span>
            <span v-else-if="$store.state.problemPage == 'all'" class="element">全部问题点列表</span>
            <span v-else-if="$store.state.problemPage == 'unmatch'" class="element">未匹配问题点列表</span>

            <span id='account' class="element">{{ ROLE_VALUE[$store.state.role] }}
                {{ USER_VALUE[$store.state.user] }}</span>
        </div>

        <div id="operation">
            <!-- 搜索框 -->
            <el-tooltip class="item" effect="dark"
                :content="$store.state.problemPage == 'device' ? '支持搜索序号、提交人、问题点描述' : '支持搜索序号、设备编号、岗位号、提交人、问题点描述'"
                placement="bottom-start">
                <span class="search">
                    <el-input v-model.trim="search" class="w-50 m-2">
                        <template #prefix>
                            <el-icon class="el-input__icon">
                                <search />
                            </el-icon>
                        </template>
                    </el-input>
                </span>
            </el-tooltip>
            <el-date-picker class="datetimeRange" v-model="datetimeRange" type="datetimerange" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
            <!-- 状态选项 -->
            <span class="statusFilter">
                <el-select v-model="status">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </span>

            <!-- 协助部门选项 -->
            <span class="departFilter">
                <el-select v-model="department">
                    <el-option v-for="item in departOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </span>
        </div>
        <div id="table">
            <el-table :data="tableData" stripe fixed style="width: 100%" :cell-style="{ 'text-align': 'center' }"
                :header-cell-style="{ background: '#10472D', color: 'white', 'line-hight': '50px', 'text-align': 'center' }">
                <el-table-column prop="id" label="序号" width="120">
                </el-table-column>
                <el-table-column v-if="$store.state.problemPage != 'device'" prop="deviceNum" label="设备编号" width="120">
                </el-table-column>
                <el-table-column v-if="$store.state.problemPage != 'device'" prop="stationNum" label="岗位号" width="120">
                </el-table-column>
                <el-table-column prop="name" label="提交人" width="120">
                </el-table-column>
                <el-table-column prop="dateCreated" label="提交日期" width="180">
                </el-table-column>
                <el-table-column prop="detail" label="问题点描述" width="180">
                </el-table-column>
                <el-table-column prop="isNeedHelp" label="是否需要其他部门协助" width="250">
                  <template v-slot="{ row }">
                    <el-select v-model="row.isNeedHelp">
                      <template #prefix>
                        <button style="padding-left: 15px;">
                        </button>
                      </template>
                      <el-option v-for="item in isNeedHelpOptions" :key="item" :label="item" :value="item">
                      </el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column prop="picture" label="图片" width="180">
                    <template v-slot="{ row }">
                        <el-image style="width: 100px; height: 100px" :src="row.picture" :fit='"scale-down"'></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="对策" width="180">
                </el-table-column>
              <el-table-column prop="returnReason" label="退回理由" width="180">
              </el-table-column>
              <el-table-column prop="status" label="状态" fixed="right">
                <template v-slot="{ row, $index }">
                  <el-button v-if="row.status == '已完成'" type="success" @click="handleFinished(row.id, $index)"
                             :disabled="$store.state.user != 'root'">{{
                      row.status }}</el-button>
                  <el-button v-else-if="row.status == '审核中'" type="warning" @click="handleReview(row.id, $index)">{{
                      row.status }}</el-button>
                  <el-button v-else-if="row.status == '未完成'" type="danger"
                             @click="handleUnfinished(row.id, row.isNeedHelp, $index)">{{
                      row.status }}</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>

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
import moment from 'moment'

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
          statusOptions: [{
              value: 'all',
              label: '全部状态'
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
          department: 'all',
          departOptions: [{
              value: 'all',
              label: '全部部门'
          }, {
              value: 'ZT1-保全',
              label: 'ZT1-保全'
          }, {
              value: 'ZT2-组装技术',
              label: 'ZT2-组装技术'
          }, {
              value: 'ZT3-加工技术',
              label: 'ZT3-加工技术'
          }, {
              value: '改善班',
              label: '改善班'
          }, {
              value: '供给中心',
              label: '供给中心'
          }],
          tableData: [],
          count: 0,
          page: 0,
          ROLE_VALUE: {
              'root': '管理员账号：',
              'assist': '辅助部门：',
              'local': '现场部门：'
          },
          USER_VALUE: {
              'root': 'root',
              'zt1': 'ZT1-保全',
              'zt2': 'ZT2-组装技术',
              'zt3': 'ZT3-加工技术',
              'improve': '改善班',
              'provide': '供给中心',
              'assy': '组装',
              'logistics': '物流',
              'case': '外壳',
              'gear': '齿轮',
              'pulley': '带轮',
              'differential': '差速器',
              'heat': '热处理'
          },
          datetimeRange: null,
          isNeedHelpOptions: ['ZT1-保全', 'ZT2-组装技术', 'ZT3-加工技术', '改善班', '供给中心', '否']
        }
    },
    mounted() {
        console.log('跳转到问题点详情页');
        const arr = this.$store.state.choose.split('+');
        this.deviceNum = arr[0];
        this.stationNum = arr[1];
        // 监听status变量
        this.$watch("status", (newVal, oldVal) => {
            this.tableData = [];
            this.setProblemsCount();
            this.setTableData();
        });
        // 监听department变量
        this.$watch("department", (newVal, oldVal) => {
            this.tableData = [];
            this.setProblemsCount();
            this.setTableData();
        });
        // 监听search变量
        this.$watch("search", (newVal, oldVal) => {
            this.tableData = [];
            this.setProblemsCount();
            this.setTableData();
        });
        // 监听page变量
        this.$watch("page", (newVal, oldVal) => {
            this.tableData = [];
            this.setTableData();
        });
        // 监听datetimeRange变量
        this.$watch("datetimeRange", (newVal, oldVal) => {
            this.tableData = [];
            this.setProblemsCount();
            this.setTableData();
        });
        // 部门，动态赋值
        this.departOptions.push({
            value: '否',
            label: this.USER_VALUE[this.$store.state.plant]
        });
        this.setProblemsCount();
        this.setTableData();
    },
    methods: {
        // 跳转到地图页
        toMap() {
            this.$store.state.problemPage = 'all';
            this.$store.commit('saveStateToStorage');
            this.$emit('toMap');
            this.$router.push(this.$route.path.replace(new RegExp("/problems$"), ""));
        },
        /**
         * 问题点count赋值
         */
        setProblemsCount() {
            // 开始时间、结束时间
            let startDatetime = null;
            let endDatetime = null;
            if (this.datetimeRange != null) {
                startDatetime = moment(this.datetimeRange[0]).format('YYYY-MM-DD HH:mm:ss');
                endDatetime = moment(this.datetimeRange[1]).format('YYYY-MM-DD HH:mm:ss');
            }

            if (this.$store.state.problemPage == 'device') {
                // 设备问题点查询
                new Promise((resolve, reject) => {
                    this.$axiosInstance.get("/plant/problems/count", {
                        params: {
                            plant: this.$store.state.plant,
                            deviceNum: this.deviceNum,
                            stationNum: this.stationNum,
                            status: this.status == 'all' ? null : this.status,
                            search: this.isEmpty(this.search) ? null : this.search,
                            department: this.department == 'all' ? null : this.department,
                            startDatetime: startDatetime,
                            endDatetime: endDatetime
                        }
                    }).then(function (response) {
                        resolve(response.data['count']);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.count = data;
                })
            } else if (this.$store.state.problemPage == 'all') {
                // 全部问题点查询
                new Promise((resolve, reject) => {
                    this.$axiosInstance.get("/plant/problems/count", {
                        params: {
                            plant: this.$store.state.plant,
                            status: this.status == 'all' ? null : this.status,
                            search: this.isEmpty(this.search) ? null : this.search,
                            department: this.department == 'all' ? null : this.department,
                            startDatetime: startDatetime,
                            endDatetime: endDatetime
                        }
                    }).then(function (response) {
                        resolve(response.data['count']);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.count = data;
                })
            } else if (this.$store.state.problemPage == 'unmatch') {
                // 未匹配问题点查询
                new Promise((resolve, reject) => {
                    this.$axiosInstance.post("/plant/problems/unmatch/count", {
                        plant: this.$store.state.plant,
                        status: this.status == 'all' ? null : this.status,
                        search: this.isEmpty(this.search) ? null : this.search,
                        department: this.department == 'all' ? null : this.department,
                        // 所有设备编号+岗位号
                        allDevice: this.buildAllDeviceNumAndStationNum(),
                        startDatetime: startDatetime,
                        endDatetime: endDatetime
                    }).then(function (response) {
                        resolve(response.data['count']);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.count = data;
                })
            }
        },
        /**
         * 问题点数据赋值
         */
        setTableData() {
            // 开始时间、结束时间
            let startDatetime = null;
            let endDatetime = null;
            if (this.datetimeRange != null) {
                startDatetime = moment(this.datetimeRange[0]).format('YYYY-MM-DD HH:mm:ss');
                endDatetime = moment(this.datetimeRange[1]).format('YYYY-MM-DD HH:mm:ss');
            }

            if (this.$store.state.problemPage == 'device') {
                new Promise((resolve, reject) => {
                    this.$axiosInstance.get("/plant/problems", {
                        params: {
                            plant: this.$store.state.plant,
                            deviceNum: this.deviceNum,
                            stationNum: this.stationNum,
                            status: this.status == 'all' ? null : this.status,
                            page: this.page,
                            size: 5,
                            search: this.isEmpty(this.search) ? null : this.search,
                            department: this.department == 'all' ? null : this.department,
                            startDatetime: startDatetime,
                            endDatetime: endDatetime
                        }
                    }).then(function (response) {
                        resolve(response.data);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.tableData = data;
                })
            } else if (this.$store.state.problemPage == 'all') {
                // 全部问题点查询
                new Promise((resolve, reject) => {
                    this.$axiosInstance.get("/plant/problems", {
                        params: {
                            plant: this.$store.state.plant,
                            status: this.status == 'all' ? null : this.status,
                            page: this.page,
                            size: 5,
                            search: this.isEmpty(this.search) ? null : this.search,
                            department: this.department == 'all' ? null : this.department,
                            startDatetime: startDatetime,
                            endDatetime: endDatetime
                        }
                    }).then(function (response) {
                        resolve(response.data);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.tableData = data;
                })
            } else if (this.$store.state.problemPage == 'unmatch') {
                // 未匹配问题点查询
                new Promise((resolve, reject) => {
                    this.$axiosInstance.post("/plant/problems/unmatch", {
                        plant: this.$store.state.plant,
                        status: this.status == 'all' ? null : this.status,
                        page: this.page,
                        size: 5,
                        search: this.isEmpty(this.search) ? null : this.search,
                        department: this.department == 'all' ? null : this.department,
                        // 所有设备编号+岗位号
                        allDevice: this.buildAllDeviceNumAndStationNum(),
                        startDatetime: startDatetime,
                        endDatetime: endDatetime
                    }).then(function (response) {
                        resolve(response.data);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(data => {
                    this.tableData = data;
                })
            }
        },
        // page赋值
        setPage(val) {
            this.page = val - 1;
        },
        // 点击“已完成”，只有root才可点击
        handleFinished(id, index) {
            this.$confirm('是否退回问题点？', '提示', {
                confirmButtonText: '退回',
                confirmButtonClass: 'redClass',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                new Promise((resolve, reject) => {
                    this.$axiosInstance.put("/plant/problem", {}, {
                        params: {
                            id: id,
                            status: 'unfinished'
                        }
                    }).then(function (response) {
                        resolve(response.data);
                    }).catch(function (error) {
                        reject(error);
                    })
                }).then(() => {
                    this.tableData[index]['status'] = '未完成';
                })
                this.$message({
                    type: 'success',
                    message: '已退回!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消操作'
                });
            });
        },
        // 点击“审核中”
        handleReview(id, index) {
            if (this.$store.state.role == 'root' || (this.$store.state.role == 'local' &&
                this.$store.state.plant == this.$store.state.user)) {
                this.$confirm('请审核问题点？', '提示', {
                    distinguishCancelAndClose: true,
                    confirmButtonText: '通过',
                    confirmButtonClass: 'greenClass',
                    cancelButtonText: '退回',
                    cancelButtonClass: 'redClass',
                    type: 'warning'
                }).then(() => {
                    new Promise((resolve, reject) => {
                        this.$axiosInstance.put("/plant/problem", {}, {
                            params: {
                                id: id,
                                status: 'finished'
                            }
                        }).then(function (response) {
                            resolve(response.data);
                        }).catch(function (error) {
                            reject(error);
                        })
                    }).then(() => {
                        this.tableData[index]['status'] = '已完成';
                    })
                    this.$message({
                        type: 'success',
                        message: '通过成功!'
                    });
                }).catch(action => {
                    if (action == 'cancel') {
                        new Promise((resolve, reject) => {
                            this.$axiosInstance.put("/plant/problem", {}, {
                                params: {
                                    id: id,
                                    status: 'unfinished'
                                }
                            }).then(function (response) {
                                resolve(response.data);
                            }).catch(function (error) {
                                reject(error);
                            })
                        }).then(() => {
                            this.tableData[index]['status'] = '未完成';
                        })
                        this.$message({
                            type: 'error',
                            message: '退回成功!'
                        });
                    } else if (action == 'close') {
                        this.$message({
                            type: 'info',
                            message: '取消操作'
                        });
                    }
                });
            } else {
                this.$message({
                    showClose: true,
                    message: '当前账号没有权限',
                    type: 'warning'
                });
            }
        },
        // 点击“未完成”
        handleUnfinished(id, isNeedHelp, index) {
            if (this.$store.state.role == 'root') {
                this.$confirm('是否完成问题点？', '提示', {
                    confirmButtonText: '完成',
                    confirmButtonClass: 'greenClass',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    new Promise((resolve, reject) => {
                        this.$axiosInstance.put("/plant/problem", {}, {
                            params: {
                                id: id,
                                status: 'finished'
                            }
                        }).then(function (response) {
                            resolve(response.data);
                        }).catch(function (error) {
                            reject(error);
                        })
                    }).then(() => {
                        this.tableData[index]['status'] = '已完成';
                    })
                    this.$message({
                        type: 'success',
                        message: '已完成!'
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消操作'
                    });
                });
            }
            else if (this.$store.state.role == 'local' &&
                this.$store.state.plant == this.$store.state.user) {
                // 不需要协助，直接完成
                if (isNeedHelp == '否') {
                    this.$confirm('是否完成问题点？', '提示', {
                        confirmButtonText: '完成',
                        confirmButtonClass: 'greenClass',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        new Promise((resolve, reject) => {
                            this.$axiosInstance.put("/plant/problem", {}, {
                                params: {
                                    id: id,
                                    status: 'finished'
                                }
                            }).then(function (response) {
                                resolve(response.data);
                            }).catch(function (error) {
                                reject(error);
                            })
                        }).then(() => {
                            this.tableData[index]['status'] = '已完成';
                        })
                        this.$message({
                            type: 'success',
                            message: '已完成!'
                        });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '取消操作'
                        });
                    });
                } else {
                    // 需要协助问题点，不能点击
                    this.$message({
                        showClose: true,
                        message: '当前账号没有权限',
                        type: 'warning'
                    });
                }
            } else if (this.$store.state.role == 'assist' &&
                this.USER_VALUE[this.$store.state.user] == isNeedHelp) {

                this.$confirm('是否提交审核？', '提示', {
                    confirmButtonText: '提交',
                    confirmButtonClass: 'yellowClass',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    new Promise((resolve, reject) => {
                        this.$axiosInstance.put("/plant/problem", {}, {
                            params: {
                                id: id,
                                status: 'review'
                            }
                        }).then(function (response) {
                            resolve(response.data);
                        }).catch(function (error) {
                            reject(error);
                        })
                    }).then(() => {
                        this.tableData[index]['status'] = '审核中';
                    })
                    this.$message({
                        type: 'success',
                        message: '已提交!'
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消操作'
                    });
                });
            } else {
                this.$message({
                    showClose: true,
                    message: '当前账号没有权限',
                    type: 'warning'
                });
            }
        },
      handleSaveItem(id, index) {

      },
        // 判断字符串是否为空
        isEmpty(str) {
            if (str == null || str.trim() == "") {
                return true;
            }
            return false;
        },
        // 构建所有设备编号+岗位号的in sql语句
        buildAllDeviceNumAndStationNum() {
            let stringBuilder = [];
            this.$store.state.shapes.forEach((shape, key) => {
                stringBuilder.push('(\''
                    + shape['deviceNum']
                    + '\',\''
                    + (this.isEmpty(shape['stationNum']) ? '(跳过)' : shape['stationNum'])
                    + '\')');
            });
            return stringBuilder.join(', ');
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

.body #title #account {
    float: right;
    margin-right: 20px;
    margin-top: 0px;
}

.body #operation .search {
    width: 200px;
    display: inline-block;
    position: relative;
    left: 20px;
}

.body #operation .datetimeRange {
    display: inline-block;
    position: relative;
    left: 30px;
    vertical-align: middle;
}

.body #operation .departFilter {
    width: 140px;
    float: right;
    margin-right: 20px;
    margin-top: 0px;
}

.body #operation .statusFilter {
    width: 140px;
    float: right;
    margin-right: 20px;
    margin-top: 0px;
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
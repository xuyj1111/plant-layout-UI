<template>
    <section id="sidebar">
        <img class="logo" src="../../assets/logo.png" onclick="" />
        <el-tooltip class="box-item" effect="dark" content="组装" placement="right">
            <div id="assy" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="(currentId == 'assy' || plant == 'assy') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="物流" placement="right">
            <div id="logistics" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)"
                :class="(currentId == 'logistics' || plant == 'logistics') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="外壳" placement="right">
            <div id="case" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="(currentId == 'case' || plant == 'case') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="齿轮" placement="right">
            <div id="gear" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="(currentId == 'gear' || plant == 'gear') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="带轮" placement="right">
            <div id="pulley" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="(currentId == 'pulley' || plant == 'pulley') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="差速器" placement="right">
            <div id="differential" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)"
                :class="(currentId == 'differential' || plant == 'differential') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="热处理" placement="right">
            <div id="heat" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="(currentId == 'heat' || plant == 'heat') ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="登出" placement="right">
            <div id="logout" @mouseenter="handleMouseEnter($event)" @mouseleave="handleMouseLeave()"
                @click="handleClick($event)" :class="currentId == 'logout' ? 'fixed' : 'notFixed'">
            </div>
        </el-tooltip>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Sidebar',
    data() {
        return {
            currentId: this.$store.state.plant,
        }
    },
    computed: {
        ...mapState(['plant'])
    },
    mounted() {
    },
    methods: {
        // 鼠标移入
        handleMouseEnter(e) {
            this.currentId = e.target.id;
        },
        // 鼠标移出
        handleMouseLeave() {
            this.currentId = this.$store.state.plant;
        },
        // 鼠标点击
        handleClick(e) {
            const displayOptionsConst = ['all', 'zt1', 'zt2', 'zt3', 'improve', 'provide'];
            this.$store.state.displayOptions = null;
            if (displayOptionsConst.indexOf(this.$store.state.displayByUser) < 0) {
                this.$store.state.displayByUser = 'all';
            }
            if (e.target.id == 'logout') {
                this.$emit('removeResizeEvent');
                this.$router.push('/logout');
                this.$message({
                    showClose: true,
                    message: `登出系统`,
                    type: 'warning'
                });
                this.$store.state.displayByUser = 'all';
            } else {
                // 只有下面这样写才能修改，无法修改“...mapState(['plant'])”引入的 plant
                this.$store.state.plant = e.target.id;
                this.$store.state.choose = '';
                this.$store.commit('saveStateToStorage');
                this.$router.push(`/map/${e.target.id}`);
            }
        }
    }
}
</script>

<style scoped>
#sidebar {
    /* 高度百分百，宽度固定 50px */
    background-color: #10472D;
    height: 100%;
    width: 50px;
    /* 没有滚动条，显示不下就不显示 */
    overflow-x: hidden;
    overflow-y: hidden;
}

/* 菜单栏的所有图标 */
#sidebar div {
    height: 30px;
    widows: 30px;
    margin: 20px 10px;
    flex-direction: column;
}

#logout {
    position: relative;
    top: calc(100% - 460px);
}

#assy.fixed {
    background: url(../../assets/assyC.png) no-repeat center center;
}

#assy.notFixed {
    background: url(../../assets/assy.png) no-repeat center center;
}

#logistics.fixed {
    background: url(../../assets/logisticsC.png) no-repeat center center;
}

#logistics.notFixed {
    background: url(../../assets/logistics.png) no-repeat center center;
}

#case.fixed {
    background: url(../../assets/caseC.png) no-repeat center center;
}

#case.notFixed {
    background: url(../../assets/case.png) no-repeat center center;
}

#gear.fixed {
    background: url(../../assets/gearC.png) no-repeat center center;
}

#gear.notFixed {
    background: url(../../assets/gear.png) no-repeat center center;
}

#pulley.fixed {
    background: url(../../assets/pulleyC.png) no-repeat center center;
}

#pulley.notFixed {
    background: url(../../assets/pulley.png) no-repeat center center;
}

#differential.fixed {
    background: url(../../assets/differentialC.png) no-repeat center center;
}

#differential.notFixed {
    background: url(../../assets/differential.png) no-repeat center center;
}

#heat.fixed {
    background: url(../../assets/heatC.png) no-repeat center center;
}

#heat.notFixed {
    background: url(../../assets/heat.png) no-repeat center center;
}

#logout.fixed {
    background: url(../../assets/logoutC.png) no-repeat center center;
}

#logout.notFixed {
    background: url(../../assets/logout.png) no-repeat center center;
}
</style>
  
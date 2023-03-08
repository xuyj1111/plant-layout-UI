<template>
    <section id="menu">
        <img class="logo" src="../assets/logo.png" onclick="" />
        <el-tooltip class="box-item" effect="dark" content="组装" placement="right">
            <div id="assy" class="plant" @mouseover="execMouseover($event)"></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="物流" placement="right">
            <div id="logistics" class="plant" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="外壳" placement="right">
            <div id="case" class="plant" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="齿轮" placement="right">
            <div id="gear" class="plant" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="带轮" placement="right">
            <div id="pulley" class="plant" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="差速器" placement="right">
            <div id="differential" class="plant" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="热处理" placement="right">
            <div id="heat" class="plant" onclick=""></div>
        </el-tooltip>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Menu',
    computed: {
        ...mapState(['plant'])
    },
    data() {
        return {
            notSelected: {
                assy: 'url(../assets/assy.png)',
                logistics: 'url(../assets/logistics.png)',
                case: 'url(../assets/case.png)',
                gear: 'url(../assets/gear.png)',
                pulley: 'url(../assets/pulley.png)',
                differential: 'url(../assets/differential.png)',
                heat: 'url(../assets/heat.png)'
            },
            selected: {
                assy: 'url(../assets/assyC.png)',
                logistics: 'url(../assets/logisticsC.png)',
                case: 'url(../assets/caseC.png)',
                gear: 'url(../assets/gearC.png)',
                pulley: 'url(../assets/pulleyC.png)',
                differential: 'url(../assets/differentialC.png)',
                heat: 'url(../assets/heatC.png)'
            }
        }
    },
    mounted() {
        window.addEventListener('load', this.init);
    },
    methods: {
        init() {
            const elements = document.getElementsByClassName('plant');
            Array.from(elements).forEach((element) => {
                console.log(this.notSelected[element.id] + ' no-repeat center center');
                element.setAttribute('style', 'background: ' + this.notSelected[element.id] + ' no-repeat center center;')
            })
        },
        execMouseover(e) {
            console.log(e);
        }
    }
}
</script>

<style scoped>
#menu {
    /* 高度百分百，宽度固定 50px */
    background-color: #10472D;
    height: 100%;
    width: 50px;
    /* 没有滚动条，显示不下就不显示 */
    overflow-y: hidden;
}

/* 菜单栏中的选项 */
#menu .plant {
    height: 30px;
    widows: 30px;
    margin: 20px 10px;
    flex-direction: column;
}

/* #assy {
    background: url(../assets/assy.png) no-repeat center center;
}

#assy:hover {
    background: url(../assets/assyC.png) no-repeat center center;
} 

#logistics {
    background: url(../assets/logistics.png) no-repeat center center;
}

#logistics:hover {
    background: url(../assets/logisticsC.png) no-repeat center center;
}

#case {
    background: url(../assets/case.png) no-repeat center center;
}

#case:hover {
    background: url(../assets/caseC.png) no-repeat center center;
}

#gear {
    background: url(../assets/gear.png) no-repeat center center;
}

#gear:hover {
    background: url(../assets/gearC.png) no-repeat center center;
}

#pulley {
    background: url(../assets/pulley.png) no-repeat center center;
}

#pulley:hover {
    background: url(../assets/pulleyC.png) no-repeat center center;
}

#differential {
    background: url(../assets/differential.png) no-repeat center center;
}

#differential:hover {
    background: url(../assets/differentialC.png) no-repeat center center;
}

#heat {
    background: url(../assets/heat.png) no-repeat center center;
}

#heat:hover {
    background: url(../assets/heatC.png) no-repeat center center;
} */
</style>
  
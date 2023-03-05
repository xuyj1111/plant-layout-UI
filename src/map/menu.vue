<template>
    <section id="menu">
        <img class="logo" src="../assets/logo.png" onclick="" />
        <el-tooltip class="box-item" effect="dark" content="组装" placement="right">
            <div id="assy" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="物流" placement="right">
            <div id="logistics" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="外壳" placement="right">
            <div id="case" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="齿轮" placement="right">
            <div id="gear" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="带轮" placement="right">
            <div id="pulley" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="差速器" placement="right">
            <div id="differential" class="site" onclick=""></div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="热处理" placement="right">
            <div id="heat" class="site" onclick=""></div>
        </el-tooltip>
    </section>
</template>

<script>
export default {
    name: 'Menu'
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
#menu .site {
    height: 30px;
    widows: 30px;
    margin: 20px 10px;
    flex-direction: column;
}

#assy {
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
}
</style>
  
<template>
    <!-- 显示地图 -->
    <section id="main">
        <canvas ref="map" :width="map.width" :height="map.height"> </canvas>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DisMap',
    data() {
        return {
        }
    },
    mounted() {
        window.addEventListener('load', this.init)
    },
    computed: {
        ...mapState(['map'])
    },
    methods: {
        init() {
            
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
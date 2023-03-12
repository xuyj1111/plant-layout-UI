import { createStore } from 'vuex'

export default createStore({
    state: {
        // 厂房
        plant: 'assy',
        // 画布
        map: {
            width: 870,
            height: 570,
            maxWidth: 3480,
            maxHeight: 2280,
            minWidth: 580,
            minHeight: 380,
            // 画布比例，10%
            per: 10
        },
        // 地图中的图形
        shapes: new Map(),
        // 选中的设备（设备号+工作号），未选中为空字符串
        choose: ''
    }
})
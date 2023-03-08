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
        }
    }
})
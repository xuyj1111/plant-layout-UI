import { parseStringStyle } from '@vue/shared'
import { parse } from 'querystring'
import { createStore } from 'vuex'

/**
 * 全局变量
 * state：存储状态
 * mutations：修改状态
 * 
 */
export default createStore({
    state: {
        // 登陆用户
        user: '',
        // 用户角色
        role: '',
        // 厂房
        plant: 'assy',
        // 地图
        map: {
            width: 870,
            height: 570,
            maxWidth: 3480,
            maxHeight: 2280,
            minWidth: 580,
            minHeight: 380,
            // 地图比例，10%
            per: 10,
            // 滚动条的偏移量
            scrollLeft: 0,
            scrollTop: 0
        },
        // 地图中的图形
        shapes: new Map(),
        // 选中的设备（设备号+工作号），未选中为空字符串
        choose: '',
        // 缩略图
        thumbnail: {
            // 常量宽度，高度
            width: 203,
            height: 133,
            // 选中框宽度,高度
            checkWidth: 0,
            checkHeight: 0,
            // 选中框x,y
            checkOffsetX: 0,
            checkOffsetY: 0
        },
        // window事件是否添加
        isAddWindowEvent: false,
        displayByUser: 'all',
        displayOptions: null,
        // 问题点页面
        // 'device'：设备问题点界面，标题显示设备编号和岗位号，表不显示
        // 'all'：全部问题点页面，标题显示“全部问题点列表”，表显示设备编号和岗位号
        // 'unmatch'：未匹配问题点页面，标题显示“未匹配问题点列表”，表显示设备编号和岗位号
        problemPage: 'all'
    },
    mutations: {
        // 保存到 sessionStorage 中
        saveStateToStorage(state) {
            console.log('>>> saveStateToStorage')
            sessionStorage.setItem('choose', state.choose)
            sessionStorage.setItem('problemPage', state.problemPage)
            sessionStorage.setItem('user', state.user)
            sessionStorage.setItem('role', state.role)
        },
        // 从 sessionStorage 中恢复
        restoreStateFromStorage(state) {
            console.log('>>> restoreStateFromStorage');
            state.choose = sessionStorage.getItem('choose');
            state.problemPage = sessionStorage.getItem('problemPage');
            state.user = sessionStorage.getItem('user');
            state.role = sessionStorage.getItem('role');
            console.log(state.plant);
        }
    },
    // 在页面关闭或刷新前保存 state 的状态
    plugins: [
        store => {
            window.addEventListener('beforeunload', () => {
                store.commit('saveStateToStorage')
            })
        }
    ]
})
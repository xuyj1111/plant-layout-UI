<template>
  <router-view></router-view>
</template>

<script>
import Map from './modules/Map.vue';
import Login from './modules/Login.vue';
import Problems from './modules/Problems.vue';

export default {
  name: 'app',
  components: {
    Map,
    Login,
    Problems
  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

<style>
#app,
body,
html {
  /* 无内外边距，长宽百分百 */
  padding: 0px;
  margin: 0px;
  border: 0px;
  width: 100%;
  height: 100%;
}

body {
  /* 使用 flex 布局，方向 row */
  display: flex;
  flex-direction: row;
}

.greenClass {
    background: #67C23A !important;
    color: #fff !important;
}

.yellowClass {
    background: #E6A23C !important;
    color: #fff !important;
}

.redClass {
    background: #F56C6C !important;
    color: #fff !important;
}
</style>
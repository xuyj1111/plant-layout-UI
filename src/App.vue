<template>
  <router-view></router-view>
</template>

<script>
import Map from './modules/map/index.vue';
import Login from './modules/login/index.vue';

export default {
  name: 'app',
  components: {
    Map,
    Login
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
</style>
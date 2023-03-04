<template>
    <body>
        <Menu />
        <DisMap />
        <Operation />
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue'

export default {
    name: 'Map',
    components: {
        Menu,
        DisMap,
        Operation
    }
}

</script>

<style scoped>

</style>
<template>
    <body>
        <Menu @onButtonEvent="onButtonEvent" />
        <DisMap ref="disMapChild" />
        <Operation />
    </body>
</template>

<script>
import Menu from './menu.vue';
import DisMap from './disMap.vue';
import Operation from './operation.vue';

export default {
    name: 'Map',
    components: {
        Menu,
        DisMap,
        Operation
    },
    methods: {
        onButtonEvent() {
            const disMap = this.$refs.disMapChild;
            disMap.setPlantData();
        }
    }
}

</script>

<style scoped></style>
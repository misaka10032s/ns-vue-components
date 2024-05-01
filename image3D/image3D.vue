<script setup>
    import { useI18n } from 'vue-i18n'
    import store from '@/store/serverStore.js'
    import { useRoute, useRouter } from 'vue-router'

    import { url_for } from '@/router/routerSetting.js'
    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    const $el = ref(null);

    const props = defineProps({
        images: {
            type: Array,
            default: () => []
        },
        gate: {
            type: Number,
            default: 20, // px
        }
    });
    const { images, gate } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "image3D.image3D";

    const dimension = computed(() => images.value.some(image => Array.isArray(image)) ? 2 : 1);
    const startPos = ref({ x: 0, y: 0 });
    const imageIndex = ref([0, 0]); // x, y

    const onPress = (e) => {
        console.log("onPress");
        startPos.value = { x: e.clientX, y: e.clientY };
    }

    const onMove = (e) => {
        const { x, y } = startPos.value;
        if(x === 0 && y === 0) return;
        const dx = e.clientX - x;
        const dy = e.clientY - y;
        if(Math.sqrt(dx ** 2 + dy ** 2) < gate.value) return;

        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        // if deg in range (0, 90, 180, 270) +- 10, change imageIndex
        if(dimension.value === 1){
            const len = images.value.length;
            if(deg > -10 && deg < 10) imageIndex.value[0] = (imageIndex.value[0] + 1) % len;
            else if(deg > 170 && deg < 190) imageIndex.value[0] = (imageIndex.value[0] - 1 + len) % len;
        }
        else if(dimension.value === 2){
            const xLen = images.value[imageIndex.value[1]].length, yLen = images.value.length;
            if(deg > -10 && deg < 10) imageIndex.value[0] = (imageIndex.value[0] + 1) % xLen;
            else if(deg > 80 && deg < 100) imageIndex.value[1] = (imageIndex.value[1] + 1) % yLen;
            else if(deg > 170 && deg < 190) imageIndex.value[0] = (imageIndex.value[0] - 1 + xLen) % xLen;
            else if(deg > 260 && deg < 280) imageIndex.value[1] = (imageIndex.value[1] - 1 + yLen) % yLen;
        }

        // console.log(imageIndex.value, deg, startPos.value, e.clientX, e.clientY)

        // reset startPos
        startPos.value = { x: e.clientX, y: e.clientY };
    }

    const onRelease = (e) => {
        console.log("onRelease");
        startPos.value = { x: 0, y: 0 };
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el" class="image-wrapper" @mousedown="onPress" @mousemove="onMove" @mouseup="onRelease">
        <template v-if="dimension === 1">
            <template v-for="(imageSrc, x) in images">
                <img :key="x" :src="url_for(imageSrc)" :alt="imageSrc" v-if="x==imageIndex[0]"/>
            </template>
        </template>
        <template v-else-if="dimension === 2">
            <div v-for="(imageRow, y) in images" :key="'$'+y" class="image-row">
                <template v-for="(imageSrc, x) in imageRow">
                    <img :key="'$'+x" :src="url_for(imageSrc)" :alt="imageSrc" v-if="x==imageIndex[0] && y==imageIndex[1]"/>
                </template>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.image-wrapper {
    background-color: #aaa;
    user-select: none;

    img {
        user-select: none;
        min-width: 100px;
        min-height: 100px;
    }
}
</style>
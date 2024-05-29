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

    import nsImage3D from './nsImage3D.vue';

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "nsImage3D.display";

    const image = ref([0,1,2,3,4]);
    const image2 = ref([[0,1,2,3], [4,5,6,7], [8,9,10,11]]);

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <nsImage3D :images="image2"/>
    </div>
</template>

<style scoped lang="scss">
</style>
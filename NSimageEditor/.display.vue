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
    
    import nsImageEditor from './nsImageEditor.vue'

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "nsImageEditor.display";

    const displayConfig = ref({
        data: ["data1", "data2", "data3", "data4"],
    });

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <ns-image-editor :config="displayConfig"/>
    </div>
</template>

<style scoped lang="scss">
</style>
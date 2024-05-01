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
    const $img = ref(null);

    const props = defineProps({
        src: {
            type: String,
            required: true,
        },
        loadingSrc: {
            type: String,
            required: false,
            default: ''
        },
        defaultSrc: {
            type: String,
            required: false,
            default: ''
        },
    });
    const { src, loadingSrc, defaultSrc } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "preImage.preImage";

    const state = ref(0); // 0: loading, 1: loaded, 2: error
    const showing = ref(src.value)

    const reloadImg = () => {
        console.log("reloadImg");
        showing.value = src.value;
        state.value = 0;
    }

    const loaded = () => {
        console.log("loaded");
        if(showing.value == src.value) state.value = 1;
    }

    const defaultImg = () => {
        console.log("defaultImg", defaultSrc.value);
        showing.value = defaultSrc.value;
        state.value = 2;
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el" class="image-wrapper">
        <span class="reload-btn" @click="reloadImg()" v-if="state === 2">
            <i class="fas fa-sync-alt"></i>
        </span>
        <img :src="loadingSrc" v-show="state === 0"/>
        <img ref="$img" :src="showing" @error="defaultImg" @load="loaded" v-show="state !== 0"/>
    </div>
</template>

<style scoped lang="scss">
.image-wrapper{
    display: flex;
    flex-direction: column;


    .reload-btn{
        cursor: pointer;
    }
}
</style>
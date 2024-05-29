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
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "devEntrance";

    const links = [
        {'name': 'NStable', 'url': 'NStable'},
        {'name': 'NSrollingTable', 'url': 'NSrollingTable'},
        {'name': 'NStriac', 'url': 'NStriac'},
        {'name': 'NStoggle', 'url': 'NStoggle'},
        {'name': 'webocr', 'url': 'webocr'},
        {'name': 'preImage', 'url': 'preImage'},
        {'name': 'NSimage3D', 'url': 'NSimage3D'},
        {'name': 'NSform', 'url': 'NSform'},
        {'name': 'NScarousel', 'url': 'NScarousel'},
        {'name': 'NSimageEditor', 'url': 'NSimageEditor'},
        {'name': 'trans', 'url': 'trans'},
    ]

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <router-link :to="url_for(link.url)" class="text-decoration-none" v-for="link in links" :key="link.url">
            <button class="btn mx-2 nav-baseline-sky">{{ link.name }}</button>
        </router-link>

        <router-view v-slot="{ Component }" class="router-view-grow">
            <transition name="fade">
                <component :is="Component"/>
            </transition>
        </router-view>
    </div>
</template>

<style scoped lang="scss">
</style>
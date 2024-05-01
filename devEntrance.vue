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

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <router-link :to="url_for('NStable')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NStable</button>
        </router-link>
        <router-link :to="url_for('NSrollingTable')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NSrollingTable</button>
        </router-link>
        <router-link :to="url_for('NStriac')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NStriac</button>
        </router-link>
        <router-link :to="url_for('NStoggle')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NStoggle</button>
        </router-link>
        <router-link :to="url_for('webocr')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">webocr</button>
        </router-link>
        <router-link :to="url_for('preImage')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">preImage</button>
        </router-link>
        <router-link :to="url_for('image3D')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">image3D</button>
        </router-link>
        <router-link :to="url_for('NSform')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NSform</button>
        </router-link>
        <router-link :to="url_for('NScarousel')" class="text-decoration-none">
            <button class="btn mx-2 nav-baseline-sky">NScarousel</button>
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
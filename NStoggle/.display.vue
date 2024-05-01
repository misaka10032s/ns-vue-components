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

    import flipToggle from './flipToggle.vue';
    import nightDayToggle from './nightDayToggle.vue';
    import skewedToggle from './skewedToggle.vue';

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "NStoggle.display";

    const showState = async (x) => {
        Swal.fire({
            title: x.value ? "ON" : "OFF",
            text: x.value,
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("confirmed");
            } else {
                x.value ^= 1;
            }
        });
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <div>
            <p>flipToggle</p>
            <flipToggle @toggle="x => showState(x)"/>
        </div>

        <div>
            <p>nightDayToggle</p>
            <nightDayToggle @toggle="x => showState(x)"/>
        </div>

        <div>
            <p>skewedToggle</p>
            <skewedToggle @toggle="x => showState(x)"/>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>
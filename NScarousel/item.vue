<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

const $el = ref(null);

const props = defineProps({
    data: {
        type: [String, Number, Object, Array, Boolean, Symbol, Function, Date, BigInt, Map, Set, WeakMap, WeakSet, null, undefined],
        default: () => {
            return {
                // data
            }
        }
    },
    selected: {
        type: Number,
        default: 0
    }
});
const { data, selected } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NScarousel.item";

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});

watch(() => selected.value, (v) => {
    $el.value.style.transform = `translateX(${(-v) * 100}%)`;
});
</script>

<template>
    <div ref="$el" class="item">
        {{ data }}
    </div>
</template>

<style scoped lang="scss">
.item{
    min-width: 100%;
    max-width: 100%;
    min-height: 100%;
    max-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    background-color: #f0f0f0;
    transition: .5s;
}
</style>